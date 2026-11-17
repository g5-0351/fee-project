import { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { getCurrentUser, login as doLogin, register as doRegister, logout as doLogout, updateUser } from '../lib/storage'
import { loadPlanFor, resetAssignments } from '../store/slices'

// Context API: "who is signed in" is needed almost everywhere (nav, guards, every page),
// so it is global state. Passing it through props would mean drilling it through every layer.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const dispatch = useDispatch()
  const [user, setUser] = useState(getCurrentUser)

  // restore this user's saved study plan after a page refresh
  useEffect(() => {
    if (user) dispatch(loadPlanFor(user.email))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finish(result) {
    if (result.ok) {
      const u = getCurrentUser()
      setUser(u)
      dispatch(loadPlanFor(u.email)) // each user has their own study plan
    }
    return result
  }

  const value = {
    user,
    login: (creds) => finish(doLogin(creds)),
    register: (data) => finish(doRegister(data)),
    logout() {
      doLogout()
      setUser(null)
      dispatch(loadPlanFor(null))
      dispatch(resetAssignments())
    },
    updateProfile(changes) {
      const result = updateUser(user.email, changes)
      if (result.ok) setUser(getCurrentUser())
      return result
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
