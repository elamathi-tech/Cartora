import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import products from '../data/products'
import './ProductDetails.css'

function ProductDetails() {
  const { id } = useParams()
  const { addToCart } = useCart()

  const product = products.find(
    (item) => item.id === Number(id),
  )

  if (!product) {
    return (
      <main className='product-details-page'>
        <p className='eyebrow'>CARTORA COLLECTION</p>
        <h1>Product not found.</h1>
        <Link className='primary-button' to='/shop'>
          Back to shop ↗
        </Link>
      </main>
    )
  }

  return (
    <main className='product-details-page'>
      <Link className='back-to-shop' to='/shop'>
        ← Back to collection
      </Link>

      <div className='product-details-layout'>
        <div className='product-details-image'>
          <img src={product.image} alt={product.name} />
        </div>

        <section className='product-details-info'>
          <p className='eyebrow'>{product.category}</p>

          <h1>{product.name}</h1>

          <p className='product-details-rating'>
            ★ {product.rating} / 5
          </p>

          <p className='product-details-price'>
            ₹{product.price.toLocaleString('en-IN')}
          </p>

          <p className='product-details-description'>
            {product.description}
          </p>

          <button
            className='primary-button'
            type='button'
            onClick={() => addToCart(product)}
          >
            Add to bag ↗
          </button>

          <p className='product-details-note'>
            A considered choice for everyday living.
          </p>
        </section>
      </div>
    </main>
  )
}

export default ProductDetails