import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Register.module.css'
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Leaf, 
  Camera, 
  Globe, 
  Trophy,
  Loader2 
} from 'lucide-react'

const Register = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
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
      const res = await API.post('/api/auth/register', form)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.registerCard}>
        {/* Logo Section */}
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <Leaf size={32} fill="#10b981" color="#10b981" />
          </div>
          <h1 className={styles.brandName}>Join SnapGreen</h1>
          <p className={styles.subtitle}>Start your sustainability journey today</p>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <User className={styles.icon} size={18} />
              <input
                type='text'
                name='name'
                placeholder='John Doe'
                value={form.name}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.icon} size={18} />
              <input
                type='email'
                name='email'
                placeholder='you@example.com'
                value={form.email}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.icon} size={18} />
              <input
                type='password'
                name='password'
                placeholder='Min. 6 characters'
                value={form.password}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
          </div>

          <button type='submit' className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <Loader2 className={styles.spinner} size={20} />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account? <Link to='/login' className={styles.link}>Sign in instead</Link>
        </p>

        {/* Feature Highlights */}
        <div className={styles.featureGrid}>
          <div className={styles.featureItem}>
            <div className={styles.featureCircle}><Camera size={16} /></div>
            <span>Scan</span>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureCircle}><Globe size={16} /></div>
            <span>Impact</span>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureCircle}><Trophy size={16} /></div>
            <span>Rank</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register