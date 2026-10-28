import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import API_BASE_URL from '../config/api'
import './ProductDetails.css'

function ProductDetails() {
  const { id } = useParams()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_BASE_URL}/api/products`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load product.')
        }

        const foundProduct = (data.products || []).find(
          (item) => String(item.id) === String(id),
        )

        if (!foundProduct) {
          setError('Product not found.')
          return
        }

        setProduct(foundProduct)
      } catch (err) {
        setError(err.message || 'Unable to load product.')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <main className="product-details-page">
        <p>Loading product...</p>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="product-details-page">
        <p className="eyebrow">CARTORA COLLECTION</p>
        <h1>{error || 'Product not found.'}</h1>
        <Link className="primary-button" to="/shop">
          Back to shop ↗
        </Link>
      </main>
    )
  }

  return (
    <main className="product-details-page">
      <Link className="back-to-shop" to="/shop">
        ← Back to collection
      </Link>

      <div className="product-details-layout">
        <div className="product-details-image">
          <img
            src={product.image}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.style.visibility = 'hidden'
            }}
          />
        </div>

        <section className="product-details-info">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>

          <p className="product-details-rating">
            ★ {product.rating ?? 0} / 5
          </p>

          <p className="product-details-price">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>

          <p className="product-details-description">
            {product.description}
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={() => addToCart(product)}
          >
            Add to bag ↗
          </button>

          <p className="product-details-note">
            A considered choice for everyday living.
          </p>
        </section>
      </div>
    </main>
  )
}

export default ProductDetails
