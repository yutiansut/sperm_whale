"use strict"


/**
 * 判断是否为NULL
 * @param {.|}
 * @returns {boolean}
 */
exports.isNullValue = function (value) {
  return (value !== null && value !== undefined) === true ? true : false
};