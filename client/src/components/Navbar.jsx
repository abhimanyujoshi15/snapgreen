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
  Leaf
} from 'lucide-react'
import styles from './Navbar.module.css'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const tabs = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/scanner', icon: <ScanLine size={20} />, label: 'Scan Product' },
    { path: '/history', icon: <History size={20} />, label: 'Scan History' },
    { path: '/badges', icon: <Medal size={20} />, label: 'Badges' },
    { path: '/leaderboard', icon: <Trophy size={20} />, label: 'Leaderboard' },
    { path: '/profile', icon: <User size={20} />, label: 'Profile' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <aside className={styles.sidebar}>

      {/* Logo */}
      <div className={styles.logo} onClick={() => navigate('/dashboard')}>
        <div className={styles.logoIconBox}>
          <Leaf size={20} color='white' />
        </div>
        <span className={styles.logoText}>SnapGreen</span>
      </div>

      {/* Nav Links */}
      <nav className={styles.nav}>
        {tabs.map((tab) => (
          <button
            key={tab.path}
            className={`${styles.navItem} ${isActive(tab.path) ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className={`${styles.navIcon} ${isActive(tab.path) ? styles.activeIcon : ''}`}>
              {tab.icon}
            </span>
            <span className={styles.navLabel}>{tab.label}</span>
            {isActive(tab.path) && <div className={styles.activeBar} />}
          </button>
        ))}
      </nav>

      {/* Bottom User Info */}
      <div className={styles.userSection}>
        <div className={styles.userAvatar}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name}</span>
          <span className={styles.userScore}>🌿 {user?.greenScore || 0} pts</span>
        </div>
        <button
          className={styles.logoutIcon}
          onClick={() => { logout(); navigate('/login') }}
          title='Logout'
        >
          <LogOut size={16} color='#e53935' />
        </button>
      </div>

    </aside>
  )
}

export default Navbar