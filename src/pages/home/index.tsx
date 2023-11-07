import { View, Text, Button } from '@tarojs/components'
import { useCounterStore, useCounterReset } from '@/models'
import './index.scss'

export default function Home() {
  const count = useCounterStore.use.count()
  const inc = useCounterStore.use.inc()
  const dec = useCounterStore.use.dec()

  return (
    <View className="flex flex-1 flex-wrap flex-col items-center justify-center gap-4 h-full">
      <Text>Home Page</Text>
      <View className="text-center">
        <Button type="warn" onClick={dec}>
          Dec
        </Button>
        <Text>{count}</Text>
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
