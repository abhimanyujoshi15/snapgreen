import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Profile.module.css'

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    {
      icon: '📷',
      label: 'Scan a Product',
      sub: 'Check eco impact',
      action: () => navigate('/scanner')
    },
    {
      icon: '📋',
      label: 'Scan History',
      sub: 'View all past scans',
      action: () => navigate('/history')
    },
    {
      icon: '🏅',
      label: 'My Badges',
      sub: `${user?.badges?.length || 0} earned`,
      action: () => navigate('/badges')
    },
    {
      icon: '🏆',
      label: 'Leaderboard',
      sub: 'See global rankings',
      action: () => navigate('/leaderboard')
    },
  ]

  return (
    <div className={styles.container}>

      {/* Profile Hero */}
      <div className={styles.hero}>
        <div className={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h1 className={styles.name}>{user?.name}</h1>
        <p className={styles.email}>{user?.email}</p>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{user?.greenScore || 0}</span>
            <span className={styles.statLabel}>Green Score</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>{user?.streakCount || 0}</span>
            <span className={styles.statLabel}>Day Streak 🔥</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>{user?.badges?.length || 0}</span>
            <span className={styles.statLabel}>Badges 🏅</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className={styles.menu}>
        {menuItems.map((item, i) => (
          <button
            key={i}
            className={styles.menuItem}
            onClick={item.action}
          >
            <span className={styles.menuIcon}>{item.icon}</span>
            <div className={styles.menuText}>
              <span className={styles.menuLabel}>{item.label}</span>
              <span className={styles.menuSub}>{item.sub}</span>
            </div>
            <span className={styles.menuArrow}>›</span>
          </button>
        ))}
      </div>

      {/* App Info */}
      <div className={styles.appInfo}>
        <div className={styles.appLogo}>🌿</div>
        <p className={styles.appName}>SnapGreen</p>
        <p className={styles.appVersion}>Version 1.0.0</p>
        <p className={styles.appTagline}>
          Making every purchase a green choice
        </p>
      </div>

      {/* Logout */}
      <div className={styles.logoutSection}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

    </div>
  )
}

export default Profile