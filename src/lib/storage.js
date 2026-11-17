// Everything the app needs to read/write is in this one file, on purpose —
// it's the whole "backend" for a front-end-only classroom demo.

const USERS_KEY = 'asp_users'
const SESSION_KEY = 'asp_session'
const SUBMISSIONS_KEY = 'asp_submissions'

// ---- assignments (static "course content") ----------------------------

export const ASSIGNMENTS = [
  {
    id: 'a1',
    title: 'Semantic HTML Practice',
    due: '2026-09-20',
    points: 10,
    summary: 'Mark up the sample resume using landmark elements, no divs.',
    instructions:
      'Rebuild the provided resume markup using semantic elements — header, nav, main, section, article, footer. Every image needs alt text, and every form field needs a label. Submit a link to your file or paste your HTML below.',
    issuedBy: 'Ms. Alvarez',
  },
  {
    id: 'a2',
    title: 'Flexbox Layout: Card Row',
    due: '2026-09-27',
    points: 15,
    summary: 'Build a responsive row of three cards that stacks on mobile.',
    instructions:
      'Use Flexbox to lay out three cards in a row on desktop and stacked on screens under 600px. Cards should have equal height regardless of content length. Include a screenshot or a short write-up of your approach.',
    issuedBy: 'Ms. Alvarez',
  },
  {
    id: 'a3',
    title: 'React State & Forms',
    due: '2026-10-04',
    points: 20,
    summary: 'A controlled form that validates an email and password.',
    instructions:
      'Build a controlled sign-up form with useState. Show an inline error if the email is missing an "@" or the password is under 8 characters. Disable the submit button until both fields are valid.',
    issuedBy: 'Ms. Alvarez',
  },
  {
    id: 'a4',
    title: 'Fetch & Render a List',
    due: '2026-10-11',
    points: 15,
    summary: 'Call a public API and render the results as a list.',
    instructions:
      'Use fetch (or the browser fetch API) inside useEffect to load data from a public API of your choice. Render a loading state, an error state, and the final list. Paste your component code or a repo link.',
    issuedBy: 'Ms. Alvarez',
  },
]

// ---- custom assignments (added by the signed-in user) -------------------

const CUSTOM_KEY = 'asp_custom_assignments'

function readCustom() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY)) ?? []
  } catch {
    return []
  }
}

export function addAssignment({ title, due, points, summary, instructions }, teacher) {
  const custom = readCustom()
  const assignment = {
    id: 'c' + Date.now(),
    title,
    due,
    points: Number(points) || 0,
    summary,
    instructions: instructions || summary,
    custom: true,
    issuedBy: teacher?.name || 'Your teacher',
  }
  custom.push(assignment)
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom))
  return assignment
}

export function getAllAssignments() {
  return [...ASSIGNMENTS, ...readCustom()].sort((a, b) => a.due.localeCompare(b.due))
}

// ---- users / session ----------------------------------------------------

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) ?? []
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSession() {
  return localStorage.getItem(SESSION_KEY)
}

export function register({ name, email, password, role }) {
  const users = readUsers()
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: 'An account with that email already exists.' }
  }
  users.push({ name, email, password, role: role === 'teacher' ? 'teacher' : 'student' })
  writeUsers(users)
  localStorage.setItem(SESSION_KEY, email)
  return { ok: true }
}

export function login({ email, password }) {
  const users = readUsers()
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) {
    return { ok: false, error: 'Email or password is incorrect.' }
  }
  localStorage.setItem(SESSION_KEY, email)
  return { ok: true }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentUser() {
  const email = getSession()
  if (!email) return null
  const users = readUsers()
  return users.find((u) => u.email === email) ?? null
}

// ---- submissions ----------------------------------------------------------

function readSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)) ?? {}
  } catch {
    return {}
  }
}

function key(email, assignmentId) {
  return `${email}::${assignmentId}`
}

export function getSubmission(email, assignmentId) {
  const all = readSubmissions()
  return all[key(email, assignmentId)] ?? null
}

export function saveSubmission(student, assignmentId, text) {
  const all = readSubmissions()
  all[key(student.email, assignmentId)] = {
    text,
    studentName: student.name,
    studentEmail: student.email,
    submittedAt: new Date().toISOString(),
  }
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all))
}

// Returns every submission turned in for one assignment, newest first —
// this is what a teacher sees on an assignment's page.
export function getSubmissionsForAssignment(assignmentId) {
  const all = readSubmissions()
  return Object.entries(all)
    .filter(([k]) => k.endsWith(`::${assignmentId}`))
    .map(([, submission]) => submission)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

// ---- profile -----------------------------------------------------------------

export function updateUser(email, changes) {
  const users = readUsers()
  const i = users.findIndex((u) => u.email === email)
  if (i === -1) return { ok: false, error: 'Account not found.' }
  users[i] = { ...users[i], ...changes }
  writeUsers(users)
  return { ok: true }
}

// ---- async + study plan helpers (used by the Redux store) -----------------------

// Pretend this is a network call so the UI can show real loading states.
export function fetchAssignmentsAsync() {
  return new Promise((resolve) => setTimeout(() => resolve(getAllAssignments()), 700))
}

const PLAN_KEY = 'asp_plan'

export function readPlan(email) {
  if (!email) return []
  try {
    return JSON.parse(localStorage.getItem(`${PLAN_KEY}::${email}`)) ?? []
  } catch {
    return []
  }
}

export function writePlan(email, items) {
  if (email) localStorage.setItem(`${PLAN_KEY}::${email}`, JSON.stringify(items))
}
