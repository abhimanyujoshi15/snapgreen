import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Profile.module.css'
import {
  Camera,
  ClipboardList,
  Medal,
  Trophy,
  LogOut,
  ChevronRight,
  Leaf,
  Flame,
  Award,
  Settings
} from 'lucide-react'

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    {
      icon: <Camera size={22} />,
      label: 'Scan a Product',
      sub: 'Check eco impact instantly',
      action: () => navigate('/scanner'),
      color: '#10b981',
      bg: '#ecfdf5'
    },
    {
      icon: <ClipboardList size={22} />,
      label: 'My History',
      sub: 'Past scans and impacts',
      action: () => navigate('/history'),
      color: '#6366f1',
      bg: '#eef2ff'
    },
    {
      icon: <Medal size={22} />,
      label: 'Achievement Badges',
      sub: `${user?.badges?.length || 0} milestones unlocked`,
      action: () => navigate('/badges'),
      color: '#f59e0b',
      bg: '#fffbeb'
    },
    {
      icon: <Trophy size={22} />,
      label: 'Global Leaderboard',
      sub: 'See how you rank',
      action: () => navigate('/leaderboard'),
      color: '#3b82f6',
      bg: '#eff6ff'
    },
  ]

  return (
    <div className={styles.container}>
      {/* Profile Header Card */}
      <div className={styles.profileHeader}>
        <div className={styles.topActions}>
           <div className={styles.appLogo}>
             <Leaf size={20} fill="#10b981" color="#10b981" />
             <span>SnapGreen</span>
           </div>
           <button className={styles.settingsBtn}><Settings size={20} /></button>
        </div>

        <div className={styles.userHero}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.levelBadge}>Level 4</div>
          </div>
          <h1 className={styles.userName}>{user?.name}</h1>
          <p className={styles.userEmail}>{user?.email}</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{user?.greenScore || 0}</span>
            <span className={styles.statLabel}>Green Pts</span>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statWithIcon}>
               <span className={styles.statValue}>{user?.streakCount || 0}</span>
               <Flame size={16} color="#ef4444" fill="#ef4444" />
            </div>
            <span className={styles.statLabel}>Day Streak</span>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statWithIcon}>
               <span className={styles.statValue}>{user?.badges?.length || 0}</span>
               <Award size={16} color="#f59e0b" fill="#f59e0b" />
            </div>
            <span className={styles.statLabel}>Badges</span>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <div className={styles.menuSection}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.menuList}>
          {menuItems.map((item, i) => (
            <button key={i} className={styles.menuItem} onClick={item.action}>
              <div className={styles.iconContainer} style={{ background: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <div className={styles.menuInfo}>
                <span className={styles.itemLabel}>{item.label}</span>
                <span className={styles.itemSub}>{item.sub}</span>
              </div>
              <ChevronRight size={18} className={styles.chevron} />
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className={styles.footer}>
        <div className={styles.logoutWrapper}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
        <div className={styles.versionInfo}>
          <p>SnapGreen v1.0.4 (Beta)</p>
          <p>Together for a greener planet 🌍</p>
        </div>
      </div>
    </div>
  )
}

export default Profile