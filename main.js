/*!
 * spermWhale
 * git https://gitee.com/jessehealth/spermWhale
 * Copyright(c) 2018-2023 Mr.Panda jessehealth
 * MIT Licensed
 */


/**
 * 数据库二级缓存
 * 消息队列
 * 数据库事件触发器
 */

/**
 * 二级缓存
 * MongoDB 为最终落盘数据库
 * Redis 为高速缓存
 * 通过消息队列到来的数据库查询语句查询出数据
 * 缓存到Redis
 * 并标记数据更新的节点
 * 当绑定的数据更新时
 * 更新缓存数据
 */

/**
 * 消息队列
 * 实现单个小型消息队列
 * 实现发布订阅模式
 * 实现消息管道
 * 实现去中心化
 * 队列消息编号
 * 阅后即焚
 * 对重要消息进行存储
 */

/**
 * 数据库触发器
 * 绑定数据文档
 * 精度达到每个文档级别
 * 当文档更新时
 * 触发事件
 * 通过消息队列订阅的消息管道将事件推送
 */
"use strict"

// system env.
const { 
  SPERMWHALE_APP_CONF = "./configure/app.toml",
  SPERMWHALE_KAFKA_CONF = "./configure/kafka.json",
  SPERMWHALE_MONGODB_CONF = "./configure/mongodb.json",
  SPERMWHALE_REDIS_CONF = "./configure/redis.json",
} = process.env

// Modules.
const fs = require("fs")
const http = require("http")
const toml = require("toml")
const events = require("events")
const express = require("express")
const bodyParser = require("body-parser")

// bin.
const journal = require("./bin/journal")
const connect = require("./bin/database/connect")
const bindHandle = require("./bin/router/bindHandle")
const routers = require("./bin/router/routers")
const auth = require("./bin/events/auth")

// configure.
const kafka = require(SPERMWHALE_KAFKA_CONF)
const mongodb = require(SPERMWHALE_MONGODB_CONF)
const redis = require(SPERMWHALE_REDIS_CONF)
const app = toml.parse(fs.readFileSync(SPERMWHALE_APP_CONF))
const configure = Object.assign(app, { kafka, redis, mongodb })

// constructor.
const expressHandle = express()
const httpService = http.createServer(expressHandle)
const routerHandle = new bindHandle()
const connects = new connect()
const journalHandle = new journal(configure)

// listen database.
connects.topologyRedis(configure.redis)
connects.topologyMongoDB(configure.mongodb)
connects.topologyKafka(configure.kafka)

// router use.
routerHandle.use("connects", connects)
routerHandle.use("configure", configure)
routerHandle.use("auth", auth)
routerHandle.bindRouter(routerHandle, routers)

// express use.
expressHandle.use(bodyParser.json())
expressHandle.use(bodyParser.urlencoded({ extended: true }))
expressHandle.use(routerHandle.express)

// listen.
httpService.listen(configure.net.bindPort)

setTimeout(function () {
  console.log(connects.kafka)
}, 2000)

// log bind.
// journalHandle.use()