import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import useForm from '../hooks/useForm.js'
import { required, minLen, strongPassword, matches, passwordScore } from '../lib/validators'
import { TextField, PasswordMeter } from '../components/forms/Field.jsx'

// a blank new password means "leave it unchanged"
const optional = (check) => (v, all) => (v ? check(v, all) : '')

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { theme, toggle } = useTheme()
  const notify = useToast()

  const form = useForm(
    { name: user.name, password: '', confirm: '' },
    {
      name: [required('Name'), minLen(2, 'Name')],
      password: [optional(strongPassword)],
      confirm: [(v, all) => (all.password ? matches('password', 'Passwords do not match.')(v, all) : '')],
    }
  )

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.validateAll()) return
    const { name, password } = form.values
    const result = updateProfile(password ? { name: name.trim(), password } : { name: name.trim() })
    if (result.ok) {
      notify('Profile updated')
      form.reset({ name: name.trim(), password: '', confirm: '' })
    } else notify(result.error, 'error')
  }

  return (
    <div className="dashboard narrow">
      <div className="dashboard-head">
        <div>
          <h1>Your profile</h1>
          <p className="muted">{user.email} · {user.role === 'teacher' ? 'Teacher' : 'Student'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="panel auth-form" noValidate>
        <TextField label="Name" {...form.bind('name')} />
        <TextField label="New password" type="password" hint="Leave blank to keep your current password." autoComplete="new-password" {...form.bind('password')} />
        {form.values.password && (
          <>
            <PasswordMeter score={passwordScore(form.values.password)} />
            <TextField label="Confirm new password" type="password" autoComplete="new-password" {...form.bind('confirm')} />
          </>
        )}
        <button type="submit" className="btn-primary">Save changes</button>
      </form>

      <section className="panel pref-row">
        <div>
          <h2>Appearance</h2>
          <p className="muted">Currently using the {theme} theme.</p>
        </div>
        <button type="button" className="btn-ghost" onClick={toggle}>Switch to {theme === 'dark' ? 'light' : 'dark'}</button>
      </section>
    </div>
  )
}
