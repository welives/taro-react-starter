import { View, Text, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'
import { useCounterStore, useCounterReset } from '@/models'

export default function Home() {
  useLoad(() => {
    console.log('Home loaded.')
  })
  const count = useCounterStore.use.count()
  const inc = useCounterStore.use.inc()
  const dec = useCounterStore.use.dec()

  return (
    <View className="flex flex-1 flex-wrap flex-col items-center justify-center gap-4 h-full">
      <Text>Home!</Text>
      <View>
        <Button type="warn" onClick={dec}>
          Dec
        </Button>
        <Text className="mx-3">{count}</Text>
        <Button type="primary" onClick={inc}>
          Inc
        </Button>
      </View>
      <Button type="default" onClick={useCounterReset}>
        Reset
      </Button>
    </View>
  )
}
