import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Cart.css'

function Cart() {
  const { 
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
 } = useCart()

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  if (cartItems.length === 0) {
    return (
      <main className='cart-page'>
        <p className='eyebrow'>YOUR CARTORA BAG</p>
        <h1>Your bag is <em>waiting.</em></h1>
        <p>Your bag is currently empty.</p>
        <Link className='primary-button' to='/shop'>
          Continue Shopping ↗
        </Link>
      </main>
    )
  }

  return (
        <main className='cart-page'>
          <p className='eyebrow'>YOUR CARTORA BAG</p>
          <h1>Your finds, <em>together.</em></h1>

          <section className='cart-items'>
            {cartItems.map((item) => (
              <article className='cart-item' key={item.id}>
                <img src={item.image} alt={item.name} />

                <div className='cart-item-info'>
                  <h2>{item.name}</h2>
                  <p>{item.category}</p>
                  
                  <div className='quantity-controls'>
                    <button
                      type='button'
                      onClick={() => decreaseQuantity(item.id)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type='button'
                      onClick={() => increaseQuantity(item.id)}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>

                  <strong>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </strong>

                  <button
                    className='remove-item-button'
                    type='button'
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>

              </article>
            ))}
          </section>

          <section className='cart-summary'>
            <h2>Order summary</h2>
            <p>
              Subtotal
              <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
            </p>
            <Link className='primary-button' to='/checkout'>
              Proceed to checkout  ↗
            </Link>
          </section>
        </main>
      )
}

export default Cart