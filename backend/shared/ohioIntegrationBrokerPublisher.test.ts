import assert from 'node:assert/strict';
import test from 'node:test';

import { buildOhioBrokerEnvelope, resolveOhioBrokerPublisherConfig } from './ohioIntegrationBrokerPublisher';
import { OhioIntegrationEvent } from './ohioIntegrationSender';

const sampleEvent: OhioIntegrationEvent = {
  event_id: 'evt-contract-001',
  event_type: 'customer.upsert',
  occurred_at: '2026-03-08T12:00:00.000Z',
  event_version: 'v1',
  trace_id: 'trace-contract-001',
  payload: {
    external_id: 'cust-001',
    name: 'Example Customer',
  },
};

function withEnv<T>(changes: Record<string, string | undefined>, operation: () => T): T {
  const previous: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(changes)) {
    previous[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return operation();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test('resolveOhioBrokerPublisherConfig defaults to stdout driver', () => {
  const config = withEnv(
    {
      OHIO_BROKER_DRIVER: undefined,
      OHIO_BROKER_TOPIC: undefined,
      OHIO_BROKER_PUBLISH_TIMEOUT_MS: undefined,
      OHIO_BROKER_PUBLISH_URL: undefined,
      OHIO_BROKER_AMQP_URL: undefined,
    },
    () => resolveOhioBrokerPublisherConfig()
  );

  assert.equal(config.driver, 'stdout');
  assert.equal(config.topic, 'ohio.sales_center.events');
  assert.equal(config.timeoutMs, 5000);
});

test('resolveOhioBrokerPublisherConfig requires publish URL for http-bridge', () => {
  assert.throws(
    () =>
      withEnv(
        {
          OHIO_BROKER_DRIVER: 'http-bridge',
          OHIO_BROKER_PUBLISH_URL: undefined,
        },
        () => resolveOhioBrokerPublisherConfig()
      ),
    /Missing required environment variable: OHIO_BROKER_PUBLISH_URL/
  );
});

test('resolveOhioBrokerPublisherConfig requires AMQP URL for rabbitmq-amqp', () => {
  assert.throws(
    () =>
      withEnv(
        {
          OHIO_BROKER_DRIVER: 'rabbitmq-amqp',
          OHIO_BROKER_AMQP_URL: undefined,
        },
        () => resolveOhioBrokerPublisherConfig()
      ),
    /Missing required environment variable: OHIO_BROKER_AMQP_URL/
  );
});

test('resolveOhioBrokerPublisherConfig maps rabbitmq-amqp config values', () => {
  const config = withEnv(
    {
      OHIO_BROKER_DRIVER: 'rabbitmq-amqp',
      OHIO_BROKER_AMQP_URL: 'amqp://guest:guest@localhost:5672',
      OHIO_BROKER_AMQP_EXCHANGE: 'ohio.events.exchange',
      OHIO_BROKER_AMQP_ROUTING_KEY: 'customer.upsert',
      OHIO_BROKER_TOPIC: 'ohio.sales_center.events',
      OHIO_BROKER_PUBLISH_TIMEOUT_MS: '7000',
    },
    () => resolveOhioBrokerPublisherConfig()
  );

  assert.equal(config.driver, 'rabbitmq-amqp');
  assert.equal(config.amqpUrl, 'amqp://guest:guest@localhost:5672');
  assert.equal(config.amqpExchange, 'ohio.events.exchange');
  assert.equal(config.amqpRoutingKey, 'customer.upsert');
  assert.equal(config.timeoutMs, 7000);
});

test('buildOhioBrokerEnvelope sets idempotency key equal to event_id', () => {
  const envelope = buildOhioBrokerEnvelope(sampleEvent, 'ohio.sales_center.events');

  assert.equal(envelope.schema_version, 'v1');
  assert.equal(envelope.producer, 'ohio-backend');
  assert.equal(envelope.topic, 'ohio.sales_center.events');
  assert.equal(envelope.key, sampleEvent.event_id);
  assert.equal(envelope.idempotency_key, sampleEvent.event_id);
  assert.equal(envelope.event_version, 'v1');
  assert.equal(envelope.trace_id, sampleEvent.trace_id);
  assert.deepEqual(envelope.event, sampleEvent);
});

test('buildOhioBrokerEnvelope falls back trace_id to event_id', () => {
  const envelope = buildOhioBrokerEnvelope(
    {
      ...sampleEvent,
      trace_id: undefined,
      event_id: 'evt-contract-002',
    },
    'ohio.sales_center.events'
  );

  assert.equal(envelope.trace_id, 'evt-contract-002');
  assert.equal(envelope.idempotency_key, 'evt-contract-002');
  assert.equal(envelope.event.event_version, 'v1');
  assert.equal(envelope.event_version, 'v1');
});

test('buildOhioBrokerEnvelope supports schema version override for v2 rollout', () => {
  const envelope = withEnv(
    {
      OHIO_CONTRACT_SCHEMA_VERSION: 'v2',
    },
    () => buildOhioBrokerEnvelope({ ...sampleEvent, event_version: 'v2' }, 'ohio.sales_center.events')
  );

  assert.equal(envelope.schema_version, 'v2');
  assert.equal(envelope.event_version, 'v2');
  assert.equal(envelope.event.event_version, 'v2');
});

test('buildOhioBrokerEnvelope rejects unsupported schema version', () => {
  assert.throws(
    () =>
      withEnv(
        {
          OHIO_CONTRACT_SCHEMA_VERSION: 'v3',
        },
        () => buildOhioBrokerEnvelope(sampleEvent, 'ohio.sales_center.events')
      ),
    /Unsupported OHIO_CONTRACT_SCHEMA_VERSION/
  );
});
