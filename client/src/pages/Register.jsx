import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config/api'
import './Register.css'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.')
      }

      setSuccess('Account created successfully! Redirecting to login...')

      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (err) {
      setError(err.message || 'Unable to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='auth-page'>
      <section className='auth-card'>
        <p className='auth-eyebrow'>WELCOME TO CARTORA</p>
        <h1>Create your account</h1>
        <p className='auth-description'>
          Join Cartora for a more personal shopping experience.
        </p>

        <form onSubmit={handleSubmit} className='auth-form'>
          <label htmlFor='name'>Full name</label>
          <input 
            id='name'
            name='name'
            type='text'
            autoComplete='name'
            placeholder='Enter your full name'
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={80}
          />

          <label htmlFor='email'>Email address</label>
          <input 
            id='email'
            name='email'
            type='email'
            autoComplete='email'
            placeholder='your@example.com'
            value={formData.email}
            onChange={handleChange}
            required
            maxLength={254}
          />

          <label htmlFor='password'>Password</label>
          <input
            id='password'
            name='password'
            type='password'
            autoComplete='new-password'
            placeholder='At least 8 characters'
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            maxLength={72}
          />

          <label htmlFor='confirmPassword'>Confirm password</label>
          <input 
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            autoComplete='new-password'
            placeholder='Enter your password again'
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            maxLength={72}
          />

          {error && <p className='auth-message auth-error' role='alert'>{error}</p>}
          {success && <p className='auth-message auth-success' role='status'>{success}</p>}

          <button type='submit' disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className='auth-footer'>
          Already have an account? <Link to='/login'>Sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default Register