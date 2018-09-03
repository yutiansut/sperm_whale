"use strict";

const assert = require("assert").strict;
const events = require("events");
const protocol = require("./protocol");

/**
 * TCP服务类
 * @class
 * @public
 * @returns {Class}
 */
module.exports = class {

  /**
   * 初始化
   * @private
   */
  constructor ({ configure, dataBaseProse }) {
    this.configure = configure;
    this.dataBaseProse = dataBaseProse;
    this.eventEmitters = new events.EventEmitter();
    this.loop = {};
  }

  /**
   * 发送数据
   * @param {Socket} socketHandle
   * @param {Object|String|Buffer} data
   * @returns {Error|undefined}
   * @private
   */
  send (socketHandle, data) {
    try {

      /**
       * 是否已经被销毁
       * 断开socket
       * 清理连接池
       */
      if (socketHandle.destroyed) {
        socketHandle.end();
        return;
      }

      // 过滤心跳包
      if ((Buffer.from([0x01]).equals(data))) {
        socketHandle.write(data);
        return;
      }

      /**
       * 消息打包
       * 发送消息
       */
      socketHandle.write(protocol.from(data));
    } catch (error) {
      throw error;
    }
  }

  /**
   * 连接句柄
   * @param {Object} socketHandle
   * @private
   */
  handle (socketHandle) {
    try {

      // 接收到消息
      socketHandle.on("data", async bufferHandle => {
        try {

          // 过滤心跳包
          if ((Buffer.from([0x01]).equals(bufferHandle))) {
            this.send(Buffer.from([0x00]));
            return;
          }

          // 解包
          await this.dataBaseProse.parse(protocol.parse(bufferHandle));
        } catch (error) {
          this.eventEmitters.emit("error", "socket close");
        }
      });

      // 结束
      socketHandle.on("end", () => {
        /**
         * TODO:
         * 发送FIN
         */
      });

      // 超时
      socketHandle.on("timeout", () => {
        socketHandle.destroy("timeout");
      });

      // 关闭
      socketHandle.on("close", hadError => {

        /**
         * 断开连接时
         * 发生错误
         */
        if (hadError) {
          socketHandle.destroy("close");
          this.eventEmitters.emit("error", "socket close");
        }
      });

      // 错误
      socketHandle.on("error", error => {
        this.eventEmitters.emit("error", error);
      });

      // 写入缓冲区为空
      socketHandle.on("drain", () => {
        /**
         * TODO:
         * 发送缓冲区已经空
         * <未做处理>
         */
      });

      // keepAlive
      socketHandle._keepAlive = setInterval(() => {
        this.send(socketHandle, Buffer.from([0x01]));
      }, this.configure.net.keepAlive);
    } catch (error) {
      this.eventEmitters.emit("error", error);
    }
  }

  /**
   * 绑定服务器句柄
   * @param {Object} serverHandle
   * @private
   */
  bind (serverHandle) {
    
    // 服务关闭
    serverHandle.on("close", () => {
      this.eventEmitters.emit("error", "server close")
    });

    // 错误
    serverHandle.on("error", error => {
      this.eventEmitters.emit("error", error);
    });
  }

  /**
   * 绑定内部事件
   * @param {String} event
   * @param {Function} handle
   * @private
   */
  on (event, handle) {
    this.eventEmitters.on(event, handle);
  }

}