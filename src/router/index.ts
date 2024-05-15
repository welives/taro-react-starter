import Taro from '@tarojs/taro'
import { useUserStore } from '../models'
import { utils } from '../libs'

interface AnyObj {
  [key: string]: any
}
type RouterType = 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch' | 'navigateBack'
type SuccessCallback = TaroGeneral.CallbackResult | (TaroGeneral.CallbackResult & { eventChannel: Taro.EventChannel })
interface TaroRouterOptions<S = SuccessCallback>
  extends Omit<Taro.navigateTo.Option, 'success'>,
  Omit<Taro.navigateBack.Option, 'success'>,
  Omit<Taro.redirectTo.Option, 'success'>,
  Omit<Taro.reLaunch.Option, 'success'>,
  Omit<Taro.switchTab.Option, 'success'> {
  data?: string | AnyObj
  success?: (res: S) => void
}

function searchParams2Obj(params: any) {
  const searchParams = new URLSearchParams(params)
  const obj: AnyObj = {}
  for (const [key, value] of searchParams.entries())
    obj[key] = value

  return obj
}

/**
 * 路由跳转处理
 */
function authCheck(urlKey: string, type: RouterType, options: TaroRouterOptions) {
  const isLogged = useUserStore.getState().isLogged
  if (authRoutes.includes(urlKey)) {
    if (!isLogged) {
      // TODO 补充自己的业务逻辑
      return
    }
    navigate(type, options)
  }
  else {
    navigate(type, options)
  }
}
/**
 * 执行路由跳转
 */
function navigate(type: RouterType, options: TaroRouterOptions) {
  const { data, ...rest } = options
  if (!['navigateTo', 'redirectTo', 'switchTab', 'reLaunch'].includes(type))
    return
  if (!rest.url.startsWith('/'))
    rest.url = `/${rest.url}`

  Taro[type](rest)
}

const singletonEnforcer = Symbol('Router')
class Router {
  private static _instance: Router
  constructor(enforcer: any) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot initialize single instance')
  }

  static get instance() {
    // 如果已经存在实例则直接返回, 否则实例化后返回
    this._instance || (this._instance = new Router(singletonEnforcer))
    return this._instance
  }

  /**
   * 路由中间件,做跳转前的代理
   */
  private middleware(type: RouterType, options: TaroRouterOptions) {
    let { url = '', data = {}, events, ...rest } = options
    let [urlKey, queryStr] = url.split('?')
    // 单独存一份url,待会要用
    urlKey = urlKey
      .split('/')
      .filter(e => e !== '')
      .join('/')
    try {
      if (type === 'navigateBack') {
        Taro.navigateBack(rest)
      }
      else {
        if (!urlKey.trim() || !routes.includes(urlKey))
          throw new Error('无效的路由')

        if (type === 'switchTab') {
          url = urlKey
        }
        else {
          let obj: AnyObj = {}
          if (data && typeof data === 'string' && data.trim())
            data = searchParams2Obj(data)

          if (queryStr && queryStr.trim())
            obj = searchParams2Obj(queryStr)

          const str = new URLSearchParams(utils.merge(data as object, obj)).toString()
          url = str ? `${urlKey}?${str}` : urlKey
        }
        authCheck(urlKey, type, { ...rest, url, events })
      }
    }
    catch (error) {
      // TODO
      console.error(error.message)
    }
  }

  /**
   * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
   */
  switchTab(options: TaroRouterOptions) {
    this.middleware('switchTab', options)
  }

  /**
   * 关闭所有页面，打开到应用内的某个页面
   */
  reLaunch(options: TaroRouterOptions) {
    this.middleware('reLaunch', options)
  }

  /**
   * 关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面
   */
  redirectTo(options: TaroRouterOptions) {
    this.middleware('redirectTo', options)
  }

  /**
   * 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面
   */
  navigateTo(options: TaroRouterOptions) {
    this.middleware('navigateTo', options)
  }

  /**
   * 关闭当前页面，返回上一页面或多级页面
   */
  navigateBack(options: Omit<TaroRouterOptions, 'url'>) {
    this.middleware('navigateBack', { url: '', ...options })
  }
}
// 需要权限的路由,注意首尾不能带有斜杠
const authRoutes = ['pages/home/index', 'pages/profile/index']
// 全部路由
const routes = ['pages/blank/index', 'pages/index/index', 'pages/home/index', 'pages/profile/index']
export default Router.instance
