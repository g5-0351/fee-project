import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Nav from '../components/Nav.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { loadAssignments } from '../store/slices'

export default function AppLayout() {
  const { user } = useAuth()
  const dispatch = useDispatch()
  const status = useSelector((s) => s.assignments.status)

  useEffect(() => {
    if (user && status === 'idle') dispatch(loadAssignments())
  }, [user, status, dispatch])

  return (
    <div className="shell">
      <div className="aurora" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>
      <Nav />
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">
        Assignment Submission Portal · Front End Engineering-II · built with React, React Router, Context API &amp; Redux Toolkit
      </footer>
    </div>
  )
}
