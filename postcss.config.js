const isH5 = process.env.TARO_ENV === 'h5'
module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-rem-to-responsive-pixel': {
      rootValue: 32, // 1rem = 32rpx
      propList: ['*'], // 默认所有属性都转化
      transformUnit: isH5 ? 'px' : 'rpx', // 转化的单位,可以变成 px / rpx
    },
  },
}
