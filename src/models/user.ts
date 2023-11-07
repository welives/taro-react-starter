import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware'
import { setStorageSync, getStorageSync, removeStorageSync } from '@tarojs/taro'
import createSelectors from './selectors'
import { StorageSceneKey } from '../utils'

interface State {
  token: string
  isLogged: boolean
}
interface Action {
  setToken: (token: string) => void
  removeToken: () => void
}

const userStorage: StateStorage = {
  getItem: (key) => {
    const value = getStorageSync(key)
    return value ?? null
  },
  setItem: (key, value) => {
    setStorageSync(key, value)
  },
  removeItem: (key) => {
    removeStorageSync(key)
  },
}

const initialState: State = {
  token: '',
  isLogged: false,
}
const userStore = create<State & Action>()(
  immer(
    persist(
      (set, get) => ({
        token: '',
        isLogged: false,
        setToken: (token) => set({ token, isLogged: true }),
        removeToken: () => set({ token: '', isLogged: false }),
      }),
      {
        //! 注意这里的 name 并不是创建 mmkv 实例的 ID，而是 mmkv 持久化数据的唯一 key
        name: StorageSceneKey.USER,
        storage: createJSONStorage(() => userStorage),
      }
    )
  )
)

export const useUserStore = createSelectors(userStore)
export function useUserReset() {
  userStore.setState(initialState)
}
