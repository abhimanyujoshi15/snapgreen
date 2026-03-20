const BADGES = [
  {
    id: 'first_scan',
    name: 'First Step',
    description: 'Completed your first scan',
    icon: '🌱',
    condition: (stats) => stats.totalScans >= 1
  },
  {
    id: 'scan_10',
    name: 'Curious Scanner',
    description: 'Scanned 10 products',
    icon: '🔍',
    condition: (stats) => stats.totalScans >= 10
  },
  {
    id: 'scan_50',
    name: 'Eco Explorer',
    description: 'Scanned 50 products',
    icon: '🧭',
    condition: (stats) => stats.totalScans >= 50
  },
  {
    id: 'scan_100',
    name: 'Green Legend',
    description: 'Scanned 100 products',
    icon: '🏆',
    condition: (stats) => stats.totalScans >= 100
  },
  {
    id: 'green_5',
    name: 'Green Starter',
    description: 'Made 5 green choices (A or B grade)',
    icon: '🌿',
    condition: (stats) => stats.goodScans >= 5
  },
  {
    id: 'green_20',
    name: 'Eco Champion',
    description: 'Made 20 green choices',
    icon: '🥇',
    condition: (stats) => stats.goodScans >= 20
  },
  {
    id: 'green_percent_80',
    name: 'Planet Protector',
    description: '80% of your scans are green choices',
    icon: '🌍',
    condition: (stats) => stats.totalScans >= 5 && stats.greenPercent >= 80
  },
  {
    id: 'streak_3',
    name: 'On a Roll',
    description: 'Scanned products 3 days in a row',
    icon: '🔥',
    condition: (stats) => stats.streakCount >= 3
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Scanned products 7 days in a row',
    icon: '⚡',
    condition: (stats) => stats.streakCount >= 7
  },
  {
    id: 'photo_scan',
    name: 'Snap Happy',
    description: 'Used photo scan for the first time',
    icon: '📸',
    condition: (stats) => stats.photoScans >= 1
  },
  {
    id: 'avoid_f',
    name: 'Conscious Consumer',
    description: 'Never scanned an F grade product',
    icon: '✨',
    condition: (stats) => stats.totalScans >= 5 && stats.fScans === 0
  },
]

// Check which badges user has earned and return new ones
const checkBadges = (currentBadges, stats) => {
  const newBadges = []

  for (const badge of BADGES) {
    const alreadyEarned = currentBadges.includes(badge.id)
    if (!alreadyEarned && badge.condition(stats)) {
      newBadges.push(badge.id)
    }
  }

  return newBadges
}

module.exports = { BADGES, checkBadges }