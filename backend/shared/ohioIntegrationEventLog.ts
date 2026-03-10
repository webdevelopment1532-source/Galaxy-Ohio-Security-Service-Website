import { OhioIntegrationEvent, dispatchOhioIntegrationEvent, resolveOhioSenderConfig } from './ohioIntegrationSender';

export type OhioIntegrationEventStatus =
  | 'PENDING'
  | 'RETRYING'
  | 'SENDING'
  | 'SENT'
  | 'QUEUED_TO_BROKER'
  | 'FAILED'
  | 'PERMANENTLY_FAILED';

type QueryExecutor = (sql: string, params?: any[]) => Promise<any[]>;

export interface OhioIntegrationEventLogRow {
  event_id: string;
  event_type: string;
  payload_json: string;
  status: OhioIntegrationEventStatus;
  attempts: number;
  target_url: string | null;
  error_message?: string | null;
  last_http_status?: number | null;
  last_latency_ms?: number | null;
  occurred_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface SentDeliveryMetadata {
  status?: number;
  latencyMs?: number;
  attemptsUsed?: number;
}

interface BrokerDeliveryMetadata {
  latencyMs?: number;
  attemptsUsed?: number;
}

interface BrokerReplayResult {
  processed: number;
  queued: number;
  failed: number;
}

function runQuery(sql: string, params?: any[]): Promise<any[]> {
  const db = require('../db') as { query: (statement: string, values?: any[]) => Promise<any[]> };
  return db.query(sql, params);
}

function toNonNegativeInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function toPositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function buildOhioIntegrationEndpoint(integrationUrl: string): string {
  const endpointPath = process.env.OHIO_INTEGRATION_ENDPOINT_PATH || '/api/integrations/ohio/events';
  return `${integrationUrl.replace(/\/$/, '')}${endpointPath}`;
}

export function computeRetryDelayMs(attemptNumber: number, baseDelayMs: number): number {
  const safeAttempt = Math.max(1, attemptNumber);
  const exponent = Math.min(safeAttempt - 1, 6);
  return baseDelayMs * 2 ** exponent;
}

function getEventLogMaxAttempts(): number {
  return toPositiveInteger(process.env.OHIO_EVENT_LOG_MAX_ATTEMPTS, 10);
}

function getEventLogReplayBatchSize(): number {
  return toPositiveInteger(process.env.OHIO_EVENT_LOG_REPLAY_BATCH_SIZE, 25);
}

function getBaseRetryDelayMs(): number {
  return toNonNegativeInteger(process.env.OHIO_INTEGRATION_RETRY_DELAY_MS, 500);
}

function getSendingRecoverySeconds(): number {
  return toPositiveInteger(process.env.OHIO_EVENT_LOG_SENDING_RECOVERY_SECONDS, 120);
}

function resolveTargetUrlFromEnv(): string | null {
  try {
    return buildOhioIntegrationEndpoint(resolveOhioSenderConfig().integrationUrl);
  } catch {
    return null;
  }
}

export async function ensureOhioIntegrationEventLogTable(): Promise<void> {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS ohio_integration_event_log (
      event_id VARCHAR(64) PRIMARY KEY,
      event_type VARCHAR(64) NOT NULL,
      occurred_at DATETIME(3) NOT NULL,
      payload_json LONGTEXT NOT NULL,
      target_url VARCHAR(512) NULL,
      status VARCHAR(16) NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      last_attempt_at DATETIME(3) NULL,
      next_attempt_at DATETIME(3) NULL,
      sent_at DATETIME(3) NULL,
      last_http_status INT NULL,
      last_latency_ms INT NULL,
      error_message TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ohio_event_log_status_next_attempt (status, next_attempt_at)
    )
  `);

  // Backfill columns for existing deployments running older table definitions.
  await runQuery(`ALTER TABLE ohio_integration_event_log ADD COLUMN IF NOT EXISTS sent_at DATETIME(3) NULL`);
  await runQuery(`ALTER TABLE ohio_integration_event_log ADD COLUMN IF NOT EXISTS last_http_status INT NULL`);
  await runQuery(`ALTER TABLE ohio_integration_event_log ADD COLUMN IF NOT EXISTS last_latency_ms INT NULL`);
}

export async function enqueueOhioIntegrationEvent(event: OhioIntegrationEvent, queryExecutor?: QueryExecutor): Promise<void> {
  const targetUrl = resolveTargetUrlFromEnv();
  const execute = queryExecutor || runQuery;
  const parsedOccurredAt = new Date(event.occurred_at);
  const occurredAtForDb = Number.isNaN(parsedOccurredAt.getTime()) ? new Date() : parsedOccurredAt;
  const eventToPersist = {
    ...event,
    event_version: event.event_version || process.env.OHIO_INTEGRATION_EVENT_VERSION || 'v1',
    trace_id: event.trace_id || event.event_id,
  };
  await execute(
    `INSERT INTO ohio_integration_event_log (event_id, event_type, occurred_at, payload_json, target_url, status, attempts) VALUES (?, ?, ?, ?, ?, 'PENDING', 0)`,
    [event.event_id, event.event_type, occurredAtForDb, JSON.stringify(eventToPersist), targetUrl]
  );
}

export async function markOhioIntegrationEventSent(eventId: string, delivery?: SentDeliveryMetadata): Promise<void> {
  const attemptsUsed = Math.max(1, delivery?.attemptsUsed || 1);
  await runQuery(
    `UPDATE ohio_integration_event_log
     SET status = 'SENT',
         attempts = attempts + ?,
         last_attempt_at = CURRENT_TIMESTAMP(3),
         next_attempt_at = NULL,
         sent_at = CURRENT_TIMESTAMP(3),
         last_http_status = ?,
         last_latency_ms = ?,
         error_message = NULL
     WHERE event_id = ?
       AND status = 'SENDING'`,
    [attemptsUsed, delivery?.status || null, delivery?.latencyMs || null, eventId]
  );
}

export async function markOhioIntegrationEventQueuedToBroker(
  eventId: string,
  delivery?: BrokerDeliveryMetadata
): Promise<void> {
  const attemptsUsed = Math.max(1, delivery?.attemptsUsed || 1);
  await runQuery(
    `UPDATE ohio_integration_event_log
     SET status = 'QUEUED_TO_BROKER',
         attempts = attempts + ?,
         last_attempt_at = CURRENT_TIMESTAMP(3),
         next_attempt_at = NULL,
         sent_at = CURRENT_TIMESTAMP(3),
         last_http_status = NULL,
         last_latency_ms = ?,
         error_message = NULL
     WHERE event_id = ?
       AND status = 'SENDING'`,
    [attemptsUsed, delivery?.latencyMs || null, eventId]
  );
}

export async function markOhioIntegrationEventFailedAttempt(eventId: string, errorMessage: string): Promise<void> {
  const rows = await runQuery('SELECT attempts FROM ohio_integration_event_log WHERE event_id = ? AND status = \'SENDING\'', [eventId]);
  const row = rows[0] as { attempts?: number } | undefined;
  if (!row) {
    return;
  }
  const currentAttempts = row?.attempts ?? 0;
  const nextAttemptCount = currentAttempts + 1;
  const maxAttempts = getEventLogMaxAttempts();
  const isTerminalFailure = nextAttemptCount >= maxAttempts;

  let nextAttemptAt: Date | null = null;
  if (!isTerminalFailure) {
    const delayMs = computeRetryDelayMs(nextAttemptCount, getBaseRetryDelayMs());
    nextAttemptAt = new Date(Date.now() + delayMs);
  }

  await runQuery(
    `UPDATE ohio_integration_event_log
     SET status = ?,
         attempts = ?,
         last_attempt_at = CURRENT_TIMESTAMP(3),
         next_attempt_at = ?,
         last_http_status = NULL,
         error_message = ?
     WHERE event_id = ?
       AND status = 'SENDING'`,
    [isTerminalFailure ? 'PERMANENTLY_FAILED' : 'RETRYING', nextAttemptCount, nextAttemptAt, errorMessage, eventId]
  );
}

async function claimOhioIntegrationEventForSending(eventId: string): Promise<boolean> {
  const maxAttempts = getEventLogMaxAttempts();
  const result = await runQuery(
    `UPDATE ohio_integration_event_log
     SET status = 'SENDING',
         last_attempt_at = CURRENT_TIMESTAMP(3)
     WHERE event_id = ?
       AND status IN ('PENDING', 'RETRYING')
       AND attempts < ?
       AND (next_attempt_at IS NULL OR next_attempt_at <= CURRENT_TIMESTAMP(3))`,
    [eventId, maxAttempts]
  );

  const affectedRows = Number((result as { affectedRows?: number } | undefined)?.affectedRows || 0);
  return affectedRows > 0;
}

export async function recoverStuckSendingOhioIntegrationEvents(): Promise<number> {
  const recoverySeconds = getSendingRecoverySeconds();
  const result = await runQuery(
    `UPDATE ohio_integration_event_log
     SET status = 'RETRYING',
         next_attempt_at = CURRENT_TIMESTAMP(3),
         error_message = COALESCE(error_message, 'Recovered from stale SENDING state by outbox worker')
     WHERE status = 'SENDING'
       AND last_attempt_at IS NOT NULL
       AND last_attempt_at <= (CURRENT_TIMESTAMP(3) - INTERVAL ? SECOND)`,
    [recoverySeconds]
  );

  return Number((result as { affectedRows?: number } | undefined)?.affectedRows || 0);
}

export async function getReplayableOhioIntegrationEvents(limit = getEventLogReplayBatchSize()): Promise<OhioIntegrationEventLogRow[]> {
  const maxAttempts = getEventLogMaxAttempts();
  const rows = await runQuery(
    `SELECT event_id, event_type, payload_json, status, attempts, target_url
     FROM ohio_integration_event_log
     WHERE status IN ('PENDING', 'RETRYING')
       AND attempts < ?
       AND (next_attempt_at IS NULL OR next_attempt_at <= CURRENT_TIMESTAMP(3))
     ORDER BY created_at ASC
     LIMIT ?`,
    [maxAttempts, limit]
  );

  return rows as OhioIntegrationEventLogRow[];
}

export async function replayOhioIntegrationEventQueue(limit = getEventLogReplayBatchSize()): Promise<{ processed: number; sent: number; failed: number }> {
  await recoverStuckSendingOhioIntegrationEvents();
  const rows = await getReplayableOhioIntegrationEvents(limit);
  let sent = 0;
  let failed = 0;
  let processed = 0;

  for (const row of rows) {
    const claimed = await claimOhioIntegrationEventForSending(row.event_id);
    if (!claimed) {
      continue;
    }
    processed += 1;

    try {
      const event = JSON.parse(row.payload_json) as OhioIntegrationEvent;
      const dispatchResult = await dispatchOhioIntegrationEvent(event, { maxRetries: 0 });
      await markOhioIntegrationEventSent(row.event_id, {
        status: dispatchResult.status,
        latencyMs: dispatchResult.latencyMs,
        attemptsUsed: dispatchResult.attempts,
      });
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await markOhioIntegrationEventFailedAttempt(row.event_id, message);
      failed += 1;
    }
  }

  return {
    processed,
    sent,
    failed,
  };
}

export async function replayOhioIntegrationEventQueueToBroker(
  publishEvent: (event: OhioIntegrationEvent) => Promise<{ latencyMs?: number }>,
  limit = getEventLogReplayBatchSize()
): Promise<BrokerReplayResult> {
  await recoverStuckSendingOhioIntegrationEvents();
  const rows = await getReplayableOhioIntegrationEvents(limit);
  let queued = 0;
  let failed = 0;
  let processed = 0;

  for (const row of rows) {
    const claimed = await claimOhioIntegrationEventForSending(row.event_id);
    if (!claimed) {
      continue;
    }
    processed += 1;

    try {
      const event = JSON.parse(row.payload_json) as OhioIntegrationEvent;
      const publishResult = await publishEvent(event);
      await markOhioIntegrationEventQueuedToBroker(row.event_id, {
        latencyMs: publishResult.latencyMs,
        attemptsUsed: 1,
      });
      queued += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await markOhioIntegrationEventFailedAttempt(row.event_id, message);
      failed += 1;
    }
  }

  return {
    processed,
    queued,
    failed,
  };
}

export async function getPermanentlyFailedOhioIntegrationEvents(limit = 100): Promise<OhioIntegrationEventLogRow[]> {
  const safeLimit = Math.max(1, Math.min(limit, 500));
  const rows = await runQuery(
    `SELECT event_id, event_type, payload_json, status, attempts, target_url, error_message, occurred_at, created_at, updated_at
     FROM ohio_integration_event_log
     WHERE status = 'PERMANENTLY_FAILED'
     ORDER BY updated_at DESC
     LIMIT ?`,
    [safeLimit]
  );

  return rows as OhioIntegrationEventLogRow[];
}

export async function requeueOhioIntegrationEvent(eventId: string): Promise<boolean> {
  const result = await runQuery(
    `UPDATE ohio_integration_event_log
     SET status = 'RETRYING',
         attempts = 0,
         next_attempt_at = CURRENT_TIMESTAMP(3),
         error_message = NULL
     WHERE event_id = ?
       AND status = 'PERMANENTLY_FAILED'`,
    [eventId]
  );

  const affectedRows = Number((result as { affectedRows?: number } | undefined)?.affectedRows || 0);
  return affectedRows > 0;
}

export async function getOhioIntegrationEventLogMetrics(): Promise<{
  byStatus: Record<string, number>;
  replayable: number;
  permanentlyFailed: number;
  last24h: {
    created: number;
    sent: number;
    averageDeliveryLatencyMs: number;
  };
}> {
  const grouped = await runQuery(
    `SELECT status, COUNT(*) AS total
     FROM ohio_integration_event_log
     GROUP BY status`
  );

  const replayableRows = await runQuery(
    `SELECT COUNT(*) AS total
     FROM ohio_integration_event_log
     WHERE status IN ('PENDING', 'RETRYING')
       AND (next_attempt_at IS NULL OR next_attempt_at <= CURRENT_TIMESTAMP(3))`
  );

  const last24hRows = await runQuery(
    `SELECT
       SUM(CASE WHEN created_at >= (CURRENT_TIMESTAMP - INTERVAL 1 DAY) THEN 1 ELSE 0 END) AS created_24h,
       SUM(CASE WHEN sent_at >= (CURRENT_TIMESTAMP - INTERVAL 1 DAY) THEN 1 ELSE 0 END) AS sent_24h,
       AVG(CASE WHEN sent_at >= (CURRENT_TIMESTAMP - INTERVAL 1 DAY) THEN last_latency_ms ELSE NULL END) AS avg_latency_24h
     FROM ohio_integration_event_log`
  );

  const byStatus = (grouped as Array<{ status?: string; total?: number }>).reduce<Record<string, number>>(
    (acc, row) => {
      const key = row.status || 'UNKNOWN';
      acc[key] = Number(row.total || 0);
      return acc;
    },
    {}
  );

  return {
    byStatus,
    replayable: Number((replayableRows?.[0] as { total?: number } | undefined)?.total || 0),
    permanentlyFailed:
      Number(byStatus.PERMANENTLY_FAILED || 0) + Number(byStatus.FAILED || 0),
    last24h: {
      created: Number((last24hRows?.[0] as { created_24h?: number } | undefined)?.created_24h || 0),
      sent: Number((last24hRows?.[0] as { sent_24h?: number } | undefined)?.sent_24h || 0),
      averageDeliveryLatencyMs: Math.round(
        Number((last24hRows?.[0] as { avg_latency_24h?: number } | undefined)?.avg_latency_24h || 0)
      ),
    },
  };
}
