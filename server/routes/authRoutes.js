const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

//Register a new customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    //Validate required fields
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        message: 'Name, email, and password are required.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Basic email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long.'
      })
    }

    if (password.length > 72) {
      return res.status(400).json({
        message: 'Password must not exceed 72 characters.',
      })
    }

    // Check whether the account already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      })
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 12)

    // Always register new accounts as customers
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'customer',
    })

    return res.status(201).json({
      message: 'Registration successful.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    // Handle duplicate-email race conditions
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      })
    }

    console.error('Registration error:', error)

    return res.status(500).json({
      message: 'Unable to register right now. Please try again.'
    })
  }
})

/* Login an existing customer */
const jwt = require('jsonwebtoken')

//Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate required fields
    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        message: 'Email and password are required.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Find the registered user
    const user = await User.findOne({
      email: normalizedEmail,
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      })
    }

    // Compare the entered password with the stored hash

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password,
    )

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    // Ensure the JWT secret is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from .env')

      return res.status(500).json({
        message: 'Login is temporarily unavailable.',
      })
    }

    // Create a signed authentication token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
    )

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)

    return res.status(500).json({
      message: 'Unable to log in right now. Please try again.',
    })
  }
})

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: 'Name and email are required.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'Please enter a valid email address.',
      })
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id },
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'This email address is already in use.',
      })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name.trim(),
        email: normalizedEmail,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('_id name email role')

    if (!user) {
      return res.status(404).json({
        message: 'User account not found.',
      })
    }

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This email address is already in use.',
      })
    }

    console.error('Profile update error:', error)

    return res.status(500).json({
      message: 'Unable to update profile.',
    })
  }
})

module.exports = router