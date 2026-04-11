import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  ScanLine,
  History,
  Medal,
  Trophy,
  User,
  LogOut,
  Leaf,
  ChevronRight
} from 'lucide-react'
import styles from './Navbar.module.css'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const tabs = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { path: '/scanner', icon: <ScanLine size={20} />, label: 'Eco Scanner' },
    { path: '/history', icon: <History size={20} />, label: 'My Scans' },
    { path: '/badges', icon: <Medal size={20} />, label: 'Achievements' },
    { path: '/leaderboard', icon: <Trophy size={20} />, label: 'Ranking' },
    { path: '/profile', icon: <User size={20} />, label: 'Account' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <aside className={styles.sidebar}>
      {/* Brand Branding */}
      <div className={styles.brand} onClick={() => navigate('/dashboard')}>
        <div className={styles.logoContainer}>
          <Leaf size={22} fill="#10b981" color="#10b981" />
        </div>
        <div className={styles.brandText}>
          <span className={styles.appName}>SnapGreen</span>
          <span className={styles.appTag}>Eco-Assistant</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.navigation}>
        <div className={styles.navGroup}>
          <p className={styles.groupLabel}>Main Menu</p>
          {tabs.map((tab) => (
            <button
              key={tab.path}
              className={`${styles.navLink} ${isActive(tab.path) ? styles.activeLink : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <div className={styles.iconWrapper}>
                {tab.icon}
              </div>
              <span className={styles.linkLabel}>{tab.label}</span>
              {isActive(tab.path) && <ChevronRight size={14} className={styles.activeIndicator} />}
            </button>
          ))}
        </div>
      </nav>

      {/* User Footer */}
      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userMeta}>
            <p className={styles.userName}>{user?.name?.split(' ')[0]}</p>
            <p className={styles.userPoints}>
              <span className={styles.leafIcon}>🌿</span> {user?.greenScore || 0} pts
            </p>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={() => { logout(); navigate('/login') }}
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Navbar