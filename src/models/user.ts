import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createJSONStorage, persist } from 'zustand/middleware'
import { StorageSceneKey, zustandStorage } from '../libs'
import createSelectors from './selectors'

interface State {
  token: string
  isLogged: boolean
}
interface Action {
  setToken: (token: string) => void
  removeToken: () => void
}

const initialState: State = {
  token: '',
  isLogged: false,
}
const store = create<State & Action>()(
  immer(
    persist(
      (set, get) => ({
        token: '',
        isLogged: false,
        setToken: token => set({ token, isLogged: true }),
        removeToken: () => set({ token: '', isLogged: false }),
      }),
      {
        // ! 注意这里的name是当前这个Zustand模块进行缓存时的唯一key, 每个需要缓存的Zustand模块都必须分配一个唯一key
        name: StorageSceneKey.USER,
        storage: createJSONStorage(() => zustandStorage),
      },
    ),
  ),
)

export const useUserStore = createSelectors(store)
export function useUserReset() {
  store.setState(initialState)
}
