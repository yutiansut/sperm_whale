"use strict"


/**
 * Modules.
 * @package
 */
const assert = require("assert").strict
const express = require("express")
const router = express.Router()


/**
 * 认证
 * @private
 */
router.post("/auth", async function (req, res) {
  try {
    let { username, password } = req.body
    assert.deepStrictEqual(typeof username, "string", "失败")
    assert.deepStrictEqual(typeof password, "string", "失败")
    let redisHandle = req.handle.connects.redis
    let configure = req.handle.configure
    let token = req.handle.auth.decrypt({ redisHandle, configure, username, password })
    res.sendOn("auth.callback", token)
  } catch (error) {
    res.sendError(error)
  }
})


/**
 * exports routers.
 */
module.exports = router