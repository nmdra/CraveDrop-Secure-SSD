#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ref = process.argv[2] ?? 'HEAD';
const source = (path) => {
  if (ref === 'WORKTREE') return readFileSync(resolve(root, path), 'utf8');

  try {
    return execFileSync('git', ['show', `${ref}:${path}`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    if (ref === 'baseline-vulnerable' && error.status === 128) return '';
    throw error;
  }
};

const expect = (condition, message) => {
  if (!condition) {
    throw new Error(`${ref}: ${message}`);
  }
};

const paymentRoutes = source('payment-service/src/routes/payment.route.js');
const paymentMiddleware = source('payment-service/src/middleware/authMiddleware.js');
const orderRoutes = source('order-service/src/routes/order.route.js');
const orderController = source('order-service/src/controller/order.controller.js');

if (ref === 'baseline-vulnerable') {
  expect(!paymentRoutes.includes('authenticatePaymentUser'), 'baseline unexpectedly protects payment routes');
  expect(!orderRoutes.includes('authenticateOrderUser'), 'baseline unexpectedly protects order routes');
  expect(orderController.includes('Order.findById(req.params.id)'), 'baseline no longer contains the order IDOR lookup');
  expect(orderController.includes('Order.findByIdAndUpdate(req.params.id, req.body'), 'baseline no longer contains the mass-assignment update');
  console.log('V1-V3 baseline regression is red by design: vulnerable route/controller contracts are present.');
  process.exit(0);
}

expect(paymentRoutes.includes('authenticatePaymentUser'), 'payment actions are not protected by the focused middleware');
expect(paymentMiddleware.includes('jwt.verify'), 'payment middleware does not verify the bearer token');
expect(orderRoutes.includes('authenticateOrderUser'), 'order routes are not protected by the focused middleware');
expect(orderController.includes('userId: req.userId'), 'order ownership is not constrained to the verified user');
expect(!orderController.includes('Order.findById(req.params.id)'), 'unscoped order lookup remains');
expect(!orderController.includes('Order.findByIdAndUpdate(req.params.id, req.body'), 'mass-assignment update remains');
expect(orderController.includes("const allowedFields = ['deliveryAddress', 'phoneNumber'];"), 'order update allow-list is missing');

console.log('V1-V3 regression checks passed on the current source.');
