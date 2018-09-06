"use strict"


/**
 * Modules.
 * @package
 */
const crypto = require("crypto")


/**
 * 判断是否为NULL
 * @param {.|}
 * @returns {boolean}
 */
exports.isNullValue = function (value) {
  return (value !== null && value !== undefined) === true ? true : false
}


/**
 * 加密
 * @param {string} [text] 加密内容
 * @param {string} [iv] 加密初始化向量
 * @param {string} [type] 加密方法
 * @param {string} [key] 加密密钥
 * @returns {String} 密文
 * @throws {Error} 
 */
exports.decrypt = function ({ text, iv, type, key }) {
  let cipher = crypto.createCipheriv(type, key, iv)
  let crypted = cipher.update(text, "utf8", "hex")
  crypted += cipher.final("hex")
  return crypted
}


/**
 * 解密
 * @param {string} [text] 密文
 * @param {string} [iv] 加密初始化向量
 * @param {string} [type] 加密方法
 * @param {string} [key] 加密密钥
 * @returns {String} 明文
 * @throws {Error} 
 */
exports.encrypt = function ({ text, iv, type, key }) {
  let decipher = crypto.createDecipheriv(type, key, iv)
  let dec = decipher.update(text, "hex", "utf8")
  dec += decipher.final("utf8")
  return dec
}