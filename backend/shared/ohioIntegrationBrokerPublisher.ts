import { randomUUID } from 'crypto';

import { OhioIntegrationEvent } from './ohioIntegrationSender';
import { OhioBrokerEnvelopeContract, OhioContractSchemaVersion } from '../contracts/ohioContractTypes';

export interface OhioBrokerPublishResult {
  brokerMessageId?: string;
  latencyMs?: number;
}

export type OhioBrokerEnvelope = OhioBrokerEnvelopeContract;

const schemaVersionPattern = /^v[0-9]+$/;

type BrokerDriver = 'stdout' | 'http-bridge' | 'rabbitmq-amqp';

type AmqpChannel = {
  assertExchange: (exchange: string, type: string, options?: { durable?: boolean }) => Promise<unknown>;
  publish: (exchange: string, routingKey: string, content: Buffer, options?: { persistent?: boolean }) => boolean;
  waitForConfirms?: () => Promise<void>;
};

type AmqpConnection = {
  createConfirmChannel?: () => Promise<AmqpChannel>;
  createChannel: () => Promise<AmqpChannel>;
};

interface OhioBrokerPublisherConfig {
  driver: BrokerDriver;
  topic: string;
  publishUrl?: string;
  timeoutMs: number;
  amqpUrl?: string;
  amqpExchange?: string;
  amqpRoutingKey?: string;
}

let cachedAmqpConnection: AmqpConnection | undefined;
let cachedAmqpChannel: AmqpChannel | undefined;

function toPositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function resolveOhioBrokerPublisherConfig(): OhioBrokerPublisherConfig {
  const rawDriver = (process.env.OHIO_BROKER_DRIVER || 'stdout').toLowerCase();
  const driver: BrokerDriver = rawDriver === 'http-bridge' || rawDriver === 'rabbitmq-amqp' ? rawDriver : 'stdout';

  return {
    driver,
    topic: process.env.OHIO_BROKER_TOPIC || 'ohio.sales_center.events',
    publishUrl: driver === 'http-bridge' ? getRequiredEnv('OHIO_BROKER_PUBLISH_URL') : undefined,
    timeoutMs: toPositiveInteger(process.env.OHIO_BROKER_PUBLISH_TIMEOUT_MS, 5000),
    amqpUrl: driver === 'rabbitmq-amqp' ? getRequiredEnv('OHIO_BROKER_AMQP_URL') : undefined,
    amqpExchange: process.env.OHIO_BROKER_AMQP_EXCHANGE || 'ohio.sales_center.events',
    amqpRoutingKey: process.env.OHIO_BROKER_AMQP_ROUTING_KEY,
  };
}

async function getAmqpChannel(config: OhioBrokerPublisherConfig): Promise<AmqpChannel> {
  if (cachedAmqpChannel) {
    return cachedAmqpChannel;
  }

  // Lazy-load so HTTP/stdout modes do not require AMQP dependencies at runtime.
  const amqplib = (await import('amqplib')) as {
    connect: (url: string) => Promise<AmqpConnection>;
  };

  if (!cachedAmqpConnection) {
    cachedAmqpConnection = await amqplib.connect(config.amqpUrl!);
  }

  const channel = cachedAmqpConnection.createConfirmChannel
    ? await cachedAmqpConnection.createConfirmChannel()
    : await cachedAmqpConnection.createChannel();

  await channel.assertExchange(config.amqpExchange!, 'topic', { durable: true });
  cachedAmqpChannel = channel;
  return channel;
}

export function buildOhioBrokerEnvelope(event: OhioIntegrationEvent, topic: string): OhioBrokerEnvelope {
  const resolvedEventVersion = event.event_version || process.env.OHIO_PUBLISH_EVENT_VERSION || 'v1';
  const configuredSchemaVersion = process.env.OHIO_CONTRACT_SCHEMA_VERSION || resolvedEventVersion || 'v1';
  if (!schemaVersionPattern.test(configuredSchemaVersion)) {
    throw new Error(`Invalid OHIO_CONTRACT_SCHEMA_VERSION: ${configuredSchemaVersion}. Expected format v<number>.`);
  }
  if (configuredSchemaVersion !== 'v1' && configuredSchemaVersion !== 'v2') {
    throw new Error(
      `Unsupported OHIO_CONTRACT_SCHEMA_VERSION: ${configuredSchemaVersion}. Supported values: v1, v2.`
    );
  }
  const schemaVersion = configuredSchemaVersion as OhioContractSchemaVersion;

  return {
    schema_version: schemaVersion,
    producer: 'ohio-backend',
    topic,
    key: event.event_id,
    idempotency_key: event.event_id,
    event_version: resolvedEventVersion,
    trace_id: event.trace_id || event.event_id,
    event: {
      ...event,
      event_version: resolvedEventVersion,
      trace_id: event.trace_id || event.event_id,
    },
  };
}

export async function publishOhioIntegrationEventToBroker(
  event: OhioIntegrationEvent
): Promise<OhioBrokerPublishResult> {
  const config = resolveOhioBrokerPublisherConfig();
  const start = Date.now();
  const envelope = buildOhioBrokerEnvelope(event, config.topic);

  if (config.driver === 'stdout') {
    const brokerMessageId = `stdout-${randomUUID()}`;
    console.log(
      `[ohio-broker-publisher] queued topic=${config.topic} event_id=${event.event_id} event_type=${event.event_type} idempotency_key=${envelope.idempotency_key}`
    );
    return {
      brokerMessageId,
      latencyMs: Date.now() - start,
    };
  }

  if (config.driver === 'rabbitmq-amqp') {
    const channel = await getAmqpChannel(config);
    const routingKey = config.amqpRoutingKey || event.event_type;
    const message = Buffer.from(JSON.stringify(envelope));

    const accepted = channel.publish(config.amqpExchange!, routingKey, message, { persistent: true });
    if (!accepted) {
      throw new Error('RabbitMQ publish was back-pressured and not accepted by the channel.');
    }
    if (channel.waitForConfirms) {
      await channel.waitForConfirms();
    }

    return {
      brokerMessageId: `rabbitmq-${event.event_id}`,
      latencyMs: Date.now() - start,
    };
  }

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(config.publishUrl!, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(envelope),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Broker publish failed HTTP ${response.status}: ${body}`);
    }

    const body = (await response.json().catch(() => ({}))) as { brokerMessageId?: string };
    return {
      brokerMessageId: body.brokerMessageId || `http-bridge-${event.event_id}`,
      latencyMs: Date.now() - start,
    };
  } finally {
    clearTimeout(timeoutHandle);
  }
}
