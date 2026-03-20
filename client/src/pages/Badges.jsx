import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from './Badges.module.css'

const Badges = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/dashboard/badges', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setBadges(res.data.badges)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const earned = badges.filter(b => b.earned)
  const locked = badges.filter(b => !b.earned)

  if (loading) return (
    <div className={styles.centered}>
      <div className={styles.spinner} />
    </div>
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🏅 Badges</h1>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressCard}>
        <div className={styles.progressTop}>
          <span>{earned.length} / {badges.length} earned</span>
          <span>{Math.round((earned.length / badges.length) * 100)}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(earned.length / badges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>✅ Earned ({earned.length})</h2>
          <div className={styles.badgeGrid}>
            {earned.map(badge => (
              <div key={badge.id} className={`${styles.badgeCard} ${styles.earned}`}>
                <span className={styles.badgeIcon}>{badge.icon}</span>
                <strong className={styles.badgeName}>{badge.name}</strong>
                <p className={styles.badgeDesc}>{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🔒 Locked ({locked.length})</h2>
          <div className={styles.badgeGrid}>
            {locked.map(badge => (
              <div key={badge.id} className={`${styles.badgeCard} ${styles.locked}`}>
                <span className={styles.badgeIcon}>🔒</span>
                <strong className={styles.badgeName}>{badge.name}</strong>
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