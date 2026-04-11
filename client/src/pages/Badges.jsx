import { useState, useEffect } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Badges.module.css'
import { 
  Trophy, 
  Lock, 
  CheckCircle2, 
  Award, 
  Star, 
  Loader2,
  Medal
} from 'lucide-react'

const Badges = () => {
  const { token } = useAuth()
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await API.get('/api/dashboard/badges', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setBadges(res.data.badges)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBadges()
  }, [token])

  const earned = badges.filter(b => b.earned)
  const locked = badges.filter(b => !b.earned)
  const progressPercent = badges.length > 0 ? Math.round((earned.length / badges.length) * 100) : 0

  if (loading) return (
    <div className={styles.centered}>
      <Loader2 className={styles.spinner} size={40} />
      <p>Polishing your trophies...</p>
    </div>
  )

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <Medal className={styles.headerIcon} size={32} />
          <h1 className={styles.title}>Achievements</h1>
        </div>
        <p className={styles.subtitle}>Track your milestones and eco-impact awards</p>
      </header>

      {/* Progress Card */}
      <div className={styles.progressCard}>
        <div className={styles.progressInfo}>
          <div className={styles.progressText}>
            <span className={styles.count}>{earned.length} / {badges.length}</span>
            <span className={styles.label}>Badges Collected</span>
          </div>
          <div className={styles.percentBadge}>{progressPercent}%</div>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Earned Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Star size={18} className={styles.earnedIcon} />
          <h2 className={styles.sectionTitle}>Earned Badges</h2>
        </div>
        <div className={styles.badgeGrid}>
          {earned.length > 0 ? (
            earned.map(badge => (
              <div key={badge.id} className={`${styles.badgeCard} ${styles.earnedCard}`}>
                <div className={styles.iconWrapper}>
                  <span className={styles.badgeEmoji}>{badge.icon}</span>
                  <CheckCircle2 className={styles.checkMark} size={16} />
                </div>
                <h3 className={styles.badgeName}>{badge.name}</h3>
                <p className={styles.badgeDesc}>{badge.description}</p>
              </div>
            ))
          ) : (
            <div className={styles.emptyGrid}>Start scanning to earn your first badge!</div>
          )}
        </div>
      </div>

      {/* Locked Section */}
      {locked.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Lock size={18} className={styles.lockedIcon} />
            <h2 className={styles.sectionTitle}>Locked Achievements</h2>
          </div>
          <div className={styles.badgeGrid}>
            {locked.map(badge => (
              <div key={badge.id} className={`${styles.badgeCard} ${styles.lockedCard}`}>
                <div className={styles.iconWrapperLocked}>
                  <Lock size={24} />
                </div>
                <h3 className={styles.badgeName}>{badge.name}</h3>
                <p className={styles.badgeDesc}>{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Badges