import { setStorageSync, getStorageSync, removeStorageSync } from '@tarojs/taro'

enum StorageSceneKey {
  DEVICE = 'storage-device-uuid',
  USER = 'storage-user',
}

function getItem<T = any>(key: string): T {
  const value = getStorageSync(key)
  return value ? JSON.parse(value) ?? null : null
}
function setItem<T = any>(key: string, value: T) {
  setStorageSync(key, JSON.stringify(value))
}
function removeItem(key: string) {
  removeStorageSync(key)
}

export { getItem, setItem, removeItem, StorageSceneKey }
