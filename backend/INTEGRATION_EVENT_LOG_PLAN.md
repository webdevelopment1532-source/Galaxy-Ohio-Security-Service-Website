# Ohio To Sales Center Event Log Plan

This guide describes the next Ohio-side backend changes needed to make outbound delivery to the Sales Center durable, replayable, and auditable.

## Goal

The Ohio backend should:

1. Write its own local database changes first.
2. Record the outbound Sales Center event in an event-log table.
3. Attempt an immediate signed delivery.
4. Leave failed deliveries in the log for background replay instead of depending only on request-time retries.

This keeps the Ohio site independent while still guaranteeing eventual delivery to the Sales Center.

## Sales Center Contract

Target endpoint:

  POST /api/integrations/ohio/events

Required headers:

  x-galaxy-timestamp: Unix timestamp in seconds
  x-galaxy-signature: sha256=<hmac>

Signature payload:

  timestamp.rawJsonBody

Supported event types:

  customer.upsert
  sale.upsert
  service.upsert
  payment.upsert

Event body shape:

    {
      "event_id": "sale-123",
      "event_type": "sale.upsert",
      "occurred_at": "2026-03-08T12:00:00.000Z",
      "payload": {
        "external_id": "ohio-sale-123",
        "customer_external_id": "ohio-customer-88",
        "amount": 2500,
        "sale_date": "2026-03-08T12:00:00.000Z",
        "status": "completed",
        "notes": "optional"
      }
    }

## Required Ohio Environment Variables

Move all current database and integration secrets into environment variables.

Recommended variables:

  DB_HOST
  DB_USER
  DB_PASS
  DB_NAME
  SALES_CENTER_INTEGRATION_URL
  OHIO_INTEGRATION_SECRET
  SALES_CENTER_INTEGRATION_TIMEOUT_MS
  SALES_CENTER_INTEGRATION_MAX_ATTEMPTS
  SALES_CENTER_INTEGRATION_RETRY_DELAY_SECONDS
  SALES_CENTER_INTEGRATION_BATCH_SIZE

## Database Table

Recommended table name:

  sales_center_event_log

Recommended schema:

    CREATE TABLE IF NOT EXISTS sales_center_event_log (
      event_id VARCHAR(64) PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      payload JSON NOT NULL,
      sales_center_url VARCHAR(255) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      attempts INT NOT NULL DEFAULT 0,
      last_attempt_at DATETIME NULL,
      next_attempt_at DATETIME NULL,
      delivered_at DATETIME NULL,
      error_message TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

Recommended indexes:

    CREATE INDEX idx_sales_center_event_log_status_next_attempt
      ON sales_center_event_log (status, next_attempt_at);

    CREATE INDEX idx_sales_center_event_log_created_at
      ON sales_center_event_log (created_at);

## Files To Change

Current Ohio backend files already present:

- [backend/server.ts](/mnt/ai/websites/galaxysecurityweb/galaxy-guard-ohio-next/backend/server.ts)
- [backend/db.ts](/mnt/ai/websites/galaxysecurityweb/galaxy-guard-ohio-next/backend/db.ts)

Recommended new backend files:

- [backend/src/index.ts](/mnt/ai/websites/galaxysecurityweb/galaxy-guard-ohio-next/backend/src/index.ts) or a nearby backend folder for shared integration exports
- backend/src/integrations/salesCenterEventLog.ts
- backend/src/integrations/salesCenterSender.ts
- backend/src/integrations/replaySalesCenterEvents.ts
- backend/src/integrations/types.ts

If you prefer to keep the Ohio backend flat, these can also live directly under the backend folder.

## Immediate Refactors

### 1. Fix Database Configuration

Current issue:

- [backend/db.ts](/mnt/ai/websites/galaxysecurityweb/galaxy-guard-ohio-next/backend/db.ts) still hardcodes database credentials.

Required change:

- Replace inline host, user, password, and database values with environment variables.
- Load env values before creating the MariaDB pool.

### 2. Add Event Log Persistence

Create functions to:

- insertPendingEvent(event)
- markEventSending(eventId)
- markEventDelivered(eventId)
- markEventFailed(eventId, errorMessage, nextAttemptAt)
- loadReplayBatch(limit)

Suggested event statuses:

  PENDING
  SENDING
  RETRYING
  DELIVERED
  FAILED

## Sender Implementation

Create a sender module that:

1. Serializes the exact JSON body.
2. Builds a timestamp string in seconds.
3. Creates the HMAC SHA-256 signature using OHIO_INTEGRATION_SECRET.
4. Posts to SALES_CENTER_INTEGRATION_URL.
5. Returns both response details and thrown error details.

Signing rule:

    signature = sha256(timestamp + '.' + rawJsonBody)

Required outbound headers:

  Content-Type: application/json
  x-galaxy-timestamp: <timestamp>
  x-galaxy-signature: sha256=<hex-digest>

## Request Path Change

For every Ohio backend route that creates or updates a Sales Center-relevant record:

1. Commit the Ohio database write first.
2. Build a deterministic event_id.
3. Insert the event into sales_center_event_log with PENDING.
4. Attempt one immediate delivery.
5. If successful:
   update status to DELIVERED and set delivered_at.
6. If unsuccessful:
   update attempts, last_attempt_at, next_attempt_at, and error_message.
   leave the event available for background replay.

Recommended response behavior:

- Do not fail the main Ohio user request solely because the Sales Center is temporarily unavailable.
- Return the Ohio success response once the local write succeeds.
- Log the event for eventual delivery.

## Background Worker

Add a replay worker that runs on an interval or from a separate process.

Responsibilities:

1. Query pending or retrying events whose next_attempt_at is due.
2. Process a small batch each cycle.
3. Attempt delivery to the Sales Center.
4. Mark successful events as DELIVERED.
5. Increment attempts and schedule the next retry for failures.
6. Mark an event permanently FAILED after the configured max attempt count.

Suggested retry policy:

- first retry: 1 minute
- second retry: 5 minutes
- third retry: 15 minutes
- later retries: capped exponential or fixed 30-minute delay

## First Ohio Routes To Wire

Based on the current Ohio backend, there are not yet dedicated sales-center submission routes. Start with the server actions or endpoints that represent real customer or sales activity.

Recommended first additions in [backend/server.ts](/mnt/ai/websites/galaxysecurityweb/galaxy-guard-ohio-next/backend/server.ts):

1. customer or registration upsert flow
2. service request or quote intake flow
3. sale completion flow
4. payment recording flow

If the public-facing Next pages currently submit directly to page handlers or future API routes, those handlers should call the Ohio backend, and only the Ohio backend should emit signed events to the Sales Center.

## Testing Recommendation

The Ohio project currently does not expose an obvious backend test runner. Add one before wiring this deeply.

Minimum useful backend tests:

1. signature generation uses timestamp.rawJsonBody exactly
2. sender attaches x-galaxy-timestamp and x-galaxy-signature headers
3. event log insert occurs before immediate send attempt
4. failed send leaves event in RETRYING or FAILED state with next_attempt_at set
5. replay worker delivers queued events and marks them DELIVERED

## Order Of Implementation

1. Move Ohio DB credentials to env in [backend/db.ts](/mnt/ai/websites/galaxysecurityweb/galaxy-guard-ohio-next/backend/db.ts)
2. Add the sales_center_event_log table migration
3. Add the shared sender module
4. Add event-log helper functions
5. Update Ohio backend routes in [backend/server.ts](/mnt/ai/websites/galaxysecurityweb/galaxy-guard-ohio-next/backend/server.ts)
6. Add replay worker
7. Add backend tests
8. Run an end-to-end test against a non-production Sales Center instance

## Operational Note

This design preserves the separation you want:

- Ohio website remains on its own server and database
- Sales Center remains on its own server and database
- no direct database connectivity is introduced
- data crosses the boundary only through signed HTTPS requests
- failed cross-system sends become replayable instead of silently lost