import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import requestConfig from './config'

type RequestError = AxiosError | Error

// request 方法 opts 参数的接口
interface IRequestOptions extends AxiosRequestConfig {
  skipErrorHandler?: boolean
  requestInterceptors?: IRequestInterceptorTuple[]
  responseInterceptors?: IResponseInterceptorTuple[]
  [key: string]: any
}

interface IRequestOptionsWithResponse extends IRequestOptions {
  getResponse: true
}

interface IRequestOptionsWithoutResponse extends IRequestOptions {
  getResponse: false
}

interface IRequest<T = any> {
  (url: string, opts: IRequestOptionsWithResponse): Promise<AxiosResponse<T>>
  (url: string, opts: IRequestOptionsWithoutResponse): Promise<T>
  (url: string, opts: IRequestOptions): Promise<T> // getResponse 默认是 false， 因此不提供该参数时，只返回 data
  (url: string): Promise<T> // 不提供 opts 时，默认使用 'GET' method，并且默认返回 data
}

interface IErrorHandler {
  (error: RequestError, opts: IRequestOptions): void
}

type IRequestInterceptor = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
type IResponseInterceptor = (response: AxiosResponse) => AxiosResponse
type IErrorInterceptor = (error: AxiosError) => Promise<AxiosError>

type IRequestInterceptorTuple = [IRequestInterceptor, IErrorInterceptor] | [IRequestInterceptor] | IRequestInterceptor
type IResponseInterceptorTuple =
  | [IResponseInterceptor, IErrorInterceptor]
  | [IResponseInterceptor]
  | IResponseInterceptor

interface RequestConfig<T = any> extends AxiosRequestConfig {
  errorConfig?: {
    errorHandler?: IErrorHandler
    errorThrower?: (res: T) => void
  }
  requestInterceptors?: IRequestInterceptorTuple[]
  responseInterceptors?: IResponseInterceptorTuple[]
}

const singletonEnforcer = Symbol()

class AxiosRequest {
  private static _instance: AxiosRequest
  private readonly service: AxiosInstance
  private config: RequestConfig = {
    baseURL: process.env.TARO_APP_API,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  }
  constructor(enforcer: any) {
    if (enforcer !== singletonEnforcer) {
      throw new Error('Cannot initialize Axios client single instance')
    }
    this.mergeConfig()
    this.service = axios.create(this.config)
    // 请求拦截
    this.config?.requestInterceptors?.forEach((interceptor) => {
      interceptor instanceof Array
        ? this.service.interceptors.request.use(interceptor[0], interceptor[1])
        : this.service.interceptors.request.use(interceptor)
    })
    // 响应拦截
    this.config?.responseInterceptors?.forEach((interceptor) => {
      interceptor instanceof Array
        ? this.service.interceptors.response.use(interceptor[0], interceptor[1])
        : this.service.interceptors.response.use(interceptor)
    })
    // 当响应的数据 success 是 false 的时候，抛出 error 以供 errorHandler 处理
    this.service.interceptors.response.use((response) => {
      const { data } = response
      if (data?.success === false && this.config?.errorConfig?.errorThrower) {
        this.config.errorConfig.errorThrower(data)
      }
      return response
    })
  }
  /**
   * 创建唯一实例
   */
  static get instance() {
    // 如果已经存在实例则直接返回, 否则实例化后返回
    this._instance || (this._instance = new AxiosRequest(singletonEnforcer))
    return this._instance
  }
  /**
   * 合并请求参数
   */
  private mergeConfig() {
    this.config = Object.assign(this.config, requestConfig)
  }
  /**
   * 获取需要移除的拦截器
   * @param opts
   */
  private getInterceptorsEject(opts: {
    requestInterceptors?: IRequestInterceptorTuple[]
    responseInterceptors?: IResponseInterceptorTuple[]
  }) {
    const { requestInterceptors, responseInterceptors } = opts
    const requestInterceptorsToEject = requestInterceptors?.map((interceptor) => {
      return interceptor instanceof Array
        ? this.service.interceptors.request.use(interceptor[0], interceptor[1])
        : this.service.interceptors.request.use(interceptor)
    })
    const responseInterceptorsToEject = (responseInterceptors as IResponseInterceptorTuple[])?.map((interceptor) => {
      return interceptor instanceof Array
        ? this.service.interceptors.response.use(interceptor[0], interceptor[1])
        : this.service.interceptors.response.use(interceptor)
    })
    return { requestInterceptorsToEject, responseInterceptorsToEject }
  }
  /**
   * 移除拦截器
   * @param opts
   */
  private removeInterceptors(opts: { requestInterceptorsToEject?: number[]; responseInterceptorsToEject?: number[] }) {
    const { requestInterceptorsToEject, responseInterceptorsToEject } = opts
    requestInterceptorsToEject?.forEach((interceptor) => {
      this.service.interceptors.request.eject(interceptor)
    })
    responseInterceptorsToEject?.forEach((interceptor) => {
      this.service.interceptors.response.eject(interceptor)
    })
  }
  /**
   * 基础请求
   * @param url 接口地址
   * @param opts 额外参数
   */
  request: IRequest = (url: string, opts: any = { method: 'GET' }): Promise<any> => {
    const { getResponse = false, requestInterceptors, responseInterceptors } = opts
    const { requestInterceptorsToEject, responseInterceptorsToEject } = this.getInterceptorsEject({
      requestInterceptors,
      responseInterceptors,
    })
    return new Promise((resolve, reject) => {
      this.service
        .request({ ...opts, url })
        .then((res) => {
          this.removeInterceptors({ requestInterceptorsToEject, responseInterceptorsToEject })
          resolve(getResponse ? res : res.data)
        })
        .catch((error) => {
          this.removeInterceptors({ requestInterceptorsToEject, responseInterceptorsToEject })
          try {
            const handler = this.config?.errorConfig?.errorHandler
            if (handler) handler(error, opts)
          } catch (e) {
            reject(e)
          }
          reject(error)
        })
    })
  }
  upload(url: string, file: File) {
    const headers = Object.assign({}, this.config.headers, {
      'Content-Type': 'multipart/form-data',
    })
    const data = new FormData()
    data.append('file', file)
    return this.request(url, {
      headers: headers,
      method: 'POST',
      data,
      onUploadProgress: ({ loaded, total }) => {
        console.log((loaded / (total as number)) * 100 + '%')
      },
    })
  }
}

const requestInstance = AxiosRequest.instance
const request = requestInstance.request
export { requestInstance, request }
export type {
  RequestError,
  RequestConfig,
  IResponseInterceptor as ResponseInterceptor,
  IRequestOptions as RequestOptions,
  IRequest as Request,
}
