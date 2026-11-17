import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '../context/ToastContext.jsx'
import { clearPlan, removeFromPlan, selectPlanSummary, setHours } from '../store/slices'
import AsyncState from '../components/AsyncState.jsx'
import { daysUntil } from '../components/AssignmentRow.jsx'

// Mini project: "shopping cart". Items = assignments, quantity = hours, totals = hours + points.
// All of the state lives in the Redux plan slice; this page only dispatches actions.
export default function StudyPlan() {
  const dispatch = useDispatch()
  const notify = useToast()
  const status = useSelector((s) => s.assignments.status)
  const { lines, totalHours, totalPoints } = useSelector(selectPlanSummary)

  const nearest = lines.length ? Math.min(...lines.map((l) => daysUntil(l.assignment.due))) : null
  const perDay = nearest !== null && nearest > 0 ? (totalHours / nearest).toFixed(1) : null

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <div>
          <h1>Study plan</h1>
          <p className="muted">Pick the work you want to tackle and set how many hours each piece gets.</p>
        </div>
        {lines.length > 0 && (
          <button type="button" className="btn-text" onClick={() => { dispatch(clearPlan()); notify('Plan cleared') }}>
            Clear plan
          </button>
        )}
      </div>

      <AsyncState
        status={status}
        isEmpty={lines.length === 0}
        empty={<>Your plan is empty. <Link to="/assignments">Browse assignments</Link> and tap “+ Plan”.</>}
        rows={3}
      >
        <div className="plan-layout">
          <ul className="plan-list">
            {lines.map(({ id, hours, assignment: a }) => (
              <li key={id} className="plan-item">
                <div className="plan-info">
                  <Link to={`/assignments/${id}`} className="ledger-title">{a.title}</Link>
                  <span className="muted">{a.points} pts · due in {Math.max(0, daysUntil(a.due))} days</span>
                </div>
                <div className="stepper" role="group" aria-label={`Hours for ${a.title}`}>
                  <button type="button" onClick={() => dispatch(setHours({ id, hours: hours - 1 }))} disabled={hours <= 1} aria-label="Fewer hours">−</button>
                  <span>{hours}h</span>
                  <button type="button" onClick={() => dispatch(setHours({ id, hours: hours + 1 }))} disabled={hours >= 20} aria-label="More hours">+</button>
                </div>
                <button type="button" className="btn-text" onClick={() => dispatch(removeFromPlan(id))}>Remove</button>
              </li>
            ))}
          </ul>

          <aside className="panel plan-summary">
            <h2>Summary</h2>
            <dl>
              <div><dt>Assignments</dt><dd>{lines.length}</dd></div>
              <div><dt>Total hours</dt><dd>{totalHours}h</dd></div>
              <div><dt>Points in play</dt><dd>{totalPoints}</dd></div>
              {perDay && <div><dt>Hours per day until first deadline</dt><dd>{perDay}h</dd></div>}
            </dl>
          </aside>
        </div>
      </AsyncState>
    </div>
  )
}
