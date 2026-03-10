/*
 * Sales Center CI bootstrap validator example.
 *
 * Usage in Sales Center:
 *   node ./scripts/validateOhioContracts.cjs
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const packageRoot = path.resolve(__dirname, '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getVersionDirs(rootDir) {
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^v\d+$/.test(entry.name))
    .map((entry) => ({ name: entry.name, fullPath: path.join(rootDir, entry.name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function run() {
  const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
  const versionDirs = getVersionDirs(packageRoot);

  if (versionDirs.length === 0) {
    throw new Error(`No versioned contract directories found in ${packageRoot}`);
  }

  let isGreen = true;
  let fixtureCount = 0;

  console.log('[sales-center-contracts] validating Ohio fixtures against versioned schemas');

  for (const versionDir of versionDirs) {
    const schemaPath = path.join(versionDir.fullPath, 'ohioBrokerEnvelope.schema.json');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Missing schema at ${schemaPath}`);
    }

    const schema = readJson(schemaPath);
    const validate = ajv.compile(schema);

    const fixtures = fs
      .readdirSync(versionDir.fullPath)
      .filter((name) => name.endsWith('.fixture.json'))
      .map((name) => ({ name, fullPath: path.join(versionDir.fullPath, name) }));

    if (fixtures.length === 0) {
      throw new Error(`No fixtures found in ${versionDir.fullPath}`);
    }

    console.log(`  [${versionDir.name}] ${fixtures.length} fixture(s)`);

    for (const fixture of fixtures) {
      const payload = readJson(fixture.fullPath);
      const valid = validate(payload);

      if (!valid) {
        isGreen = false;
        console.error(`    FAIL ${fixture.name}`);
        for (const err of validate.errors || []) {
          const location = err.instancePath || err.schemaPath || '/';
          console.error(`      - ${location}: ${err.message || 'validation error'}`);
        }
        continue;
      }

      // Hook for Sales Center event handler verification:
      // await processOhioEvent(payload)
      console.log(`    PASS ${fixture.name}`);
      fixtureCount += 1;
    }
  }

  if (!isGreen) {
    throw new Error('Ohio contract validation failed. See errors above.');
  }

  console.log(`[sales-center-contracts] validated ${fixtureCount} fixture(s) successfully`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
