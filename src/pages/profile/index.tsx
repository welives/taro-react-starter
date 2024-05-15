import { Button, Text, View } from '@tarojs/components'
import { useCounterStore } from '@/models'
import { useAuth } from '@/hooks'
import './index.scss'

export default function Profile() {
  useAuth()
  const { count, inc, dec } = useCounterStore()

  return (
    <View className="flex flex-1 flex-wrap flex-col items-center justify-center gap-4 h-full">
      <Text>Profile Page</Text>
      <View className="text-center">
        <Button type="warn" onClick={dec}>
          Dec
        </Button>
        <Text>{count}</Text>
        <Button type="primary" onClick={inc}>
          Inc
        </Button>
      </View>
    </View>
  )
}
