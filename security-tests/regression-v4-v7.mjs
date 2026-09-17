#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

const deliveryRoutes = read('delivery-service/src/routes/deliveryRoutes.js');
const deliveryController = read('delivery-service/src/controllers/deliveryController.js');
const driverRoutes = read('driver-service/src/routes/driverRoutes.js');
const driverController = read('driver-service/src/controllers/driverController.js');
const driverAuth = read('driver-service/src/middleware/authMiddleware.js');
const orderController = read('order-service/src/controller/order.controller.js');
const userAuth = read('user-service/src/controllers/authController.js');
const userMiddleware = read('user-service/src/middleware/authMiddleware.js');
const tokenUtils = read('user-service/src/utils/generateToken.js');
const loginHook = read('frontend/src/Hooks/useLogin.jsx');
const browserAxios = read('frontend/src/axios.jsx');

expect(deliveryRoutes.includes('authenticateDeliveryActor, updateDeliveryStatus'), 'V4 status route lacks authentication');
expect(deliveryRoutes.includes('authenticateDeliveryActor, updateDriverLocation'), 'V4 location route lacks authentication');
expect(deliveryController.includes("String(delivery.driverid) !== String(req.actorId)"), 'V4 assigned-driver ownership check is missing');
expect(deliveryController.includes('allowedTransitions'), 'V4 delivery transition check is missing');

expect(driverRoutes.includes("router.put('/:id/availability', protect, updateDriverAvailabilityById)"), 'V5 availability route lacks driver authentication');
expect(driverController.includes("String(req.driver?._id) !== String(driverId)"), 'V5 driver ownership check is missing');
expect(!driverAuth.includes('token.substring'), 'V5 driver middleware still logs a token prefix');

expect(orderController.includes('totalAmount: calculatedTotalAmount'), 'V6 does not persist the calculated server total');
expect(orderController.includes("currency: 'usd'"), 'V6 currency is not server-owned');
expect(orderController.includes("status: 'pending'"), 'V6 card orders are still marked paid before confirmation');
expect(!orderController.includes('const { items, paymentMethod, totalAmount'), 'V6 still accepts totalAmount as a create authority');

expect(userAuth.includes(".cookie('accessToken'"), 'V7 access cookie is missing');
expect(userMiddleware.includes('req.cookies?.accessToken'), 'V7 protected user routes do not read the session cookie');
expect(!userAuth.includes('accessToken\n        });'), 'V7 login response still exposes an access token');
expect(!tokenUtils.includes('console.log(refreshToken)'), 'V7 refresh token is still logged');
expect(!loginHook.includes("localStorage.setItem('token'"), 'V7 frontend still persists a bearer token');
expect(!browserAxios.includes('interceptors.request'), 'V7 frontend still has a bearer-token interceptor');

console.log('V4-V7 source regression checks passed on the current source.');
