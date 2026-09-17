#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const evidenceDir = resolve(root, 'evidence');
const baselineRef = process.argv[2] ?? 'baseline-vulnerable';

const source = (path) => execFileSync('git', ['show', `${baselineRef}:${path}`], {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});

const checks = [
  {
    id: 'V1',
    title: 'Missing authentication on payment actions',
    cwe: 'CWE-306: Missing Authentication for Critical Function',
    request: `curl -i -X POST http://localhost:5000/api/payments/create-payment-intent \\\n  -H 'Content-Type: application/json' \\\n  --data '{"amount":1,"currency":"usd"}'`,
    evidence: [
      ['payment-service/src/index.js', "app.use('/api/payments', paymentRoutes);"],
      ['payment-service/src/routes/payment.route.js', "router.post('/create-payment-intent', createPaymentIntent);"],
      ['payment-service/src/routes/payment.route.js', "router.post('/confirm-payment', confirmPayment);"],
    ],
    impact: 'The payment actions are mounted without an authentication middleware, so an anonymous caller reaches payment functionality.',
  },
  {
    id: 'V2',
    title: 'Order IDOR/BOLA',
    cwe: 'CWE-639: Authorization Bypass Through User-Controlled Key',
    request: `curl -i http://localhost:5000/api/orders/0000000000000000000000e1 \\\n  -H 'Authorization: Bearer CUSTOMER_B_TOKEN'`,
    evidence: [
      ['order-service/src/routes/order.route.js', "router.get('/:id', getOrderById);"],
      ['order-service/src/controller/order.controller.js', 'const order = await Order.findById(req.params.id);'],
      ['order-service/src/controller/order.controller.js', 'const deleted = await Order.findByIdAndDelete(req.params.id);'],
    ],
    impact: 'The record lookup and delete operation use only the caller-controlled order id and do not constrain the record to the authenticated customer.',
  },
  {
    id: 'V3',
    title: 'Order mass assignment',
    cwe: 'CWE-915: Improperly Controlled Modification of Dynamically-Managed Object Attributes',
    request: `curl -i -X PUT http://localhost:5000/api/orders/0000000000000000000000e1 \\\n  -H 'Content-Type: application/json' \\\n  --data '{"userId":"CUSTOMER_B","totalAmount":1,"status":"paid"}'`,
    evidence: [
      ['order-service/src/controller/order.controller.js', 'const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });'],
      ['order-service/src/controller/order.controller.js', 'const { userId, items, paymentMethod, totalAmount, currency, deliveryAddress, phoneNumber } = req.body;'],
    ],
    impact: 'The update path passes the complete request body to the persistence operation, allowing client-controlled protected attributes.',
  },
  {
    id: 'V4',
    title: 'Unauthorised delivery mutation',
    cwe: 'CWE-862: Missing Authorization',
    request: `curl -i -X PATCH http://localhost:3010/delivery/0000000000000000000000f1/status \\\n  -H 'Content-Type: application/json' \\\n  --data '{"status":"DELIVERED"}'`,
    evidence: [
      ['delivery-service/src/routes/deliveryRoutes.js', "router.patch('/:id/status', updateDeliveryStatus);"],
      ['delivery-service/src/controllers/deliveryController.js', 'const delivery = await Delivery.findById(id);'],
      ['delivery-service/src/controllers/deliveryController.js', 'delivery.status = status;'],
      ['delivery-service/src/controllers/deliveryController.js', 'delivery.driverlocation = location;'],
    ],
    impact: 'The status and location mutations identify a delivery by URL id but do not authenticate or verify the assigned driver before saving changes.',
  },
  {
    id: 'V5',
    title: 'Broken administrative authorisation',
    cwe: 'CWE-862: Missing Authorization for Administrative Function',
    request: `curl -i -X PUT http://localhost:3009/driver/0000000000000000000000b1/availability \\\n  -H 'Content-Type: application/json' \\\n  --data '{"isAvailable":false}'`,
    evidence: [
      ['driver-service/src/routes/driverRoutes.js', "router.put('/:id/availability', updateDriverAvailabilityById);"],
      ['driver-service/src/routes/driverRoutes.js', "router.get('/all',  getAllDrivers);"],
      ['restaurant-service/src/routes/restaurantRoutes.js', 'router.put("/menu/:restaurantId/:itemId", updateMenuItem);'],
      ['restaurant-service/src/routes/adminRoutes.js', 'router.put("/verify/:restaurantId", verifyRestaurant);'],
    ],
    impact: 'Identifier-based driver and restaurant administrative operations are publicly routed without an owner, staff, or admin capability check.',
  },
  {
    id: 'V6',
    title: 'Payment amount manipulation',
    cwe: 'CWE-841: Improper Enforcement of Behavioral Workflow',
    request: `curl -i -X POST http://localhost:5000/api/orders \\\n  -H 'Content-Type: application/json' \\\n  --data '{"userId":"CUSTOMER_A","paymentMethod":"card","totalAmount":1,"items":[...]} '`,
    evidence: [
      ['payment-service/src/controller/payment.controllers.js', 'const { amount, currency } = req.body;'],
      ['payment-service/src/controller/payment.controllers.js', 'amount,'],
      ['order-service/src/controller/order.controller.js', "const finalAmount = paymentMethod === 'card' ? totalAmount : calculatedTotalAmount;"],
      ['order-service/src/controller/order.controller.js', "status: paymentMethod === 'card' ? 'paid' : 'pending',"],
    ],
    impact: 'The client-selected amount is sent to Stripe and card orders are marked paid without server-side confirmation that the amount matches trusted product prices.',
  },
  {
    id: 'V7',
    title: 'Sensitive session-token exposure',
    cwe: 'CWE-922: Insecure Storage of Sensitive Information',
    request: `curl -i -X POST http://localhost:5000/api/user/auth \\\n  -H 'Content-Type: application/json' \\\n  --data '{"email":"customer-a@security.test","password":"CustomerA-Local-Only-123!"}'`,
    evidence: [
      ['user-service/src/controllers/authController.js', 'accessToken'],
      ['user-service/src/controllers/authController.js', 'console.log(refreshToken)'],
      ['frontend/src/Hooks/useLogin.jsx', "localStorage.setItem('token', accessToken)"],
      ['frontend/src/axios.jsx', "console.log(token)"],
    ],
    impact: 'The access token is returned to browser JavaScript, persisted in localStorage, and logged by the frontend; refresh-token material is also logged by the user service.',
  },
];

const lineOf = (text, needle) => {
  const line = text.split('\n').findIndex((value) => value.includes(needle));
  return line === -1 ? null : line + 1;
};

await mkdir(evidenceDir, { recursive: true });
let failed = false;

for (const finding of checks) {
  const lines = [`# ${finding.id}: ${finding.title}`, '', `Baseline reference: ${baselineRef}`, `Primary mapping: ${finding.cwe}`, '', '## Reproduction request', '', '```bash', finding.request, '```', '', '## Baseline source result', ''];
  for (const [path, needle] of finding.evidence) {
    let text;
    try {
      text = source(path);
    } catch {
      failed = true;
      lines.push(`- FAIL: ${path} could not be read from ${baselineRef}`);
      continue;
    }
    const line = lineOf(text, needle);
    if (line === null) {
      failed = true;
      lines.push(`- FAIL: ${path} does not contain the expected vulnerable operation: \`${needle}\``);
    } else {
      lines.push(`- PASS: ${path}:${line} contains \`${needle}\``);
    }
  }
  lines.push('', `Impact: ${finding.impact}`, '', 'This Phase 3 artifact is a reproducible source-level baseline proof. The curl request is the local HTTP reproduction recipe; live response captures are added after the affected local service is started. No live response is claimed by this artifact.', '');
  await writeFile(resolve(evidenceDir, `${finding.id}-before.txt`), `${lines.join('\n').replace(/\n+$/, '')}\n`);
}

if (failed) {
  console.error('One or more baseline source checks failed.');
  process.exit(1);
}

console.log(`Verified ${checks.length} distinct baseline source conditions at ${baselineRef}.`);
for (const finding of checks) console.log(`${finding.id}: ${finding.title}`);
