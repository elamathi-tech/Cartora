
import { useCallback, useEffect, useState } from 'react'
import API_BASE_URL from '../config/api'
import './AdminOrders.css'

const orderStatuses = [
  'Placed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
]

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [savingOrderId, setSavingOrderId] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('cartoraToken')

      if (!token) {
        throw new Error('Please sign in with your administrator account.')
      }

      const response = await fetch(
        `${API_BASE_URL}/api/orders/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not load orders.')
      }

      setOrders(data.orders || [])
    } catch (err) {
      setError(err.message || 'Could not load orders.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order._id === orderId
          ? { ...order, selectedStatus: newStatus }
          : order,
      ),
    )
  }

  const updateOrderStatus = async (order) => {
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('cartoraToken')

      if (!token) {
        throw new Error('Please sign in with your administrator account.')
      }

      setSavingOrderId(order._id)

      const response = await fetch(
        `${API_BASE_URL}/api/orders/admin/${order._id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: order.selectedStatus || order.status,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not update order status.')
      }

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item._id === order._id
            ? { ...data.order, selectedStatus: data.order.status }
            : item,
        ),
      )

      setSuccess(`Order status updated to ${data.order.status}.`)
    } catch (err) {
      setError(err.message || 'Could not update order status.')
    } finally {
      setSavingOrderId('')
    }
  }

  if (loading) {
    return (
      <main className="admin-orders-page">
        <p>Loading orders...</p>
      </main>
    )
  }

  return (
    <main className="admin-orders-page">
      <div className="admin-orders-heading">
        <p className="admin-orders-eyebrow">CARTORA ADMIN</p>
        <h1>Customer Orders</h1>
        <p>Review customer purchases and manage their delivery status.</p>
      </div>

      {error && <p className="admin-orders-message error">{error}</p>}
      {success && <p className="admin-orders-message success">{success}</p>}

      <div className="admin-orders-summary">
        <span>Total orders</span>
        <strong>{orders.length}</strong>
      </div>

      {orders.length === 0 ? (
        <div className="admin-orders-empty">
          <h2>No orders yet</h2>
          <p>Customer orders will appear here after a purchase.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => {
            const selectedStatus = order.selectedStatus || order.status

            return (
              <article className="admin-order-card" key={order._id}>
                <div className="admin-order-top">
                  <div>
                    <p className="admin-order-label">ORDER ID</p>
                    <strong>{order._id}</strong>
                  </div>
                  <span className="admin-order-status">{order.status}</span>
                </div>

                <div className="admin-order-details">
                  <h2>Customer details</h2>
                  <p><strong>Name:</strong> {order.customer?.name}</p>
                  <p><strong>Email:</strong> {order.customer?.email}</p>
                  <p><strong>Phone:</strong> {order.customer?.phone}</p>
                  <p><strong>Address:</strong> {order.customer?.address}</p>
                  <p>
                    <strong>Ordered:</strong>{' '}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : 'Not available'}
                  </p>
                  <p>
                    <strong>Payment:</strong>{' '}
                    {order.paymentMethod === 'cod'
                      ? 'Cash on Delivery'
                      : order.paymentMethod}
                  </p>
                </div>

                <div className="admin-order-details">
                  <h2>Products</h2>
                  {order.items?.map((item, index) => (
                    <div
                      className="admin-order-item"
                      key={`${item.productId}-${index}`}
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <strong>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  ))}

                  <div className="admin-order-total">
                    <span>Total amount</span>
                    <strong>
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="admin-order-update">
                  <label htmlFor={`status-${order._id}`}>
                    Update order status
                  </label>

                  <select
                    id={`status-${order._id}`}
                    value={selectedStatus}
                    onChange={(event) =>
                      handleStatusChange(order._id, event.target.value)
                    }
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={
                      savingOrderId === order._id ||
                      selectedStatus === order.status
                    }
                    onClick={() => updateOrderStatus(order)}
                  >
                    {savingOrderId === order._id
                      ? 'Saving...'
                      : 'Save Status'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default AdminOrders
