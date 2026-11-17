import { useId } from 'react'

// Reusable input components. Every form in the app (sign in, new assignment,
// submission, profile) is built from these three, so labels, error text and
// accessibility attributes are written exactly once.

function Wrapper({ id, label, error, hint, children }) {
  return (
    <div className={error ? 'field has-error' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className="field-error" id={`${id}-msg`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="field-hint" id={`${id}-msg`}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function TextField({ label, error, hint, type = 'text', ...rest }) {
  const id = useId()
  return (
    <Wrapper id={id} label={label} error={error} hint={hint}>
      <input id={id} type={type} aria-invalid={!!error} aria-describedby={`${id}-msg`} {...rest} />
    </Wrapper>
  )
}

export function TextAreaField({ label, error, hint, rows = 6, ...rest }) {
  const id = useId()
  return (
    <Wrapper id={id} label={label} error={error} hint={hint}>
      <textarea id={id} rows={rows} aria-invalid={!!error} aria-describedby={`${id}-msg`} {...rest} />
    </Wrapper>
  )
}

export function SelectField({ label, error, hint, options, ...rest }) {
  const id = useId()
  return (
    <Wrapper id={id} label={label} error={error} hint={hint}>
      <select id={id} aria-invalid={!!error} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  )
}

export function PasswordMeter({ score }) {
  const labels = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong']
  return (
    <div className="meter" aria-live="polite">
      <div className="meter-bars">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={n <= score ? `on s${score}` : ''} />
        ))}
      </div>
      <span className="meter-label">{labels[score]}</span>
    </div>
  )
}
