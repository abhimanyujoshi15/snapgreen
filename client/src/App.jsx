import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Scanner from './pages/Scanner'
import History from './pages/History'
import Badges from './pages/Badges'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'

const authRoutes = ['/login', '/register']

const Layout = ({ children }) => {
  const location = useLocation()
  const showNav = !authRoutes.includes(location.pathname)
  return (
    <>
      {children}
      {showNav && <Navbar />}
    </>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path='/' element={<Navigate to='/login' replace />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path='/scanner' element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
            <Route path='/history' element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path='/badges' element={<ProtectedRoute><Badges /></ProtectedRoute>} />
            <Route path='/leaderboard' element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route
                path='/profile'
                element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App