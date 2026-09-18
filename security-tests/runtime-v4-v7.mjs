#!/usr/bin/env node

import { createHmac } from 'node:crypto';

// Docker Compose exposes the order and payment services on these host ports.
const orderUrl = process.env.ORDER_URL ?? 'http://127.0.0.1:3007';
const paymentUrl = process.env.PAYMENT_URL ?? 'http://127.0.0.1:3008';
const deliveryUrl = process.env.DELIVERY_URL ?? 'http://127.0.0.1:3010';
const driverUrl = process.env.DRIVER_URL ?? 'http://127.0.0.1:3009';
const userUrl = process.env.USER_URL ?? 'http://127.0.0.1:3001';
const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error('Set JWT_SECRET to the local security-test secret before running this script.');
  process.exit(2);
}

const customerA = '00000000-0000-4000-8000-000000000001';
const customerB = '00000000-0000-4000-8000-000000000002';
const driverA = '0000000000000000000000a1';
const driverB = '0000000000000000000000b1';
const orderA = '0000000000000000000000e1';
const deliveryA = '0000000000000000000000f1';
const productA = '0000000000000000000000d1';

const base64url = (value) => Buffer.from(value).toString('base64url');
const tokenFor = (claims, expiresInSeconds = 3600) => {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ ...claims, iat: now, exp: now + expiresInSeconds }));
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
};

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  return { status: response.status, body: await response.text(), headers: response.headers };
};

const json = (value) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(value),
});

const assertStatus = (name, result, expected) => {
  if (result.status !== expected) {
    throw new Error(`${name}: expected HTTP ${expected}, received HTTP ${result.status}: ${result.body.slice(0, 160)}`);
  }
  console.log(`PASS ${name}: HTTP ${result.status}`);
};

const assertBody = (name, result, predicate) => {
  let body;
  try {
    body = JSON.parse(result.body);
  } catch {
    throw new Error(`${name}: response was not JSON`);
  }
  if (!predicate(body)) throw new Error(`${name}: response assertion failed`);
  console.log(`PASS ${name}: response assertion`);
};

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

assertStatus(
  'V4 anonymous delivery status update is blocked',
  await request(`${deliveryUrl}/delivery/${deliveryA}/status`, {
    method: 'PATCH',
    ...json({ status: 'PICKED_UP' }),
  }),
  401,
);

assertStatus(
  'V4 customer cannot update a driver delivery',
  await request(`${deliveryUrl}/delivery/${deliveryA}/status`, {
    method: 'PATCH',
    headers: { ...json({ status: 'PICKED_UP' }).headers, ...bearer(tokenFor({ userId: customerA })) },
    body: JSON.stringify({ status: 'PICKED_UP' }),
  }),
  403,
);

assertStatus(
  'V4 unrelated driver cannot update the delivery',
  await request(`${deliveryUrl}/delivery/${deliveryA}/status`, {
    method: 'PATCH',
    headers: { ...json({ status: 'PICKED_UP' }).headers, ...bearer(tokenFor({ id: driverB })) },
    body: JSON.stringify({ status: 'PICKED_UP' }),
  }),
  403,
);

assertStatus(
  'V4 assigned driver can update the next delivery state',
  await request(`${deliveryUrl}/delivery/${deliveryA}/status`, {
    method: 'PATCH',
    headers: { ...json({ status: 'PICKED_UP' }).headers, ...bearer(tokenFor({ id: driverA })) },
    body: JSON.stringify({ status: 'PICKED_UP' }),
  }),
  200,
);

assertStatus(
  'V4 reversed delivery transition is blocked',
  await request(`${deliveryUrl}/delivery/${deliveryA}/status`, {
    method: 'PATCH',
    headers: { ...json({ status: 'ASSIGNED' }).headers, ...bearer(tokenFor({ id: driverA })) },
    body: JSON.stringify({ status: 'ASSIGNED' }),
  }),
  409,
);

assertStatus(
  'V4 assigned driver can update delivery location',
  await request(`${deliveryUrl}/delivery/${deliveryA}/driver-location`, {
    method: 'PATCH',
    headers: { ...json({ location: [79.862, 6.928] }).headers, ...bearer(tokenFor({ id: driverA })) },
    body: JSON.stringify({ location: [79.862, 6.928], locationText: 'Synthetic location' }),
  }),
  200,
);

assertStatus(
  'V5 wrong driver cannot change Driver B availability',
  await request(`${driverUrl}/driver/${driverB}/availability`, {
    method: 'PUT',
    headers: { ...json({ isAvailable: false }).headers, ...bearer(tokenFor({ id: driverA })) },
    body: JSON.stringify({ isAvailable: false }),
  }),
  403,
);

assertStatus(
  'V5 driver can change their own availability',
  await request(`${driverUrl}/driver/${driverA}/availability`, {
    method: 'PUT',
    headers: { ...json({ isAvailable: false }).headers, ...bearer(tokenFor({ id: driverA })) },
    body: JSON.stringify({ isAvailable: false }),
  }),
  200,
);

await request(`${driverUrl}/driver/${driverA}/availability`, {
  method: 'PUT',
  headers: { ...json({ isAvailable: true }).headers, ...bearer(tokenFor({ id: driverA })) },
  body: JSON.stringify({ isAvailable: true }),
});

const tamperedOrder = await request(`${orderUrl}/api/orders`, {
  method: 'POST',
  headers: { ...json({}).headers, ...bearer(tokenFor({ userId: customerA })) },
  body: JSON.stringify({
    userId: customerB,
    items: [{ productId: productA, quantity: 2 }],
    paymentMethod: 'card',
    totalAmount: 1,
    currency: 'eur',
    status: 'paid',
    paymentStatus: 'paid',
    deliveryAddress: 'Synthetic Address A',
    phoneNumber: '0700000001',
  }),
});
assertStatus('V6 tampered card order request is handled', tamperedOrder, 201);
assertBody('V6 server owns card total and initial payment state', tamperedOrder, (body) => (
  body.order?.totalAmount === 2500 &&
  body.order?.currency === 'usd' &&
  body.order?.status === 'pending'
));

const login = await request(`${userUrl}/api/user/auth`, {
  method: 'POST',
  ...json({ email: 'customer-a@security.test', password: 'CustomerA-Local-Only-123!' }),
});
assertStatus('V7 customer login succeeds', login, 200);
assertBody('V7 login response does not expose an access token', login, (body) => (
  body.accessToken === undefined && body.user?.userId
));

const setCookie = login.headers.get('set-cookie') ?? '';
if (!setCookie.includes('accessToken=') || !setCookie.includes('refreshToken=') || !setCookie.includes('HttpOnly') || !setCookie.includes('SameSite=Strict')) {
  throw new Error('V7 login did not issue both strict HttpOnly session cookies');
}
console.log('PASS V7 login issues strict HttpOnly access and refresh cookies');

const cookies = setCookie
  .split(/, (?=[^;,]+=)/)
  .map((value) => value.split(';', 1)[0])
  .join('; ');

assertStatus(
  'V7 cookie session reaches the protected user profile',
  await request(`${userUrl}/api/user/`, { headers: { Cookie: cookies } }),
  200,
);

assertStatus(
  'V7 refresh without an approved origin is blocked',
  await request(`${userUrl}/api/user/refresh`, {
    method: 'POST',
    headers: { Cookie: cookies },
  }),
  403,
);

const refreshed = await request(`${userUrl}/api/user/refresh`, {
  method: 'POST',
  headers: { Cookie: cookies, Origin: 'http://localhost:5173' },
});
assertStatus('V7 refresh endpoint succeeds with the HttpOnly cookie', refreshed, 200);
assertBody('V7 refresh response does not expose an access token', refreshed, (body) => body.accessToken === undefined);

console.log('V4-V7 runtime regression checks passed.');
