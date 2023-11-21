import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createJSONStorage, persist } from 'zustand/middleware'
import createSelectors from './selectors'
import { zustandStorage, StorageSceneKey } from '../utils'

interface Redirect {
  url: string
  tab?: boolean
}

interface State {
  redirect: Redirect | null
}
interface Action {
  setRedirect: (value: Redirect) => void
}

const store = create<State & Action>()(
  immer(
    persist(
      (set, get) => ({
        redirect: null,
        setRedirect: (value) => set({ redirect: value }),
      }),
      {
        name: StorageSceneKey.AUTH,
        storage: createJSONStorage(() => zustandStorage),
      }
    )
  )
)

export const useAuthStore = createSelectors(store)
export function useAuthReset() {
  store.setState({ redirect: null })
}
