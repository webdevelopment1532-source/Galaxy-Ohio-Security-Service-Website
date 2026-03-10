# Ohio → Sales Center Integration

This document describes the integration contract between the Ohio backend and Galaxy Guard Sales Center.

## Overview

Ohio dispatches signed events to Sales Center's integration intake endpoint whenever key business entities are modified (customers, sales, services, payments). Events are persisted to a local event-log table before transmission to guarantee delivery even if the initial HTTP request fails.

## Integration Contract

### Endpoint

```
POST /api/integrations/ohio/events
```

Base URL configured via `SALES_CENTER_INTEGRATION_URL` environment variable.

### Headers

| Header | Format | Description |
|--------|--------|-------------|
| `x-galaxy-timestamp` | Unix seconds (string) | Event timestamp as `Math.floor(Date.now() / 1000)` |
| `x-galaxy-signature` | `sha256=<hex>` | HMAC SHA-256 signature with `sha256=` prefix |

### Signature Algorithm

```typescript
const timestamp = Math.floor(Date.now() / 1000); // Unix seconds
const message = `${timestamp}.${rawJsonBody}`;
const hmac = crypto.createHmac('sha256', OHIO_INTEGRATION_SECRET);
hmac.update(message);
const signature = `sha256=${hmac.digest('hex')}`;
```

**Critical**: 
- Timestamp MUST be Unix seconds (integer), not ISO 8601 string
- Signature MUST include `sha256=` prefix
- Message format is `<timestamp>.<raw_json_body>` (dot separator)

### Event Structure

```typescript
{
  event_id: string;        // UUID v4
  event_type: string;      // One of: customer.upsert, sale.upsert, service.upsert, payment.upsert
  occurred_at: string;     // ISO 8601 timestamp
  payload: object;         // Entity-specific data
}
```

### Event Types

| Event Type | Trigger | Payload Schema |
|------------|---------|----------------|
| `customer.upsert` | Customer created/updated via `PUT /api/customers/:externalId` | `{id, external_id, name, email, phone, ...}` |
| `sale.upsert` | Sale created/updated via `PUT /api/sales/:externalId` | `{id, external_id, customer_id, amount, ...}` |
| `service.upsert` | Service created/updated via `PUT /api/services/:externalId` | `{id, external_id, customer_id, description, ...}` |
| `payment.upsert` | Payment created/updated via `PUT /api/payments/:externalId` | `{id, external_id, sale_id, amount, ...}` |

## Guaranteed Delivery

### Consumer Idempotency Contract

When Ohio publishes events over broker transport, the message envelope includes:

```typescript
{
  schema_version: 'v1',
  producer: 'ohio-backend',
  topic: 'ohio.sales_center.events',
  key: event.event_id,
  idempotency_key: event.event_id,
  event_version: event.event_version,
  trace_id: event.trace_id || event.event_id,
  event: OhioIntegrationEvent
}
```

Sales Center consumers should use `idempotency_key` (same value as `event.event_id`) as the dedupe key. If the same key is observed more than once, the consumer must acknowledge without replaying business side effects.

### Dynamic Contract Artifacts

Ohio keeps contract source types in `backend/contracts/ohioContractTypes.ts` and generates versioned schema artifacts under `backend/contracts/v1/`.

Contract commands:

```bash
npm run generate:contract-schema
npm run check:contract-fixtures
npm run contracts:verify
npm run contracts:pack
```

For private registry publication:

```bash
npm run contracts:publish
```

Versioned fixture files (`*.fixture.json`) are validated against the generated schema and can be consumed directly by Sales Center CI (Ajv/Pact workflows).

### Event Log Table

Events are persisted to `ohio_integration_event_log` before transmission:

```sql
CREATE TABLE ohio_integration_event_log (
  event_id VARCHAR(36) PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  payload TEXT NOT NULL,
  status ENUM('PENDING','RETRYING','SENT','FAILED') DEFAULT 'PENDING',
  attempt_count INT DEFAULT 0,
  last_attempt_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Status States

- **PENDING**: Event enqueued, not yet sent
- **RETRYING**: Event failed, will be retried by replay worker
- **SENT**: Event successfully delivered to Sales Center
- **FAILED**: Event exhausted retry attempts (manual intervention required)

### Retry Strategy

**Immediate Retry** (synchronous, on API route):
- Configured via `OHIO_INTEGRATION_MAX_RETRIES` (default: 2)
- Fixed delay via `OHIO_INTEGRATION_RETRY_DELAY_MS` (default: 500ms)
- On success: Status → SENT
- On exhaustion: Status → RETRYING

**Background Replay** (asynchronous, via worker):
- Triggered manually: `npm run replay:ohio-events`
- Processes events with status PENDING or RETRYING
- Exponential backoff: `Math.min(2 ** attempt_count, 2 ** 6) * base_delay`
- Max attempts: `OHIO_EVENT_LOG_MAX_ATTEMPTS` (default: 10)
- Batch size: `OHIO_EVENT_LOG_REPLAY_BATCH_SIZE` (default: 25)
- On success: Status → SENT
- On max attempts: Status → FAILED, requires manual investigation

## Environment Variables

### Required

```env
# Sales Center Integration
SALES_CENTER_INTEGRATION_URL=https://sales-center.galaxyguard.com
OHIO_INTEGRATION_SECRET=shared_secret_matching_sales_center
OHIO_PUBLISH_EVENT_VERSION=v1
OHIO_CONTRACT_SCHEMA_VERSION=v1

# Database Connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=ohio_user
DB_PASSWORD=secure_password
DB_NAME=ohio_db
```

### Optional

```env
# Immediate Retry Configuration (synchronous)
OHIO_INTEGRATION_MAX_RETRIES=2
OHIO_INTEGRATION_RETRY_DELAY_MS=500

# Background Replay Configuration (asynchronous)
OHIO_EVENT_LOG_MAX_ATTEMPTS=10
OHIO_EVENT_LOG_REPLAY_BATCH_SIZE=25

# Outbox publisher transport mode
OHIO_OUTBOX_TRANSPORT=http

# Broker mode options
OHIO_BROKER_DRIVER=stdout
OHIO_BROKER_TOPIC=ohio.sales_center.events
OHIO_BROKER_PUBLISH_TIMEOUT_MS=5000
# Required for http-bridge driver
# OHIO_BROKER_PUBLISH_URL=https://broker-bridge.example.com/publish
# Required for rabbitmq-amqp driver
# OHIO_BROKER_AMQP_URL=amqp://guest:guest@localhost:5672
# OHIO_BROKER_AMQP_EXCHANGE=ohio.sales_center.events
# OHIO_BROKER_AMQP_ROUTING_KEY=customer.upsert

# Database Connection Pool
DB_CONNECTION_LIMIT=5
```

## Testing

Run backend integration tests:

```bash
npm run test:backend
```

Test suite validates:
- Signature generation with correct format (`sha256=<hex>`)
- Timestamp as Unix seconds
- Retry logic with configurable attempts
- Exponential backoff calculation
- Broker envelope idempotency contract (`idempotency_key === event_id`)
- Feature-flagged version override (`OHIO_PUBLISH_EVENT_VERSION`)

## Contract Evolution & Rollback

1. Introduce new contract version under `backend/contracts/vN/`.
2. Keep Ohio producer behind `OHIO_PUBLISH_EVENT_VERSION` until Sales Center consumer for `vN` is deployed.
3. Ramp traffic to `vN` by environment/flag rollout.
4. If consumer failures increase (DLQ/backlog alerts), revert `OHIO_PUBLISH_EVENT_VERSION` to last stable version.

## Operations

### Manual Event Replay

To replay failed/pending events:

```bash
npm run replay:ohio-events
```

This runs a one-shot worker that:
1. Queries events with status PENDING or RETRYING
2. Orders by `last_attempt_at ASC` (oldest first)
3. Applies exponential backoff delay before retry
4. Limits batch to `OHIO_EVENT_LOG_REPLAY_BATCH_SIZE`
5. Updates status to SENT or FAILED based on outcome

### Monitoring Failed Events

Query events requiring manual intervention:

```sql
SELECT 
  event_id,
  event_type,
  status,
  attempt_count,
  error_message,
  last_attempt_at
FROM ohio_integration_event_log
WHERE status = 'FAILED'
ORDER BY last_attempt_at DESC;
```

### Manual Event Requeue

To retry a failed event, reset its status:

```sql
UPDATE ohio_integration_event_log
SET 
  status = 'PENDING',
  attempt_count = 0,
  last_attempt_at = NULL,
  error_message = NULL
WHERE event_id = '<uuid>';
```

Then run `npm run replay:ohio-events`.

## Security Notes

1. **Secret Rotation**: `OHIO_INTEGRATION_SECRET` must match Sales Center's `.env` value. Coordinate rotation with Sales Center team.
2. **Timing Safety**: Sales Center uses timing-safe comparison for signature validation to prevent timing attacks.
3. **Timestamp Skew**: Sales Center may enforce `MAX_SKEW_SECONDS` to reject events with stale timestamps (prevents replay attacks).

## References

- Sales Center intake implementation: `api-server/index.js` (`POST /api/integrations/ohio/events`)
- Sales Center contract tests: `api-server/integration.contract.test.js`
- Ohio sender implementation: `backend/shared/ohioIntegrationSender.ts`
- Ohio event log: `backend/shared/ohioIntegrationEventLog.ts`
- Ohio replay worker: `backend/workers/replayOhioIntegrationEvents.ts`
- Ohio broker publisher: `backend/shared/ohioIntegrationBrokerPublisher.ts`
