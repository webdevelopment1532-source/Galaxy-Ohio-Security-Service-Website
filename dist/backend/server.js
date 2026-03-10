"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var path = require("path");
var envPath = path.resolve(__dirname, '../../.env');
console.log('[DEBUG] Loading .env from:', envPath);
dotenv.config({ path: envPath });
var express = require("express");
var cors = require("cors");
var helmet = require("helmet");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var bcrypt = require("bcrypt");
var db_1 = require("./db");
var axios = require("axios");
var crypto_1 = require("crypto");
var ohioIntegrationSender_1 = require("./shared/ohioIntegrationSender");
var ohioIntegrationEventLog_1 = require("./shared/ohioIntegrationEventLog");
var ohioIntegrationSender_2 = require("./shared/ohioIntegrationSender");
var index_1 = require("./api/index");
var app = express();
var PORT = process.env.PORT || 4000;
app.use(helmet.default());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/api', index_1.default);
var domainTableMap = {
    customer: 'ohio_customers',
    sale: 'ohio_sales',
    service: 'ohio_services',
    payment: 'ohio_payments',
};
var entityToEventType = {
    customer: 'customer.upsert',
    sale: 'sale.upsert',
    service: 'service.upsert',
    payment: 'payment.upsert',
};
function ensureOhioDomainTables() {
    return __awaiter(this, void 0, void 0, function () {
        var createTableStatements, _i, createTableStatements_1, statement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createTableStatements = Object.values(domainTableMap).map(function (tableName) { return "\n\t\tCREATE TABLE IF NOT EXISTS ".concat(tableName, " (\n\t\t\tid INT AUTO_INCREMENT PRIMARY KEY,\n\t\t\texternal_id VARCHAR(128) NOT NULL UNIQUE,\n\t\t\tpayload_json LONGTEXT NOT NULL,\n\t\t\tcreated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n\t\t\tupdated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n\t\t)\n\t"); });
                    _i = 0, createTableStatements_1 = createTableStatements;
                    _a.label = 1;
                case 1:
                    if (!(_i < createTableStatements_1.length)) return [3 /*break*/, 4];
                    statement = createTableStatements_1[_i];
                    return [4 /*yield*/, (0, db_1.query)(statement)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function upsertDomainRecord(entity, externalId, payload) {
    return __awaiter(this, void 0, void 0, function () {
        var tableName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tableName = domainTableMap[entity];
                    return [4 /*yield*/, (0, db_1.query)("INSERT INTO ".concat(tableName, " (external_id, payload_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE payload_json = VALUES(payload_json), updated_at = CURRENT_TIMESTAMP"), [externalId, JSON.stringify(payload)])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function buildEvent(eventType, payload) {
    var traceId = (0, crypto_1.randomUUID)();
    return {
        event_id: (0, crypto_1.randomUUID)(),
        event_type: eventType,
        occurred_at: new Date().toISOString(),
        event_version: (0, ohioIntegrationSender_1.resolveOhioPublishedEventVersion)(),
        trace_id: traceId,
        payload: payload,
    };
}
function persistThenEmit(entity, externalId, payload) {
    return __awaiter(this, void 0, void 0, function () {
        var event, dispatchResult, error_1, message;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event = buildEvent(entityToEventType[entity], payload);
                    return [4 /*yield*/, (0, db_1.runInTransaction)(function (txQuery) { return __awaiter(_this, void 0, void 0, function () {
                            var tableName;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        tableName = domainTableMap[entity];
                                        return [4 /*yield*/, txQuery("INSERT INTO ".concat(tableName, " (external_id, payload_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE payload_json = VALUES(payload_json), updated_at = CURRENT_TIMESTAMP"), [externalId, JSON.stringify(payload)])];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, (0, ohioIntegrationEventLog_1.enqueueOhioIntegrationEvent)(event, txQuery)];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 7]);
                    return [4 /*yield*/, (0, ohioIntegrationSender_1.dispatchOhioIntegrationEvent)(event)];
                case 3:
                    dispatchResult = _a.sent();
                    return [4 /*yield*/, (0, ohioIntegrationEventLog_1.markOhioIntegrationEventSent)(event.event_id, {
                            status: dispatchResult.status,
                            latencyMs: dispatchResult.latencyMs,
                            attemptsUsed: dispatchResult.attempts,
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, { integrationSynced: true }];
                case 5:
                    error_1 = _a.sent();
                    console.error("Integration emit failed for ".concat(entity, " ").concat(externalId, ":"), error_1);
                    message = error_1 instanceof Error ? error_1.message : String(error_1);
                    return [4 /*yield*/, (0, ohioIntegrationEventLog_1.markOhioIntegrationEventFailedAttempt)(event.event_id, message)];
                case 6:
                    _a.sent();
                    return [2 /*return*/, {
                            integrationSynced: false,
                            integrationError: message,
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
app.get('/api/integrations/ohio/health', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var metrics, senderConfig, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, ohioIntegrationEventLog_1.getOhioIntegrationEventLogMetrics)()];
            case 1:
                metrics = _a.sent();
                senderConfig = (0, ohioIntegrationSender_2.resolveOhioSenderConfig)();
                return [2 /*return*/, res.json({
                        integration: 'ohio-sales-center',
                        endpoint: "".concat(senderConfig.integrationUrl.replace(/\/$/, '')).concat(senderConfig.integrationEndpointPath),
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
                    })];
            case 2:
                error_2 = _a.sent();
                console.error('Error loading Ohio integration health:', error_2);
                return [2 /*return*/, res.status(500).json({ error: 'Failed to load integration health.' })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/integrations/ohio/dead-letter', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requestedLimit, limit, events, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requestedLimit = Number.parseInt(String(req.query.limit || '100'), 10);
                limit = Number.isFinite(requestedLimit) ? requestedLimit : 100;
                return [4 /*yield*/, (0, ohioIntegrationEventLog_1.getPermanentlyFailedOhioIntegrationEvents)(limit)];
            case 1:
                events = _a.sent();
                return [2 /*return*/, res.json({ events: events, total: events.length })];
            case 2:
                error_3 = _a.sent();
                console.error('Error loading Ohio dead-letter queue view:', error_3);
                return [2 /*return*/, res.status(500).json({ error: 'Failed to load dead-letter events.' })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/integrations/ohio/requeue/:eventId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var eventId, queued, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                eventId = getSingleParam(req.params.eventId);
                if (!eventId) {
                    return [2 /*return*/, res.status(400).json({ error: 'eventId is required.' })];
                }
                return [4 /*yield*/, (0, ohioIntegrationEventLog_1.requeueOhioIntegrationEvent)(eventId)];
            case 1:
                queued = _a.sent();
                if (!queued) {
                    return [2 /*return*/, res.status(404).json({ error: 'Event was not found in PERMANENTLY_FAILED state.' })];
                }
                return [2 /*return*/, res.json({ message: 'Event re-queued for replay.', eventId: eventId })];
            case 2:
                error_4 = _a.sent();
                console.error('Error re-queueing Ohio integration event:', error_4);
                return [2 /*return*/, res.status(500).json({ error: 'Failed to re-queue event.' })];
            case 3: return [2 /*return*/];
        }
    });
}); });
function withExternalId(payload, externalId) {
    return __assign(__assign({}, payload), { external_id: externalId });
}
function getSingleParam(value) {
    if (Array.isArray(value)) {
        var first = value[0];
        return typeof first === 'string' ? first : undefined;
    }
    return typeof value === 'string' ? value : undefined;
}
function getSalesCenterApiUrl() {
    return process.env.SALES_CENTER_API_URL || 'http://localhost:3005';
}
function tableExists(tableName) {
    return __awaiter(this, void 0, void 0, function () {
        var rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, db_1.query)('SELECT 1 AS exists_flag FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1', [tableName])];
                case 1:
                    rows = _a.sent();
                    return [2 /*return*/, rows.length > 0];
            }
        });
    });
}
app.get('/', function (req, res) {
    res.send('Galaxy Guard Ohio Backend API is running.');
});
app.post('/api/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, full_name, email, password, role, existing, saltRounds, password_hash, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, full_name = _a.full_name, email = _a.email, password = _a.password, role = _a.role;
                if (!full_name || !email || !password || !role) {
                    return [2 /*return*/, res.status(400).json({ error: 'All fields are required.' })];
                }
                return [4 /*yield*/, (0, db_1.query)('SELECT id FROM users WHERE email = ?', [email])];
            case 1:
                existing = _b.sent();
                if (existing.length > 0) {
                    return [2 /*return*/, res.status(409).json({ error: 'Email already registered.' })];
                }
                saltRounds = 12;
                return [4 /*yield*/, bcrypt.hash(password, saltRounds)];
            case 2:
                password_hash = _b.sent();
                // Insert user with role
                return [4 /*yield*/, (0, db_1.query)('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)', [full_name, email, password_hash, role])];
            case 3:
                // Insert user with role
                _b.sent();
                res.status(201).json({ message: 'Account created successfully.' });
                return [3 /*break*/, 5];
            case 4:
                err_1 = _b.sent();
                console.error(err_1);
                res.status(500).json({ error: 'Server error.' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post('/api/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, users, user, match, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({ error: 'Email and password are required.' })];
                }
                return [4 /*yield*/, (0, db_1.query)('SELECT id, full_name, email, password_hash, role, status, created_at FROM users WHERE email = ?', [email])];
            case 1:
                users = _b.sent();
                if (users.length === 0) {
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid email or password.' })];
                }
                user = users[0];
                return [4 /*yield*/, bcrypt.compare(password, user.password_hash)];
            case 2:
                match = _b.sent();
                if (!match) {
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid email or password.' })];
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
                return [3 /*break*/, 4];
            case 3:
                err_2 = _b.sent();
                console.error(err_2);
                res.status(500).json({ error: 'Server error.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Return user info for dashboard (simulate auth by email query param for now)
app.get('/api/me', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, users, user, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                email = getSingleParam(req.query.email);
                if (!email)
                    return [2 /*return*/, res.status(400).json({ error: 'Email required.' })];
                return [4 /*yield*/, (0, db_1.query)('SELECT id, full_name, email, role, status, created_at FROM users WHERE email = ?', [email])];
            case 1:
                users = _a.sent();
                if (users.length === 0)
                    return [2 /*return*/, res.status(404).json({ error: 'User not found.' })];
                user = users[0];
                res.json({
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    created_at: user.created_at
                });
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                console.error('Error in /api/me:', err_3);
                res.status(500).json({ error: 'Server error.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/enrollments', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rawUserId, userId, enrollmentsTableExists, enrollments, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                rawUserId = getSingleParam(req.query.userId);
                userId = rawUserId ? Number.parseInt(rawUserId, 10) : Number.NaN;
                if (!Number.isFinite(userId) || userId <= 0) {
                    return [2 /*return*/, res.status(400).json({ error: 'A valid userId is required.' })];
                }
                return [4 /*yield*/, tableExists('enrollments')];
            case 1:
                enrollmentsTableExists = _a.sent();
                if (!enrollmentsTableExists) {
                    return [2 /*return*/, res.json([])];
                }
                return [4 /*yield*/, (0, db_1.query)('SELECT id, program_name, status, enrolled_date, completion_date FROM enrollments WHERE user_id = ? ORDER BY enrolled_date DESC', [userId])];
            case 2:
                enrollments = _a.sent();
                return [2 /*return*/, res.json(enrollments)];
            case 3:
                err_4 = _a.sent();
                console.error('Error in /api/enrollments:', err_4);
                return [2 /*return*/, res.status(500).json({ error: 'Server error.' })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Tickets endpoint
app.get('/api/tickets', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tickets, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, db_1.query)('SELECT * FROM tickets')];
            case 1:
                tickets = _a.sent();
                res.json({ tickets: tickets });
                return [3 /*break*/, 3];
            case 2:
                err_5 = _a.sent();
                console.error(err_5);
                res.status(500).json({ error: 'Server error.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Companies endpoint
app.get('/api/companies', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var companies, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, db_1.query)('SELECT * FROM companies')];
            case 1:
                companies = _a.sent();
                res.json({ companies: companies });
                return [3 /*break*/, 3];
            case 2:
                err_6 = _a.sent();
                console.error(err_6);
                res.status(500).json({ error: 'Server error.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Sync tickets from SSC
app.post('/api/sync-tickets', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sscApiUrl, sscJwt, response, tickets, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                sscApiUrl = "".concat(getSalesCenterApiUrl().replace(/\/$/, ''), "/api/tickets");
                sscJwt = req.body.sscJwt;
                if (!sscJwt)
                    return [2 /*return*/, res.status(400).json({ error: 'SSC JWT required.' })];
                return [4 /*yield*/, axios.get(sscApiUrl, {
                        headers: { Authorization: "Bearer ".concat(sscJwt) }
                    })];
            case 1:
                response = _a.sent();
                tickets = response.data.tickets;
                // Optionally, insert/update tickets in local DB here
                res.json({ tickets: tickets });
                return [3 /*break*/, 3];
            case 2:
                err_7 = _a.sent();
                console.error('Error syncing tickets from SSC:', err_7);
                res.status(500).json({ error: 'Sync error.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/api/customers/:externalId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var externalId, payload, result, err_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                externalId = getSingleParam(req.params.externalId);
                if (!externalId) {
                    return [2 /*return*/, res.status(400).json({ error: 'externalId is required.' })];
                }
                payload = withExternalId(req.body || {}, externalId);
                return [4 /*yield*/, persistThenEmit('customer', externalId, payload)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, res.status(result.integrationSynced ? 200 : 202).json({
                        message: 'Customer upserted locally.',
                        integration: result,
                        event_type: 'customer.upsert',
                    })];
            case 2:
                err_8 = _a.sent();
                console.error('Error in customer upsert:', err_8);
                return [2 /*return*/, res.status(500).json({ error: 'Server error.' })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/api/sales/:externalId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var externalId, payload, result, err_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                externalId = getSingleParam(req.params.externalId);
                if (!externalId) {
                    return [2 /*return*/, res.status(400).json({ error: 'externalId is required.' })];
                }
                payload = withExternalId(req.body || {}, externalId);
                return [4 /*yield*/, persistThenEmit('sale', externalId, payload)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, res.status(result.integrationSynced ? 200 : 202).json({
                        message: 'Sale upserted locally.',
                        integration: result,
                        event_type: 'sale.upsert',
                    })];
            case 2:
                err_9 = _a.sent();
                console.error('Error in sale upsert:', err_9);
                return [2 /*return*/, res.status(500).json({ error: 'Server error.' })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/api/services/:externalId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var externalId, payload, result, err_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                externalId = getSingleParam(req.params.externalId);
                if (!externalId) {
                    return [2 /*return*/, res.status(400).json({ error: 'externalId is required.' })];
                }
                payload = withExternalId(req.body || {}, externalId);
                return [4 /*yield*/, persistThenEmit('service', externalId, payload)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, res.status(result.integrationSynced ? 200 : 202).json({
                        message: 'Service upserted locally.',
                        integration: result,
                        event_type: 'service.upsert',
                    })];
            case 2:
                err_10 = _a.sent();
                console.error('Error in service upsert:', err_10);
                return [2 /*return*/, res.status(500).json({ error: 'Server error.' })];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/api/payments/:externalId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var externalId, payload, result, err_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                externalId = getSingleParam(req.params.externalId);
                if (!externalId) {
                    return [2 /*return*/, res.status(400).json({ error: 'externalId is required.' })];
                }
                payload = withExternalId(req.body || {}, externalId);
                return [4 /*yield*/, persistThenEmit('payment', externalId, payload)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, res.status(result.integrationSynced ? 200 : 202).json({
                        message: 'Payment upserted locally.',
                        integration: result,
                        event_type: 'payment.upsert',
                    })];
            case 2:
                err_11 = _a.sent();
                console.error('Error in payment upsert:', err_11);
                return [2 /*return*/, res.status(500).json({ error: 'Server error.' })];
            case 3: return [2 /*return*/];
        }
    });
}); });
function bootstrap() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureOhioDomainTables()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, ohioIntegrationEventLog_1.ensureOhioIntegrationEventLogTable)()];
                case 2:
                    _a.sent();
                    app.listen(PORT, function () {
                        console.log("Backend server running on port ".concat(PORT));
                    });
                    return [2 /*return*/];
            }
        });
    });
}
bootstrap().catch(function (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
});
