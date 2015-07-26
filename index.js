'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var url = require('url');
var querystring = require('querystring');

/**
 * Module exports.
 * @public
 */

module.exports = mock;

/**
 * mock data
 *
 * @public
 * @param {String|Buffer} path
 * @param {Object} [options]
 * @return {Function} middleware
 */

function mock(root, options) {
  var opts = options || {};

  return function mock(req, res, next) {
    var mockJsonPath = getMockJsonPath(root, req.url, req.method);

    if (!fs.existsSync(mockJsonPath)) {
      res.end('can not found mock data');
      next();
      return;
    }

    res.setHeader('Content-Type', 'application/json;charset=UTF-8');
    res.end(fs.readFileSync(mockJsonPath, 'utf8'));
    next();
  };
};

///////////////////////////////////////////////////////////////////////////////

/**
 * get mock json path
 *
 * @private
 * @param {string} root
 * @param {string} mockUrlPath
 * @param {string} method
 * @return {string}
 */
function getMockJsonPath(root, reqUrl, method) {
  var mockUrlPath = url.parse(reqUrl).pathname;
  var query = url.parse(reqUrl).query;
  var status = querystring.parse(query)._status || '200';
  return path.join(root, mockUrlPath + '.' + method + '.response.' + status + '.json');
};
