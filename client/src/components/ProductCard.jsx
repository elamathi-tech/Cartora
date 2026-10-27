import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <article className="product-card">
      <Link
        className='product-card-image'
        to={`/product/${product.id}`}
        aria-label={`View details for ${product.name}`}
      >
        <img src={product.image} alt={product.name} />

        <span className="product-category">
          {product.category}
        </span>
      </Link>

      <div className="product-card-info">
        <h3>
          <Link
            to={`/product/${product.id}`}
            className='product-title-link'
          >
            {product.name}
          </Link>
        </h3>

        <p className="product-description">
          {product.description}
        </p>

        <div className="product-card-bottom">
          <span className="product-price">
            ₹{product.price.toLocaleString('en-IN')}
          </span>

          <span className="product-rating">
            ★ {product.rating}
          </span>
        </div>

        <div className='product-card-actions'>
          <Link
            className='view-details-button'
            to={`/product/${product.id}`}
          >
            View details ↗
          </Link>

          <button
            className="add-to-cart-button"
            type="button"
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>

        </div>


      </div>
    </article>
  )
}

export default ProductCard