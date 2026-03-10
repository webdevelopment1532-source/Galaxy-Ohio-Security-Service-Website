import {
  ensureOhioIntegrationEventLogTable,
  getOhioIntegrationEventLogMetrics,
  replayOhioIntegrationEventQueue,
  replayOhioIntegrationEventQueueToBroker,
} from '../shared/ohioIntegrationEventLog';
import { publishOhioIntegrationEventToBroker } from '../shared/ohioIntegrationBrokerPublisher';

function toPositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPublisherLoop(): Promise<void> {
  const pollIntervalMs = toPositiveInteger(process.env.OHIO_OUTBOX_POLL_INTERVAL_MS, 2000);
  const batchSize = toPositiveInteger(process.env.OHIO_EVENT_LOG_REPLAY_BATCH_SIZE, 25);
  const transport = (process.env.OHIO_OUTBOX_TRANSPORT || 'http').toLowerCase();
  let stopping = false;

  const stop = () => {
    stopping = true;
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  await ensureOhioIntegrationEventLogTable();
  console.log(
    `[ohio-outbox-publisher] started transport=${transport} interval_ms=${pollIntervalMs} batch_size=${batchSize}`
  );

  while (!stopping) {
    const replay =
      transport === 'broker'
        ? await replayOhioIntegrationEventQueueToBroker(publishOhioIntegrationEventToBroker, batchSize)
        : await replayOhioIntegrationEventQueue(batchSize);
    const metrics = await getOhioIntegrationEventLogMetrics();

    const sent = 'sent' in replay ? replay.sent : 0;
    const queued = 'queued' in replay ? replay.queued : 0;

    if (replay.processed > 0 || metrics.permanentlyFailed > 0) {
      console.log(
        `[ohio-outbox-publisher] transport=${transport} processed=${replay.processed} sent=${sent} queued=${queued} failed=${replay.failed} replayable=${metrics.replayable} permanently_failed=${metrics.permanentlyFailed} avg_latency_ms_24h=${metrics.last24h.averageDeliveryLatencyMs}`
      );
    }

    await sleep(pollIntervalMs);
  }

  console.log('[ohio-outbox-publisher] stopped');
}

runPublisherLoop().catch((error) => {
  console.error('[ohio-outbox-publisher] fatal error', error);
  process.exit(1);
});
