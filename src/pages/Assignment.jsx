import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { addToPlan, loadAssignments, selectAssignments } from '../store/slices'
import { getSubmission, saveSubmission, getSubmissionsForAssignment } from '../lib/storage'
import useForm from '../hooks/useForm.js'
import { required, minLen, maxLen } from '../lib/validators'
import { TextAreaField } from '../components/forms/Field.jsx'
import AsyncState from '../components/AsyncState.jsx'

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function TeacherView({ assignment }) {
  const submissions = getSubmissionsForAssignment(assignment.id)
  return (
    <>
      <div className="submissions-head">
        <h2>Submissions</h2>
        <span className="pill pill-done">{submissions.length} turned in</span>
      </div>
      {submissions.length === 0 ? (
        <div className="state-box"><p className="muted">No one has submitted this yet.</p></div>
      ) : (
        <ul className="submission-list">
          {submissions.map((s) => (
            <li key={s.studentEmail} className="submission-card">
              <div className="submission-card-head">
                <span className="avatar avatar-sm">{s.studentName?.[0]?.toUpperCase() ?? '?'}</span>
                <div>
                  <p className="submission-name">{s.studentName}</p>
                  <p className="muted submission-time">Submitted {formatDateTime(s.submittedAt)}</p>
                </div>
              </div>
              <p className="submission-text">{s.text}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function StudentView({ user, assignment }) {
  const notify = useToast()
  const dispatch = useDispatch()
  const inPlan = useSelector((s) => s.plan.some((p) => p.id === assignment.id))
  const [submission, setSubmission] = useState(() => getSubmission(user.email, assignment.id))
  const form = useForm(
    { answer: submission?.text ?? '' },
    { answer: [required('Your submission'), minLen(20, 'Your submission'), maxLen(4000, 'Your submission')] }
  )

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.validateAll()) return
    saveSubmission(user, assignment.id, form.values.answer)
    setSubmission(getSubmission(user.email, assignment.id))
    notify(submission ? 'Resubmitted' : 'Submitted — nice work')
  }

  return (
    <form onSubmit={handleSubmit} className="submit-form" noValidate>
      <TextAreaField
        label="Your submission"
        rows={8}
        placeholder="Paste a link, write your answer, or describe your approach..."
        hint={`${form.values.answer.length}/4000 characters · at least 20 to submit`}
        {...form.bind('answer')}
      />
      <div className="submit-row">
        <button type="submit" className="btn-primary">{submission ? 'Resubmit' : 'Submit'}</button>
        {!submission && !inPlan && (
          <button type="button" className="btn-ghost" onClick={() => { dispatch(addToPlan(assignment.id)); notify('Added to your study plan') }}>
            Add to study plan
          </button>
        )}
        {submission && <span className="muted">Last submitted {formatDateTime(submission.submittedAt)}</span>}
      </div>
    </form>
  )
}

export default function Assignment() {
  const { id } = useParams()
  const { user } = useAuth()
  const dispatch = useDispatch()
  const { status, error } = useSelector((s) => s.assignments)
  const assignment = useSelector(selectAssignments).find((a) => a.id === id)

  // once the list has loaded, an unknown id means a bad link
  if (status === 'succeeded' && !assignment) return <Navigate to="/assignments" replace />

  return (
    <div className="assignment">
      <Link to="/assignments" className="back-link">← All assignments</Link>
      <AsyncState status={assignment ? 'succeeded' : status} error={error} onRetry={() => dispatch(loadAssignments())} rows={3}>
        {assignment && (
          <>
            <h1>{assignment.title}</h1>
            <p className="assignment-meta">
              Due{' '}
              {new Date(assignment.due + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              {' · '}{assignment.points} points
              {assignment.issuedBy && ` · Issued by ${assignment.issuedBy}`}
            </p>
            <p className="assignment-instructions">{assignment.instructions}</p>
            {user.role === 'teacher' ? <TeacherView assignment={assignment} /> : <StudentView user={user} assignment={assignment} />}
          </>
        )}
      </AsyncState>
    </div>
  )
}
