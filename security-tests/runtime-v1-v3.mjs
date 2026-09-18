#!/usr/bin/env node

import { createHmac } from 'node:crypto';

// Docker Compose exposes the order and payment services on these host ports.
const orderUrl = process.env.ORDER_URL ?? 'http://127.0.0.1:3007';
const paymentUrl = process.env.PAYMENT_URL ?? 'http://127.0.0.1:3008';
const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error('Set JWT_SECRET to the local security-test secret before running this script.');
  process.exit(2);
}

const customerA = '00000000-0000-4000-8000-000000000001';
const customerB = '00000000-0000-4000-8000-000000000002';
const orderA = '0000000000000000000000e1';
const productA = '0000000000000000000000d1';

const base64url = (value) => Buffer.from(value).toString('base64url');
const tokenFor = (userId, expiresInSeconds = 3600) => {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  }));
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
};

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  return { status: response.status, body: await response.text() };
};

const assertStatus = (name, result, expected) => {
  if (result.status !== expected) {
    throw new Error(`${name}: expected HTTP ${expected}, received HTTP ${result.status}`);
  }
  console.log(`PASS ${name}: HTTP ${result.status}`);
};

const assertNotUnauthorized = (name, result) => {
  if (result.status === 401) {
    throw new Error(`${name}: authenticated request was rejected as unauthenticated`);
  }
  console.log(`PASS ${name}: authenticated handler reached with HTTP ${result.status}`);
};

const json = (value) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(value),
});

assertStatus(
  'V1 anonymous payment request is blocked',
  await request(`${paymentUrl}/api/payments/create-payment-intent`, {
    method: 'POST',
    ...json({ amount: 1, currency: 'usd' }),
  }),
  401,
);

assertStatus(
  'V1 expired payment token is blocked',
  await request(`${paymentUrl}/api/payments/create-payment-intent`, {
    method: 'POST',
    headers: {
      ...json({ amount: 1, currency: 'usd' }).headers,
      Authorization: `Bearer ${tokenFor(customerA, -60)}`,
    },
    body: JSON.stringify({ amount: 1, currency: 'usd' }),
  }),
  401,
);

assertNotUnauthorized(
  'V1 authenticated payment request reaches the payment handler',
  await request(`${paymentUrl}/api/payments/create-payment-intent`, {
    method: 'POST',
    headers: {
      ...json({ amount: 1, currency: 'usd' }).headers,
      Authorization: `Bearer ${tokenFor(customerA)}`,
    },
    body: JSON.stringify({ amount: 1, currency: 'usd' }),
  }),
);

assertStatus(
  'V2 anonymous order read is blocked',
  await request(`${orderUrl}/api/orders/${orderA}`),
  401,
);

assertStatus(
  'V2 foreign order read is blocked',
  await request(`${orderUrl}/api/orders/${orderA}`, {
    headers: { Authorization: `Bearer ${tokenFor(customerB)}` },
  }),
  404,
);

assertStatus(
  'V2 owner order read remains available',
  await request(`${orderUrl}/api/orders/${orderA}`, {
    headers: { Authorization: `Bearer ${tokenFor(customerA)}` },
  }),
  200,
);

assertStatus(
  'V3 protected order fields cannot be mass-assigned',
  await request(`${orderUrl}/api/orders/${orderA}`, {
    method: 'PUT',
    headers: {
      ...json({}).headers,
      Authorization: `Bearer ${tokenFor(customerA)}`,
    },
    body: JSON.stringify({
      userId: customerB,
      totalAmount: 1,
      status: 'paid',
      createdAt: '2000-01-01T00:00:00.000Z',
    }),
  }),
  400,
);

const update = await request(`${orderUrl}/api/orders/${orderA}`, {
  method: 'PUT',
  headers: {
    ...json({}).headers,
    Authorization: `Bearer ${tokenFor(customerA)}`,
  },
  body: JSON.stringify({ deliveryAddress: 'Synthetic Address A - authorised update' }),
});
assertStatus('V2/V3 owner can update an allowed order field', update, 200);

const created = await request(`${orderUrl}/api/orders`, {
  method: 'POST',
  headers: {
    ...json({}).headers,
    Authorization: `Bearer ${tokenFor(customerA)}`,
  },
  body: JSON.stringify({
    userId: customerB,
    items: [{ productId: productA, quantity: 1 }],
    paymentMethod: 'cash',
    totalAmount: 1,
    deliveryAddress: 'Synthetic Address A',
    phoneNumber: '0700000001',
  }),
});
assertStatus('V3 owner can create an order through the authorised path', created, 201);

console.log('V1-V3 runtime regression checks passed.');
