import { View, Button } from '@tarojs/components'
import { request } from '@/api'
import { useUserStore } from '@/models'
import router from '@/routes'
import './index.scss'

export default function Index() {
  const setToken = useUserStore.use.setToken()
  const login = async () => {
    const res = await request('/api/login', {
      method: 'POST',
    })
    setToken(res.data)
    router.switchTab({ url: '/pages/home/index' })
  }

  return (
    <View className="flex flex-1 flex-col items-center justify-center gap-2 h-full">
      <Button plain type="primary" onClick={login}>
        Go Home
      </Button>
    </View>
  )
}
