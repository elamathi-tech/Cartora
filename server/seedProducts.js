require('dotenv').config()

const mongoose = require('mongoose')
const Product = require('./models/Product')

const products = [
  {
    id: 1,
    name: 'Classic Everyday Tote',
    category: 'Fashion',
    price: 1299,
    image:'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80',
    description: 'A versatile everyday bag for work and weekends.',
    rating: 4.5,
  },
  {
    id: 2,
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
    description: 'Enjoy your favourite music in comfort and style.',
    rating: 4.7,
  },
  {
    id: 3,
    name: 'Minimal Ceramic Vase',
    category: 'Home & Living',
    price: 899,
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=700&q=80',
    description: 'A simple accent to bring warmth to your space.',
    rating: 4.3,
  },
  {
    id: 4,
    name: 'Gaming Controller',
    category: 'Gaming',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=700&q=80',
    description: 'Comfortable control for your gaming sessions.',
    rating: 4.6,
  },
]

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    for (const product of products) {
      await Product.updateOne(
        { id: product.id },
        { $set: product },
        { upsert: true },
      )
    }

    console.log('Cartora products added successfully!')
  } catch (error) {
    console.error('Error adding products:', error.message)
  } finally {
    await mongoose.disconnect()
  }
}

seedProducts()