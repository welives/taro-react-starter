const singletonEnforcer = Symbol('Helper')
// 助手函数写这里
class Helper {
  private static _instance: Helper
  constructor(enforcer: any) {
    if (enforcer !== singletonEnforcer) {
      throw new Error('Cannot initialize single instance')
    }
  }
  static get instance() {
    // 如果已经存在实例则直接返回, 否则实例化后返回
    this._instance || (this._instance = new Helper(singletonEnforcer))
    return this._instance
  }
}

export default Helper.instance
