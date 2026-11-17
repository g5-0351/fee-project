import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { addToPlan, createAssignment, loadAssignments, selectAssignments } from '../store/slices'
import { getSubmission, getSubmissionsForAssignment } from '../lib/storage'
import useForm from '../hooks/useForm.js'
import { required, minLen, positiveNumber } from '../lib/validators'
import { TextField, TextAreaField } from '../components/forms/Field.jsx'
import AsyncState from '../components/AsyncState.jsx'
import AssignmentRow from '../components/AssignmentRow.jsx'

const rules = {
  title: [required('Title'), minLen(3, 'Title')],
  due: [required('Due date')],
  points: [positiveNumber('Points')],
  summary: [required('Summary'), minLen(10, 'Summary')],
  instructions: [],
}
const empty = { title: '', due: '', points: 10, summary: '', instructions: '' }

function NewAssignmentForm({ onDone }) {
  const { user } = useAuth()
  const dispatch = useDispatch()
  const notify = useToast()
  const form = useForm(empty, rules)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.validateAll()) return
    await dispatch(createAssignment({ form: form.values, teacher: user }))
    notify('Assignment posted to the class')
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="panel new-assignment-form" noValidate>
      <TextField label="Title" placeholder="e.g. CSS Grid Gallery" {...form.bind('title')} />
      <div className="two-col">
        <TextField label="Due date" type="date" {...form.bind('due')} />
        <TextField label="Points" type="number" min="1" {...form.bind('points')} />
      </div>
      <TextField label="Short summary" placeholder="One line describing the task" {...form.bind('summary')} />
      <TextAreaField label="Full instructions (optional)" rows={4} hint="Falls back to the summary if left empty." {...form.bind('instructions')} />
      <button type="submit" className="btn-primary">Assign to class</button>
    </form>
  )
}

export default function Assignments() {
  const { user } = useAuth()
  const dispatch = useDispatch()
  const notify = useToast()
  const { status, error } = useSelector((s) => s.assignments)
  const assignments = useSelector(selectAssignments)
  const plan = useSelector((s) => s.plan)

  // local UI state: only this page cares about the search box, filter and form toggle
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | open | submitted
  const [showForm, setShowForm] = useState(false)
  const isTeacher = user.role === 'teacher'

  const visible = assignments.filter((a) => {
    const text = `${a.title} ${a.summary}`.toLowerCase().includes(query.trim().toLowerCase())
    const sub = !isTeacher && getSubmission(user.email, a.id)
    if (filter === 'open') return text && !sub
    if (filter === 'submitted') return text && sub
    return text
  })

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <div>
          <h1>{isTeacher ? "Assignments you've issued" : 'Your assignments'}</h1>
          <p className="muted">{assignments.length} in total</p>
        </div>
        {isTeacher && (
          <button className="btn-add" onClick={() => setShowForm((s) => !s)} type="button">
            {showForm ? 'Cancel' : '+ New assignment'}
          </button>
        )}
      </div>

      {isTeacher && showForm && <NewAssignmentForm onDone={() => setShowForm(false)} />}

      <div className="toolbar">
        <input
          type="search"
          className="search"
          placeholder="Search assignments"
          aria-label="Search assignments"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {!isTeacher && (
          <div className="segmented" role="group" aria-label="Filter">
            {['all', 'open', 'submitted'].map((f) => (
              <button key={f} type="button" className={filter === f ? 'seg active' : 'seg'} onClick={() => setFilter(f)}>
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <AsyncState
        status={status}
        error={error}
        onRetry={() => dispatch(loadAssignments())}
        isEmpty={visible.length === 0}
        empty={assignments.length === 0 ? 'Nothing assigned yet.' : 'No assignments match that search.'}
      >
        <ul className="ledger">
          {visible.map((a) => {
            if (isTeacher) {
              const n = getSubmissionsForAssignment(a.id).length
              return (
                <AssignmentRow
                  key={a.id}
                  a={a}
                  pill={<span className={n ? 'pill pill-done' : 'pill'}>{n} submission{n === 1 ? '' : 's'}</span>}
                />
              )
            }
            const sub = getSubmission(user.email, a.id)
            const inPlan = plan.some((p) => p.id === a.id)
            return (
              <AssignmentRow
                key={a.id}
                a={a}
                pill={<span className={sub ? 'pill pill-done' : 'pill'}>{sub ? 'Submitted' : 'Not submitted'}</span>}
                action={
                  !sub && (
                    <button
                      type="button"
                      className={inPlan ? 'plan-btn in' : 'plan-btn'}
                      disabled={inPlan}
                      onClick={() => {
                        dispatch(addToPlan(a.id))
                        notify(`Added "${a.title}" to your study plan`)
                      }}
                    >
                      {inPlan ? 'In plan' : '+ Plan'}
                    </button>
                  )
                }
              />
            )
          })}
        </ul>
      </AsyncState>
    </div>
  )
}
