const express = require('express')
const Order = require('../models/Order')
const Product = require('../models/Product')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// Get orders belonging to the logged-in user
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error('Fetch my orders error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your orders.',
    })
  }
})

// Create a new order 
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { customer, items, paymentMethod = 'cod' } = req.body

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

    if (paymentMethod !== 'cod') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Please select Cash on Delivery.',
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your order must contain at least one product.',
      })
    }

    const combinedItems = new Map()

    for (const item of items) {
      const productId = Number(item.productId)
      const quantity = Number(item.quantity)

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Product quantity must be a positive whole number.',
        })
      }

      const product = await Product.findOne({ id: productId })

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} was not found.`,
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

    const newOrder = new Order({
      userId: req.user._id,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
      },
      items: orderItems,
      totalAmount,
      paymentMethod,
    })

    const savedOrder = await newOrder.save()

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: savedOrder,
    })

  } catch (error) {
    console.error('Order validation error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Failed to process order.',
    })
  }
})

module.exports = router