import asyncHandler from 'express-async-handler';
import Order from '../models/OrderModel.js';
import Product from '../models/ProductModel.js';
import mongoose from 'mongoose';
//fix issues------------------------------
// @desc    Create order using server-verified product prices
// @route   POST /api/orders
// @access  Private

const addOrderItems = asyncHandler(async (req, res) => {

  const {
    orderItems,
    shippingAddress,
    paymentMethod,
  } = req.body;

  // 1. Validate the cart.
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error('Order must contain at least one item');
  }

  // 2. Validate product IDs and quantities.
  const productIds = [];
  const seenProducts = new Set();

  for (const item of orderItems) {
    if (
      !item ||
      typeof item.product !== 'string' ||
      !mongoose.isValidObjectId(item.product) ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1
    ) {
      res.status(400);
      throw new Error('Invalid product ID or quantity');
    }

    const productId = item.product.toLowerCase();

    if (seenProducts.has(productId)) {
      res.status(400);
      throw new Error('Duplicate products are not allowed');
    }

    seenProducts.add(productId);
    productIds.push(item.product);
  }

  // 3. Load actual products from MongoDB.
  const products = await Product.find({
    _id: { $in: productIds },
  });

  const productMap = new Map(
    products.map((product) => [
      product._id.toString(),
      product,
    ])
  );

  // Convert prices into integer cents.
  const toCents = (value) => {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0
    ) {
      return NaN;
    }

    const cents = Math.round(value * 100);

    return Number.isSafeInteger(cents) &&
      Math.abs(value * 100 - cents) < 0.000001
      ? cents
      : NaN;
  };

  let itemsTotalCents = 0;
  const verifiedOrderItems = [];

  // 4. Build order items using database values only.
  for (const item of orderItems) {

    const product = productMap.get(
      item.product.toLowerCase()
    );

    if (!product) {
      res.status(400);
      throw new Error('Product not found');
    }

    if (item.quantity > product.countInStock) {
      res.status(400);
      throw new Error(
        'Insufficient stock for ' + product.name
      );
    }

    const priceCents = toCents(product.price);

    if (
      !Number.isSafeInteger(priceCents) ||
      priceCents <= 0
    ) {
      res.status(400);
      throw new Error('Invalid product price');
    }

    const lineTotal = priceCents * item.quantity;

    if (!Number.isSafeInteger(lineTotal)) {
      res.status(400);
      throw new Error('Order amount exceeds allowed limit');
    }

    itemsTotalCents += lineTotal;

    if (!Number.isSafeInteger(itemsTotalCents)) {
      res.status(400);
      throw new Error('Order amount exceeds allowed limit');
    }

    verifiedOrderItems.push({
      name: product.name,
      quantity: item.quantity,
      image: product.image,
      price: Number((priceCents / 100).toFixed(2)),
      product: product._id,
    });
  }

  // 5. Calculate shipping and tax on the server.
  // Original ProShop rules:
  // Free shipping when items total exceeds $100.
  // Otherwise shipping costs $10.
  // Tax is 15% of the items total.

  const shippingCents =
    itemsTotalCents > 10000 ? 0 : 1000;

  const taxCents = Math.round(
    itemsTotalCents * 0.15
  );

  const totalCents =
    itemsTotalCents + shippingCents + taxCents;

  if (!Number.isSafeInteger(totalCents)) {
    res.status(400);
    throw new Error('Invalid order total');
  }

  // 6. Create the order using trusted values.
  const order = new Order({
    user: req.user._id,
    orderItems: verifiedOrderItems,
    shippingAddress,
    paymentMethod,

    itemsPrice: (itemsTotalCents / 100).toFixed(2),
    taxPrice: (taxCents / 100).toFixed(2),
    shippingPrice: (shippingCents / 100).toFixed(2),
    totalPrice: (totalCents / 100).toFixed(2),
  });

  const createdOrder = await order.save();

  res.status(201).json(createdOrder);
});
// fix issues-----------------------------------
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private - Order Owner or Admin 

const getOrderById = asyncHandler(async (req, res) => {

  
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email');

  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }


  const isOwner =
    order.user?._id?.toString() ===
    req.user._id.toString();


  const isAdmin = req.user.isAdmin === true;


  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error(
      'Access denied: You are not authorized to view this order'
    );
  }


  res.status(200).json(order);

});

// @desc    Update order to paid
// @routes  PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error(
      'Error not found - either the order does not exist or the order id is incorrect.'
    );
  } else {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  }
});

// @desc    Update order to delivered
// @routes  PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error(
      'Error not found - either the order does not exist or the order id is incorrect.'
    );
  } else {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  }
});

// @desc    Get logged in user orders
// @routes  GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

  if (!orders) {
    res.status(404);
    throw new Error('User or User orders could not be found.');
  } else {
    res.json(orders);
  }
});

// @desc    Get All orders
// @routes  GET /api/orders
// @access  Admin/Private
const getAllOrders = asyncHandler(async (req, res) => {
  const pageSize = 5;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Order.count();

  const orders = await Order.find({})
    .populate('user', 'id name')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  if (!orders) {
    res.status(404);
    throw new Error('Orders could not be retreived.');
  } else {
    res.json({ orders, page, pages: Math.ceil(count / pageSize) });
  }
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getAllOrders,
};
