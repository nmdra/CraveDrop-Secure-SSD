#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// The committed fixture pack is the canonical synthetic dataset. The active
// copy is generated locally and remains ignored so test runs cannot alter it.
const sourcePath = resolve(root, 'security-tests/fixtures/security-fixtures.json');
const activePath = resolve(root, 'security-tests/fixtures/active-fixtures.json');

const action = process.argv[2] ?? 'reset';
const allowedActions = new Set(['reset', 'verify']);

if (!allowedActions.has(action)) {
  console.error(`Usage: node scripts/seed-security-fixtures.mjs [${[...allowedActions].join('|')}]`);
  process.exit(2);
}

const source = await readFile(sourcePath, 'utf8');
const fixtures = JSON.parse(source);
// Stable formatting makes verification a byte-for-byte reproducibility check.
const normalized = `${JSON.stringify(fixtures, null, 2)}\n`;

if (action === 'reset') {
  await mkdir(dirname(activePath), { recursive: true });
  // Restrictive permissions keep even synthetic local test state private.
  await writeFile(activePath, normalized, { mode: 0o600 });
  console.log('Security fixtures reset to the deterministic synthetic A/B dataset.');
} else {
  const active = await readFile(activePath, 'utf8');
  if (active !== normalized) {
    console.error('Active security fixtures differ from the deterministic fixture pack.');
    process.exit(1);
  }
  console.log('Security fixtures verified.');
}

console.log(`Customer A: ${fixtures.customers.customerA.userId}`);
console.log(`Customer B: ${fixtures.customers.customerB.userId}`);
console.log(`Order A: ${fixtures.orders.customerAOrder.orderId}`);
console.log(`Driver A: ${fixtures.drivers.driverA.driverId}`);
console.log(`Driver B: ${fixtures.drivers.driverB.driverId}`);
