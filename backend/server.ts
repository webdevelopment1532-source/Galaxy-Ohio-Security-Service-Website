import dotenv from 'dotenv';
import path from 'path';
const envPath = path.resolve(__dirname, '../../.env');
console.log('[DEBUG] Loading .env from:', envPath);
dotenv.config({ path: envPath });
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import { query, runInTransaction } from './db';
import axios from 'axios';
import { randomUUID } from 'crypto';
import {
	dispatchOhioIntegrationEvent,
	OhioEventType,
	OhioIntegrationEvent,
	resolveOhioPublishedEventVersion,
} from './shared/ohioIntegrationSender';
import {
	ensureOhioIntegrationEventLogTable,
	enqueueOhioIntegrationEvent,
	getPermanentlyFailedOhioIntegrationEvents,
	getOhioIntegrationEventLogMetrics,
	markOhioIntegrationEventSent,
	markOhioIntegrationEventFailedAttempt,
	requeueOhioIntegrationEvent,
} from './shared/ohioIntegrationEventLog';
import { resolveOhioSenderConfig } from './shared/ohioIntegrationSender';
import apiRouter from './api/index';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/api', apiRouter);

type OhioDomainEntity = 'customer' | 'sale' | 'service' | 'payment';

const domainTableMap: Record<OhioDomainEntity, string> = {
	customer: 'ohio_customers',
	sale: 'ohio_sales',
	service: 'ohio_services',
	payment: 'ohio_payments',
};

const entityToEventType: Record<OhioDomainEntity, OhioEventType> = {
	customer: 'customer.upsert',
	sale: 'sale.upsert',
	service: 'service.upsert',
	payment: 'payment.upsert',
};

async function ensureOhioDomainTables(): Promise<void> {
	const createTableStatements = Object.values(domainTableMap).map((tableName) => `
		CREATE TABLE IF NOT EXISTS ${tableName} (
			id INT AUTO_INCREMENT PRIMARY KEY,
			external_id VARCHAR(128) NOT NULL UNIQUE,
			payload_json LONGTEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		)
	`);

	for (const statement of createTableStatements) {
		await query(statement);
	}
}

async function upsertDomainRecord(entity: OhioDomainEntity, externalId: string, payload: Record<string, unknown>): Promise<void> {
	const tableName = domainTableMap[entity];
	await query(
		`INSERT INTO ${tableName} (external_id, payload_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE payload_json = VALUES(payload_json), updated_at = CURRENT_TIMESTAMP`,
		[externalId, JSON.stringify(payload)]
	);
}

function buildEvent(eventType: OhioEventType, payload: Record<string, unknown>): OhioIntegrationEvent {
	const traceId = randomUUID();
	return {
		event_id: randomUUID(),
		event_type: eventType,
		occurred_at: new Date().toISOString(),
		event_version: resolveOhioPublishedEventVersion(),
		trace_id: traceId,
		payload,
	};
}

async function persistThenEmit(
	entity: OhioDomainEntity,
	externalId: string,
	payload: Record<string, unknown>
): Promise<{ integrationSynced: boolean; integrationError?: string }> {
	const event = buildEvent(entityToEventType[entity], payload);
	await runInTransaction(async (txQuery) => {
		const tableName = domainTableMap[entity];
		await txQuery(
			`INSERT INTO ${tableName} (external_id, payload_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE payload_json = VALUES(payload_json), updated_at = CURRENT_TIMESTAMP`,
			[externalId, JSON.stringify(payload)]
		);
		await enqueueOhioIntegrationEvent(event, txQuery);
	});

	try {
		const dispatchResult = await dispatchOhioIntegrationEvent(event);
		await markOhioIntegrationEventSent(event.event_id, {
			status: dispatchResult.status,
			latencyMs: dispatchResult.latencyMs,
			attemptsUsed: dispatchResult.attempts,
		});
		return { integrationSynced: true };
	} catch (error) {
		console.error(`Integration emit failed for ${entity} ${externalId}:`, error);
		const message = error instanceof Error ? error.message : String(error);
		await markOhioIntegrationEventFailedAttempt(event.event_id, message);
		return {
			integrationSynced: false,
			integrationError: message,
		};
	}
}

app.get('/api/integrations/ohio/health', async (req: express.Request, res: express.Response) => {
	try {
		const metrics = await getOhioIntegrationEventLogMetrics();
		const senderConfig = resolveOhioSenderConfig();

		return res.json({
			integration: 'ohio-sales-center',
			endpoint: `${senderConfig.integrationUrl.replace(/\/$/, '')}${senderConfig.integrationEndpointPath}`,
			eventVersion: senderConfig.eventVersion,
			retryPolicy: {
				maxRetries: senderConfig.maxRetries,
				retryDelayMs: senderConfig.retryDelayMs,
			},
			deliverySlo: {
				latencyWindow: '24h',
			},
			queue: metrics,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error loading Ohio integration health:', error);
		return res.status(500).json({ error: 'Failed to load integration health.' });
	}
});

app.get('/api/integrations/ohio/dead-letter', async (req: express.Request, res: express.Response) => {
	try {
		const requestedLimit = Number.parseInt(String(req.query.limit || '100'), 10);
		const limit = Number.isFinite(requestedLimit) ? requestedLimit : 100;
		const events = await getPermanentlyFailedOhioIntegrationEvents(limit);
		return res.json({ events, total: events.length });
	} catch (error) {
		console.error('Error loading Ohio dead-letter queue view:', error);
		return res.status(500).json({ error: 'Failed to load dead-letter events.' });
	}
});

app.post('/api/integrations/ohio/requeue/:eventId', async (req: express.Request, res: express.Response) => {
	try {
		const eventId = getSingleParam(req.params.eventId);
		if (!eventId) {
			return res.status(400).json({ error: 'eventId is required.' });
		}

		const queued = await requeueOhioIntegrationEvent(eventId);
		if (!queued) {
			return res.status(404).json({ error: 'Event was not found in PERMANENTLY_FAILED state.' });
		}

		return res.json({ message: 'Event re-queued for replay.', eventId });
	} catch (error) {
		console.error('Error re-queueing Ohio integration event:', error);
		return res.status(500).json({ error: 'Failed to re-queue event.' });
	}
});

function withExternalId(payload: Record<string, unknown>, externalId: string): Record<string, unknown> {
	return {
		...payload,
		external_id: externalId,
	};
}

function getSingleParam(value: unknown): string | undefined {
	if (Array.isArray(value)) {
		const first = value[0];
		return typeof first === 'string' ? first : undefined;
	}

	return typeof value === 'string' ? value : undefined;
}

function getSalesCenterApiUrl(): string {
	return process.env.SALES_CENTER_API_URL || 'http://localhost:3005';
}

async function tableExists(tableName: string): Promise<boolean> {
	const rows = await query(
		'SELECT 1 AS exists_flag FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1',
		[tableName]
	);
	return rows.length > 0;
}

app.get('/', (req: express.Request, res: express.Response) => {
	res.send('Galaxy Guard Ohio Backend API is running.');
});

app.post('/api/register', async (req: express.Request, res: express.Response) => {
	try {
		const { full_name, email, password, role } = req.body;
		if (!full_name || !email || !password || !role) {
			return res.status(400).json({ error: 'All fields are required.' });
		}
		// Check if user already exists
		const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
		if (existing.length > 0) {
			return res.status(409).json({ error: 'Email already registered.' });
		}
		// Hash password
		const saltRounds = 12;
		const password_hash = await bcrypt.hash(password, saltRounds);
		// Insert user with role
		await query(
			'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
			[full_name, email, password_hash, role]
		);
		res.status(201).json({ message: 'Account created successfully.' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error.' });
	}
});

app.post('/api/login', async (req: express.Request, res: express.Response) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required.' });
		}
		// Find user
		const users = await query('SELECT id, full_name, email, password_hash, role, status, created_at FROM users WHERE email = ?', [email]);
		if (users.length === 0) {
			return res.status(401).json({ error: 'Invalid email or password.' });
		}
		const user = users[0];
		// Compare password
		const match = await bcrypt.compare(password, user.password_hash);
		if (!match) {
			return res.status(401).json({ error: 'Invalid email or password.' });
		}
		// Success: return user info (omit password)
		res.json({
			id: user.id,
			full_name: user.full_name,
			email: user.email,
			role: user.role,
			status: user.status,
			created_at: user.created_at
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error.' });
	}
});

// Return user info for dashboard (simulate auth by email query param for now)
app.get('/api/me', async (req: express.Request, res: express.Response) => {
	try {
		// In production, use session/JWT. For now, get email from query param for demo
		const email = getSingleParam(req.query.email);
		if (!email) return res.status(400).json({ error: 'Email required.' });
		const users = await query('SELECT id, full_name, email, role, status, created_at FROM users WHERE email = ?', [email]);
		if (users.length === 0) return res.status(404).json({ error: 'User not found.' });
		const user = users[0];
		res.json({
			id: user.id,
			full_name: user.full_name,
			email: user.email,
			role: user.role,
			status: user.status,
			created_at: user.created_at
		});
	} catch (err) {
		console.error('Error in /api/me:', err);
		res.status(500).json({ error: 'Server error.' });
	}
});

app.get('/api/enrollments', async (req: express.Request, res: express.Response) => {
	try {
		const rawUserId = getSingleParam(req.query.userId);
		const userId = rawUserId ? Number.parseInt(rawUserId, 10) : Number.NaN;
		if (!Number.isFinite(userId) || userId <= 0) {
			return res.status(400).json({ error: 'A valid userId is required.' });
		}

		const enrollmentsTableExists = await tableExists('enrollments');
		if (!enrollmentsTableExists) {
			return res.json([]);
		}

		const enrollments = await query(
			'SELECT id, program_name, status, enrolled_date, completion_date FROM enrollments WHERE user_id = ? ORDER BY enrolled_date DESC',
			[userId]
		);
		return res.json(enrollments);
	} catch (err) {
		console.error('Error in /api/enrollments:', err);
		return res.status(500).json({ error: 'Server error.' });
	}
});

// Tickets endpoint
app.get('/api/tickets', async (req: express.Request, res: express.Response) => {
	try {
		const tickets = await query('SELECT * FROM tickets');
		res.json({ tickets });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error.' });
	}
});

// Companies endpoint
app.get('/api/companies', async (req: express.Request, res: express.Response) => {
	try {
		const companies = await query('SELECT * FROM companies');
		res.json({ companies });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error.' });
	}
});

// Sync tickets from SSC
app.post('/api/sync-tickets', async (req: express.Request, res: express.Response) => {
	try {
		const sscApiUrl = `${getSalesCenterApiUrl().replace(/\/$/, '')}/api/tickets`;
		const sscJwt = req.body.sscJwt; // JWT from SSC (in production, generate securely)
		if (!sscJwt) return res.status(400).json({ error: 'SSC JWT required.' });
		const response = await axios.get(sscApiUrl, {
			headers: { Authorization: `Bearer ${sscJwt}` }
		});
		const tickets = (response.data as { tickets: any[] }).tickets;
		// Optionally, insert/update tickets in local DB here
		res.json({ tickets });
	} catch (err) {
		console.error('Error syncing tickets from SSC:', err);
		res.status(500).json({ error: 'Sync error.' });
	}
});

app.put('/api/customers/:externalId', async (req: express.Request, res: express.Response) => {
	try {
		const externalId = getSingleParam(req.params.externalId);
		if (!externalId) {
			return res.status(400).json({ error: 'externalId is required.' });
		}

		const payload = withExternalId(req.body || {}, externalId);
		const result = await persistThenEmit('customer', externalId, payload);
		return res.status(result.integrationSynced ? 200 : 202).json({
			message: 'Customer upserted locally.',
			integration: result,
			event_type: 'customer.upsert',
		});
	} catch (err) {
		console.error('Error in customer upsert:', err);
		return res.status(500).json({ error: 'Server error.' });
	}
});

app.put('/api/sales/:externalId', async (req: express.Request, res: express.Response) => {
	try {
		const externalId = getSingleParam(req.params.externalId);
		if (!externalId) {
			return res.status(400).json({ error: 'externalId is required.' });
		}

		const payload = withExternalId(req.body || {}, externalId);
		const result = await persistThenEmit('sale', externalId, payload);
		return res.status(result.integrationSynced ? 200 : 202).json({
			message: 'Sale upserted locally.',
			integration: result,
			event_type: 'sale.upsert',
		});
	} catch (err) {
		console.error('Error in sale upsert:', err);
		return res.status(500).json({ error: 'Server error.' });
	}
});

app.put('/api/services/:externalId', async (req: express.Request, res: express.Response) => {
	try {
		const externalId = getSingleParam(req.params.externalId);
		if (!externalId) {
			return res.status(400).json({ error: 'externalId is required.' });
		}

		const payload = withExternalId(req.body || {}, externalId);
		const result = await persistThenEmit('service', externalId, payload);
		return res.status(result.integrationSynced ? 200 : 202).json({
			message: 'Service upserted locally.',
			integration: result,
			event_type: 'service.upsert',
		});
	} catch (err) {
		console.error('Error in service upsert:', err);
		return res.status(500).json({ error: 'Server error.' });
	}
});

app.put('/api/payments/:externalId', async (req: express.Request, res: express.Response) => {
	try {
		const externalId = getSingleParam(req.params.externalId);
		if (!externalId) {
			return res.status(400).json({ error: 'externalId is required.' });
		}

		const payload = withExternalId(req.body || {}, externalId);
		const result = await persistThenEmit('payment', externalId, payload);
		return res.status(result.integrationSynced ? 200 : 202).json({
			message: 'Payment upserted locally.',
			integration: result,
			event_type: 'payment.upsert',
		});
	} catch (err) {
		console.error('Error in payment upsert:', err);
		return res.status(500).json({ error: 'Server error.' });
	}
});

async function bootstrap(): Promise<void> {
	await ensureOhioDomainTables();
	await ensureOhioIntegrationEventLogTable();
	app.listen(PORT, () => {
		console.log(`Backend server running on port ${PORT}`);
	});
}

bootstrap().catch((error) => {
	console.error('Failed to start backend:', error);
	process.exit(1);
});
