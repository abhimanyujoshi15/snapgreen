import { useState, useEffect } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Leaderboard.module.css'
import { 
  Trophy, 
  Flame, 
  Medal, 
  Crown, 
  Loader2, 
  TrendingUp 
} from 'lucide-react'

const Leaderboard = () => {
  const { token } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
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
    fetchLeaderboard()
  }, [token])

  if (loading) return (
    <div className={styles.centered}>
      <Loader2 className={styles.spinner} size={40} />
      <p>Calculating rankings...</p>
    </div>
  )

  const topThree = leaderboard.slice(0, 3)
  const others = leaderboard.slice(3)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Community Rankings</h1>
          <p className={styles.subtitle}>Our top eco-warriors this month</p>
        </div>
        <div className={styles.rankStatus}>
          <TrendingUp size={16} />
          <span>Global</span>
        </div>
      </header>

      {/* Hero Podium Section */}
      {leaderboard.length >= 3 && (
        <div className={styles.podiumContainer}>
          {/* Silver - 2nd */}
          <div className={`${styles.podiumItem} ${styles.second}`}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>{topThree[1].name.charAt(0)}</div>
              <div className={styles.rankBadge}>2</div>
            </div>
            <p className={styles.podiumName}>{topThree[1].name.split(' ')[0]}</p>
            <div className={styles.podiumScore}>{topThree[1].greenScore}</div>
            <div className={styles.baseBlock}></div>
          </div>

          {/* Gold - 1st */}
          <div className={`${styles.podiumItem} ${styles.first}`}>
            <div className={styles.avatarWrapper}>
              <Crown className={styles.crownIcon} size={24} />
              <div className={styles.avatar}>{topThree[0].name.charAt(0)}</div>
              <div className={styles.rankBadge}>1</div>
            </div>
            <p className={styles.podiumName}>{topThree[0].name.split(' ')[0]}</p>
            <div className={styles.podiumScore}>{topThree[0].greenScore}</div>
            <div className={styles.baseBlock}></div>
          </div>

          {/* Bronze - 3rd */}
          <div className={`${styles.podiumItem} ${styles.third}`}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>{topThree[2].name.charAt(0)}</div>
              <div className={styles.rankBadge}>3</div>
            </div>
            <p className={styles.podiumName}>{topThree[2].name.split(' ')[0]}</p>
            <div className={styles.podiumScore}>{topThree[2].greenScore}</div>
            <div className={styles.baseBlock}></div>
          </div>
        </div>
      )}

      {/* Table List */}
      <div className={styles.listSection}>
        {leaderboard.map((entry, index) => (
          <div 
            key={entry.rank} 
            className={`${styles.row} ${entry.isCurrentUser ? styles.highlightRow : ''}`}
          >
            <div className={styles.rankNum}>
              {index === 0 ? <Trophy size={18} color="#fbbf24" /> : entry.rank}
            </div>
            
            <div className={styles.userCore}>
              <div className={styles.smallAvatar}>
                {entry.name.charAt(0)}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>
                  {entry.name} {entry.isCurrentUser && <span className={styles.youTag}>YOU</span>}
                </span>
                <div className={styles.stats}>
                  <span className={styles.statItem}><Flame size={12} /> {entry.streakCount}</span>
                  <span className={styles.statItem}><Medal size={12} /> {entry.badgeCount}</span>
                </div>
              </div>
            </div>

            <div className={styles.finalScore}>
              <span className={styles.pts}>{entry.greenScore}</span>
              <span className={styles.ptsLabel}>PTS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Leaderboard