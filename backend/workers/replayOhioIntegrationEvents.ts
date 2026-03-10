import {
  ensureOhioIntegrationEventLogTable,
  getOhioIntegrationEventLogMetrics,
  replayOhioIntegrationEventQueue,
} from '../shared/ohioIntegrationEventLog';

async function run(): Promise<void> {
  await ensureOhioIntegrationEventLogTable();
  const result = await replayOhioIntegrationEventQueue();
  const metrics = await getOhioIntegrationEventLogMetrics();
  console.log(
    `[ohio-integration-replay] processed=${result.processed} sent=${result.sent} failed=${result.failed} permanently_failed=${metrics.permanentlyFailed} replayable=${metrics.replayable} avg_latency_ms_24h=${metrics.last24h.averageDeliveryLatencyMs}`
  );
}

run().catch((error) => {
  console.error('[ohio-integration-replay] fatal error', error);
  process.exit(1);
});
