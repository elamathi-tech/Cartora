const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
  try {
    // Read the token from the Authorization header 
    const authHeader = req.headers.authorization 

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required. Please log in.',
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token is missing.',
      })
    }

    // Verify the token using our secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from .env')

      return res.status(500).json({
        message: 'Authentication is temporarily unavailable.',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Confirm that the user still exists
    const user = await User.findById(decoded.userId).select(
      '_id name email role',
    )
 
    if (!user) {
      return res.status(401).json({
        message: 'User account not found. Please log in again.',
      })
    }

    // Make the authenticated user available to protected routes

    req.user = user

    next()
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        message: 'Invalid or expired token. Please log in again.'
      })
    }

    console.error('Authentication error:', error)

    return res.status(500).json({
      message: 'Unable to authenticate the request.',
    })
  }
}

module.exports = authMiddleware