import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const __filename = fileURLToPath(import.meta.url);
const contractsRoot = path.dirname(__filename);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function run() {
  const versionDirs = fs
    .readdirSync(contractsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^v[0-9]+$/.test(entry.name))
    .map((entry) => path.join(contractsRoot, entry.name))
    .sort();

  if (versionDirs.length === 0) {
    throw new Error(`No versioned contract directories found in ${contractsRoot}`);
  }

  const ajv = new Ajv({ allErrors: true });
  let totalFixtures = 0;

  for (const contractsDir of versionDirs) {
    const schemaPath = path.join(contractsDir, 'ohioBrokerEnvelope.schema.json');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema not found at ${schemaPath}. Run npm run generate:contract-schema first.`);
    }

    const schema = readJson(schemaPath);
    const fixtureFiles = fs
      .readdirSync(contractsDir)
      .filter((file) => file.endsWith('.fixture.json'))
      .map((file) => path.join(contractsDir, file));

    if (fixtureFiles.length === 0) {
      throw new Error(`No fixture files found in ${contractsDir}`);
    }

    const validate = ajv.compile(schema);
    for (const fixturePath of fixtureFiles) {
      const fixture = readJson(fixturePath);
      const isValid = validate(fixture);

      if (!isValid) {
        const errors = (validate.errors || [])
          .map((error) => `${error.instancePath || '/'} ${error.message || 'validation error'}`)
          .join('; ');
        throw new Error(`Fixture validation failed for ${path.basename(fixturePath)}: ${errors}`);
      }
      totalFixtures += 1;
    }
  }

  console.log(`[contracts] validated ${totalFixtures} fixture(s) across ${versionDirs.length} contract version(s)`);
}

run();
