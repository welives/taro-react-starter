import { getStorageSync, removeStorageSync, setStorageSync } from '@tarojs/taro'
import type { StateStorage } from 'zustand/middleware'

enum StorageSceneKey {
  USER = 'storage-user',
  AUTH = 'storage-auth',
}

function getItem<T = any>(key: string): T {
  const value = getStorageSync(key)
  return value ? JSON.parse(value) ?? null : null
}
function setItem(key: string, value: any) {
  setStorageSync(key, JSON.stringify(value))
}
function removeItem(key: string) {
  removeStorageSync(key)
}

export { getItem, setItem, removeItem, StorageSceneKey }

/** @description 用来给 zustand 持久化存储的方法 */
export const zustandStorage: StateStorage = {
  getItem: (key: string) => {
    const value = getStorageSync(key)
    return value ?? null
  },
  setItem: (key: string, value) => {
    setStorageSync(key, value)
  },
  removeItem: (key: string) => {
    removeStorageSync(key)
  },
}
