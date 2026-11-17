import { useState } from 'react'
import { runRules } from '../lib/validators'

// Controlled-form helper: values + touched state live here (local state),
// errors are derived from the rules on every render, so they're never stale.
export default function useForm(initialValues, rules) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})

  const allErrors = runRules(rules, values)
  // only show an error after the user has left the field (or tried to submit)
  const errors = Object.fromEntries(Object.entries(allErrors).filter(([k]) => touched[k]))
  const isValid = Object.keys(allErrors).length === 0

  const bind = (name) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
  })

  // Call on submit: marks every field touched and says whether the form may proceed.
  function validateAll() {
    setTouched(Object.fromEntries(Object.keys(rules).map((k) => [k, true])))
    return isValid
  }

  function reset(next = initialValues) {
    setValues(next)
    setTouched({})
  }

  return { values, setValues, errors, isValid, bind, validateAll, reset }
}
