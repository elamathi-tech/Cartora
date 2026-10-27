require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const authRoutes = require('./routes/authRoutes')
const cartRoutes = require('./routes/cartRoutes')
const authMiddleware = require('./middleware/authMiddleware')

const app = express()
const PORT = process.env.PORT || 5000

//Middleware to read JSON request bodies
app.use(cors())
app.use(express.json())
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/cart', cartRoutes)

//Test route to check whether the backend is running
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Cartora backend is running!',
  })
})

// Protected route to test authentication
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    message: 'Authentication successful.',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  })
})


// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!')
    console.log(
      'Connected database:',
      mongoose.connection.name,
    )

    app.listen(PORT, () => {
      console.log(`Cartora server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message)
  })