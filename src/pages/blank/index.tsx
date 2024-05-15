import { useLoad } from '@tarojs/taro'
import { useUserStore } from '@/models'
import router from '@/router'

export default function Blank() {
  const isLogged = useUserStore.use.isLogged()
  useLoad(() => {
    if (isLogged)
      router.switchTab({ url: '/pages/home/index' })
    else
      router.reLaunch({ url: '/pages/index/index' })
  })
  return null
}
