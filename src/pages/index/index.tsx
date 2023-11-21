import { View, Button } from '@tarojs/components'
import { request } from '@/api'
import { useUserStore, useAuthStore, useAuthReset } from '@/models'
import router from '@/router'
import './index.scss'

export default function Index() {
  const setToken = useUserStore.use.setToken()
  const auth = useAuthStore()
  const login = async () => {
    const res = await request('/api/login', {
      method: 'POST',
    })
    setToken(res.data)
    if (auth.redirect?.url) {
      const success = () => {
        useAuthReset()
      }
      auth.redirect.tab
        ? router.switchTab({
            url: auth.redirect.url,
            success,
          })
        : router.redirectTo({
            url: auth.redirect.url,
            success,
          })
    } else {
      router.switchTab({ url: '/pages/home/index' })
    }
  }

  return (
    <View className="flex flex-1 flex-col items-center justify-center gap-2 h-full">
      <Button plain type="primary" onClick={login}>
        Go Home
      </Button>
    </View>
  )
}
