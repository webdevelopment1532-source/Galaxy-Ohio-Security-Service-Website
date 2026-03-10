# Ohio Integration Contracts

This directory contains versioned contract artifacts used for Consumer-Driven Contract (CDC) validation between Ohio (producer) and Sales Center (consumer).

For Sales Center onboarding, see `INTEGRATION_CONSUMER_GUIDE.md`.

## Structure

- `v1/ohioBrokerEnvelope.schema.json`: Generated JSON Schema for broker envelope v1.
- `v2/ohioBrokerEnvelope.schema.json`: Generated JSON Schema for broker envelope v2.
- `v1/*.fixture.json`: Canonical example events per event type.
- `v2/*.fixture.json`: Canonical v2 examples for migration testing.
- `ohioContractTypes.ts`: Source-of-truth TypeScript contract types.
- `validateFixtures.ts`: Validates fixtures against the generated schema.
- `package.json`: Publishable contract artifact package manifest.
- `types/ohioContractTypes.d.ts`: Type exports for consumer TypeScript usage.
- `examples/validateOhioContracts.cjs`: CI-ready validator bootstrap script for consumers.

## Commands

```bash
npm run generate:contract-schema
npm run check:contract-fixtures
npm run contracts:verify
npm run contracts:pack
```

Optional publish command:

```bash
npm run contracts:publish
```

## Versioning

Use a new folder (`v2/`, `v3/`, ...) for breaking contract changes.

For controlled rollout/rollback, set:

```env
OHIO_PUBLISH_EVENT_VERSION=v1
OHIO_CONTRACT_SCHEMA_VERSION=v1
```

Sales Center should route by `event_version` and dedupe by `idempotency_key`.
