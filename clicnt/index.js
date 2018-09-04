"use strict"

const net = require("net")
const events = require("events")
const eventEmitter = new events.EventEmitter()

function Handle (options = {}) {
  options.port = options.port || 89
  options.host = options.host || "localhost"
  options.auth = options.auth || {}

  this.options = options
  this.socket = net.createConnection({ 
    port: options.port, 
    host: options.host 
  })

  this.socket.on("close", () => eventEmitter.emit("_close", this))
  this.socket.on("connect", () => eventEmitter.emit("_connect", this))
  this.socket.on("end", () => eventEmitter.emit("_end", this))
  this.socket.on("timeout", () => eventEmitter.emit("_timeout", this))
  this.socket.on("data", data => eventEmitter.emit("_data", Object.assign(this, { _data: data })))
  this.socket.on("error", error => eventEmitter.emit("_error", Object.assign(this, { _error: error })))

  eventEmitter.on("_send", data => this.socket.write(Buffer.from(JSON.stringify(data))))
  eventEmitter.emit("_send", {
    event: "auth",
    data: options.auth
  })
}

Handle.prototype.on = function (name, handle) {
  eventEmitter.on(name, handle)
}

Handle.prototype.send = function () {

}

eventEmitter.on("_error", function (handle) {
  eventEmitter.emit("error", handle._error)
})

eventEmitter.on("_data", function (handle) {
  let { _data, socket, options } = handle
})

module.exports = Handle