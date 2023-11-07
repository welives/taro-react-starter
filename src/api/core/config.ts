import { AxiosError } from 'axios'
import type { RequestConfig } from './http'

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

// 与后端约定的响应数据格式
interface ResponseStructure<T = any> {
  success: boolean
  code: string
  data?: T
  message?: string
  [key: string]: any
}

const requestConfig: RequestConfig = {
  errorConfig: {
    // 错误抛出
    errorThrower: (res: ResponseStructure) => {
      const { success, data, errorCode, errorMessage, showType } = res
      if (!success) {
        const error: any = new Error(errorMessage)
        error.name = 'BizError'
        error.info = { errorCode, errorMessage, showType, data }
        throw error // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts) => {
      if (opts?.skipErrorHandler) throw error
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break
            case ErrorShowType.WARN_MESSAGE:
              // TODO: message
              console.warn(errorMessage)
              break
            case ErrorShowType.ERROR_MESSAGE:
              // TODO: message
              console.error(errorMessage)
              break
            case ErrorShowType.NOTIFICATION:
              // TODO: notification
              console.error({ description: errorMessage, message: errorCode })
              break
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break
            default:
              // TODO: message
              console.error(errorMessage)
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        // TODO: message
        console.error(`Response status:${error.response.status}`)
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // error.request 在浏览器中是 XMLHttpRequest 的实例
        // 而在node.js中是 http.ClientRequest 的实例
        // TODO: message
        console.error('None response! Please retry.')
      } else {
        // 发送请求时出了点问题
        // TODO: message
        console.error('Request error, please retry')
      }
    },
  },
  // 请求拦截器
  requestInterceptors: [
    [
      (config) => {
        // 拦截请求配置，进行个性化处理。
        return { ...config }
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      },
    ],
  ],
  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response
      if (!data.success) {
        // TODO: message
        console.error('请求失败！')
      }
      return response
    },
  ],
}

export default requestConfig
