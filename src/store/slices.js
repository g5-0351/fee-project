import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import { fetchAssignmentsAsync, addAssignment, readPlan } from '../lib/storage'

// ---------------------------------------------------------------------------
// Slice 1: assignments  (shared server-like data + async loading/error state)
// ---------------------------------------------------------------------------

// createAsyncThunk gives us pending / fulfilled / rejected actions for free.
export const loadAssignments = createAsyncThunk('assignments/load', async () => {
  return await fetchAssignmentsAsync()
})

export const createAssignment = createAsyncThunk('assignments/create', async ({ form, teacher }) => {
  return addAssignment(form, teacher)
})

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState: { items: [], status: 'idle', error: null }, // idle | loading | succeeded | failed
  reducers: {
    resetAssignments: () => ({ items: [], status: 'idle', error: null }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAssignments.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(loadAssignments.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.items = a.payload
      })
      .addCase(loadAssignments.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message || 'Could not load assignments.'
      })
      .addCase(createAssignment.fulfilled, (s, a) => {
        s.items = [...s.items, a.payload].sort((x, y) => x.due.localeCompare(y.due))
      })
  },
})

export const { resetAssignments } = assignmentsSlice.actions
export const assignmentsReducer = assignmentsSlice.reducer

// ---------------------------------------------------------------------------
// Slice 2: study plan  (works like a shopping cart: items, quantity, totals)
// ---------------------------------------------------------------------------

const planSlice = createSlice({
  name: 'plan',
  initialState: [], // [{ id: assignmentId, hours: number }]
  reducers: {
    loadPlanFor: {
      reducer: (_state, action) => action.payload,
      prepare: (email) => ({ payload: readPlan(email) }),
    },
    addToPlan: (state, action) => {
      // Redux Toolkit uses Immer, so "mutating" state here is safe.
      if (!state.some((i) => i.id === action.payload)) state.push({ id: action.payload, hours: 2 })
    },
    removeFromPlan: (state, action) => state.filter((i) => i.id !== action.payload),
    setHours: (state, action) => {
      const item = state.find((i) => i.id === action.payload.id)
      if (item) item.hours = Math.min(20, Math.max(1, action.payload.hours))
    },
    clearPlan: () => [],
  },
})

export const { loadPlanFor, addToPlan, removeFromPlan, setHours, clearPlan } = planSlice.actions
export const planReducer = planSlice.reducer

// ---- selectors -------------------------------------------------------------

export const selectAssignments = (s) => s.assignments.items
export const selectPlan = (s) => s.plan

// Joins plan items with assignment details and computes cart-style totals.
export const selectPlanSummary = createSelector([selectPlan, selectAssignments], (plan, assignments) => {
  const lines = plan
    .map((p) => ({ ...p, assignment: assignments.find((a) => a.id === p.id) }))
    .filter((l) => l.assignment)
  return {
    lines,
    totalHours: lines.reduce((n, l) => n + l.hours, 0),
    totalPoints: lines.reduce((n, l) => n + l.assignment.points, 0),
  }
})
