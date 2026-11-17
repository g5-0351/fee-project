import { Link } from 'react-router-dom'

export function formatDue(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// whole days from today until the due date (negative = overdue)
export function daysUntil(dateStr) {
  const today = new Date(new Date().toDateString())
  return Math.round((new Date(dateStr + 'T00:00:00') - today) / 86400000)
}

export default function AssignmentRow({ a, pill, action }) {
  const d = daysUntil(a.due)
  const dueText = d < 0 ? `Overdue ${-d}d` : d === 0 ? 'Due today' : d <= 7 ? `Due in ${d}d` : `Due ${formatDue(a.due)}`
  return (
    <li className="ledger-item">
      <Link to={`/assignments/${a.id}`} className="ledger-row">
        <div className="ledger-main">
          <span className="ledger-title">
            {a.title}
            {a.custom && <span className="tag-custom">your own</span>}
          </span>
          <span className="ledger-summary">{a.summary}</span>
        </div>
        <div className="ledger-meta">
          <span className="ledger-points">{a.points} pts</span>
          <span className={d < 0 ? 'ledger-due late' : d <= 3 ? 'ledger-due soon' : 'ledger-due'}>{dueText}</span>
          {pill}
        </div>
      </Link>
      {action}
    </li>
  )
}
