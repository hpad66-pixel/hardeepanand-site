import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshots, benefitCase } from '../src/lib/resilience-dashboard.js';

test('funding does not stand in for verified protection and portfolio spend is reconciled', () => {
  const [identified, funded, verified] = snapshots;
  for (const key of ['cves', 'paths', 'recovery', 'verified']) assert.equal(funded[key], identified[key]);
  assert.ok(funded.allocated > identified.allocated);
  for (const snapshot of snapshots) {
    assert.equal(snapshot.spent - snapshot.packageSpent, 420000);
    assert.ok(snapshot.packageSpent <= snapshot.allocated);
    assert.ok(snapshot.spent <= 1200000);
    assert.ok(snapshot.recovery <= 6);
  }
  assert.equal(verified.verified, identified.verified + 1);
  assert.equal(verified.recovery, identified.recovery + 1);
  assert.equal(identified.paths - verified.paths, 3);
  assert.equal(identified.cves - verified.cves, 4);
  assert.ok(verified.cves > 0, 'Completing one package does not close every finding');
});
test('financial scenario exposes negative, break-even, and positive returns', () => {
  assert.deepEqual(benefitCase(30000), {benefit:90000, net:-30000, roi:-25});
  assert.deepEqual(benefitCase(40000), {benefit:120000, net:0, roi:0});
  assert.deepEqual(benefitCase(50000), {benefit:150000, net:30000, roi:25});
  assert.deepEqual(benefitCase(70000), {benefit:210000, net:90000, roi:75});
});
