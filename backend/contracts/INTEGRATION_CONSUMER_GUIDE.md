# Sales Center Consumer Guide

This guide is for Sales Center engineers integrating Ohio's versioned contract artifacts.

## 1. Consuming Ohio Integration Contracts

Install from your private registry:

```bash
npm install --save-dev @galaxyguard/ohio-integration-contracts@^1
```

Pin exact versions for strict reproducibility:

```bash
npm install --save-dev @galaxyguard/ohio-integration-contracts@1.0.0
```

### Artifact Paths

After install, artifacts are available under:

- `node_modules/@galaxyguard/ohio-integration-contracts/v1/ohioBrokerEnvelope.schema.json`
- `node_modules/@galaxyguard/ohio-integration-contracts/v2/ohioBrokerEnvelope.schema.json`
- `node_modules/@galaxyguard/ohio-integration-contracts/v1/*.fixture.json`
- `node_modules/@galaxyguard/ohio-integration-contracts/v2/*.fixture.json`

### TypeScript Type Imports

```ts
// sales-center-backend/src/types/ohio-events.ts
import type {
  OhioBrokerEnvelopeContract,
  OhioIntegrationEventContract,
} from '@galaxyguard/ohio-integration-contracts/types/ohioContractTypes';

export type IncomingOhioEvent = OhioBrokerEnvelopeContract<OhioIntegrationEventContract>;
export type IncomingOhioPayload = OhioIntegrationEventContract;
```

## 2. Automated Consumer Validation in Sales Center CI

Add script in Sales Center `package.json`:

```json
{
  "scripts": {
    "validate:ohio-contracts": "node ./scripts/validateOhioContracts.js"
  }
}
```

Use this robust validator implementation in Sales Center `scripts/validateOhioContracts.js`:

```js
const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true, strict: false });

const contractsPackageRoot = path.dirname(
  require.resolve('@galaxyguard/ohio-integration-contracts/package.json')
);

const versionDirs = fs
  .readdirSync(contractsPackageRoot, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory() && /^v\d+$/.test(dirent.name))
  .map((dirent) => path.join(contractsPackageRoot, dirent.name))
  .sort();

console.log('Validating Sales Center event processing against Ohio contracts...');
let allValid = true;

for (const versionPath of versionDirs) {
  const version = path.basename(versionPath);
  const schemaPath = path.join(versionPath, 'ohioBrokerEnvelope.schema.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schema);

  console.log(`\n  --- Validating for contract version ${version} ---`);

  const fixtureFiles = fs.readdirSync(versionPath).filter((file) => file.endsWith('.fixture.json'));
  for (const fixtureFile of fixtureFiles) {
    const fixture = JSON.parse(fs.readFileSync(path.join(versionPath, fixtureFile), 'utf8'));
    const isValid = validate(fixture);

    if (!isValid) {
      allValid = false;
      console.error(`    FAIL ${fixtureFile} failed schema validation:`);
      console.error(JSON.stringify(validate.errors, null, 2));
    } else {
      console.log(`    PASS ${fixtureFile} is valid against schema.`);
      // Optional advanced check:
      // await salesCenterEventHandler(fixture)
    }
  }
}

if (!allValid) {
  console.error('\nOhio Contract validation FAILED for Sales Center.');
  process.exit(1);
} else {
  console.log('\nAll Ohio Contracts validated successfully for Sales Center!');
}
```

### GitHub Actions Step

```yaml
- name: Install dependencies
  run: npm ci

- name: Validate Ohio Integration Contracts
  run: npm run validate:ohio-contracts
```

Recommendation: run this on every PR and on dependency update PRs for `@galaxyguard/ohio-integration-contracts`.

## 3. Event Version Evolution Playbook

### Routing by `event_version`

```ts
import type { OhioBrokerEnvelopeContract } from '@galaxyguard/ohio-integration-contracts/types/ohioContractTypes';

export async function processOhioEvent(envelope: OhioBrokerEnvelopeContract) {
  switch (envelope.event_version) {
    case 'v1':
      return processEventV1(envelope.event);
    case 'v2':
      return processEventV2(envelope.event);
    default:
      throw new Error(`Unsupported event version: ${envelope.event_version}`);
  }
}
```

### Idempotency Requirement

Use `idempotency_key` as your dedupe key. If already processed:

- acknowledge message
- do not reapply business side effects

### Deprecation and Rollback

- Monitor volume of each version (`v1`, `v2`) in consumer metrics.
- Keep old processors until older version traffic reaches zero for your deprecation window.
- If issues are detected in new version, coordinate with Ohio to roll back producer flags:
  - `OHIO_PUBLISH_EVENT_VERSION`
  - `OHIO_CONTRACT_SCHEMA_VERSION`

## 4. Pact / CDC Alignment

You can pair schema checks with Pact:

- Consumer (Sales Center) defines expected interaction with Ohio envelope.
- Producer (Ohio) verifies contract in CI using generated schema and fixture set.

Schema validation catches shape drift; Pact catches behavior/expectation drift.
