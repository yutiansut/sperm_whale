"use strict"


/**
 * modules.
 * @package
 */
const assert = require("assert").strict
const isNullValue = require("../util").isNullValue
const auth = require("../events/auth")


/**
 * 数据库命令解析类
 * @class
 * @public
 */
module.exports = class {
  constructor ({ mongodb, redis }, configure) {
    this.mongodb = mongodb
    this.redis = redis
    this.configure = configure
  }


  /**
   * 代理
   */
  proxy ({ db, collection, method, params }) {

  }


  /**
   * 解析
   */
  parse (msg) {
    return new Promise(async (resolve, reject) => {
      try {
  
        /**
         * 验证数据
         */
        assert.deepStrictEqual(typeof msg, "object")
        assert.deepStrictEqual(typeof msg.db, "string")
        assert.deepStrictEqual(typeof msg.collection, "string")
        assert.deepStrictEqual(typeof msg.auth, "string")
        assert.deepStrictEqual(Array.isArray(msg.use), "object")
        assert.deepStrictEqual(typeof msg.cursor, "string")
  
        /**
         * 认证
         */
        await this.auth(msg)

        /**
         * 提交代理
         */
        this.proxy({ db, collection, method, params })

        /**
         * 运行命令
         * 数据库游标
         * 连接数据表
         */
        let cursor = false
        let collection = this.mongodb[msg.db][msg.collection]

        /**
         * 循环方法
         * 不断叠加游标
         * @param {string} method 方法
         * @param {object} params 参数
         */
        for (let { 
          method, params 
        } of msg.use) {
          // 调用方法
          cursor = ([collection, cursor])[ cursor === false ? 0 : 1 ][method](params)
        }

        /**
         * 输出
         */
        resolve(cursor[msg.cursor]())
      } catch (error) {
        /**
         * 返回错误
         */
        reject(error)
      }
    })
  }
}