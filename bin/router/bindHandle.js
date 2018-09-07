"use strict"


/**
 * Modules.
 * @package
 */
const express = require("express")
const router = express.Router()


/**
 * 路由句柄
 * @class
 * @returns {prototype}
 */
function RouterHandle () {
  this.express = router
}


/**
 * 绑定路由句柄
 * @method
 * @param {string} name 
 * @param {object} value
 * @returns {object}
 */
RouterHandle.prototype.use = function (name, value) {
  Object.defineProperty(RouterHandle.prototype, name, {
    enumerable: true,
    get: function () {
      return value || {}
    }
  })
}


/**
 * 绑定路由类
 * @method
 * @param {this} handle
 * @param {Router} router
 */
RouterHandle.prototype.bindRouter = function (handle, routers, debug) {
  router.use(function (req, res, next) {
    res.sendOn = (event, data) => res.json({ event, data: data })
    res.sendError = error => res.json(Object.assign({ 
      event: "error", data: error.message 
    }, debug ? { stack: error.stack } : {}))
    req.handle = handle
    next()
  }, routers)
}


/**
 * exports.
 */
module.exports = RouterHandle