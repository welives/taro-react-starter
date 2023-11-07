import { View, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'
import { request } from '@/api'
import { useUserStore } from '@/models'
import router from '@/routes'

export default function Index() {
  useLoad(() => {
    console.log('Index loaded.')
  })
  const setToken = useUserStore.use.setToken()
  const login = async () => {
    const res = await request('https://mock.mengxuegu.com/mock/64f5ddc4e70b8004a69e9c4c/expo-starter/login', {
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
