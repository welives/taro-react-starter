export default defineAppConfig({
  animation: true,
  entryPagePath: 'pages/index/index',
  pages: ['pages/index/index', 'pages/home/index', 'pages/profile/index'],
  tabBar: {
    color: '#666666',
    selectedColor: '#4965f2',
    backgroundColor: '#fefefe',
    list: [
      {
        pagePath: 'pages/home/index',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-selected.png',
        text: '首页',
      },
      {
        pagePath: 'pages/profile/index',
        iconPath: 'assets/tabbar/profile.png',
        selectedIconPath: 'assets/tabbar/profile-selected.png',
        text: '我的',
      },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
})
