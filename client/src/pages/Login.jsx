import { useState } from 'react'
import API_BASE_URL from '../config/api'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const { syncCartAfterLogin } = useCart()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to sign in.')
      }

      if (!data.token || !data.user) {
        throw new Error('Login response was incomplete. Please try again.')
      }


      localStorage.setItem('cartoraToken', data.token)
      localStorage.setItem('cartoraUser', JSON.stringify(data.user))

      try {
        await syncCartAfterLogin()
      } catch (cartError) {
        console.error('Could not sync guest cart:', cartError)
        setError(
          'You are signed in, but your cart could not be synchronized. Please refresh and try again.',
        )
        return
      }

      navigate('/')


    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-eyebrow">WELCOME BACK</p>
        <h1>Sign in to Cartora</h1>
        <p className="auth-description">
          Sign in to continue your shopping experience.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && (
            <p className="auth-message auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          New to Cartora? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default Login
