"use strict"


/**
 * packages.
 * @package
 */
const util = require("util")
const redis = require("redis")
const kafka = require("node-rdkafka")
const assert = require("assert").strict
const { MongoClient } = require("mongodb")


/**
 * 连接句柄
 * @class
 * @property {object} MongoDB
 * @property {object} Redis
 * @property {object} Kafka
 * @returns {collectionHandle}
 */
function collectionHandle () {
  this.m = null
  this.r = null
  this.k = null
}


/**
 * 获取MongoDB连接
 * @returns {m}
 */
Object.defineProperty(collectionHandle.prototype, "mongodb", {
  enumerable: true,
  get: function () {
    return this.m || {}
  }
})


/**
 * 获取Redis连接
 * @returns {r}
 */
Object.defineProperty(collectionHandle.prototype, "redis", {
  enumerable: true,
  get: function () {
    return this.r || {}
  }
})


/**
 * 获取Kafka连接
 * @returns {k}
 */
Object.defineProperty(collectionHandle.prototype, "kafka", {
  enumerable: true,
  get: function () {
    return this.k || {}
  }
})


/**
 * 连接到MongoDB服务器
 * @method
 * @param {object} [options={}] 连接配置列表
 */
collectionHandle.prototype.topologyMongoDB = function (options, callback = new Function()) { Object.keys(options).forEach((dbName) => {
  let { host, collection } = options[dbName]
  MongoClient.connect(host, options[dbName].options || {}, (error, connectHandle) => {
    assert.ifError(error)
    this.m = {}
    this.m[dbName] = {}
    for (let collectionName of collection) {
      this
      .m[dbName][collectionName] = connectHandle
      .db(dbName).collection(collectionName)
    }
    callback()
  })
}) }


/**
 * 连接到Redis
 * @method
 * @param {object} [options={}] 连接配置
 */
collectionHandle.prototype.topologyRedis = function (options, callback = new Function()) {
  assert.deepStrictEqual(typeof options, "object")
  this.r = redis.createClient(options)
  this.r.on("ready", () => {
    this.r.__proto__.Del = util.promisify(this.r.del).bind(this.r)
    this.r.__proto__.Get = util.promisify(this.r.get).bind(this.r)
    callback()
  })
  this.r.on("error", function (error) {
    assert.ifError(error)
  })
}


/**
 * 连接到Kafka
 * @method
 * @param {object} [options={}] 连接配置
 */
collectionHandle.prototype.topologyKafka = function (options, callback = new Function()) {
  assert.deepStrictEqual(typeof options, "object")
  this.k = new kafka.Producer({ 
    "metadata.broker.list": options.connect, 
    "dr_cb": true 
  })
  this.k.connect()
  this.k.on("event.error", function(error) {
    assert.ifError(error)
  })
  callback()
}


// exports
module.exports = collectionHandle