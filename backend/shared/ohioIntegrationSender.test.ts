import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildSignedOhioEventRequest,
  dispatchOhioIntegrationEvent,
  generateOhioIntegrationSignature,
  OhioIntegrationEvent,
  resolveOhioSenderConfig,
} from './ohioIntegrationSender';

const sampleEvent: OhioIntegrationEvent = {
  event_id: 'event-123',
  event_type: 'customer.upsert',
  occurred_at: '2026-03-08T12:00:00.000Z',
  payload: {
    external_id: 'ohio-customer-123',
    name: 'Jane Doe',
    email: 'jane@example.com',
  },
};

test('generateOhioIntegrationSignature signs timestamp.rawJsonBody with HMAC SHA-256', () => {
  const timestamp = '1741435200';
  const rawBody = JSON.stringify(sampleEvent);
  const signature = generateOhioIntegrationSignature('test-secret', timestamp, rawBody);

  assert.equal(
    signature,
    'sha256=e94c8b01e9ee54b0b1f6782617d7b6db9cd0bd96613a1aba01b560f55265380d'
  );
});

test('dispatchOhioIntegrationEvent retries and succeeds', async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const statuses = [500, 502, 202];
  let statusIndex = 0;

  const result = await dispatchOhioIntegrationEvent(sampleEvent, {
    integrationUrl: 'https://sales-center.local',
    integrationSecret: 'test-secret',
    maxRetries: 2,
    retryDelayMs: 0,
    sleep: async () => {},
    httpClient: async (url, init) => {
      calls.push({ url, init });
      const status = statuses[statusIndex] || 500;
      statusIndex += 1;

      return {
        ok: status >= 200 && status < 300,
        status,
        statusText: `status-${status}`,
        text: async () => 'mock-response',
      };
    },
  });

  assert.equal(result.status, 202);
  assert.equal(result.attempts, 3);
  assert.equal(calls.length, 3);
  assert.equal(calls[0].url, 'https://sales-center.local/api/integrations/ohio/events');

  const firstHeaders = calls[0].init.headers as Record<string, string>;
  assert.ok(firstHeaders['x-galaxy-timestamp']);
  assert.ok(firstHeaders['x-galaxy-signature']);
  assert.equal(firstHeaders['x-galaxy-event-version'], 'v1');
  assert.equal(firstHeaders['x-galaxy-event-id'], sampleEvent.event_id);
  assert.equal(firstHeaders['x-galaxy-trace-id'], sampleEvent.event_id);
  assert.equal(firstHeaders['content-type'], 'application/json');
});

test('dispatchOhioIntegrationEvent respects custom endpoint path and event version', async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];

  await dispatchOhioIntegrationEvent(sampleEvent, {
    integrationUrl: 'https://sales-center.local',
    integrationEndpointPath: '/api/integrations/v1/ohio/events',
    integrationSecret: 'test-secret',
    eventVersion: 'v1',
    maxRetries: 0,
    retryDelayMs: 0,
    sleep: async () => {},
    httpClient: async (url, init) => {
      calls.push({ url, init });
      return {
        ok: true,
        status: 202,
        statusText: 'accepted',
        text: async () => 'ok',
      };
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://sales-center.local/api/integrations/v1/ohio/events');
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers['x-galaxy-event-version'], 'v1');
});

test('dispatchOhioIntegrationEvent throws after retry limit', async () => {
  let attempts = 0;

  await assert.rejects(
    () =>
      dispatchOhioIntegrationEvent(sampleEvent, {
        integrationUrl: 'https://sales-center.local',
        integrationSecret: 'test-secret',
        maxRetries: 1,
        retryDelayMs: 0,
        sleep: async () => {},
        httpClient: async () => {
          attempts += 1;
          throw new Error('socket timeout');
        },
      }),
    /Failed to dispatch Ohio integration event after retries/
  );

  assert.equal(attempts, 2);
});

test('buildSignedOhioEventRequest includes signed headers and raw body', () => {
  const signed = buildSignedOhioEventRequest(sampleEvent, 'test-secret', '1741435200');
  assert.equal(signed.rawBody, JSON.stringify(sampleEvent));
  assert.equal(signed.headers['x-galaxy-timestamp'], '1741435200');
  assert.equal(signed.headers['x-galaxy-signature'], 'sha256=e94c8b01e9ee54b0b1f6782617d7b6db9cd0bd96613a1aba01b560f55265380d');
});

test('dispatchOhioIntegrationEvent rejects unsupported event versions', async () => {
  let called = false;

  await assert.rejects(
    () =>
      dispatchOhioIntegrationEvent(
        {
          ...sampleEvent,
          event_version: '2026.1',
        },
        {
          integrationUrl: 'https://sales-center.local',
          integrationSecret: 'test-secret',
          maxRetries: 0,
          retryDelayMs: 0,
          sleep: async () => {},
          httpClient: async () => {
            called = true;
            return {
              ok: true,
              status: 202,
              statusText: 'accepted',
              text: async () => 'ok',
            };
          },
        }
      ),
    /event_version must match format/
  );

  assert.equal(called, false);
});

test('resolveOhioSenderConfig uses OHIO_PUBLISH_EVENT_VERSION for rollout control', () => {
  const previousPublishVersion = process.env.OHIO_PUBLISH_EVENT_VERSION;
  const previousLegacyVersion = process.env.OHIO_INTEGRATION_EVENT_VERSION;
  const previousUrl = process.env.SALES_CENTER_INTEGRATION_URL;
  const previousSecret = process.env.OHIO_INTEGRATION_SECRET;
  try {
    process.env.OHIO_PUBLISH_EVENT_VERSION = 'v2';
    process.env.OHIO_INTEGRATION_EVENT_VERSION = 'v1';
    process.env.SALES_CENTER_INTEGRATION_URL = 'https://sales-center.local';
    process.env.OHIO_INTEGRATION_SECRET = 'test-secret';

    const config = resolveOhioSenderConfig({
      httpClient: async () => ({
        ok: true,
        status: 202,
        statusText: 'accepted',
        text: async () => 'ok',
      }),
      sleep: async () => {},
    });

    assert.equal(config.eventVersion, 'v2');
  } finally {
    if (previousPublishVersion === undefined) delete process.env.OHIO_PUBLISH_EVENT_VERSION;
    else process.env.OHIO_PUBLISH_EVENT_VERSION = previousPublishVersion;

    if (previousLegacyVersion === undefined) delete process.env.OHIO_INTEGRATION_EVENT_VERSION;
    else process.env.OHIO_INTEGRATION_EVENT_VERSION = previousLegacyVersion;

    if (previousUrl === undefined) delete process.env.SALES_CENTER_INTEGRATION_URL;
    else process.env.SALES_CENTER_INTEGRATION_URL = previousUrl;

    if (previousSecret === undefined) delete process.env.OHIO_INTEGRATION_SECRET;
    else process.env.OHIO_INTEGRATION_SECRET = previousSecret;
  }
});
