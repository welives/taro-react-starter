import { View, Navigator, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index() {
  useLoad(() => {
    console.log('Index loaded.')
  })

  return (
    <View className="flex flex-1 items-center justify-center h-full">
      <Navigator url="/pages/home/index">
        <Button plain type="primary">
          Go Home
        </Button>
      </Navigator>
    </View>
  )
}
