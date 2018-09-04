/**
 * 数据封包解包
 * TCP通信协议
 * 协议封装详情
 * -------------------------------------
 * | head u8 | length int16 | data u8  |
 * -------------------------------------
 * | 0x00    | 32767        |  buffer  |
 * | 0x00    | 32767        |  message |
 * | 0x09    | 32767        |          |
 * |         | 32767        |          |
 * -------------------------------------
 * @ mr.panda
 */
"use strict"

/**
 * Modules.
 * @public
 */
const assert = require("assert").strict

/**
 * 数据打包
 * @param {object|String|Buffer} data
 * @returns {Buffer}
 * @public
 */
exports.from = function (data) {
  
  // 检查类型转buffer
  if (!Buffer.isBuffer(data)) {
    if (typeof data === "object") {

      // 对象转字符串
      data = Buffer.from(JSON.stringify(data))
    } else 
    if (typeof data === "string") {
      
      // 字符串直接构建Buffer
      data = Buffer.from(data)
    } else {

      // 不能处理的数据
      throw new Error("参数类型错误")
    }
  }

  /**
   * 检查数据包长度
   * 数据包长度限制
   * max <= 131068
   */
  if (Math.ceil(data.length / 32767) > 4) {
    throw new Error("数据长度超长 [max = 131068]")
  }

  /**
   * 数据包长度转4位数组
   * 循环4次
   * 高位为int16最大值32767
   * 低位为0
   */
  // 数据长度
  let dataLength = data.length
  let Int16Len = Buffer.alloc(8)

  /**
   * 循环数组
   * 数值索引为要写入的包头数组索引
   */
  for (let v of [0, 2, 4, 6]) {

    /**
     * 如果长度能除整
     * 写入高位
     * 减去高位值
     */
    if (dataLength >= 32767) {
      Int16Len.writeInt16BE(32767, v, v + 1)
      dataLength -= 32767
    } else {

      /**
       * 如果长度已经被除完
       * 直接写入低位
       */
      if (dataLength === 0) {
        Int16Len.writeInt16BE(0, v, v + 1)
      } else {

        /**
         * 如果还有数值
         * 但是不能被除整
         * 直接取值
         */
        Int16Len.writeInt16BE(dataLength, v, v + 1)
        dataLength -= dataLength
      }
    }
  }

  /**
   * 组包
   * 连接包头和数据
   * 返回Buffer
   */

  // 包头转Buffer
  let headBuffer = Buffer.from([ 0x00, 0x00, 0x09 ])

  // 连接之后的长度
  let packageLength = headBuffer.length + Int16Len.length + data.length

  // 返回数据包
  return Buffer.concat([headBuffer, Int16Len, data], packageLength)
}

/**
 * 数据解包
 * @param {Buffer} data
 * @returns {Object}
 * @public
 */
exports.parse = function (data) {
  try {
    // 包头长度
    let HEAD_LENGHT = 11

    // 数据包句柄
    let dataHandle = {
      length: 0,
      buffer: []
    }

    // 校验包头
    assert.deepStrictEqual(Buffer.isBuffer(data), true, "数据包不合法")
    assert.deepStrictEqual(data[0], 0x00, "数据包不合法")
    assert.deepStrictEqual(data[1], 0x00, "数据包不合法")
    assert.deepStrictEqual(data[2], 0x09, "数据包不合法")

    // 取包长度
    dataHandle.length += data.readInt16BE(3, 4)
    dataHandle.length += data.readInt16BE(5, 6)
    dataHandle.length += data.readInt16BE(7, 8)
    dataHandle.length += data.readInt16BE(9, 10)

    // 截取包数据实体
    dataHandle.buffer = data.slice(HEAD_LENGHT, dataHandle.length + HEAD_LENGHT)

    // 返回解析数据
    return dataHandle
  } catch (error) {
    throw error
  }
}