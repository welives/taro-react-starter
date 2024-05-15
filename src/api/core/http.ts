// @ts-expect-error
import utils from 'axios/unsafe/utils'
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import requestConfig from './config'

type RequestError = AxiosError | Error

interface IRequestOptions extends AxiosRequestConfig {
  skipErrorHandler?: boolean
  getResponse?: boolean
  requestInterceptors?: IRequestInterceptorTuple[]
  responseInterceptors?: IResponseInterceptorTuple[]
  [key: string]: any
}

interface IRequest<T = any> {
  (url: string, opts?: IRequestOptions): Promise<T>
}

interface IUpload<T = any, D = any> {
  (url: string, data: D, opts?: IRequestOptions): Promise<T>
}

interface IErrorHandler {
  (error: RequestError, opts: IRequestOptions): void
}

type IRequestInterceptor = (
  config: IRequestOptions & InternalAxiosRequestConfig
) => IRequestOptions & InternalAxiosRequestConfig
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

const singletonEnforcer = Symbol('AxiosRequest')

class AxiosRequest {
  private static _instance: AxiosRequest
  private readonly service: AxiosInstance
  private config: RequestConfig = {
    // TODO 改成你的基础路径
    baseURL: process.env.TARO_APP_API,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  }

  constructor(enforcer: any) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot initialize Axios client single instance')

    this.mergeConfig()
    this.service = axios.create(this.config)
    // 请求拦截
    this.config?.requestInterceptors?.forEach((interceptor) => {
      Array.isArray(interceptor)
        ? this.service.interceptors.request.use(interceptor[0], interceptor[1])
        : this.service.interceptors.request.use(interceptor)
    })
    // 响应拦截
    this.config?.responseInterceptors?.forEach((interceptor) => {
      Array.isArray(interceptor)
        ? this.service.interceptors.response.use(interceptor[0], interceptor[1])
        : this.service.interceptors.response.use(interceptor)
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
    this.config = utils.merge(this.config, requestConfig)
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
      return Array.isArray(interceptor)
        ? this.service.interceptors.request.use(interceptor[0], interceptor[1])
        : this.service.interceptors.request.use(interceptor)
    })
    const responseInterceptorsToEject = (responseInterceptors as IResponseInterceptorTuple[])?.map((interceptor) => {
      return Array.isArray(interceptor)
        ? this.service.interceptors.response.use(interceptor[0], interceptor[1])
        : this.service.interceptors.response.use(interceptor)
    })
    return { requestInterceptorsToEject, responseInterceptorsToEject }
  }

  /**
   * 移除拦截器
   * @param opts
   */
  private removeInterceptors(opts: { requestInterceptorsToEject?: number[], responseInterceptorsToEject?: number[] }) {
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
   * @param opts 请求参数
   */
  request: IRequest = (url: string, opts = { method: 'GET' }) => {
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
            if (handler)
              handler(error, opts)
          }
          catch (e) {
            reject(e)
          }
          finally {
            reject(error) // 如果不想把错误传递到方法调用处的话就去掉这个 finally
          }
        })
    })
  }

  /**
   * 上传
   * @param url 接口地址
   * @param opts 请求参数
   */
  upload: IUpload = (url: string, data, opts = {}) => {
    opts.headers = opts.headers ?? { 'Content-Type': 'multipart/form-data' }
    const { getResponse = false, requestInterceptors, responseInterceptors } = opts
    const { requestInterceptorsToEject, responseInterceptorsToEject } = this.getInterceptorsEject({
      requestInterceptors,
      responseInterceptors,
    })
    return new Promise((resolve, reject) => {
      this.service
        .post(url, data, opts)
        .then((res) => {
          this.removeInterceptors({ requestInterceptorsToEject, responseInterceptorsToEject })
          resolve(getResponse ? res : res.data)
        })
        .catch((error) => {
          this.removeInterceptors({ requestInterceptorsToEject, responseInterceptorsToEject })
          try {
            const handler = this.config?.errorConfig?.errorHandler
            if (handler)
              handler(error, opts)
          }
          catch (e) {
            reject(e)
          }
          finally {
            reject(error)
          }
        })
    })
  }

  /**
   * 下载
   * @param url 资源地址
   * @param opts 请求参数
   */
  download: IRequest = (url: string, opts = {}) => {
    opts.responseType = opts.responseType ?? 'blob'
    const { getResponse = false, requestInterceptors, responseInterceptors } = opts
    const { requestInterceptorsToEject, responseInterceptorsToEject } = this.getInterceptorsEject({
      requestInterceptors,
      responseInterceptors,
    })
    return new Promise((resolve, reject) => {
      this.service
        .get(url, opts)
        .then((res) => {
          this.removeInterceptors({ requestInterceptorsToEject, responseInterceptorsToEject })
          resolve(getResponse ? res : res.data)
        })
        .catch((error) => {
          this.removeInterceptors({ requestInterceptorsToEject, responseInterceptorsToEject })
          try {
            const handler = this.config?.errorConfig?.errorHandler
            if (handler)
              handler(error, opts)
          }
          catch (e) {
            reject(e)
          }
          finally {
            reject(error)
          }
        })
    })
  }
}

const requestInstance = AxiosRequest.instance
const request = requestInstance.request
const upload = requestInstance.upload
const download = requestInstance.download
export { requestInstance, request, upload, download }
export type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  RequestError,
  RequestConfig,
  IResponseInterceptor as ResponseInterceptor,
  IRequestOptions as RequestOptions,
  IRequest as Request,
  IUpload as Upload,
}
