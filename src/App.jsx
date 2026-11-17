import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Assignments from './pages/Assignments.jsx'
import Assignment from './pages/Assignment.jsx'
import StudyPlan from './pages/StudyPlan.jsx'
import Resources from './pages/Resources.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'

// Multi-page SPA structure with nested routes:
//   AppLayout (nav + footer + <Outlet/>)
//     ├─ "/"                      public landing + sign in
//     ├─ ProtectedRoute           redirects to "/" when signed out
//     │    ├─ /dashboard, /assignments, /assignments/:id, /resources, /profile
//     │    └─ ProtectedRoute role="student" → /study-plan
//     └─ *                        404
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="assignments/:id" element={<Assignment />} />
          <Route path="resources" element={<Resources />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute role="student" />}>
          <Route path="study-plan" element={<StudyPlan />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
