import { useEffect, useState } from 'react'
import AsyncState from '../components/AsyncState.jsx'

const TOPICS = ['react', 'javascript', 'css', 'redux', 'web accessibility']

// Shown only if every online source fails, so the page is never empty during a demo.
const OFFLINE_BOOKS = [
  { id: 'o1', title: 'Learning React', author: 'Alex Banks, Eve Porcello', year: '2020', link: 'https://react.dev/learn' },
  { id: 'o2', title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', year: '2018', link: 'https://eloquentjavascript.net' },
  { id: 'o3', title: 'CSS: The Definitive Guide', author: 'Eric A. Meyer', year: '2017', link: 'https://developer.mozilla.org/docs/Web/CSS' },
  { id: 'o4', title: 'Redux Toolkit documentation', author: 'Redux team', year: '2024', link: 'https://redux-toolkit.js.org' },
  { id: 'o5', title: 'Inclusive Design Patterns', author: 'Heydon Pickering', year: '2016', link: 'https://developer.mozilla.org/docs/Web/Accessibility' },
]

// fetch() that gives up after a few seconds instead of hanging forever
async function getJson(url, outerSignal) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  outerSignal.addEventListener('abort', () => controller.abort())
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error('Server answered ' + res.status)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function fromGoogleBooks(topic, signal) {
  const data = await getJson(
    'https://www.googleapis.com/books/v1/volumes?maxResults=8&q=' + encodeURIComponent(topic),
    signal
  )
  return (data.items || []).map((item) => ({
    id: item.id,
    title: item.volumeInfo.title,
    author: item.volumeInfo.authors?.join(', ') || 'Unknown author',
    year: (item.volumeInfo.publishedDate || '').slice(0, 4),
    link: item.volumeInfo.infoLink,
  }))
}

async function fromOpenLibrary(topic, signal) {
  const data = await getJson(
    'https://openlibrary.org/search.json?limit=8&q=' + encodeURIComponent(topic),
    signal
  )
  return (data.docs || []).map((d) => ({
    id: d.key,
    title: d.title,
    author: d.author_name?.[0] || 'Unknown author',
    year: d.first_publish_year ? String(d.first_publish_year) : '',
    link: 'https://openlibrary.org' + d.key,
  }))
}

// Try each source in order and use the first one that works.
async function loadBooks(topic, signal) {
  for (const source of [fromGoogleBooks, fromOpenLibrary]) {
    try {
      return { books: await source(topic, signal), offline: false }
    } catch (err) {
      if (signal.aborted) throw err
    }
  }
  return { books: OFFLINE_BOOKS, offline: true }
}

export default function Resources() {
  const [topic, setTopic] = useState('react')
  const [state, setState] = useState({ status: 'loading', books: [], offline: false, error: '' })
  const [attempt, setAttempt] = useState(0) // changing this re-runs the effect (retry)

  useEffect(() => {
    const controller = new AbortController()
    setState((s) => ({ ...s, status: 'loading' }))

    loadBooks(topic, controller.signal)
      .then(({ books, offline }) => setState({ status: 'succeeded', books, offline, error: '' }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: 'failed', books: [], offline: false, error: 'Could not load books. Check your connection and try again.' })
        }
      })

    return () => controller.abort()
  }, [topic, attempt])

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <div>
          <h1>Reading resources</h1>
          <p className="muted">Books for the topic you pick, loaded live from Google Books (Open Library as backup).</p>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Topic">
        {TOPICS.map((t) => (
          <button key={t} type="button" className={t === topic ? 'chip active' : 'chip'} onClick={() => setTopic(t)}>
            {t}
          </button>
        ))}
      </div>

      {state.offline && state.status === 'succeeded' && (
        <p className="form-error" role="status">
          Could not reach the online book services, so this is a short saved list.{' '}
          <button type="button" className="btn-text" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
        </p>
      )}

      <AsyncState
        status={state.status}
        error={state.error}
        onRetry={() => setAttempt((n) => n + 1)}
        isEmpty={state.books.length === 0}
        empty={`No books found for "${topic}".`}
        rows={5}
      >
        <ul className="book-grid">
          {state.books.map((b) => (
            <li key={b.id} className="book">
              <a href={b.link} target="_blank" rel="noreferrer" className="book-title">{b.title}</a>
              <span className="muted">{b.author}</span>
              {b.year && <span className="book-year">First published {b.year}</span>}
            </li>
          ))}
        </ul>
      </AsyncState>
    </div>
  )
}
