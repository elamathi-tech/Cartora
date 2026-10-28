import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import API_BASE_URL from '../config/api'
import './AdminDashboard.css'

const emptyProduct = {
  id: '',
  name: '',
  category: '',
  price: '',
  image: '',
  description: '',
  rating: '0',
}

function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyProduct)
  const [editingProductId, setEditingProductId] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/products`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load products.')
      }

      setProducts(data.products || [])
    } catch (err) {
      setError(err.message || 'Could not load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleEdit = (product) => {
    setError('')
    setSuccess('')
    setShowForm(true)

    setEditingProductId(product.id)

    setForm({
      id: String(product.id),
      name: product.name,
      category: product.category,
      price: String(product.price),
      image: product.image,
      description: product.description,
      rating: String(product.rating ?? 0),
    })
  }


  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('cartoraToken')

      if (!token) {
        throw new Error('Please sign in with an administrator account.')
      }

      const response = await fetch(
        `${API_BASE_URL}/api/products/${product.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete product.')
      }

      setSuccess('Product deleted successfully.')
      await fetchProducts()
    } catch (err) {
      setError(err.message || 'Could not delete product.')
    }
  }



  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const token = localStorage.getItem('cartoraToken')

      if (!token) {
        throw new Error('Please sign in with an administrator account.')
      }

      const isEditing = editingProductId !== null

      const response = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/products/${editingProductId}`
          : `${API_BASE_URL}/api/products`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            id: Number(form.id),
            price: Number(form.price),
            rating: Number(form.rating),
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          (isEditing
            ? 'Could not update product.'
            : 'Could not create product.'),
        )
      }

      setSuccess(
        isEditing
          ? 'Product updated successfully.'
          : 'Product added successfully.',
      )

      setForm(emptyProduct)
      setEditingProductId(null)
      setShowForm(false)
      await fetchProducts()
    } catch (err) {
      setError(err.message || 'Could not save product.')
    } finally {
      setSaving(false)
    }
  }


  return (
    <main className="admin-dashboard">
      <div className="admin-heading">
        <p className="admin-eyebrow">CARTORA MANAGEMENT</p>
        <h1>Admin Dashboard</h1>
        <p>Manage your products and store inventory.</p>
        <Link to="/admin/orders" className="admin-orders-link">
          Manage Orders →
        </Link>
      </div>

      <section className="admin-stats">
        <article className="admin-stat-card">
          <p>Total Products</p>
          <h2>{loading ? '—' : products.length}</h2>
        </article>
      </section>

      <section className="admin-products">
        <div className="admin-section-heading">
          <h2>Product Inventory</h2>
          <button
            type="button"
            className="admin-add-button"
            onClick={() => {
              setError('')
              setSuccess('')
              setShowForm((current) => !current)
            }}
          >
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {success && <p className="admin-success" role="status">{success}</p>}
        {error && <p className="admin-error" role="alert">{error}</p>}

        {showForm && (
          <form className="admin-product-form" onSubmit={handleSubmit}>
            <h3>{editingProductId !== null ? 'Edit product' : 'Add a new product'}</h3>

            <div className="admin-form-grid">
              <label>
                Product ID
                <input
                  name="id"
                  type="number"
                  min="1"
                  step="1"
                  value={form.id}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Product name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Category
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Price (₹)
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Image URL
                <input
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/product.jpg"
                  required
                />
              </label>

              <label>
                Rating (0–5)
                <input
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="admin-description-field">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </label>
            </div>

            <button type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingProductId !== null
                  ? 'Update Product'
                  : 'Save Product'}
            </button>
          </form>
        )}

        <div className="admin-section-heading admin-inventory-heading">
          <h2>All Products</h2>
          <span>{products.length} products</span>
        </div>

        {loading && <p>Loading products...</p>}

        {!loading && !error && products.length === 0 && (
          <p>No products found.</p>
        )}

        {!loading && products.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-info">
                        <img src={product.image} alt={product.name} />
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>₹{Number(product.price).toLocaleString('en-IN')}</td>
                    <td>{product.rating ?? 0}/5</td>

                    <td className="admin-product-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="admin-delete-button"
                        onClick={() => handleDelete(product)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminDashboard
