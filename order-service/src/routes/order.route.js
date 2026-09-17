import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  getAllOrders,
  getOrdersByRestaurant
} from '../controller/order.controller.js';
import { authenticateOrderUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateOrderUser, createOrder);
router.get('/:id', authenticateOrderUser, getOrderById);
router.put('/:id', authenticateOrderUser, updateOrder);
router.delete('/:id', authenticateOrderUser, deleteOrder);
router.get('/', authenticateOrderUser, getAllOrders); // Fetch all orders
router.get('/restaurant/:restaurantId', authenticateOrderUser, getOrdersByRestaurant); // New endpoint for restaurant orders

export default router;
