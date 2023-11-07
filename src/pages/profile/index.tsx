import { View, Text, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'
import { useCounterStore } from '@/models'

export default function Profile() {
  useLoad(() => {
    console.log('Profile loaded.')
  })
  const { count, inc, dec } = useCounterStore()

  return (
    <View className="flex flex-1 flex-wrap flex-col items-center justify-center gap-4 h-full">
      <Text>profile!</Text>
      <View>
        <Button type="warn" onClick={dec}>
          Dec
        </Button>
        <Text className="mx-3">{count}</Text>
        <Button type="primary" onClick={inc}>
          Inc
        </Button>
      </View>
    </View>
  )
}
