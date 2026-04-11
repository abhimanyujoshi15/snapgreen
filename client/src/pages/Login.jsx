import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/api/auth/login', form)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className={styles.container}>
    <div className={styles.card}>

      {/* Logo */}
      <div className={styles.logoWrapper}>
        <div className={styles.logoIcon}>🌿</div>
        <span className={styles.logoText}>SnapGreen</span>
      </div>

      <h1 className={styles.title}>Welcome Back</h1>
      <p className={styles.subtitle}>Login to continue your green journey</p>

      {error && <div className={styles.error}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Email Address</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>📧</span>
            <input
              type='email'
              name='email'
              placeholder='you@example.com'
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Password</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>🔒</span>
            <input
              type='password'
              name='password'
              placeholder='Your password'
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type='submit' className={styles.button} disabled={loading}>
          {loading ? '⏳ Logging in...' : '→ Login'}
        </button>
      </form>

      <p className={styles.switchText}>
        Don't have an account? <Link to='/register'>Create one</Link>
      </p>

      {/* Features Strip */}
      <div className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>📷</span>
          <span>Scan Products</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🌍</span>
          <span>Eco Scores</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🏆</span>
          <span>Leaderboard</span>
        </div>
      </div>

    </div>
  </div>
)
}

export default Login