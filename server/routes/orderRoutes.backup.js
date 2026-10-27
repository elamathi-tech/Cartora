const express = require('express')
const Order = require('../models/Order')
const Product = require('../models/Product')

const router = express.Router()

// Create a new order 
router.post('/', async (req, res) => {
  try {
    const { customer, items } = req.body

    if(
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
        message: 'Your order must contain at least one product.',
      })
    }

    const orderItems = []

    for (const item of items) {
      const product = await Product.findOne({ id: item.productId })

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} was not found.`,
        })
      }

      const quantity = Number(item.quantity)

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Product quantity must be a positive whole number.'
        })
      }

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      })
    }

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    )

    const newOrder = new Order({
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
      },
      items: orderItems,
      totalAmount,
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