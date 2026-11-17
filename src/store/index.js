import { configureStore } from '@reduxjs/toolkit'
import { assignmentsReducer, planReducer } from './slices'
import { writePlan } from '../lib/storage'
import { getSession } from '../lib/storage'

export const store = configureStore({
  reducer: {
    assignments: assignmentsReducer,
    plan: planReducer,
  },
})

// Persist the study plan for whoever is signed in whenever it changes.
let lastPlan = store.getState().plan
store.subscribe(() => {
  const plan = store.getState().plan
  if (plan !== lastPlan) {
    lastPlan = plan
    writePlan(getSession(), plan)
  }
})
