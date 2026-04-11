import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'
import {
  Search, Package, CheckCircle, Leaf,
  Camera, Medal, Trophy, ClipboardList,
  TrendingUp, Sparkles, Flame, ChevronRight,
  Loader2
} from 'lucide-react'

const Dashboard = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboard() }, [])

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/api/dashboard', {
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
      A: '#10b981', B: '#34d399', C: '#f59e0b',
      D: '#f97316', E: '#ef4444', F: '#b91c1c'
    }
    return colors[score] || '#94a3b8'
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (loading) return (
    <div className={styles.centered}>
      <Loader2 className={styles.spinner} size={40} />
      <p>Loading your eco-impact...</p>
    </div>
  )

  const { user, stats, recentScans } = data
  const maxActivity = Math.max(...stats.weeklyActivity.map(d => d.count), 1)

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.welcome}>
          <p className={styles.greetingText}>{getGreeting()},</p>
          <h1 className={styles.userName}>{user.name}</h1>
        </div>
        <div className={styles.streakBadge}>
          <span>{user.streakCount} Day Streak</span>
        </div>
      </header>

      {/* Main Stats Banner */}
      <section className={styles.heroStats}>
        <div className={styles.mainScoreCard}>
          <div className={styles.scoreInfo}>
            <span className={styles.scoreLabel}>Current Green Score</span>
            <h2 className={styles.scoreValue}>{user.greenScore}</h2>
            <div className={styles.scoreMeta}>
              <Medal size={14} /> {user.badges?.length || 0} Badges Earned
            </div>
          </div>
          <div className={styles.progressCircle}>
             <svg viewBox="0 0 36 36" className={styles.circularChart}>
                <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={styles.circle} style={{ strokeDasharray: `${stats.greenPercent}, 100` }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" className={styles.percentage}>{stats.greenPercent}%</text>
             </svg>
             <span className={styles.circleLabel}>Eco-Positive</span>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {[
            { icon: <Search size={20} />, val: stats.totalScans, label: 'Scans', color: '#3b82f6' },
            { icon: <Package size={20} />, val: stats.uniqueProducts, label: 'Items', color: '#8b5cf6' },
            { icon: <CheckCircle size={20} />, val: stats.goodScans, label: 'Green', color: '#10b981' },
          ].map((s, i) => (
            <div key={i} className={styles.miniStatCard}>
              <div className={styles.miniStatIcon} style={{ color: s.color }}>{s.icon}</div>
              <div>
                <div className={styles.miniStatVal}>{s.val}</div>
                <div className={styles.miniStatLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.dashboardGrid}>
        {/* Left Column: Activity & Charts */}
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Activity History</h3>
              <span className={styles.cardSub}>Last 7 days</span>
            </div>
            <div className={styles.barChart}>
              {stats.weeklyActivity.map((day, i) => (
                <div key={i} className={styles.barGroup}>
                  <div className={styles.barTrack}>
                    <div 
                      className={styles.barFill} 
                      style={{ height: `${(day.count / maxActivity) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barDay}>{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Grade Distribution</h3>
            <div className={styles.gradeList}>
              {Object.entries(stats.scoreDistribution).map(([grade, count]) => (
                <div key={grade} className={styles.gradeRow}>
                  <span className={styles.gradeLetter} style={{ color: getScoreColor(grade) }}>{grade}</span>
                  <div className={styles.gradeTrack}>
                    <div 
                      className={styles.gradeFill} 
                      style={{ 
                        width: stats.totalScans > 0 ? `${(count / stats.totalScans) * 100}%` : '0%',
                        backgroundColor: getScoreColor(grade)
                      }} 
                    />
                  </div>
                  <span className={styles.gradeCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Recents */}
        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Quick Actions</h3>
            <div className={styles.actionGrid}>
              {[
                { icon: <Camera size={18} />, label: 'Scan Now', path: '/scanner', bg: '#ecfdf5', c: '#10b981' },
                { icon: <Trophy size={18} />, label: 'Rankings', path: '/leaderboard', bg: '#eff6ff', c: '#3b82f6' },
                { icon: <Medal size={18} />, label: 'Badges', path: '/badges', bg: '#fffbeb', c: '#f59e0b' },
                { icon: <ClipboardList size={18} />, label: 'History', path: '/history', bg: '#f5f3ff', c: '#8b5cf6' },
              ].map((action, i) => (
                <button key={i} className={styles.actionBtn} onClick={() => navigate(action.path)}>
                  <div className={styles.actionIcon} style={{ background: action.bg, color: action.c }}>
                    {action.icon}
                  </div>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h3 className={styles.cardTitle}>Recent Scans</h3>
              <button className={styles.textLink} onClick={() => navigate('/history')}>View All</button>
            </div>
            <div className={styles.recentList}>
              {recentScans.slice(0, 3).map((scan) => (
                <div key={scan._id} className={styles.recentItem} onClick={() => navigate(`/product/${scan.productId?._id}`)}>
                  <div className={styles.recentImg}>
                    {scan.productId?.imageUrl ? (
                      <img src={scan.productId.imageUrl} alt="" />
                    ) : (
                      <Package size={20} color="#cbd5e1" />
                    )}
                  </div>
                  <div className={styles.recentMeta}>
                    <span className={styles.recentName}>{scan.productId?.name || 'Unknown Item'}</span>
                    <span className={styles.recentDate}>{new Date(scan.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.recentGrade} style={{ background: getScoreColor(scan.ecoScoreAtScan) }}>
                    {scan.ecoScoreAtScan}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tipCard}>
        <div className={styles.tipIcon}><Leaf size={20} /></div>
        <div className={styles.tipContent}>
          <strong>Daily Tip:</strong>
          <p>Buying local seasonal produce can reduce transport emissions by up to 15%.</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard