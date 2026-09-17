import express from 'express';
import { createPaymentIntent, confirmPayment } from '../controller/payment.controllers.js';
import { authenticatePaymentUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-payment-intent', authenticatePaymentUser, createPaymentIntent);
router.post('/confirm-payment', authenticatePaymentUser, confirmPayment);

export default router;