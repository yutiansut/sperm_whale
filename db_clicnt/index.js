"use strict";

// modules.
const net = require("net");
const events = require("events")

const eventEmitter = new events.EventEmitter();

/**
 * @param {object} options 
 */
function Handle (options = {}) {
  options.port = options.port || 89;
  options.host = options.host || "localhost";
  options.auth = options.auth || {};

  this.options = options;
  this.socket = net.createConnent({ 
    port: options.port, 
    host: options.host 
  });

  this.socket.on("data", (data) => eventEmitter.emit("timeout", Object.assign(this, { _data: data })));
  this.socket.on("error", (error) => eventEmitter.emit("error", error));
  this.socket.on("close", () => eventEmitter.emit("close", this));
  this.socket.on("connect", () => eventEmitter.emit("connect", this));
  this.socket.on("end", () => eventEmitter.emit("end", this));
  this.socket.on("timeout", () => eventEmitter.emit("timeout", this));
};

eventEmitter.on("data", function (socketHandle) {
  let { _data } = socketHandle;
})