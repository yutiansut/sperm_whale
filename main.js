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
  SPERMWHALE_HOME = __dirname,
  SPERMWHALE_CONF = "./configure.toml",
} = process.env

// Modules.
const fs = require("fs")
const net = require("net")
const toml = require("toml")

// bin.
const busService = require("spermwhales/busService")
const taskNumber = require("./bin/task/number")
const tcpService = require("./bin/tcp/service")
const dataBaseProse = require("./bin/database/parse")

// constructor.
const busServices = new busService()
const dataBaseProses = new dataBaseProse(busService)
const configure = toml.parse(fs.readFileSync(SPERMWHALE_CONF))
const tcpHandle = new tcpService({ configure, dataBaseProses })
const server = net.createServer(socket => tcpHandle.handle(socket))

// listen.
tcpHandle.bind(server)
server.listen(configure.net.bindPort)

// listen database.
busServices.Redis(configure.redis)
busServices.Mongodb(configure.mongodb)