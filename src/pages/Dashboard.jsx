import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../context/AuthContext.jsx'
import { loadAssignments, selectAssignments, selectPlanSummary } from '../store/slices'
import { getSubmission, getSubmissionsForAssignment } from '../lib/storage'
import AsyncState from '../components/AsyncState.jsx'
import { daysUntil, formatDue } from '../components/AssignmentRow.jsx'

function Stat({ value, label }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const dispatch = useDispatch()
  const { status, error } = useSelector((s) => s.assignments)
  const assignments = useSelector(selectAssignments)
  const plan = useSelector(selectPlanSummary)
  const isTeacher = user.role === 'teacher'

  // per-assignment numbers drive both the stat tiles and the bar chart
  const rows = assignments.map((a) => ({
    a,
    count: isTeacher ? getSubmissionsForAssignment(a.id).length : getSubmission(user.email, a.id) ? 1 : 0,
  }))
  const done = rows.filter((r) => r.count > 0).length
  const totalSubs = rows.reduce((n, r) => n + r.count, 0)
  const maxCount = Math.max(1, ...rows.map((r) => r.count))
  const upcoming = assignments.filter((a) => daysUntil(a.due) >= 0).slice(0, 3)
  const pointsIn = rows.filter((r) => r.count > 0).reduce((n, r) => n + r.a.points, 0)

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <div>
          <h1>Hello, {user.name.split(' ')[0]}</h1>
          <p className="muted">{isTeacher ? 'Here is how your class is doing.' : 'Here is where your work stands.'}</p>
        </div>
      </div>

      <AsyncState status={status} error={error} onRetry={() => dispatch(loadAssignments())} rows={3}>
        <div className="stats">
          {isTeacher ? (
            <>
              <Stat value={assignments.length} label="assignments issued" />
              <Stat value={totalSubs} label="submissions received" />
              <Stat value={assignments.length - done} label="still waiting on work" />
            </>
          ) : (
            <>
              <Stat value={`${done}/${assignments.length}`} label="assignments submitted" />
              <Stat value={pointsIn} label="points turned in" />
              <Stat value={plan.totalHours} label="study hours planned" />
            </>
          )}
        </div>

        <div className="dash-grid">
          <section className="panel">
            <h2>{isTeacher ? 'Submissions per assignment' : 'Progress by assignment'}</h2>
            <ul className="bars">
              {rows.map(({ a, count }) => (
                <li key={a.id}>
                  <span className="bar-label">{a.title}</span>
                  <span className="bar-track">
                    <span className="bar-fill" style={{ width: `${(count / (isTeacher ? maxCount : 1)) * 100}%` }} />
                  </span>
                  <span className="bar-num">{isTeacher ? count : count ? 'Done' : '—'}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>Coming up</h2>
            {upcoming.length === 0 ? (
              <p className="muted">Nothing due in the future. Enjoy the quiet.</p>
            ) : (
              <ul className="upcoming">
                {upcoming.map((a) => (
                  <li key={a.id}>
                    <Link to={`/assignments/${a.id}`}>{a.title}</Link>
                    <span className="muted">{formatDue(a.due)} · {a.points} pts</span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/assignments" className="panel-link">See all assignments</Link>
          </section>
        </div>
      </AsyncState>
    </div>
  )
}
