
const express = require('express')
const Product = require('../models/Product')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

const router = express.Router()

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()

    return res.status(200).json({
      success: true,
      products,
    })
  } catch (error) {
    console.error('Fetch products error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products.',
    })
  }
})

// Create a product (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id, name, category, price, image, description, rating } = req.body

    if (
      id === undefined ||
      !name?.trim() ||
      !category?.trim() ||
      price === undefined ||
      !image?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required product fields.',
      })
    }

    const numericId = Number(id)
    const numericPrice = Number(price)
    const numericRating = rating === undefined ? 0 : Number(rating)

    if (!Number.isInteger(numericId) || numericId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product ID must be a positive whole number.',
      })
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number.',
      })
    }

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 0 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5.',
      })
    }

    const product = await Product.create({
      id: numericId,
      name: name.trim(),
      category: category.trim(),
      price: numericPrice,
      image: image.trim(),
      description: description.trim(),
      rating: numericRating,
    })

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A product with this ID already exists.',
      })
    }

    console.error('Create product error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create product.',
    })
  }
})

// Update a product (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id)

    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const allowedFields = [
      'name',
      'category',
      'price',
      'image',
      'description',
      'rating',
    ]

    const updates = {}

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one field to update.',
      })
    }

    for (const field of ['name', 'category', 'image', 'description']) {
      if (updates[field] !== undefined) {
        if (
          typeof updates[field] !== 'string' ||
          !updates[field].trim()
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a non-empty string.`,
          })
        }

        updates[field] = updates[field].trim()
      }
    }

    if (updates.price !== undefined) {
      updates.price = Number(updates.price)

      if (!Number.isFinite(updates.price) || updates.price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid non-negative number.',
        })
      }
    }

    if (updates.rating !== undefined) {
      updates.rating = Number(updates.rating)

      if (
        !Number.isFinite(updates.rating) ||
        updates.rating < 0 ||
        updates.rating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 0 and 5.',
        })
      }
    }

    const product = await Product.findOneAndUpdate(
      { id: productId },
      { $set: updates },
      { new: true, runValidators: true },
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    })
  } catch (error) {
    console.error('Update product error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update product.',
    })
  }
})

// Delete a product (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.id)

    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      })
    }

    const product = await Product.findOneAndDelete({ id: productId })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    })
  } catch (error) {
    console.error('Delete product error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to delete product.',
    })
  }
})

module.exports = router
