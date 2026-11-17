# Assignment Submission Portal (v2: semester update)

Register as a **student** or **teacher**, post and submit assignments, and (as a student)
build a **study plan** that totals the hours and points you are taking on.
Runs entirely in the browser — accounts and submissions live in `localStorage`.

## How to run it

1. Install Node.js 18 or newer (check with `node -v`).
2. Open a terminal in this folder (the one that contains `package.json`).
3. Run `npm install`. This downloads React, React Router, Redux Toolkit and Vite.
4. Run `npm run dev`.
5. Open the address it prints, usually http://localhost:5173.
6. Click "Create account", pick Teacher, and post an assignment.
7. Sign out, create a Student account, and submit work and build a study plan.

Other commands: `npm run build` (production build) and `npm run preview` (serve that build).

Resources page needs internet (it calls the Google Books API, with Open Library as backup); everything else works offline.

## What was added, mapped to the PE-II syllabus

| Syllabus topic | Where it lives |
| --- | --- |
| Navigation layout & multi-page SPA | `App.jsx` (nested routes), `layouts/AppLayout.jsx` (`<Outlet/>`), `components/Nav.jsx` (`NavLink` active state), `components/ProtectedRoute.jsx` (auth + role guard). Pages: Overview, Assignments, Assignment detail, Study plan, Resources, Profile, 404 |
| Context API, global vs local state | `context/AuthContext.jsx` (who is signed in), `ThemeContext.jsx` (light/dark), `ToastContext.jsx` (notifications). Local `useState` is kept for things only one page cares about (search box, filter, form toggle) |
| Redux Toolkit | `store/index.js`, `store/slices.js` — `assignments` slice (`createAsyncThunk`) and `plan` slice (add / remove / set hours / clear), plus `createSelector` for totals |
| Async state, loading/error handling | `components/AsyncState.jsx` (skeleton → error + retry → empty), used with the Redux thunk (assignments) and with a live `fetch` + `AbortController` on `pages/Resources.jsx` (Google Books API) |
| Form handling & validation | `hooks/useForm.js`, `lib/validators.js`, reusable `components/forms/Field.jsx` (`TextField`, `TextAreaField`, `SelectField`, `PasswordMeter`). Used by sign in / sign up, new assignment, submission and profile forms |
| Mini project: shopping cart / dashboard | **Study plan** = cart (items, hours as quantity, totals). **Overview** = dashboard (stat tiles, progress bars, upcoming list) |

## Design

"Aurora" theme: a drifting gradient background behind frosted-glass panels, with a
light/dark switch in the nav. All colours are CSS variables at the top of `src/index.css`.
