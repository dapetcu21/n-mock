'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var url = require('url');
var querystring = require('querystring');
var jetpack = require('fs-jetpack');

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

  createHtml(root);
  createMockApis(root);

  return function mock(req, res, next) {

    if (req.url.indexOf('mock-api') > -1 && req.url.indexOf('all') < 0) {
      var htmlPath = path.join(root, 'mock-api', 'index.html');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html;charset=UTF-8');
      res.end(fs.readFileSync(htmlPath, 'utf8'));
      next();
    } else {

      var query = url.parse(req.url).query;
      var status = querystring.parse(query)._status || '200';

      getMockJsonPath(root, req.url, req.method, function(mockJsonPath) {
        if (!mockJsonPath) {
          next();
        } else {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json;charset=UTF-8');
          res.end(fs.readFileSync(mockJsonPath, 'utf8'));
          next();
        }

      });

    }


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

function createHtml(mockPath) {
  var src = path.join(__dirname, '.npmignore');
  var dest = path.join(mockPath, 'mock-api', 'index.html');
  jetpack.copy(src, dest, { overwrite: true });
}


function createMockApis(mockPath) {
  var data = jetpack.find(mockPath, {
    matching: ['*.json']
  });

  var res = [];

  data.forEach(function(d) {
    if (d.indexOf('mock-api') < 0) {
      var item = {
        url: d.split('mocks')[1]
      }
      if (jetpack.read(d)) {
        var json = jetpack.read(d, 'json');
        item.res = json;
      } else {
        item.res = null;
      }
      res.push(item);
    }
  });

  jetpack.write(path.join(mockPath, 'mock-api', 'all.GET.response.200.json'), res);
}
