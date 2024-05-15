import { Button, Text, View } from '@tarojs/components'
import { useCounterReset, useCounterStore } from '@/models'
import { useAuth } from '@/hooks'
import './index.scss'

export default function Home() {
  useAuth()
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
