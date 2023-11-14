import Taro, { EventChannel } from '@tarojs/taro'
import { useUserStore } from '@/models'

interface IRouterOptions<T = any> {
  url: string
  data?: T
  complete?: (res: TaroGeneral.CallbackResult) => void
  fail?: (res: TaroGeneral.CallbackResult) => void
  success?: (res: TaroGeneral.CallbackResult) => void
}
interface NavigateToOptions<T = any> extends IRouterOptions<T> {
  events?: TaroGeneral.IAnyObject
  success?: (res: TaroGeneral.CallbackResult & { eventChannel: EventChannel }) => void
}
interface NavigateBackOptions extends Omit<IRouterOptions, 'url' | 'data'> {
  delta?: number
}
type RouterOptions<T = any> = NavigateToOptions<T> & NavigateBackOptions
type RouterType = 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch' | 'navigateBack'

/**
 * 路由跳转处理
 */
function handleRouter(urlKey: string, type: RouterType, options: RouterOptions) {
  const isLogged = useUserStore.getState().isLogged
  if (authRoutes.includes(urlKey)) {
    if (!isLogged) {
      // TODO 补充自己的业务逻辑
      return
    }
    navigate(type, options)
  } else {
    navigate(type, options)
  }
}
/**
 * 执行路由跳转
 */
function navigate(type: RouterType, options: RouterOptions) {
  const { data, ...rest } = options
  if (!Taro.hasOwnProperty(type)) return
  if (!rest.url.startsWith('/')) {
    rest.url = `/${rest.url}`
  }
  Taro[type](rest)
}

const singletonEnforcer = Symbol('Router')
class Router {
  private static _instance: Router
  constructor(enforcer: any) {
    if (enforcer !== singletonEnforcer) {
      throw new Error('Cannot initialize single instance')
    }
  }
  static get instance() {
    // 如果已经存在实例则直接返回, 否则实例化后返回
    this._instance || (this._instance = new Router(singletonEnforcer))
    return this._instance
  }
  /**
   * 路由中间件,做跳转前的代理
   */
  private middleware(type: RouterType, options: RouterOptions) {
    let { url = '', data = {}, events, ...rest } = options
    // 单独存一份url,待会要用
    const key = url
      .split('/')
      .filter((e) => e !== '')
      .join('/')
    try {
      if (type === 'navigateBack') {
        Taro.navigateBack(rest)
      } else {
        if (!key.trim() || !routes.includes(key)) {
          throw Error('无效的路由')
        }
        // 不是tabbar的话就给路由拼上参数
        options.url = type === 'switchTab' ? key : key + '?' + new URLSearchParams(data).toString()
        handleRouter(key, type, options)
      }
    } catch (error) {
      console.error(error.message)
      // TODO
    }
  }
  /**
   * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
   */
  switchTab(options: IRouterOptions) {
    this.middleware('switchTab', options)
  }
  /**
   * 关闭所有页面，打开到应用内的某个页面
   */
  reLaunch(options: IRouterOptions) {
    this.middleware('reLaunch', options)
  }
  /**
   * 关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面
   */
  redirectTo(options: IRouterOptions) {
    this.middleware('redirectTo', options)
  }
  /**
   * 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面
   */
  navigateTo(options: NavigateToOptions) {
    this.middleware('navigateTo', options)
  }
  /**
   * 关闭当前页面，返回上一页面或多级页面
   */
  navigateBack(options: NavigateBackOptions) {
    this.middleware('navigateBack', { url: '', ...options })
  }
}
// 需要权限的路由,注意首尾不能带有斜杠
const authRoutes = ['pages/home/index', 'pages/profile/index']
// 全部路由
const routes = ['pages/blank/index', 'pages/index/index', 'pages/home/index', 'pages/profile/index']
export default Router.instance
