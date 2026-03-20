import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(res.data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    const colors = {
      A: '#2e7d32', B: '#558b2f', C: '#f9a825',
      D: '#e65100', E: '#b71c1c', F: '#b71c1c'
    }
    return colors[score] || '#888'
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getGreenLevel = (percent) => {
    if (percent >= 80) return { label: 'Eco Warrior 🌳', color: '#2e7d32' }
    if (percent >= 60) return { label: 'Green Thinker 🌿', color: '#558b2f' }
    if (percent >= 40) return { label: 'Getting There 🌱', color: '#f9a825' }
    return { label: 'Just Starting 🌾', color: '#e65100' }
  }

  if (loading) return (
  <div className={styles.container}>
    <div className={styles.navbar}>
      <div className={styles.navLogo}>🌿 SnapGreen</div>
    </div>
    <div className={styles.skeleton}>
      <div className={`${styles.skeletonHero}`} />
      <div className={styles.skeletonGrid}>
        {[1,2,3,4].map(i => <div key={i} className={styles.skeletonCard} />)}
      </div>
      <div className={styles.skeletonBlock} />
      <div className={styles.skeletonBlock} />
    </div>
  </div>
)

  const { user, stats, recentScans } = data
  const level = getGreenLevel(stats.greenPercent)
  const maxActivity = Math.max(...stats.weeklyActivity.map(d => d.count), 1)

  return (
    <div className={styles.container}>

      {/* Top Nav */}
        <div className={styles.navLogo}>🌿 SnapGreen</div>

      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <p className={styles.greeting}>{getGreeting()},</p>
          <h1 className={styles.userName}>{user.name} 👋</h1>
          <div className={styles.levelBadge} style={{ background: level.color }}>
            {level.label}
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.greenScoreCircle}>
            <span className={styles.greenScoreNum}>{stats.greenPercent}%</span>
            <span className={styles.greenScoreText}>Green Choices</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🔍</span>
          <span className={styles.statNum}>{stats.totalScans}</span>
          <span className={styles.statLabel}>Total Scans</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📦</span>
          <span className={styles.statNum}>{stats.uniqueProducts}</span>
          <span className={styles.statLabel}>Products</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✅</span>
          <span className={styles.statNum} style={{ color: '#4caf50' }}>
            {stats.goodScans}
          </span>
          <span className={styles.statLabel}>Green Scans</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⚠️</span>
          <span className={styles.statNum} style={{ color: '#e53935' }}>
            {stats.poorScans}
          </span>
          <span className={styles.statLabel}>Poor Scans</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <button
            className={styles.actionCard}
            onClick={() => navigate('/scanner')}
          >
            <span className={styles.actionIcon}>📷</span>
            <span className={styles.actionLabel}>Scan Product</span>
            <span className={styles.actionSub}>Check eco impact</span>
          </button>
          <button
            className={styles.actionCard}
            onClick={() => navigate('/history')}
          >
            <span className={styles.actionIcon}>📋</span>
            <span className={styles.actionLabel}>History</span>
            <span className={styles.actionSub}>View past scans</span>
          </button>
          <button
              className={styles.actionCard}
              onClick={() => navigate('/badges')}
            >
            <span className={styles.actionIcon}>🏅</span>
            <span className={styles.actionLabel}>Badges</span>
            <span className={styles.actionSub}>{data?.user?.badges?.length || 0} earned</span>
          </button>
          <button
              className={styles.actionCard}
              onClick={() => navigate('/leaderboard')}
            >
            <span className={styles.actionIcon}>🏆</span>
            <span className={styles.actionLabel}>Leaderboard</span>
            <span className={styles.actionSub}>See rankings</span>
          </button>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>📅 This Week's Activity</h2>
        <div className={styles.activityCard}>
          <div className={styles.barChart}>
            {stats.weeklyActivity.map((day, i) => (
              <div key={i} className={styles.barCol}>
                <span className={styles.barCount}>{day.count > 0 ? day.count : ''}</span>
                <div className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${(day.count / maxActivity) * 100}%`,
                      background: day.count > 0 ? '#4caf50' : '#e8f5e9',
                      minHeight: day.count > 0 ? '8px' : '4px'
                    }}
                  />
                </div>
                <span className={styles.barDay}>{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🏆 Score Breakdown</h2>
        <div className={styles.distributionCard}>
          {Object.entries(stats.scoreDistribution).map(([grade, count]) => (
            <div key={grade} className={styles.distRow}>
              <div
                className={styles.distGrade}
                style={{ background: getScoreColor(grade) }}
              >
                {grade}
              </div>
              <div className={styles.distBarTrack}>
                <div
                  className={styles.distBarFill}
                  style={{
                    width: stats.totalScans > 0
                      ? `${(count / stats.totalScans) * 100}%`
                      : '0%',
                    background: getScoreColor(grade)
                  }}
                />
              </div>
              <span className={styles.distCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Scans */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🕒 Recent Scans</h2>
          {recentScans.length > 0 && (
            <button
              className={styles.viewAllBtn}
              onClick={() => navigate('/history')}
            >
              View All →
            </button>
          )}
        </div>

        {recentScans.length === 0 ? (
          <div className={styles.emptyScans}>
            <p>No scans yet! Start scanning products to see your history here.</p>
            <button
              className={styles.scanNowBtn}
              onClick={() => navigate('/scanner')}
            >
              📷 Scan Now
            </button>
          </div>
        ) : (
          <div className={styles.recentList}>
            {recentScans.map((scan) => {
              const product = scan.productId
              if (!product) return null
              return (
                <div key={scan._id} className={styles.recentCard}>
                  <div className={styles.recentImageWrapper}>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={styles.recentImage}
                      />
                    ) : (
                      <div className={styles.recentImagePlaceholder}>
                        {scan.scanMethod === 'photo' ? '📸' : '📦'}
                      </div>
                    )}
                  </div>
                  <div className={styles.recentInfo}>
                    <p className={styles.recentName}>{product.name}</p>
                    <p className={styles.recentBrand}>{product.brand}</p>
                  </div>
                  <div
                    className={styles.recentScore}
                    style={{ background: getScoreColor(scan.ecoScoreAtScan) }}
                  >
                    {scan.ecoScoreAtScan}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Eco Tip */}
      <div className={styles.ecoTip}>
        <span>🌱</span>
        <div>
          <strong>Daily Eco Tip</strong>
          <p>Choosing products with grade A or B can reduce your carbon footprint by up to 40% over a year.</p>
        </div>
      </div>

    </div>
  )
}

export default Dashboard