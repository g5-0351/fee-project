import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Nav() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const planCount = useSelector((s) => s.plan.length)
  const navigate = useNavigate()

  function handleSignOut() {
    logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')

  return (
    <header className="nav">
      <Link to={user ? '/dashboard' : '/'} className="nav-mark">
        Assignment Submission Portal
      </Link>

      {user && (
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/dashboard" className={linkClass}>Overview</NavLink>
          <NavLink to="/assignments" className={linkClass}>Assignments</NavLink>
          {user.role === 'student' && (
            <NavLink to="/study-plan" className={linkClass}>
              Study plan
              {planCount > 0 && <span className="count-badge">{planCount}</span>}
            </NavLink>
          )}
          <NavLink to="/resources" className={linkClass}>Resources</NavLink>
        </nav>
      )}

      <div className="nav-user">
        <button
          type="button"
          className="icon-btn"
          onClick={toggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
          )}
        </button>
        {user && (
          <>
            <Link to="/profile" className="nav-profile" title="Your profile">
              <span className="avatar">{user.name?.trim()?.[0]?.toUpperCase() ?? '?'}</span>
              <span className="nav-name">{user.name}</span>
              <span className={`role-badge role-badge-${user.role}`}>{user.role === 'teacher' ? 'Teacher' : 'Student'}</span>
            </Link>
            <button onClick={handleSignOut} className="btn-text">Sign out</button>
          </>
        )}
      </div>
    </header>
  )
}
