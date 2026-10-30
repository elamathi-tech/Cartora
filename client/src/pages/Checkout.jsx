
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import API_BASE_URL from '../config/api'
import './Checkout.css'

function Checkout() {
  const { cartItems, clearCart } = useCart()

  const [errorMessage, setErrorMessage] = useState('')
  const [successOrder, setSuccessOrder] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  async function handleSubmit(event) {
    event.preventDefault()

    setErrorMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    const customer = {
      name: formData.get('customerName').trim(),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      address: formData.get('address').trim(),
    }

    try {
      const token = localStorage.getItem('cartoraToken')

      if (!token) {
        throw new Error('Please log in before placing your order.')
      }

      const items = cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }))

      const paymentMethod = formData.get('paymentMethod')

      // Cash on Delivery
      if (paymentMethod === 'cod') {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customer,
            paymentMethod: 'cod',
            items,
          }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Could not place your order.')
        }

        setSuccessOrder(data.order)
        await clearCart()
        return
      }

      // Create Razorpay order
      const response = await fetch(
        `${API_BASE_URL}/api/payments/create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ customer, items }),
        },
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not create payment order.')
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Cartora',
        description: 'Cartora Order Payment',
        order_id: data.orderId,

        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },

        theme: {
          color: '#b66b50',
        },

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(
              `${API_BASE_URL}/api/payments/verify-payment`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  ...paymentResponse,
                  cartoraOrderId: data.cartoraOrderId,
                }),
              },
            )

            const verifyData = await verifyResponse.json()

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || 'Payment verification failed.',
              )
            }

            setSuccessOrder(verifyData.order)
            await clearCart()
          } catch (error) {
            console.error('Payment verification error:', error)
            setErrorMessage(error.message)
          }
        },

        modal: {
          ondismiss: function () {
            setErrorMessage('Payment was cancelled. You can try again.')
          },
        },
      }

      const razorpay = new window.Razorpay(options)

      razorpay.on('payment.failed', function (paymentError) {
        setErrorMessage(
          paymentError.error.description || 'Payment failed. Please try again.',
        )
      })

      razorpay.open()
    } catch (error) {
      console.error('Checkout error:', error)
      setErrorMessage(
        error.message || 'Something went wrong. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successOrder) {
    return (
      <main className='checkout-page'>
        <p className='eyebrow'>CARTORA ORDER CONFIRMED</p>
        <h1>Thank you for <em>your order.</em></h1>
        <p>
          Your order has been placed successfully.
        </p>
        <p>
          Order ID: <strong>{successOrder._id}</strong>
        </p>
        <p>
          Order total:{' '}
          <strong>
            ₹{successOrder.totalAmount.toLocaleString('en-IN')}
          </strong>
        </p>
        <p>Order status: {successOrder.status}</p>
        <p>
          Payment method:{' '}
          <strong>
            {successOrder.paymentMethod === 'cod'
              ? 'Cash on Delivery'
              : successOrder.paymentMethod}
          </strong>
        </p>
        <Link className='primary-button' to='/shop'>
          Continue shopping ↗
        </Link>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main className='checkout-page'>
        <p className='eyebrow'>CARTORA CHECKOUT</p>
        <h1>Your bag is <em>empty.</em></h1>
        <p>Add something you love before checking out.</p>
        <Link className='primary-button' to='/shop'>
          Explore the collection ↗
        </Link>
      </main>
    )
  }

  return (
    <main className='checkout-page'>
      <p className='eyebrow'>CARTORA CHECKOUT</p>
      <h1>Almost <em>yours.</em></h1>
      <p className='checkout-intro'>
        Enter your details to prepare your order.
      </p>

      <div className='checkout-layout'>
        <form className='checkout-form' onSubmit={handleSubmit}>
          <h2>Delivery details</h2>

          <label htmlFor='customer-name'>Full name</label>
          <input
            id='customer-name'
            name='customerName'
            type='text'
            placeholder='Your full name'
            required
          />

          <label htmlFor='customer-email'>Email address</label>
          <input
            id='customer-email'
            name='email'
            type='email'
            placeholder='you@example.com'
            required
          />

          <label htmlFor='customer-phone'>Phone number</label>
          <input
            id='customer-phone'
            name='phone'
            type='tel'
            placeholder='Your phone number'
            required
          />

          <label htmlFor='customer-address'>Delivery address</label>
          <textarea
            id='customer-address'
            name='address'
            placeholder='House number, street, city, state and PIN code'
            rows='4'
            required
          />


          <h2>Payment method</h2>

          <label htmlFor='payment-method'>Choose how to pay</label>
          <select
            id='payment-method'
            name='paymentMethod'
            defaultValue='cod'
            required
          >
            <option value='cod'>Cash on Delivery</option>
            <option value='razorpay'>Pay Online (Razorpay Test Mode)</option>
          </select>


          {errorMessage && (
            <div className='checkout-error' role='alert' aria-live='polite'>
              <p>{errorMessage}</p>

              {errorMessage === 'Please log in before placing your order.' && (
                <Link to='/login'>Sign in to continue</Link>
              )}
            </div>
          )}


          <button
            className='primary-button'
            type='submit'
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Processing...'
              : `Place order · ₹${subtotal.toLocaleString('en-IN')}`}
          </button>
        </form>

        <aside className='checkout-summary'>
          <h2>Your order</h2>

          {cartItems.map((item) => (
            <div className='checkout-product' key={item.id}>
              <img src={item.image} alt={item.name} />

              <div>
                <h3>{item.name}</h3>
                <p>Qty: {item.quantity}</p>
              </div>

              <strong>
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </strong>
            </div>
          ))}

          <div className='checkout-total'>
            <span>Subtotal</span>
            <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
          </div>

          <p className='checkout-note'>
            Your order total is calculated using the product prices
            stored in our database.
          </p>

          <Link className='back-to-cart' to='/cart'>
            ← Return to bag
          </Link>
        </aside>
      </div>
    </main>
  )
}

export default Checkout
