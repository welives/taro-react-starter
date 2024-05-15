interface AnyObj {
  [key: string]: any
}
const { getPrototypeOf } = Object
const kindOf = (cache => (thing: any) => {
  const str = toString.call(thing)
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase())
})(Object.create(null))
function kindOfTest(type: string) {
  type = type.toLowerCase()
  return (thing: any) => kindOf(thing) === type
}
const typeOfTest = (type: string) => (thing: any) => typeof thing === type
function findKey(obj: object, key: string) {
  key = key.toLowerCase()
  const keys = Object.keys(obj)
  let i = keys.length
  let _key
  while (i-- > 0) {
    _key = keys[i]
    if (key === _key.toLowerCase())
      return _key
  }
  return null
}
const _global = (() => {
  if (typeof globalThis !== 'undefined')
    return globalThis
  return typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global
})()

const singletonEnforcer = Symbol('Utils')
// 助手函数写这里
class Utils {
  private static _instance: Utils
  constructor(enforcer: any) {
    if (enforcer !== singletonEnforcer)
      throw new Error('Cannot initialize single instance')
  }

  static get instance() {
    // 如果已经存在实例则直接返回, 否则实例化后返回
    this._instance || (this._instance = new Utils(singletonEnforcer))
    return this._instance
  }

  /** @description 是否为数组 */
  isArray = Array.isArray
  /** @description 是否为 undefined */
  isUndefined = typeOfTest('undefined')
  /** @description 是否为对象 */
  isObject = (thing: any) => thing !== null && typeof thing === 'object'
  /** @description 是否为函数 */
  isFunction = typeOfTest('function')
  /** @description 是否为数字 */
  isNumber = typeOfTest('number')
  /** @description 是否为布尔值 */
  isBoolean = (thing: any) => thing === true || thing === false
  /** @description 是否为字符串 */
  isString = typeOfTest('string')
  /** @description 是否为 Date 对象 */
  isDate = kindOfTest('Date')
  /** @description 是否为 File 对象 */
  isFile = kindOfTest('File')
  /** @description 是否为 FileList 对象 */
  isFileList = kindOfTest('FileList')
  /** @description 是否为 Blob 对象 */
  isBlob = kindOfTest('Blob')
  /** @description 是否为 Stream流 */
  isStream = (val: any) => this.isObject(val) && this.isFunction(val.pipe)
  /** @description 是否为 URLSearchParams 对象 */
  isURLSearchParams = kindOfTest('URLSearchParams')
  /** @description 是否为 HTMLFormElement 对象 */
  isHTMLForm = kindOfTest('HTMLFormElement')
  /** @description 是否为 ArrayBuffer 对象 */
  isArrayBuffer = kindOfTest('ArrayBuffer')
  /** @description 是否为 RegExp 对象 */
  isRegExp = kindOfTest('RegExp')
  /** @description 是否为异步函数 */
  isAsyncFn = kindOfTest('AsyncFunction')
  /** @description 是否存在上下文对象 */
  isContextDefined = (context: any) => !this.isUndefined(context) && context !== _global
  /** @description 是否为 Buffer 对象 */
  isBuffer(val: any) {
    return (
      val !== null
      && !this.isUndefined(val)
      && val.constructor !== null
      && !this.isUndefined(val.constructor)
      && this.isFunction(val.constructor.isBuffer)
      && val.constructor.isBuffer(val)
    )
  }

  /** @description 是否为 ArrayBuffer 对象 */
  isArrayBufferView(val: any): boolean {
    let result
    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView)
      result = ArrayBuffer.isView(val)
    else
      result = val && val.buffer && this.isArrayBuffer(val.buffer)

    return result
  }

  /** @description 是否为 plain object */
  isPlainObject = (val: any) => {
    if (kindOf(val) !== 'object')
      return false
    const prototype = getPrototypeOf(val)
    return (
      (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null)
      && !(Symbol.toStringTag in val)
      && !(Symbol.iterator in val)
    )
  }

  /** @description 是否为 FormData 对象 */
  isFormData = (thing: any) => {
    let kind
    return (
      thing
      && ((typeof FormData === 'function' && thing instanceof FormData)
      || (this.isFunction(thing.append)
      && ((kind = kindOf(thing)) === 'formdata'
      // detect form-data instance
      || (kind === 'object' && this.isFunction(thing.toString) && thing.toString() === '[object FormData]'))))
    )
  }

  /** @description 是否为 FormData 对象 */
  isSpecCompliantForm(thing: any) {
    return !!(
      thing
      && this.isFunction(thing.append)
      && thing[Symbol.toStringTag] === 'FormData'
      && thing[Symbol.iterator]
    )
  }

  /** @description 是否有 then 方法 */
  isThenable = (thing: any) =>
    thing
    && (this.isObject(thing) || this.isFunction(thing))
    && this.isFunction(thing.then)
    && this.isFunction(thing.catch)

  /** @description 是否绝对地址 */
  isAbsoluteURL(url: string) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
  }

  /** @description 去除字符串首尾的空白符 */
  trim = (str: string) => (str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, ''))
  /** @description 去除字符串中的 BOM */
  stripBOM = (content: string) => {
    if (content.charCodeAt(0) === 0xFEFF)
      content = content.slice(1)

    return content
  }

  /** @description 把 横线、下划线、空格 连接起来的字符串转为小驼峰字符串 */
  toCamelCase = (str: string) => {
    return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, (m, p1, p2) => {
      return p1.toUpperCase() + p2
    })
  }

  /** @description 判断对象是否有某属性 */
  hasOwnProperty = (
    ({ hasOwnProperty }) =>
      (obj: object, prop: string) =>
        hasOwnProperty.call(obj, prop)
  )(Object.prototype)

  /** @description 把baseURL和relativeURL组合起来 */
  combineURLs(baseURL: string, relativeURL: string) {
    return relativeURL ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}` : baseURL
  }

  /** @description 将类数组对象转为真正的数组 */
  toArray = (thing: any) => {
    if (!thing)
      return null
    if (this.isArray(thing))
      return thing
    let i = thing.length
    if (!this.isNumber(i))
      return null
    const arr = new Array(i)
    while (i-- > 0)
      arr[i] = thing[i]

    return arr
  }

  /** @description 迭代数组或对象 */
  forEach(obj: AnyObj | Array<any>, fn: (...args: any[]) => void) {
    if (obj === null || typeof obj === 'undefined')
      return

    if (typeof obj !== 'object')
      obj = [obj]

    if (this.isArray(obj)) {
      for (let i = 0, l = obj.length; i < l; i++)
        fn.call(null, obj[i], i, obj)
    }
    else {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
          fn.call(null, obj[key], key, obj)
      }
    }
  }

  /** @description 对象合并 */
  merge(...args: object[]) {
    // @ts-expect-error
    const { caseless } = (this.isContextDefined(this) && this) || {}
    const result: AnyObj = {}
    const assignValue = (val: any, key: string) => {
      const targetKey = (caseless && findKey(result, key)) || key
      if (this.isPlainObject(result[targetKey]) && this.isPlainObject(val))
        result[targetKey] = this.merge(result[targetKey], val)
      else if (this.isPlainObject(val))
        result[targetKey] = this.merge({}, val)
      else if (this.isArray(val))
        result[targetKey] = val.slice()
      else
        result[targetKey] = val
    }

    for (let i = 0, l = arguments.length; i < l; i++)
      args[i] && this.forEach(args[i], assignValue)

    return result
  }

  /** @description 将文件对象转为URL */
  readBlob2Url = (blob: Blob, cb: (url: any) => void) => {
    if (!this.isBlob(blob))
      throw new Error('is not Blob')

    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
      reader.readAsDataURL(blob)
    }).then(cb)
  }

  /** @description 洗牌算法 */
  shuffle = (arr: any[]) => {
    const res: any[] = []
    let random = void 0
    while (arr.length > 0) {
      random = Math.floor(Math.random() * arr.length)
      res.push(arr.splice(random, 1)[0])
    }
    return res
  }

  /** @description 深拷贝 */
  deepClone = (source: any, cache = new WeakMap()) => {
    if (typeof source !== 'object' || source === null)
      return source
    if (cache.has(source))
      return cache.get(source)
    const target = Array.isArray(source) ? [] : {}
    Reflect.ownKeys(source).forEach((key) => {
      const val = source[key]
      if (typeof val === 'object' && val !== null)
        target[key] = this.deepClone(val, cache)
      else
        target[key] = val
    })
    return target
  }
}
export default Utils.instance
