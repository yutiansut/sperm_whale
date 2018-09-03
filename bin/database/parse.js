"use strict";

const assert = require("assert").strict;
const isNullValue = require("../util").isNullValue;

/**
 * 数据库命令解析类
 * @class
 * @public
 */
module.exports = class {
  constructor ({ mongodb, redis }) {
    this.mongodb = mongodb;
    this.redis = redis;
  }


  /**
   * 代理
   */
  proxy ({ db, collection, method, params }) {

  }


  /**
   * 认证
   */
  auth () {

  }


  /**
   * 解析
   */
  parse () {
    return new Promise(async (resolve, reject) => {
      try {
  
        /**
         * 验证数据
         */
        assert.deepStrictEqual(typeof sql, "object", "命令错误");
        assert.deepStrictEqual(typeof sql.db, "string", "命令错误");
        assert.deepStrictEqual(typeof sql.collection, "string", "命令错误");
        assert.deepStrictEqual(typeof sql.auth, "string", "命令错误");
        assert.deepStrictEqual(Array.isArray(sql.use), "object", "命令错误");
        assert.deepStrictEqual(typeof sql.cursor, "string", "命令错误");
  
        /**
         * 认证
         */
        await this.auth(sql);

        // 提交代理
        this.proxy({ db, collection, method, params });

        /**
         * 连接数据表
         */
        let db = this.mongodb[sql.db];
        assert.deepStrictEqual(isNullValue(db), true, "找不到数据库");
        let collection = db[sql.collection];
        assert.deepStrictEqual(isNullValue(collection), true, "找不到数据表");

        /**
         * 运行命令
         * 数据库游标
         */
        let cursor = false;
        /**
         * 循环方法
         * 不断叠加游标
         * @param {string} method 方法
         * @param {object} params 参数
         */
        for (let { 
          method, params 
        } of sql.use) {
          // 调用方法
          cursor = ([collection, cursor])[ cursor === false ? 0 : 1 ][method](params);
        };

        /**
         * 输出
         */
        resolve(cursor[sql.cursor]());
      } catch (error) {
        /**
         * 返回错误
         */
        reject(error);
      }
    })
  }
}