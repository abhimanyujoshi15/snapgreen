import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
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
      const res = await API.get('/api/scans/history', {
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
      await API.delete(`/api/scans/${scanId}`, {
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
        {[
          { icon: '🔍', num: totalScans, label: 'Total Scans', bg: '#e3f2fd', color: '#1565c0' },
          { icon: '📦', num: uniqueProducts, label: 'Unique Products', bg: '#f3e5f5', color: '#6a1b9a' },
          { icon: '🌿', num: `${totalScans > 0 ? Math.round((goodScans / totalScans) * 100) : 0}%`, label: 'Green Choices', bg: '#e8f5e9', color: '#2e7d32' },
        ].map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIconBox} style={{ background: s.bg }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            </div>
            <div>
              <div className={styles.statNumber} style={{ color: s.color }}>{s.num}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <span className={styles.filterLabel}>Filter:</span>
        <div className={styles.filters}>
          {[
            { key: 'all', label: 'All Scans', icon: <HistoryIcon size={13} /> },
            { key: 'good', label: 'Green', icon: <Leaf size={13} /> },
            { key: 'bad', label: 'Poor', icon: <AlertTriangle size={13} /> },
            { key: 'barcode', label: 'Barcode', icon: <ScanBarcode size={13} /> },
            { key: 'photo', label: 'Photo', icon: <Camera size={13} /> },
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
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Empty State */}
      {filteredScans.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔍</span>
          <p className={styles.emptyTitle}>No scans found</p>
          <p className={styles.emptyText}>
            {filter === 'all' ? 'Start scanning products to build your history' : 'No scans match this filter'}
          </p>
          {filter === 'all' && (
            <button className={styles.scanNowBtn} onClick={() => navigate('/scanner')}>
              <Camera size={16} /> Scan a Product
            </button>
          )}
        </div>
      )}

      {/* ✅ Fixed Scan Cards */}
      {filteredScans.map(scan => {
        const product = scan.productId || {}

        return (
          <div key={scan._id} className={styles.scanCard}>
            <div className={styles.scanImageWrapper}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className={styles.scanImage} />
              ) : (
                <div className={styles.scanImagePlaceholder}>
                  {scan.scanMethod === 'photo' ? '📸' : '📦'}
                </div>
              )}
            </div>

            <div className={styles.scanInfo}>
              <p className={styles.scanProductName}>{product.name}</p>
              <p className={styles.scanBrand}>{product.brand}</p>

              <div className={styles.scanMetaRow}>
                <span className={styles.scanMethodBadge}>
                  {scan.scanMethod === 'photo' ? (
                    <>
                      <Camera size={10} /> Photo
                    </>
                  ) : (
                    <>
                      <ScanBarcode size={10} /> Barcode
                    </>
                  )}
                </span>

                <span className={styles.scanDate}>
                  {formatDate(scan.createdAt)}
                </span>
              </div>
            </div>

            <div className={styles.scanRight}>
              <div
                className={styles.miniScore}
                style={{ backgroundColor: getScoreColor(scan.ecoScoreAtScan) }}
              >
                <span className={styles.miniScoreLetter}>
                  {scan.ecoScoreAtScan}
                </span>
                <span className={styles.miniScoreLabel}>
                  {getScoreLabel(scan.ecoScoreAtScan)}
                </span>
              </div>

              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(scan._id)}
                disabled={deleting === scan._id}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )
      })}

    </div>
  )
}

export default History