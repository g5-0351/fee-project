// Handles the three non-happy states of any async request in one place:
// loading (skeleton), error (message + retry) and empty. Children render on success.
export default function AsyncState({ status, error, onRetry, isEmpty, empty, rows = 4, children }) {
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="skeletons" aria-busy="true" aria-label="Loading">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton" />
        ))}
      </div>
    )
  }
  if (status === 'failed') {
    return (
      <div className="state-box state-error" role="alert">
        <p><strong>Something went wrong.</strong></p>
        <p className="muted">{error}</p>
        {onRetry && <button type="button" className="btn-primary" onClick={onRetry}>Try again</button>}
      </div>
    )
  }
  if (isEmpty) return <div className="state-box"><p className="muted">{empty}</p></div>
  return children
}
