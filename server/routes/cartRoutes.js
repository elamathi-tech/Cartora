
const express = require('express')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// Get the logged-in user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })

    if (!cart) {
      return res.status(200).json({
        success: true,
        items: [],
      })
    }

    const items = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findOne({ id: item.productId })

        if (!product) return null

        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: item.quantity,
          subtotal: product.price * item.quantity,
        }
      }),
    )

    const validItems = items.filter(Boolean)
    const totalAmount = validItems.reduce(
      (total, item) => total + item.subtotal,
      0,
    )

    return res.status(200).json({
      success: true,
      items: validItems,
      totalAmount,
    })
  } catch (error) {
    console.error('Get cart error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart.',
    })
  }
})

// Add an item to the cart
router.post('/items', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.body.productId)
    const quantity = Number(req.body.quantity ?? 1)

    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({
        success: false,
        message: 'A valid product ID is required.',
      })
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive whole number.',
      })
    }

    const product = await Product.findOne({ id: productId })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    let cart = await Cart.findOne({ userId: req.user._id })

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [],
      })
    }

    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({ productId, quantity })
    }

    await cart.save()

    return res.status(200).json({
      success: true,
      message: 'Item added to cart.',
    })
  } catch (error) {
    console.error('Add to cart error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to add item to cart.',
    })
  }
})

// Update an item's quantity
router.put('/items/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    const quantity = Number(req.body.quantity)

    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive whole number.',
      })
    }

    const cart = await Cart.findOne({ userId: req.user._id })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.',
      })
    }

    const item = cart.items.find(
      (cartItem) => cartItem.productId === productId,
    )

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.',
      })
    }

    item.quantity = quantity
    await cart.save()

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated.',
    })
  } catch (error) {
    console.error('Update cart error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update cart.',
    })
  }
})

// Remove an item from the cart
router.delete('/items/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId)

    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const cart = await Cart.findOne({ userId: req.user._id })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.',
      })
    }

    const originalLength = cart.items.length

    cart.items = cart.items.filter(
      (item) => item.productId !== productId,
    )

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.',
      })
    }

    await cart.save()

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
    })
  } catch (error) {
    console.error('Remove cart item error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart.',
    })
  }
})

module.exports = router
