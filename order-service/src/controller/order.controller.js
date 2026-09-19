import Order from '../model/order.model.js';
import Product from '../model/product.model.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, deliveryAddress, phoneNumber } = req.body;
    const userId = req.userId;

    if (!userId || !Array.isArray(items) || items.length === 0 || !paymentMethod || !deliveryAddress) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    let paymentClientSecret = null;
    let calculatedTotalAmount = 0;
    const enrichedItems = [];

    // Resolve every product from the trusted catalogue. Client-supplied prices
    // never participate in the total persisted for the order.
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotalAmount += itemTotal;

      enrichedItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        restaurantId: product.restaurantId || 'default-restaurant' // Include restaurant ID from product
      });
    }

    // Order creation does not accept a client claim that a card payment has
    // completed; provider confirmation belongs to a separate verified flow.
    if (paymentMethod === 'card') {
      // Keep the new order pending until trusted payment confirmation arrives.
    } else if (paymentMethod === 'cash') {
      // For cash payments, no need to process anything here
    }

    // These values are server-owned even when the request includes conflicting
    // totalAmount, currency, status, or paymentStatus properties.
    const order = new Order({
      userId,
      items: enrichedItems,
      totalAmount: calculatedTotalAmount,
      currency: 'usd',
      paymentMethod,
      paymentClientSecret,
      deliveryAddress,
      phoneNumber,
      status: 'pending',
    });

    // Persist the catalogue-derived price snapshot for later reconciliation.
    await order.save();

    //TODO call notification

    res.status(201).json({
      message: 'Order created successfully',
      order,
      paymentClientSecret,
    });
  } catch (error) {
    console.error('Order creation failed:', error.message);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

// Add a new endpoint to get orders by restaurant ID
export const getOrdersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    // Find orders that contain items from the specified restaurant
    const orders = await Order.find({
      'items.restaurantId': restaurantId
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Get restaurant orders failed:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Rest of your controller functions remain the same
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json(order);
  } catch (error) {
    console.error('Get order failed:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const allowedFields = ['deliveryAddress', 'phoneNumber'];
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]])
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No editable order fields supplied' });
    }

    const updated = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update failed:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!deleted) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete failed:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    // Support filtering by restaurantId via query param
    const { restaurantId } = req.query;

    let query = {};
    if (restaurantId) {
      // Find orders with items from this restaurant
      query = { 'items.restaurantId': restaurantId };
    }

    const orders = await Order.find(query);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get all orders failed:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
