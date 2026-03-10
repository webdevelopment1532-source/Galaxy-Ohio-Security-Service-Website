import assert from 'node:assert/strict';
import test from 'node:test';

import { computeRetryDelayMs } from './ohioIntegrationEventLog';

test('computeRetryDelayMs applies exponential backoff with cap', () => {
  const base = 500;
  assert.equal(computeRetryDelayMs(1, base), 500);
  assert.equal(computeRetryDelayMs(2, base), 1000);
  assert.equal(computeRetryDelayMs(3, base), 2000);
  assert.equal(computeRetryDelayMs(7, base), 32000);
  assert.equal(computeRetryDelayMs(12, base), 32000);
});
