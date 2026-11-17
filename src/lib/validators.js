// Small, reusable validators. Each one returns an error message, or '' if the value is fine.
// Used by the useForm hook: rules = { fieldName: [validator, validator, ...] }

export const required = (label) => (v) => (String(v ?? '').trim() ? '' : `${label} is required.`)

export const email = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? '' : 'Enter a valid email like name@college.edu.'

export const minLen = (n, label = 'This field') => (v) =>
  String(v ?? '').trim().length >= n ? '' : `${label} must be at least ${n} characters.`

export const maxLen = (n, label = 'This field') => (v) =>
  String(v ?? '').length <= n ? '' : `${label} must be ${n} characters or fewer.`

export const matches = (otherField, message) => (v, all) => (v === all[otherField] ? '' : message)

export const positiveNumber = (label) => (v) =>
  Number(v) > 0 ? '' : `${label} must be greater than 0.`

// 0..4 score used by the password strength meter on the sign-up form.
export function passwordScore(pw = '') {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export const strongPassword = (v) =>
  passwordScore(v) >= 3 ? '' : 'Use 8+ characters with upper & lower case letters and a number.'

// Run a list of validators and return the first message.
export function runRules(rules, values) {
  const errors = {}
  for (const field of Object.keys(rules)) {
    for (const check of rules[field]) {
      const msg = check(values[field], values)
      if (msg) {
        errors[field] = msg
        break
      }
    }
  }
  return errors
}
