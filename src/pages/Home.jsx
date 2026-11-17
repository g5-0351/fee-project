import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import useForm from '../hooks/useForm.js'
import { required, email, minLen, matches, strongPassword, passwordScore } from '../lib/validators'
import { TextField, PasswordMeter } from '../components/forms/Field.jsx'

export default function Home() {
  const { user, login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [role, setRole] = useState('student')
  const [serverError, setServerError] = useState('')

  // validation rules change with the mode: sign-in is lenient, sign-up is strict
  const rules =
    mode === 'login'
      ? { email: [required('Email'), email], password: [required('Password')] }
      : {
          name: [required('Name'), minLen(2, 'Name')],
          email: [required('Email'), email],
          password: [required('Password'), strongPassword],
          confirm: [matches('password', 'Passwords do not match.')],
        }
  const form = useForm({ name: '', email: '', password: '', confirm: '' }, rules)

  if (user) return <Navigate to="/dashboard" replace />

  function switchMode(next) {
    setMode(next)
    setServerError('')
    form.reset()
  }

  function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    if (!form.validateAll()) return
    const { name, email: mail, password } = form.values
    const result = mode === 'login' ? login({ email: mail, password }) : register({ name, email: mail, password, role })
    if (!result.ok) setServerError(result.error)
  }

  return (
    <div className="home">
      <section className="hero">
        <p className="hero-eyebrow">For classrooms, not committees</p>
        <h1>Assign the work. Turn it in. Plan the time it takes.</h1>
        <p className="hero-lede">
          Teachers post assignments with a due date and a brief. Students submit their answer, then
          build a study plan that adds up the hours — no lost links, no "did you get my email."
        </p>
        <svg
          className="hero-art"
          viewBox="0 0 320 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="18" y="128" width="284" height="10" rx="2" fill="var(--paper-line)" />
          <g transform="translate(34,58)">
            <rect x="0" y="40" width="86" height="34" rx="2" fill="var(--surface)" stroke="var(--ink)" strokeOpacity="0.15" />
            <rect x="6" y="0" width="74" height="46" rx="2" fill="var(--accent)" />
            <path d="M6 14 H80" stroke="var(--surface)" strokeOpacity="0.5" strokeWidth="2" />
            <path d="M6 24 H80" stroke="var(--surface)" strokeOpacity="0.5" strokeWidth="2" />
            <path d="M6 34 H56" stroke="var(--surface)" strokeOpacity="0.5" strokeWidth="2" />
          </g>
          <g transform="translate(140,30)">
            <rect x="0" y="0" width="58" height="74" rx="2" fill="var(--surface)" stroke="var(--ink)" strokeOpacity="0.18" />
            <path d="M10 16 H48 M10 28 H48 M10 40 H36" stroke="var(--ink)" strokeOpacity="0.25" strokeWidth="2" />
            <circle cx="46" cy="60" r="13" fill="var(--danger)" />
            <path d="M40 60 L44.5 65 L53 55" stroke="var(--surface)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g transform="translate(218,10)">
            <circle cx="46" cy="34" r="34" fill="var(--accent-soft)" />
            <path d="M20 26 L46 14 L72 26 L46 38 Z" fill="var(--accent)" />
            <path d="M30 31 V45 C30 49 62 49 62 45 V31" stroke="var(--accent)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <line x1="72" y1="26" x2="72" y2="44" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </section>

      <section className="auth-card">
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => switchMode('login')} type="button">
            Sign in
          </button>
          <button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => switchMode('register')} type="button">
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {mode === 'register' && (
            <>
              <div className="role-picker">
                <button
                  type="button"
                  className={role === 'student' ? 'role-option active' : 'role-option'}
                  onClick={() => setRole('student')}
                >
                  <span className="role-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 4 3 8l9 4 9-4-9-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M7 11v5c0 1.4 2.2 3 5 3s5-1.6 5-3v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>
                    <strong>Student</strong>
                    <small>Submit assignments</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={role === 'teacher' ? 'role-option active' : 'role-option'}
                  onClick={() => setRole('teacher')}
                >
                  <span className="role-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M7 20h10M12 17v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M7.5 13.5 10 9l2 3 2.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>
                    <strong>Teacher</strong>
                    <small>Assign &amp; review work</small>
                  </span>
                </button>
              </div>
              <TextField label="Name" autoComplete="name" {...form.bind('name')} />
            </>
          )}
          <TextField label="Email" type="email" autoComplete="email" {...form.bind('email')} />
          <TextField
            label="Password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            {...form.bind('password')}
          />
          {mode === 'register' && (
            <>
              <PasswordMeter score={passwordScore(form.values.password)} />
              <TextField label="Confirm password" type="password" autoComplete="new-password" {...form.bind('confirm')} />
            </>
          )}

          {serverError && <p className="form-error" role="alert">{serverError}</p>}

          <button type="submit" className="btn-primary">
            {mode === 'login' ? 'Sign in' : `Create ${role} account`}
          </button>
        </form>
      </section>
    </div>
  )
}
