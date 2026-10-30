const express = require('express')
const crypto = require('crypto')
const razorpay = require('../config/razorpay')
const Product = require('../models/Product')
const Order = require('../models/Order')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// Create a Razorpay order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { customer, items } = req.body

    if (
      !customer ||
      !customer.name?.trim() ||
      !customer.email?.trim() ||
      !customer.phone?.trim() ||
      !customer.address?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all customer details.',
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty.',
      })
    }

    // Fetch actual product prices from MongoDB
    const combinedItems = new Map()

    for (const item of items) {
      const productId = Number(item.productId)
      const quantity = Number(item.quantity)

      if (
        !Number.isSafeInteger(productId) ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product or quantity.',
        })
      }

      const product = await Product.findOne({ id: productId })

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${productId} was not found.`,
        })
      }

      const existingItem = combinedItems.get(product.id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        combinedItems.set(product.id, {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })
      }
    }

    const orderItems = Array.from(combinedItems.values())

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    )

    if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount.',
      })
    }

    // Create Razorpay order (amount must be in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `cartora_${Date.now()}`,
    })

    // Save pending order in MongoDB
    const newOrder = await Order.create({
      userId: req.user._id,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
      },
      items: orderItems,
      totalAmount,
      paymentMethod: 'razorpay',
      paymentStatus: 'Pending',
      razorpayOrderId: razorpayOrder.id,
    })

    return res.status(201).json({
      success: true,
      message: 'Payment order created successfully.',
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      cartoraOrderId: newOrder._id,
    })
  } catch (error) {
    console.error('Razorpay order creation error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order.',
    })
  }
})

// Verify Razorpay payment signature
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartoraOrderId,
    } = req.body

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !cartoraOrderId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification details are missing.',
      })
    }

    const order = await Order.findOne({
      _id: cartoraOrderId,
      userId: req.user._id,
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpay_order_id,
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified.',
        order,
      })
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    const signatureBuffer = Buffer.from(razorpay_signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed.',
      })
    }

    // Verify payment status with Razorpay itself
    const payment = await razorpay.payments.fetch(razorpay_payment_id)

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== 'captured' ||
      payment.amount !== order.totalAmount * 100 ||
      payment.currency !== 'INR'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been successfully captured.',
      })
    }

    order.paymentStatus = 'Paid'
    order.razorpayPaymentId = razorpay_payment_id
    await order.save()

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed!',
      order,
    })
  } catch (error) {
    console.error('Razorpay payment verification error:', error)

    return res.status(500).json({
      success: false,
      message: 'Payment verification failed.',
    })
  }
})

module.exports = router