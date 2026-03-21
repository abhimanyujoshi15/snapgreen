import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'
import {
  Search, Package, CheckCircle, Leaf,
  Camera, Medal, Trophy, ClipboardList,
  TrendingUp
} from 'lucide-react'

const Dashboard = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboard() }, [])

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(res.data)
    } catch (err) {
      console.error(err)
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
    <div className={styles.skeletonPage}>
      <div className={styles.skeletonHero} />
      <div className={styles.skeletonGrid}>
        {[1,2,3,4].map(i => <div key={i} className={styles.skeletonCard} />)}
      </div>
      <div className={styles.skeletonRow}>
        <div className={styles.skeletonBlock} />
        <div className={styles.skeletonBlock} />
      </div>
    </div>
  )

  const { user, stats, recentScans } = data
  const level = getGreenLevel(stats.greenPercent)
  const maxActivity = Math.max(...stats.weeklyActivity.map(d => d.count), 1)

  return (
    <div className={styles.page}>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.greeting}>{getGreeting()},</p>
          <h1 className={styles.userName}>{user.name} 👋</h1>
        </div>
        <div className={styles.levelBadge} style={{ background: level.color }}>
          {level.label}
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsGrid}>
        {[
  { icon: <Search size={22} color='#1565c0' />, num: stats.totalScans, label: 'Total Scans', color: '#1565c0' },
  { icon: <Package size={22} color='#6a1b9a' />, num: stats.uniqueProducts, label: 'Products Scanned', color: '#6a1b9a' },
  { icon: <CheckCircle size={22} color='#2e7d32' />, num: stats.goodScans, label: 'Green Choices', color: '#2e7d32' },
  { icon: <Leaf size={22} color='#00695c' />, num: `${stats.greenPercent}%`, label: 'Green Rate', color: '#00695c' },
].map((s, i) => (
  <div key={i} className={styles.statCard}>
    <div className={styles.statIconBox} style={{ background: `${s.color}15` }}>
      {s.icon}
    </div>
    <div>
      <div className={styles.statNum} style={{ color: s.color }}>{s.num}</div>
      <div className={styles.statLabel}>{s.label}</div>
    </div>
  </div>
))}
      </div>

      {/* Two Column Layout */}
      <div className={styles.twoCol}>

        {/* Left Column */}
        <div className={styles.leftCol}>

          {/* Weekly Activity */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📅 Weekly Activity</h2>
            <div className={styles.barChart}>
              {stats.weeklyActivity.map((day, i) => (
                <div key={i} className={styles.barCol}>
                  <span className={styles.barCount}>{day.count > 0 ? day.count : ''}</span>
                  <div className={styles.barWrapper}>
                    <div
                      className={styles.bar}
                      style={{
                        height: `${(day.count / maxActivity) * 100}%`,
                        background: day.count > 0
                          ? 'linear-gradient(180deg, #4caf50, #2e7d32)'
                          : '#e8f5e9',
                        minHeight: day.count > 0 ? '8px' : '4px'
                      }}
                    />
                  </div>
                  <span className={styles.barDay}>{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score Distribution */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🏆 Score Breakdown</h2>
            <div className={styles.distribution}>
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
                          ? `${(count / stats.totalScans) * 100}%` : '0%',
                        background: getScoreColor(grade)
                      }}
                    />
                  </div>
                  <span className={styles.distCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className={styles.rightCol}>

          {/* Green Score Card */}
          <div
            className={styles.greenScoreCard}
            style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}cc)` }}
          >
            <div className={styles.greenScoreTop}>
              <div>
                <p className={styles.greenScoreLabel}>Your Green Score</p>
                <h2 className={styles.greenScoreNum}>{user.greenScore}</h2>
              </div>
              <div className={styles.greenScoreCircle}>
                <span className={styles.greenScorePercent}>{stats.greenPercent}%</span>
                <span className={styles.greenScorePercentLabel}>Green</span>
              </div>
            </div>
            <div className={styles.greenScoreStreak}>
              🔥 {user.streakCount} day streak · 🏅 {user.badges?.length || 0} badges
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>⚡ Quick Actions</h2>
            <div className={styles.actionList}>
              {[
  { icon: <Camera size={20} color='#2e7d32' />, label: 'Scan a Product', sub: 'Check eco impact instantly', path: '/scanner', color: '#e8f5e9' },
  { icon: <Medal size={20} color='#f57f17' />, label: 'View Badges', sub: `${user.badges?.length || 0} earned so far`, path: '/badges', color: '#fff8e1' },
  { icon: <Trophy size={20} color='#1565c0' />, label: 'Leaderboard', sub: 'See how you rank', path: '/leaderboard', color: '#e3f2fd' },
  { icon: <ClipboardList size={20} color='#6a1b9a' />, label: 'Full History', sub: 'All your past scans', path: '/history', color: '#f3e5f5' },
].map((a, i) => (
  <button key={i} className={styles.actionItem} onClick={() => navigate(a.path)}>
    <div className={styles.actionItemIcon} style={{ background: a.color }}>
      {a.icon}
    </div>
    <div>
      <p className={styles.actionItemLabel}>{a.label}</p>
      <p className={styles.actionItemSub}>{a.sub}</p>
    </div>
    <TrendingUp size={16} color='#ccc' style={{ marginLeft: 'auto' }} />
  </button>
))}
            </div>
          </div>

          {/* Recent Scans */}
          <div className={styles.card}>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.cardTitle}>🕒 Recent Scans</h2>
              <button
                className={styles.viewAll}
                onClick={() => navigate('/history')}
              >
                View All →
              </button>
            </div>

            {recentScans.length === 0 ? (
              <div className={styles.emptyScans}>
                <p>No scans yet!</p>
                <button onClick={() => navigate('/scanner')} className={styles.scanNowBtn}>
                  📷 Scan Now
                </button>
              </div>
            ) : (
              <div className={styles.recentList}>
                {recentScans.map((scan) => {
                  const product = scan.productId
                  if (!product) return null
                  return (
                    <div key={scan._id} className={styles.recentRow}>
                      <div className={styles.recentImg}>
                        {product.imageUrl
                          ? <img src={product.imageUrl} alt={product.name} />
                          : <span>{scan.scanMethod === 'photo' ? '📸' : '📦'}</span>
                        }
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

        </div>
      </div>

      {/* Eco Tip */}
      <div className={styles.ecoTip}>
        <span className={styles.ecoTipIcon}>🌱</span>
        <div>
          <strong>Daily Eco Tip</strong>
          <p>Choosing products with grade A or B can reduce your carbon footprint by up to 40% over a year.</p>
        </div>
      </div>

    </div>
  )
}

export default Dashboard