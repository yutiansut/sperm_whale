"use strict"


/**
 * modules.
 * @package
 */
const os = require("os")
const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const moment = require("moment")


/**
 * 日志句柄
 * @param {object} [configure]
 * @returns {prototype}
 * @class
 */
function journalHandle (configure) {
  this.configure = configure
}


/**
 * 组合日志
 * @param {object} [journal]
 * @method
 */
journalHandle.prototype.toStr = function (journal) {
  let time = moment(new Date()).format("YYYYMMDDHHmmss")
  let body = "message" in journal && "stack" in journal ? 
  (`ERROR: ` + journal.stack) : 
  (`INFO: ` + journal)
  return time + ` ` + body + os.EOL
}


/**
 * 新建文件
 * @param {string} [journal]
 */
journalHandle.prototype.addFile = function (journal) {
  let filename = moment(new Date()).format("YYYYMMDDHHmmss") + `.log`
  fs.writeFileSync(path.join(this.configure.log.path, filename), journal)
}


/**
 * 追加写入文件
 * @param {string} journal 
 * @param {string} filename
 */
journalHandle.prototype.appFile = function (journal, filename) {
  fs.appendFileSync(path.join(this.configure.log.path, filename), journal)
}


/**
 * 写入文件系统
 * @param {error} [journal]
 * @method
 */
journalHandle.prototype.diskStoage = function (journal) {
  let files = fs.readdirSync(this.configure.log.path)
  console.warn(chalk.blue(journal))
  if (files.length === 0) {
    this.addFile(journal)
  } else {
    let filename = files[files.length-1]
    let stat = fs.statSync(path.join(this.configure.log.path, filename))
    stat.size > 10485760 ? 
    this.addFile(journal) : 
    this.appFile(journal, filename)
  }
}


/**
 * 绑定外部事件循环
 * @param {object} eventHandle 
 * @param {object} configure
 * @module
 */
journalHandle.prototype.use = function (handle) {
  eventHandle.on("journal", function (data) { try {
    this.diskStoage(this.toStr(data))
  } catch (error) { console.warn(chalk.red(error)) }})
  handle.on("error", function (data) { try {
    this.diskStoage(this.toStr(data))
  } catch (error) { console.warn(chalk.red(error)) }})
}


/**
 * exports journalHandle.
 * @exports
 */
module.exports = journalHandle