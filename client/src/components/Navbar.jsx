import { useLocation, useNavigate } from 'react-router-dom'
import styles from './Navbar.module.css'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
  { path: '/dashboard', icon: '🏠', label: 'Home' },
  { path: '/scanner', icon: '📷', label: 'Scan' },
  { path: '/history', icon: '📋', label: 'History' },
  { path: '/badges', icon: '🏅', label: 'Badges' },
  { path: '/profile', icon: '👤', label: 'Profile' },
]

  const isActive = (path) => location.pathname === path

  return (
    <nav className={styles.navbar}>
      {tabs.map((tab) => (
        <button
          key={tab.path}
          className={`${styles.tab} ${isActive(tab.path) ? styles.active : ''}`}
          onClick={() => navigate(tab.path)}
        >
          {/* Scanner tab gets special treatment */}
          {tab.path === '/scanner' ? (
            <div className={styles.scanBtn}>
              <span className={styles.scanIcon}>{tab.icon}</span>
            </div>
          ) : (
            <>
              <span className={styles.icon}>{tab.icon}</span>
              <span className={styles.label}>{tab.label}</span>
            </>
          )}
        </button>
      ))}
    </nav>
  )
}

export default Navbar