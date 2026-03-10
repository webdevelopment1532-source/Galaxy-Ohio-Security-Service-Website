import { createHmac } from 'crypto';
import { OhioEventType, OhioIntegrationEventContract } from '../contracts/ohioContractTypes';

export type { OhioEventType };
export type OhioIntegrationEvent = OhioIntegrationEventContract;

const supportedEventTypes = new Set<OhioEventType>([
  'customer.upsert',
  'sale.upsert',
  'service.upsert',
  'payment.upsert',
]);

const eventVersionPattern = /^v[0-9]+$/;

function validateOhioIntegrationEvent(event: OhioIntegrationEvent): void {
  if (!event.event_id || typeof event.event_id !== 'string') {
    throw new Error('Invalid Ohio integration event: event_id is required.');
  }

  if (!supportedEventTypes.has(event.event_type)) {
    throw new Error(`Invalid Ohio integration event: unsupported event_type "${String(event.event_type)}".`);
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

type HttpResult = {
  ok: boolean;
  status: number;
  statusText: string;
  text: () => Promise<string>;
};

type HttpClient = (url: string, init: RequestInit) => Promise<HttpResult>;
type SleepFn = (ms: number) => Promise<void>;

export interface OhioSenderConfig {
  integrationUrl: string;
  integrationEndpointPath: string;
  integrationSecret: string;
  eventVersion: string;
  maxRetries: number;
  retryDelayMs: number;
  httpClient: HttpClient;
  sleep: SleepFn;
}

export function resolveOhioPublishedEventVersion(): string {
  return process.env.OHIO_PUBLISH_EVENT_VERSION || process.env.OHIO_INTEGRATION_EVENT_VERSION || 'v1';
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toNonNegativeInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function defaultHttpClient(url: string, init: RequestInit): Promise<HttpResult> {
  const response = await fetch(url, init);
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    text: () => response.text(),
  };
}

export function resolveOhioSenderConfig(overrides: Partial<OhioSenderConfig> = {}): OhioSenderConfig {
  return {
    integrationUrl: overrides.integrationUrl || getRequiredEnv('SALES_CENTER_INTEGRATION_URL'),
    integrationEndpointPath:
      overrides.integrationEndpointPath || process.env.OHIO_INTEGRATION_ENDPOINT_PATH || '/api/integrations/ohio/events',
    integrationSecret: overrides.integrationSecret || getRequiredEnv('OHIO_INTEGRATION_SECRET'),
    eventVersion: overrides.eventVersion || resolveOhioPublishedEventVersion(),
    maxRetries: overrides.maxRetries ?? toNonNegativeInteger(process.env.OHIO_INTEGRATION_MAX_RETRIES, 2),
    retryDelayMs: overrides.retryDelayMs ?? toNonNegativeInteger(process.env.OHIO_INTEGRATION_RETRY_DELAY_MS, 500),
    httpClient: overrides.httpClient || defaultHttpClient,
    sleep: overrides.sleep || defaultSleep,
  };
}

export function generateOhioIntegrationSignature(secret: string, timestamp: string, rawJsonBody: string): string {
  const digest = createHmac('sha256', secret).update(`${timestamp}.${rawJsonBody}`).digest('hex');
  return `sha256=${digest}`;
}

export function buildSignedOhioEventRequest(
  event: OhioIntegrationEvent,
  secret: string,
  timestamp = String(Math.floor(Date.now() / 1000)),
  eventVersion = 'v1'
) {
  const rawBody = JSON.stringify(event);
  const signature = generateOhioIntegrationSignature(secret, timestamp, rawBody);
  return {
    timestamp,
    rawBody,
    signature,
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

export async function dispatchOhioIntegrationEvent(
  event: OhioIntegrationEvent,
  overrides: Partial<OhioSenderConfig> = {}
): Promise<{ status: number; attempts: number; latencyMs: number }> {
  const config = resolveOhioSenderConfig(overrides);
  const endpoint = `${config.integrationUrl.replace(/\/$/, '')}${config.integrationEndpointPath}`;
  const eventToSend: OhioIntegrationEvent = {
    ...event,
    event_version: event.event_version || config.eventVersion,
    trace_id: event.trace_id || event.event_id,
  };
  validateOhioIntegrationEvent(eventToSend);
  const signedRequest = buildSignedOhioEventRequest(eventToSend, config.integrationSecret, undefined, config.eventVersion);
  const start = Date.now();

  let lastError = '';
  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    try {
      const response = await config.httpClient(endpoint, {
        method: 'POST',
        headers: signedRequest.headers,
        body: signedRequest.rawBody,
      });

      if (response.ok) {
        return {
          status: response.status,
          attempts: attempt + 1,
          latencyMs: Date.now() - start,
        };
      }

      const responseText = await response.text();
      lastError = `HTTP ${response.status} ${response.statusText}: ${responseText}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lastError = `Network error: ${message}`;
    }

    if (attempt < config.maxRetries) {
      await config.sleep(config.retryDelayMs * (attempt + 1));
    }
  }

  throw new Error(`Failed to dispatch Ohio integration event after retries: ${lastError}`);
}
