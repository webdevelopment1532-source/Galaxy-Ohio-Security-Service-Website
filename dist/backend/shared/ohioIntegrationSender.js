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
exports.resolveOhioPublishedEventVersion = resolveOhioPublishedEventVersion;
exports.resolveOhioSenderConfig = resolveOhioSenderConfig;
exports.generateOhioIntegrationSignature = generateOhioIntegrationSignature;
exports.buildSignedOhioEventRequest = buildSignedOhioEventRequest;
exports.dispatchOhioIntegrationEvent = dispatchOhioIntegrationEvent;
var crypto_1 = require("crypto");
var supportedEventTypes = new Set([
    'customer.upsert',
    'sale.upsert',
    'service.upsert',
    'payment.upsert',
]);
var eventVersionPattern = /^v[0-9]+$/;
function validateOhioIntegrationEvent(event) {
    if (!event.event_id || typeof event.event_id !== 'string') {
        throw new Error('Invalid Ohio integration event: event_id is required.');
    }
    if (!supportedEventTypes.has(event.event_type)) {
        throw new Error("Invalid Ohio integration event: unsupported event_type \"".concat(String(event.event_type), "\"."));
    }
    if (Number.isNaN(Date.parse(event.occurred_at))) {
        throw new Error('Invalid Ohio integration event: occurred_at must be a valid ISO timestamp.');
    }
    if (event.event_version && !eventVersionPattern.test(event.event_version)) {
        throw new Error('Invalid Ohio integration event: event_version must match format v<number>.');
    }
    if (event.trace_id && typeof event.trace_id !== 'string') {
        throw new Error('Invalid Ohio integration event: trace_id must be a string when provided.');
    }
    if (typeof event.payload !== 'object' || event.payload === null || Array.isArray(event.payload)) {
        throw new Error('Invalid Ohio integration event: payload must be an object.');
    }
}
function resolveOhioPublishedEventVersion() {
    return process.env.OHIO_PUBLISH_EVENT_VERSION || process.env.OHIO_INTEGRATION_EVENT_VERSION || 'v1';
}
function getRequiredEnv(name) {
    var value = process.env[name];
    if (!value) {
        throw new Error("Missing required environment variable: ".concat(name));
    }
    return value;
}
function toNonNegativeInteger(value, fallback) {
    if (!value)
        return fallback;
    var parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
function defaultSleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function defaultHttpClient(url, init) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url, init)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, {
                            ok: response.ok,
                            status: response.status,
                            statusText: response.statusText,
                            text: function () { return response.text(); },
                        }];
            }
        });
    });
}
function resolveOhioSenderConfig(overrides) {
    var _a, _b;
    if (overrides === void 0) { overrides = {}; }
    return {
        integrationUrl: overrides.integrationUrl || getRequiredEnv('SALES_CENTER_INTEGRATION_URL'),
        integrationEndpointPath: overrides.integrationEndpointPath || process.env.OHIO_INTEGRATION_ENDPOINT_PATH || '/api/integrations/ohio/events',
        integrationSecret: overrides.integrationSecret || getRequiredEnv('OHIO_INTEGRATION_SECRET'),
        eventVersion: overrides.eventVersion || resolveOhioPublishedEventVersion(),
        maxRetries: (_a = overrides.maxRetries) !== null && _a !== void 0 ? _a : toNonNegativeInteger(process.env.OHIO_INTEGRATION_MAX_RETRIES, 2),
        retryDelayMs: (_b = overrides.retryDelayMs) !== null && _b !== void 0 ? _b : toNonNegativeInteger(process.env.OHIO_INTEGRATION_RETRY_DELAY_MS, 500),
        httpClient: overrides.httpClient || defaultHttpClient,
        sleep: overrides.sleep || defaultSleep,
    };
}
function generateOhioIntegrationSignature(secret, timestamp, rawJsonBody) {
    var digest = (0, crypto_1.createHmac)('sha256', secret).update("".concat(timestamp, ".").concat(rawJsonBody)).digest('hex');
    return "sha256=".concat(digest);
}
function buildSignedOhioEventRequest(event, secret, timestamp, eventVersion) {
    if (timestamp === void 0) { timestamp = String(Math.floor(Date.now() / 1000)); }
    if (eventVersion === void 0) { eventVersion = 'v1'; }
    var rawBody = JSON.stringify(event);
    var signature = generateOhioIntegrationSignature(secret, timestamp, rawBody);
    return {
        timestamp: timestamp,
        rawBody: rawBody,
        signature: signature,
        headers: {
            'content-type': 'application/json',
            'x-galaxy-timestamp': timestamp,
            'x-galaxy-signature': signature,
            'x-galaxy-event-version': eventVersion,
            'x-galaxy-event-id': event.event_id,
            'x-galaxy-trace-id': event.trace_id || event.event_id,
        },
    };
}
function dispatchOhioIntegrationEvent(event_1) {
    return __awaiter(this, arguments, void 0, function (event, overrides) {
        var config, endpoint, eventToSend, signedRequest, start, lastError, attempt, response, responseText, error_1, message;
        if (overrides === void 0) { overrides = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = resolveOhioSenderConfig(overrides);
                    endpoint = "".concat(config.integrationUrl.replace(/\/$/, '')).concat(config.integrationEndpointPath);
                    eventToSend = __assign(__assign({}, event), { event_version: event.event_version || config.eventVersion, trace_id: event.trace_id || event.event_id });
                    validateOhioIntegrationEvent(eventToSend);
                    signedRequest = buildSignedOhioEventRequest(eventToSend, config.integrationSecret, undefined, config.eventVersion);
                    start = Date.now();
                    lastError = '';
                    attempt = 0;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= config.maxRetries)) return [3 /*break*/, 9];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, config.httpClient(endpoint, {
                            method: 'POST',
                            headers: signedRequest.headers,
                            body: signedRequest.rawBody,
                        })];
                case 3:
                    response = _a.sent();
                    if (response.ok) {
                        return [2 /*return*/, {
                                status: response.status,
                                attempts: attempt + 1,
                                latencyMs: Date.now() - start,
                            }];
                    }
                    return [4 /*yield*/, response.text()];
                case 4:
                    responseText = _a.sent();
                    lastError = "HTTP ".concat(response.status, " ").concat(response.statusText, ": ").concat(responseText);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    message = error_1 instanceof Error ? error_1.message : String(error_1);
                    lastError = "Network error: ".concat(message);
                    return [3 /*break*/, 6];
                case 6:
                    if (!(attempt < config.maxRetries)) return [3 /*break*/, 8];
                    return [4 /*yield*/, config.sleep(config.retryDelayMs * (attempt + 1))];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    attempt += 1;
                    return [3 /*break*/, 1];
                case 9: throw new Error("Failed to dispatch Ohio integration event after retries: ".concat(lastError));
            }
        });
    });
}
