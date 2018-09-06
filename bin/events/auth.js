"use strict"


/**
 * modules.
 * @package
 */
const util = require("../util")
const assert = require("assert").strict
const querystring = require("querystring")


/**
 * 获取token
 * @param {object} [redisHandle] redis句柄
 * @param {string} [username] 用户名
 * @param {string} [password] 密码
 * @param {string} [type] 加密方法
 * @param {string} [key] 加密密钥
 * @returns {String} 密文
 * @throws {Error}
 */
exports.decrypt = function ({ redisHandle, username, password, type, key }) {
  try {
    assert.deepStrictEqual(util.isNullValue(redisHandle), true, "失败")
    assert.deepStrictEqual(typeof username, "string", "失败")
    assert.deepStrictEqual(typeof password, "string", "失败")
    ssert.deepStrictEqual(typeof type, "string", "失败")
    assert.deepStrictEqual(typeof key, "string", "失败")
    let pwd = Buffer.from(password).toString("base64")
    let querystr = querystring.stringify({ username, password: pwd })
    let iv = password.length >= 16 ? password.slice(0, 16) : password.padStart(16, "A")
    let hex = util.decrypt({ text: querystr, iv, type, key })
    let token = Buffer.from(querystring.stringify({ username, hex })).toString("base64")
    redisHandle.set("@SYSTEM.AUTH." + username, JSON.stringify({ password, iv, token, type, key }))
    return token
  } catch (error) {
    throw error
  }
}


/**
 * 解析token
 * @param {object} [redisHandle] redis句柄
 * @param {string} [token] 密文
 * @param {string} [type] 加密方法
 * @param {string} [iv] 加密初始化向量
 * @param {string} [key] 加密密钥
 * @returns {Object} 明文
 * @throws {Error}
 */
exports.parse = async function ({ redisHandle, token }) {
  try {
    assert.deepStrictEqual(util.isNullValue(redisHandle), true, "失败")
    assert.deepStrictEqual(typeof username, "string", "失败")
    ssert.deepStrictEqual(typeof iv, "string", "失败")
    assert.deepStrictEqual(typeof token, "string", "失败")
    ssert.deepStrictEqual(typeof type, "string", "失败")
    assert.deepStrictEqual(typeof key, "string", "失败")
    let crypted = querystring.parse(Buffer.from(token, "base64").toString("utf8"))
    assert.deepStrictEqual("username" in crypted, true, "失败")
    assert.deepStrictEqual(typeof crypted.username, "string", "失败")
    let user = await redisHandle.Get("@SYSTEM.AUTH." + crypted.username)
    assert.deepStrictEqual(util.isNullValue(user), true, "失败")
    return JSON.parse(user)
  } catch (error) {
    throw error
  }
}