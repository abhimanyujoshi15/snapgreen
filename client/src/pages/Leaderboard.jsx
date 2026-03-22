import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Leaderboard.module.css'

const Leaderboard = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/api/dashboard/leaderboard', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setLeaderboard(res.data.leaderboard)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const getRankStyle = (rank) => {
    if (rank === 1) return { bg: '#FFD700', emoji: '🥇' }
    if (rank === 2) return { bg: '#C0C0C0', emoji: '🥈' }
    if (rank === 3) return { bg: '#CD7F32', emoji: '🥉' }
    return { bg: '#e8f5e9', emoji: `#${rank}` }
  }

  if (loading) return (
    <div className={styles.centered}>
      <div className={styles.spinner} />
    </div>
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🏆 Leaderboard</h1>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className={styles.podium}>
          {/* 2nd place */}
          <div className={styles.podiumItem}>
            <div className={`${styles.podiumAvatar} ${styles.silver}`}>
              {leaderboard[1].name.charAt(0).toUpperCase()}
            </div>
            <p className={styles.podiumName}>{leaderboard[1].name.split(' ')[0]}</p>
            <p className={styles.podiumScore}>{leaderboard[1].greenScore}</p>
            <div className={`${styles.podiumBlock} ${styles.silverBlock}`}>🥈</div>
          </div>

          {/* 1st place */}
          <div className={`${styles.podiumItem} ${styles.first}`}>
            <div className={`${styles.podiumAvatar} ${styles.gold}`}>
              {leaderboard[0].name.charAt(0).toUpperCase()}
            </div>
            <p className={styles.podiumName}>{leaderboard[0].name.split(' ')[0]}</p>
            <p className={styles.podiumScore}>{leaderboard[0].greenScore}</p>
            <div className={`${styles.podiumBlock} ${styles.goldBlock}`}>🥇</div>
          </div>

          {/* 3rd place */}
          <div className={styles.podiumItem}>
            <div className={`${styles.podiumAvatar} ${styles.bronze}`}>
              {leaderboard[2].name.charAt(0).toUpperCase()}
            </div>
            <p className={styles.podiumName}>{leaderboard[2].name.split(' ')[0]}</p>
            <p className={styles.podiumScore}>{leaderboard[2].greenScore}</p>
            <div className={`${styles.podiumBlock} ${styles.bronzeBlock}`}>🥉</div>
          </div>
        </div>
      )}

      {/* Full List */}
      <div className={styles.list}>
        {leaderboard.map((entry) => {
          const rankStyle = getRankStyle(entry.rank)
          return (
            <div
              key={entry.rank}
              className={`${styles.row} ${entry.isCurrentUser ? styles.currentUser : ''}`}
            >
              <div
                className={styles.rankBadge}
                style={{ background: entry.rank <= 3 ? rankStyle.bg : '#e8f5e9' }}
              >
                {entry.rank <= 3 ? rankStyle.emoji : entry.rank}
              </div>
              <div className={styles.avatar}>
                {entry.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.info}>
                <strong>{entry.name} {entry.isCurrentUser ? '(You)' : ''}</strong>
                <p>🔥 {entry.streakCount} day streak · 🏅 {entry.badgeCount} badges</p>
              </div>
              <div className={styles.score}>
                <span className={styles.scoreNum}>{entry.greenScore}</span>
                <span className={styles.scoreLabel}>pts</span>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default Leaderboard