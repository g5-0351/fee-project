import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p className="muted">There's nothing at this address.</p>
      <Link to="/" className="btn-primary">Go home</Link>
    </div>
  )
}
