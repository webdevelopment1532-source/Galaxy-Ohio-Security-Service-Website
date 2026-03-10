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
exports.buildOhioIntegrationEndpoint = buildOhioIntegrationEndpoint;
exports.computeRetryDelayMs = computeRetryDelayMs;
exports.ensureOhioIntegrationEventLogTable = ensureOhioIntegrationEventLogTable;
exports.enqueueOhioIntegrationEvent = enqueueOhioIntegrationEvent;
exports.markOhioIntegrationEventSent = markOhioIntegrationEventSent;
exports.markOhioIntegrationEventQueuedToBroker = markOhioIntegrationEventQueuedToBroker;
exports.markOhioIntegrationEventFailedAttempt = markOhioIntegrationEventFailedAttempt;
exports.recoverStuckSendingOhioIntegrationEvents = recoverStuckSendingOhioIntegrationEvents;
exports.getReplayableOhioIntegrationEvents = getReplayableOhioIntegrationEvents;
exports.replayOhioIntegrationEventQueue = replayOhioIntegrationEventQueue;
exports.replayOhioIntegrationEventQueueToBroker = replayOhioIntegrationEventQueueToBroker;
exports.getPermanentlyFailedOhioIntegrationEvents = getPermanentlyFailedOhioIntegrationEvents;
exports.requeueOhioIntegrationEvent = requeueOhioIntegrationEvent;
exports.getOhioIntegrationEventLogMetrics = getOhioIntegrationEventLogMetrics;
var ohioIntegrationSender_1 = require("./ohioIntegrationSender");
function runQuery(sql, params) {
    var db = require('../db');
    return db.query(sql, params);
}
function toNonNegativeInteger(value, fallback) {
    if (!value)
        return fallback;
    var parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
function toPositiveInteger(value, fallback) {
    if (!value)
        return fallback;
    var parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function buildOhioIntegrationEndpoint(integrationUrl) {
    var endpointPath = process.env.OHIO_INTEGRATION_ENDPOINT_PATH || '/api/integrations/ohio/events';
    return "".concat(integrationUrl.replace(/\/$/, '')).concat(endpointPath);
}
function computeRetryDelayMs(attemptNumber, baseDelayMs) {
    var safeAttempt = Math.max(1, attemptNumber);
    var exponent = Math.min(safeAttempt - 1, 6);
    return baseDelayMs * Math.pow(2, exponent);
}
function getEventLogMaxAttempts() {
    return toPositiveInteger(process.env.OHIO_EVENT_LOG_MAX_ATTEMPTS, 10);
}
function getEventLogReplayBatchSize() {
    return toPositiveInteger(process.env.OHIO_EVENT_LOG_REPLAY_BATCH_SIZE, 25);
}
function getBaseRetryDelayMs() {
    return toNonNegativeInteger(process.env.OHIO_INTEGRATION_RETRY_DELAY_MS, 500);
}
function getSendingRecoverySeconds() {
    return toPositiveInteger(process.env.OHIO_EVENT_LOG_SENDING_RECOVERY_SECONDS, 120);
}
function resolveTargetUrlFromEnv() {
    try {
        return buildOhioIntegrationEndpoint((0, ohioIntegrationSender_1.resolveOhioSenderConfig)().integrationUrl);
    }
    catch (_a) {
        return null;
    }
}
function ensureOhioIntegrationEventLogTable() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runQuery("\n    CREATE TABLE IF NOT EXISTS ohio_integration_event_log (\n      event_id VARCHAR(64) PRIMARY KEY,\n      event_type VARCHAR(64) NOT NULL,\n      occurred_at DATETIME(3) NOT NULL,\n      payload_json LONGTEXT NOT NULL,\n      target_url VARCHAR(512) NULL,\n      status VARCHAR(16) NOT NULL,\n      attempts INT NOT NULL DEFAULT 0,\n      last_attempt_at DATETIME(3) NULL,\n      next_attempt_at DATETIME(3) NULL,\n      sent_at DATETIME(3) NULL,\n      last_http_status INT NULL,\n      last_latency_ms INT NULL,\n      error_message TEXT NULL,\n      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n      INDEX idx_ohio_event_log_status_next_attempt (status, next_attempt_at)\n    )\n  ")];
                case 1:
                    _a.sent();
                    // Backfill columns for existing deployments running older table definitions.
                    return [4 /*yield*/, runQuery("ALTER TABLE ohio_integration_event_log ADD COLUMN IF NOT EXISTS sent_at DATETIME(3) NULL")];
                case 2:
                    // Backfill columns for existing deployments running older table definitions.
                    _a.sent();
                    return [4 /*yield*/, runQuery("ALTER TABLE ohio_integration_event_log ADD COLUMN IF NOT EXISTS last_http_status INT NULL")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, runQuery("ALTER TABLE ohio_integration_event_log ADD COLUMN IF NOT EXISTS last_latency_ms INT NULL")];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function enqueueOhioIntegrationEvent(event, queryExecutor) {
    return __awaiter(this, void 0, void 0, function () {
        var targetUrl, execute, parsedOccurredAt, occurredAtForDb, eventToPersist;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    targetUrl = resolveTargetUrlFromEnv();
                    execute = queryExecutor || runQuery;
                    parsedOccurredAt = new Date(event.occurred_at);
                    occurredAtForDb = Number.isNaN(parsedOccurredAt.getTime()) ? new Date() : parsedOccurredAt;
                    eventToPersist = __assign(__assign({}, event), { event_version: event.event_version || process.env.OHIO_INTEGRATION_EVENT_VERSION || 'v1', trace_id: event.trace_id || event.event_id });
                    return [4 /*yield*/, execute("INSERT INTO ohio_integration_event_log (event_id, event_type, occurred_at, payload_json, target_url, status, attempts) VALUES (?, ?, ?, ?, ?, 'PENDING', 0)", [event.event_id, event.event_type, occurredAtForDb, JSON.stringify(eventToPersist), targetUrl])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function markOhioIntegrationEventSent(eventId, delivery) {
    return __awaiter(this, void 0, void 0, function () {
        var attemptsUsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    attemptsUsed = Math.max(1, (delivery === null || delivery === void 0 ? void 0 : delivery.attemptsUsed) || 1);
                    return [4 /*yield*/, runQuery("UPDATE ohio_integration_event_log\n     SET status = 'SENT',\n         attempts = attempts + ?,\n         last_attempt_at = CURRENT_TIMESTAMP(3),\n         next_attempt_at = NULL,\n         sent_at = CURRENT_TIMESTAMP(3),\n         last_http_status = ?,\n         last_latency_ms = ?,\n         error_message = NULL\n     WHERE event_id = ?\n       AND status = 'SENDING'", [attemptsUsed, (delivery === null || delivery === void 0 ? void 0 : delivery.status) || null, (delivery === null || delivery === void 0 ? void 0 : delivery.latencyMs) || null, eventId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function markOhioIntegrationEventQueuedToBroker(eventId, delivery) {
    return __awaiter(this, void 0, void 0, function () {
        var attemptsUsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    attemptsUsed = Math.max(1, (delivery === null || delivery === void 0 ? void 0 : delivery.attemptsUsed) || 1);
                    return [4 /*yield*/, runQuery("UPDATE ohio_integration_event_log\n     SET status = 'QUEUED_TO_BROKER',\n         attempts = attempts + ?,\n         last_attempt_at = CURRENT_TIMESTAMP(3),\n         next_attempt_at = NULL,\n         sent_at = CURRENT_TIMESTAMP(3),\n         last_http_status = NULL,\n         last_latency_ms = ?,\n         error_message = NULL\n     WHERE event_id = ?\n       AND status = 'SENDING'", [attemptsUsed, (delivery === null || delivery === void 0 ? void 0 : delivery.latencyMs) || null, eventId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function markOhioIntegrationEventFailedAttempt(eventId, errorMessage) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, row, currentAttempts, nextAttemptCount, maxAttempts, isTerminalFailure, nextAttemptAt, delayMs;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, runQuery('SELECT attempts FROM ohio_integration_event_log WHERE event_id = ? AND status = \'SENDING\'', [eventId])];
                case 1:
                    rows = _b.sent();
                    row = rows[0];
                    if (!row) {
                        return [2 /*return*/];
                    }
                    currentAttempts = (_a = row === null || row === void 0 ? void 0 : row.attempts) !== null && _a !== void 0 ? _a : 0;
                    nextAttemptCount = currentAttempts + 1;
                    maxAttempts = getEventLogMaxAttempts();
                    isTerminalFailure = nextAttemptCount >= maxAttempts;
                    nextAttemptAt = null;
                    if (!isTerminalFailure) {
                        delayMs = computeRetryDelayMs(nextAttemptCount, getBaseRetryDelayMs());
                        nextAttemptAt = new Date(Date.now() + delayMs);
                    }
                    return [4 /*yield*/, runQuery("UPDATE ohio_integration_event_log\n     SET status = ?,\n         attempts = ?,\n         last_attempt_at = CURRENT_TIMESTAMP(3),\n         next_attempt_at = ?,\n         last_http_status = NULL,\n         error_message = ?\n     WHERE event_id = ?\n       AND status = 'SENDING'", [isTerminalFailure ? 'PERMANENTLY_FAILED' : 'RETRYING', nextAttemptCount, nextAttemptAt, errorMessage, eventId])];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function claimOhioIntegrationEventForSending(eventId) {
    return __awaiter(this, void 0, void 0, function () {
        var maxAttempts, result, affectedRows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    maxAttempts = getEventLogMaxAttempts();
                    return [4 /*yield*/, runQuery("UPDATE ohio_integration_event_log\n     SET status = 'SENDING',\n         last_attempt_at = CURRENT_TIMESTAMP(3)\n     WHERE event_id = ?\n       AND status IN ('PENDING', 'RETRYING')\n       AND attempts < ?\n       AND (next_attempt_at IS NULL OR next_attempt_at <= CURRENT_TIMESTAMP(3))", [eventId, maxAttempts])];
                case 1:
                    result = _a.sent();
                    affectedRows = Number((result === null || result === void 0 ? void 0 : result.affectedRows) || 0);
                    return [2 /*return*/, affectedRows > 0];
            }
        });
    });
}
function recoverStuckSendingOhioIntegrationEvents() {
    return __awaiter(this, void 0, void 0, function () {
        var recoverySeconds, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    recoverySeconds = getSendingRecoverySeconds();
                    return [4 /*yield*/, runQuery("UPDATE ohio_integration_event_log\n     SET status = 'RETRYING',\n         next_attempt_at = CURRENT_TIMESTAMP(3),\n         error_message = COALESCE(error_message, 'Recovered from stale SENDING state by outbox worker')\n     WHERE status = 'SENDING'\n       AND last_attempt_at IS NOT NULL\n       AND last_attempt_at <= (CURRENT_TIMESTAMP(3) - INTERVAL ? SECOND)", [recoverySeconds])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, Number((result === null || result === void 0 ? void 0 : result.affectedRows) || 0)];
            }
        });
    });
}
function getReplayableOhioIntegrationEvents() {
    return __awaiter(this, arguments, void 0, function (limit) {
        var maxAttempts, rows;
        if (limit === void 0) { limit = getEventLogReplayBatchSize(); }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    maxAttempts = getEventLogMaxAttempts();
                    return [4 /*yield*/, runQuery("SELECT event_id, event_type, payload_json, status, attempts, target_url\n     FROM ohio_integration_event_log\n     WHERE status IN ('PENDING', 'RETRYING')\n       AND attempts < ?\n       AND (next_attempt_at IS NULL OR next_attempt_at <= CURRENT_TIMESTAMP(3))\n     ORDER BY created_at ASC\n     LIMIT ?", [maxAttempts, limit])];
                case 1:
                    rows = _a.sent();
                    return [2 /*return*/, rows];
            }
        });
    });
}
function replayOhioIntegrationEventQueue() {
    return __awaiter(this, arguments, void 0, function (limit) {
        var rows, sent, failed, processed, _i, rows_1, row, claimed, event_1, dispatchResult, error_1, message;
        if (limit === void 0) { limit = getEventLogReplayBatchSize(); }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, recoverStuckSendingOhioIntegrationEvents()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, getReplayableOhioIntegrationEvents(limit)];
                case 2:
                    rows = _a.sent();
                    sent = 0;
                    failed = 0;
                    processed = 0;
                    _i = 0, rows_1 = rows;
                    _a.label = 3;
                case 3:
                    if (!(_i < rows_1.length)) return [3 /*break*/, 11];
                    row = rows_1[_i];
                    return [4 /*yield*/, claimOhioIntegrationEventForSending(row.event_id)];
                case 4:
                    claimed = _a.sent();
                    if (!claimed) {
                        return [3 /*break*/, 10];
                    }
                    processed += 1;
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 8, , 10]);
                    event_1 = JSON.parse(row.payload_json);
                    return [4 /*yield*/, (0, ohioIntegrationSender_1.dispatchOhioIntegrationEvent)(event_1, { maxRetries: 0 })];
                case 6:
                    dispatchResult = _a.sent();
                    return [4 /*yield*/, markOhioIntegrationEventSent(row.event_id, {
                            status: dispatchResult.status,
                            latencyMs: dispatchResult.latencyMs,
                            attemptsUsed: dispatchResult.attempts,
                        })];
                case 7:
                    _a.sent();
                    sent += 1;
                    return [3 /*break*/, 10];
                case 8:
                    error_1 = _a.sent();
                    message = error_1 instanceof Error ? error_1.message : String(error_1);
                    return [4 /*yield*/, markOhioIntegrationEventFailedAttempt(row.event_id, message)];
                case 9:
                    _a.sent();
                    failed += 1;
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 3];
                case 11: return [2 /*return*/, {
                        processed: processed,
                        sent: sent,
                        failed: failed,
                    }];
            }
        });
    });
}
function replayOhioIntegrationEventQueueToBroker(publishEvent_1) {
    return __awaiter(this, arguments, void 0, function (publishEvent, limit) {
        var rows, queued, failed, processed, _i, rows_2, row, claimed, event_2, publishResult, error_2, message;
        if (limit === void 0) { limit = getEventLogReplayBatchSize(); }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, recoverStuckSendingOhioIntegrationEvents()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, getReplayableOhioIntegrationEvents(limit)];
                case 2:
                    rows = _a.sent();
                    queued = 0;
                    failed = 0;
                    processed = 0;
                    _i = 0, rows_2 = rows;
                    _a.label = 3;
                case 3:
                    if (!(_i < rows_2.length)) return [3 /*break*/, 11];
                    row = rows_2[_i];
                    return [4 /*yield*/, claimOhioIntegrationEventForSending(row.event_id)];
                case 4:
                    claimed = _a.sent();
                    if (!claimed) {
                        return [3 /*break*/, 10];
                    }
                    processed += 1;
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 8, , 10]);
                    event_2 = JSON.parse(row.payload_json);
                    return [4 /*yield*/, publishEvent(event_2)];
                case 6:
                    publishResult = _a.sent();
                    return [4 /*yield*/, markOhioIntegrationEventQueuedToBroker(row.event_id, {
                            latencyMs: publishResult.latencyMs,
                            attemptsUsed: 1,
                        })];
                case 7:
                    _a.sent();
                    queued += 1;
                    return [3 /*break*/, 10];
                case 8:
                    error_2 = _a.sent();
                    message = error_2 instanceof Error ? error_2.message : String(error_2);
                    return [4 /*yield*/, markOhioIntegrationEventFailedAttempt(row.event_id, message)];
                case 9:
                    _a.sent();
                    failed += 1;
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 3];
                case 11: return [2 /*return*/, {
                        processed: processed,
                        queued: queued,
                        failed: failed,
                    }];
            }
        });
    });
}
function getPermanentlyFailedOhioIntegrationEvents() {
    return __awaiter(this, arguments, void 0, function (limit) {
        var safeLimit, rows;
        if (limit === void 0) { limit = 100; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    safeLimit = Math.max(1, Math.min(limit, 500));
                    return [4 /*yield*/, runQuery("SELECT event_id, event_type, payload_json, status, attempts, target_url, error_message, occurred_at, created_at, updated_at\n     FROM ohio_integration_event_log\n     WHERE status = 'PERMANENTLY_FAILED'\n     ORDER BY updated_at DESC\n     LIMIT ?", [safeLimit])];
                case 1:
                    rows = _a.sent();
                    return [2 /*return*/, rows];
            }
        });
    });
}
function requeueOhioIntegrationEvent(eventId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, affectedRows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runQuery("UPDATE ohio_integration_event_log\n     SET status = 'RETRYING',\n         attempts = 0,\n         next_attempt_at = CURRENT_TIMESTAMP(3),\n         error_message = NULL\n     WHERE event_id = ?\n       AND status = 'PERMANENTLY_FAILED'", [eventId])];
                case 1:
                    result = _a.sent();
                    affectedRows = Number((result === null || result === void 0 ? void 0 : result.affectedRows) || 0);
                    return [2 /*return*/, affectedRows > 0];
            }
        });
    });
}
function getOhioIntegrationEventLogMetrics() {
    return __awaiter(this, void 0, void 0, function () {
        var grouped, replayableRows, last24hRows, byStatus;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, runQuery("SELECT status, COUNT(*) AS total\n     FROM ohio_integration_event_log\n     GROUP BY status")];
                case 1:
                    grouped = _e.sent();
                    return [4 /*yield*/, runQuery("SELECT COUNT(*) AS total\n     FROM ohio_integration_event_log\n     WHERE status IN ('PENDING', 'RETRYING')\n       AND (next_attempt_at IS NULL OR next_attempt_at <= CURRENT_TIMESTAMP(3))")];
                case 2:
                    replayableRows = _e.sent();
                    return [4 /*yield*/, runQuery("SELECT\n       SUM(CASE WHEN created_at >= (CURRENT_TIMESTAMP - INTERVAL 1 DAY) THEN 1 ELSE 0 END) AS created_24h,\n       SUM(CASE WHEN sent_at >= (CURRENT_TIMESTAMP - INTERVAL 1 DAY) THEN 1 ELSE 0 END) AS sent_24h,\n       AVG(CASE WHEN sent_at >= (CURRENT_TIMESTAMP - INTERVAL 1 DAY) THEN last_latency_ms ELSE NULL END) AS avg_latency_24h\n     FROM ohio_integration_event_log")];
                case 3:
                    last24hRows = _e.sent();
                    byStatus = grouped.reduce(function (acc, row) {
                        var key = row.status || 'UNKNOWN';
                        acc[key] = Number(row.total || 0);
                        return acc;
                    }, {});
                    return [2 /*return*/, {
                            byStatus: byStatus,
                            replayable: Number(((_a = replayableRows === null || replayableRows === void 0 ? void 0 : replayableRows[0]) === null || _a === void 0 ? void 0 : _a.total) || 0),
                            permanentlyFailed: Number(byStatus.PERMANENTLY_FAILED || 0) + Number(byStatus.FAILED || 0),
                            last24h: {
                                created: Number(((_b = last24hRows === null || last24hRows === void 0 ? void 0 : last24hRows[0]) === null || _b === void 0 ? void 0 : _b.created_24h) || 0),
                                sent: Number(((_c = last24hRows === null || last24hRows === void 0 ? void 0 : last24hRows[0]) === null || _c === void 0 ? void 0 : _c.sent_24h) || 0),
                                averageDeliveryLatencyMs: Math.round(Number(((_d = last24hRows === null || last24hRows === void 0 ? void 0 : last24hRows[0]) === null || _d === void 0 ? void 0 : _d.avg_latency_24h) || 0)),
                            },
                        }];
            }
        });
    });
}
