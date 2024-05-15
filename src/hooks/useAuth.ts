import { getCurrentInstance, useDidShow } from '@tarojs/taro'
import { useAuthStore, useUserStore } from '../models'
import router from '../router'

const tabbar = ['/pages/home/index', '/pages/profile/index']

export function useAuth() {
  const isLogged = useUserStore.use.isLogged()
  const setRedirect = useAuthStore.use.setRedirect()
  const current = getCurrentInstance().router
  const path = current ? current.path.split('?')[0] : ''
  const isTab = tabbar.includes(path)
  const routeParams = current?.params
  const params = {}
  for (const [key, value] of Object.entries(routeParams ?? {})) {
    if (!['stamp', '$taroTimestamp'].includes(key))
      params[key] = value
  }
  useDidShow(() => {
    if (!isLogged) {
      const str = new URLSearchParams(params).toString()
      setRedirect({ tab: isTab, url: str ? `${path}?${str}` : path })
      router.reLaunch({ url: '/pages/index/index' })
    }
  })
}
