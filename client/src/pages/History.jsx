import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from './History.module.css'
import {
  History as HistoryIcon,
  ScanBarcode,
  Camera,
  Leaf,
  AlertTriangle,
  Trash2
} from 'lucide-react'

const History = () => {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/scans/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setScans(res.data.scans)
    } catch (err) {
      setError('Could not load scan history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (scanId) => {
    setDeleting(scanId)
    try {
      await axios.delete(`http://localhost:5000/api/scans/${scanId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setScans(scans.filter(s => s._id !== scanId))
    } catch (err) {
      setError('Could not delete scan')
    } finally {
      setDeleting(null)
    }
  }

  const getScoreColor = (score) => {
    const colors = {
      A: '#2e7d32', B: '#558b2f',
      C: '#f9a825', D: '#e65100',
      E: '#b71c1c', F: '#b71c1c'
    }
    return colors[score] || '#888'
  }

  const getScoreLabel = (score) => {
    const labels = {
      A: 'Excellent', B: 'Good',
      C: 'Average', D: 'Poor',
      E: 'Very Poor', F: 'Harmful'
    }
    return labels[score] || 'Unknown'
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const filteredScans = scans.filter(scan => {
    if (filter === 'all') return true
    if (filter === 'barcode') return scan.scanMethod === 'barcode'
    if (filter === 'photo') return scan.scanMethod === 'photo'
    if (filter === 'good') return ['A', 'B'].includes(scan.ecoScoreAtScan)
    if (filter === 'bad') return ['D', 'E', 'F'].includes(scan.ecoScoreAtScan)
    return true
  })

  // Stats
  const totalScans = scans.length
  const goodScans = scans.filter(s => ['A', 'B'].includes(s.ecoScoreAtScan)).length
  const uniqueProducts = new Set(scans.map(s => s.productId?._id)).size

  if (loading) return (
    <div className={styles.centered}>
      <div className={styles.spinner} />
      <p>Loading history...</p>
    </div>
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>📋 Scan History</h1>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalScans}</span>
          <span className={styles.statLabel}>Total Scans</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{uniqueProducts}</span>
          <span className={styles.statLabel}>Unique Products</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber} style={{ color: '#4caf50' }}>
            {totalScans > 0 ? Math.round((goodScans / totalScans) * 100) : 0}%
          </span>
          <span className={styles.statLabel}>Green Choices</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filters}>
        {[
          { key: 'all', label: 'All', icon: <HistoryIcon size={14} /> },
          { key: 'good', label: 'Green', icon: <Leaf size={14} /> },
          { key: 'bad', label: 'Poor', icon: <AlertTriangle size={14} /> },
          { key: 'barcode', label: 'Barcode', icon: <ScanBarcode size={14} /> },
          { key: 'photo', label: 'Photo', icon: <Camera size={14} /> },
        ].map(f => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.activeFilter : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Empty State */}
      {filteredScans.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <span>🔍</span>
          <p>No scans found</p>
          <button
            className={styles.scanNowBtn}
            onClick={() => navigate('/scanner')}
          >
            Scan your first product
          </button>
        </div>
      )}

      {/* Scan List */}
      <div className={styles.scanList}>
        {filteredScans.map((scan) => {
          const product = scan.productId
          if (!product) return null

          return (
            <div key={scan._id} className={styles.scanCard}>

              {/* Left — Product Image */}
              <div className={styles.scanImageWrapper}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className={styles.scanImage}
                  />
                ) : (
                  <div className={styles.scanImagePlaceholder}>
                    {scan.scanMethod === 'photo' ? '📸' : '📦'}
                  </div>
                )}
              </div>

              {/* Middle — Product Info */}
              <div className={styles.scanInfo}>
                <h3 className={styles.scanProductName}>{product.name}</h3>
                <p className={styles.scanBrand}>{product.brand}</p>
                <p className={styles.scanMeta}>
                  {scan.scanMethod === 'photo' ? '📸 Photo' : '📦 Barcode'} ·{' '}
                  {formatDate(scan.createdAt)}
                </p>
              </div>

              {/* Right — Eco Score + Delete */}
              <div className={styles.scanRight}>
                <div
                  className={styles.miniScore}
                  style={{ backgroundColor: getScoreColor(scan.ecoScoreAtScan) }}
                >
                  <span className={styles.miniScoreLetter}>{scan.ecoScoreAtScan}</span>
                  <span className={styles.miniScoreLabel}>
                    {getScoreLabel(scan.ecoScoreAtScan)}
                  </span>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(scan._id)}
                  disabled={deleting === scan._id}
                >
                  <Trash2 size={15} />
                </button>
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}

export default History