import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config/api'
import './Account.css'

function Account() {
  const navigate = useNavigate()
  const { resetCartForLogout } = useCart()
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cartoraUser')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(() => user?.name || '')
  const [email, setEmail] = useState(() => user?.email || '')
  const [saving, setSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    const savedUser = localStorage.getItem('cartoraUser')
    const token = localStorage.getItem('cartoraToken')

    if (!savedUser || !token) {
      navigate('/login')
      return
    }

    try {
      JSON.parse(savedUser)
    } catch {
      localStorage.removeItem('cartoraUser')
      localStorage.removeItem('cartoraToken')
      navigate('/login')
      return
    }


    async function fetchOrders() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Could not load your orders.')
        }

        setOrders(data.orders || [])
      } catch (err) {
        setError(err.message || 'Could not load your orders.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [navigate])

  function handleLogout() {
    resetCartForLogout()
    localStorage.removeItem('cartoraToken')
    localStorage.removeItem('cartoraUser')
    navigate('/login')
  }

  function handleCancelEdit() {
    setName(user.name || '')
    setEmail(user.email || '')
    setIsEditing(false)
    setProfileMessage('')
    setProfileError('')
  }

  async function handleSaveProfile(event) {
    event.preventDefault()
    setSaving(true)
    setProfileMessage('')
    setProfileError('')

    const token = localStorage.getItem('cartoraToken')

    if (!token) {
      setProfileError('Your session has expired. Please log in again.')
      setSaving(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not update your profile.')
      }

      const updatedUser = data.user

      setUser(updatedUser)
      setName(updatedUser.name)
      setEmail(updatedUser.email)
      localStorage.setItem('cartoraUser', JSON.stringify(updatedUser))
      setIsEditing(false)
      setProfileMessage(data.message || 'Profile updated successfully.')
    } catch (err) {
      setProfileError(err.message || 'Could not update your profile.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <main className="account-page">
      <section className="account-heading">
        <p className="account-eyebrow">YOUR CARTORA SPACE</p>
        <h1>My Account</h1>
        <p>Manage your details and keep track of your orders.</p>
      </section>

      <section className="account-profile">
        <div className="account-profile-details">
          <h2>My Profile</h2>

          {isEditing ? (
            <form className="account-profile-form" onSubmit={handleSaveProfile}>
              <label htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
              />

              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <div className="account-profile-actions">
                <button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  className="account-cancel"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>

              <button
                type="button"
                onClick={() => {
                  setProfileMessage('')
                  setProfileError('')
                  setIsEditing(true)
                }}
              >
                Edit Profile
              </button>
            </>
          )}

          {profileMessage && (
            <p className="account-success" role="status">
              {profileMessage}
            </p>
          )}

          {profileError && (
            <p className="account-error" role="alert">
              {profileError}
            </p>
          )}
        </div>

        <button
          type="button"
          className="account-logout"
          onClick={handleLogout}
        >
          Log out
        </button>
      </section>

      <section className="account-orders">
        <h2>My Orders</h2>

        {loading && <p>Loading your orders...</p>}

        {!loading && error && (
          <p className="account-error">{error}</p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="account-empty">
            <p>You haven't placed any orders yet.</p>
            <button type="button" onClick={() => navigate('/shop')}>
              Explore the shop
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="account-order-list">
            {orders.map((order) => (
              <article className="account-order" key={order._id}>
                <div className="account-order-top">
                  <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <span>{order.status || 'Placed'}</span>
                </div>

                <p>
                  <strong>Total:</strong>{' '}
                  ₹{Number(order.totalAmount || 0).toFixed(2)}
                </p>

                <p>
                  <strong>Items:</strong> {order.items?.length || 0}
                </p>

                <p>
                  <strong>Date:</strong>{' '}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN')
                    : 'Not available'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Account