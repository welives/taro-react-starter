import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import createSelectors from './selectors'

interface State {
  count: number
}
interface Action {
  inc: () => void
  dec: () => void
}
const initialState: State = {
  count: 0,
}

const counterStore = create<State & Action>()(
  immer((set, get) => ({
    count: 0,
    inc: () => set(state => ({ count: state.count + 1 })),
    dec: () => set(state => ({ count: state.count - 1 })),
  })),
)
export const useCounterStore = createSelectors(counterStore)
export function useCounterReset() {
  counterStore.setState(initialState)
}
