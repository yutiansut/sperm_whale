"use strict"


/**
 * Modules.
 * @private
 */
const assert = require("assert").strict
const events = require("events")


/**
 * 发号类
 */
module.exports = class {
  constructor () {
    this.codeNumber = 0
    this.eventEmitters = new events.EventEmitter()

    /**
     * 定时刷号
     * 每隔1秒重置号段位数
     */
    setInterval(function () {
      codeNumber = 0
    }, 1000)
  }


  /**
   * 取号
   * @returns {String}
   */
  get () {
    try {
      codeNumber += 1
      return String(Date.now()) + String(codeNumber)
    } catch (error) {
      this.eventEmitters.emit("error", error)
    }
  }


  /**
   * 监听事件
   * @param {String} event
   * @param {Function} handle
   */
  on (event, handle) {
    this.eventEmitters.on(event, handle)
  }
}