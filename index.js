
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

    var query = url.parse(req.url).query;
    var status = querystring.parse(query)._status || '200';

    getMockJsonPath(root, req.url, req.method, function(mockJsonPath) {

      if (!mockJsonPath) {
        res.end('can not found mock data');
        next();
        return;
      }

      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json;charset=UTF-8');
      res.end(fs.readFileSync(mockJsonPath, 'utf8'));

      next();
    });

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
function getMockJsonPath(root, reqUrl, method, callback) {
  var mockUrlPath = url.parse(reqUrl).pathname;
  var query = url.parse(reqUrl).query;

  var status = querystring.parse(query)._status || '200';

  var mockJsonPath = path.join(root, mockUrlPath + '.' + method + '.response.' + status + '.json');

  var shortMockJsonPath = path.join(root, mockUrlPath + '.' + method + '.response.json');

  fs.exists(mockJsonPath, function(exists) {
    if (exists) return callback(mockJsonPath);

    fs.exists(shortMockJsonPath, function(existsShort) {
      if (existsShort) return callback(shortMockJsonPath);
      return callback();
    });

  });
};
