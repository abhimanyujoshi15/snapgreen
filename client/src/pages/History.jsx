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
  Trash2,
  Package,
  Search,
  ChevronRight,
  Loader2
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

  const handleDelete = async (e, scanId) => {
    e.stopPropagation() // Prevent navigating to product details
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
      A: '#10b981', B: '#34d399',
      C: '#f59e0b', D: '#f97316',
      E: '#ef4444', F: '#b91c1c'
    }
    return colors[score] || '#94a3b8'
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
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

  const totalScans = scans.length
  const goodScans = scans.filter(s => ['A', 'B'].includes(s.ecoScoreAtScan)).length
  const greenRate = totalScans > 0 ? Math.round((goodScans / totalScans) * 100) : 0

  if (loading) return (
    <div className={styles.centered}>
      <Loader2 className={styles.spinner} size={40} />
      <p>Fetching your green logs...</p>
    </div>
  )

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Your Activity</h1>
          <p className={styles.subtitle}>Tracking your environmental impact</p>
        </div>
      </header>

      {/* Modern Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.iconCircle} ${styles.blue}`}>
            <Search size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{totalScans}</span>
            <span className={styles.statLabel}>Total Scans</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.iconCircle} ${styles.green}`}>
            <Leaf size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{greenRate}%</span>
            <span className={styles.statLabel}>Eco-Positive</span>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className={styles.filterSection}>
        <div className={styles.chipContainer}>
          {[
            { key: 'all', label: 'All', icon: <HistoryIcon size={14} /> },
            { key: 'good', label: 'Eco-Friendly', icon: <Leaf size={14} /> },
            { key: 'bad', label: 'High Impact', icon: <AlertTriangle size={14} /> },
            { key: 'barcode', label: 'Barcodes', icon: <ScanBarcode size={14} /> },
            { key: 'photo', label: 'Photos', icon: <Camera size={14} /> },
          ].map(f => (
            <button
              key={f.key}
              className={`${styles.chip} ${filter === f.key ? styles.activeChip : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {/* Content Area */}
      <div className={styles.scansList}>
        {filteredScans.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIllustration}>📦</div>
            <h3>No entries found</h3>
            <p>Your history is currently empty or filtered out.</p>
            <button className={styles.ctaBtn} onClick={() => navigate('/scanner')}>
              Start Scanning
            </button>
          </div>
        ) : (
          filteredScans.map(scan => (
            <div 
              key={scan._id} 
              className={styles.scanCard}
              onClick={() => navigate(`/product/${scan.productId?._id}`)}
            >
              <div className={styles.productImgWrapper}>
                {scan.productId?.imageUrl ? (
                  <img src={scan.productId.imageUrl} alt="" />
                ) : (
                  <div className={styles.imgPlaceholder}>
                    <Package size={24} color="#94a3b8" />
                  </div>
                )}
              </div>

              <div className={styles.mainContent}>
                <div className={styles.productDetails}>
                  <h4 className={styles.productName}>{scan.productId?.name || 'Unknown Product'}</h4>
                  <p className={styles.brandName}>{scan.productId?.brand || 'Generic Brand'}</p>
                  <div className={styles.metaInfo}>
                    <span className={styles.methodTag}>
                      {scan.scanMethod === 'photo' ? <Camera size={12} /> : <ScanBarcode size={12} />}
                      {scan.scanMethod}
                    </span>
                    <span className={styles.dateText}>{formatDate(scan.createdAt)}</span>
                  </div>
                </div>

                <div className={styles.rightAction}>
                  <div 
                    className={styles.scoreBadge} 
                    style={{ '--score-color': getScoreColor(scan.ecoScoreAtScan) }}
                  >
                    {scan.ecoScoreAtScan}
                  </div>
                  <button 
                    className={styles.deleteIconButton}
                    onClick={(e) => handleDelete(e, scan._id)}
                    disabled={deleting === scan._id}
                  >
                    {deleting === scan._id ? (
                      <Loader2 size={16} className={styles.spin} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
              <ChevronRight className={styles.arrowIcon} size={18} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default History