'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var url = require('url');
var querystring = require('querystring');
var jetpack = require('fs-jetpack');
var strip = require('strip-comments');
var colors = require('colors');

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
    var isMockApi = req.url.indexOf('mock-api') > -1 && req.url.indexOf('all') < 0;
    if (isMockApi) {

      // render html
      var htmlPath = path.join(root, 'mock-api', 'index.html');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html;charset=utf-8');
      res.end(fs.readFileSync(htmlPath, 'utf8'));
      next();
    } else {

      // response json
      var query = url.parse(req.url).query;
      var status = querystring.parse(query)._status || '200';
      getMockJsonPath(root, req.url, req.method, function(mockJsonPath) {
        if (mockJsonPath) {
          var jsonData = fs.readFileSync(mockJsonPath, 'utf8');
          jsonData = strip(jsonData);

          try {
            var body = jsonData ? JSON.parse(jsonData) : null;
          } catch (e) {
            console.log(colors.red('can not parse josn in file:' + mockJsonPath));
          }

          body = body ? JSON.stringify(body) : null;
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json;charset=utf-8');
          if (body) {
            res.end(body);
          } else {
            res.end();
          }

          next();
        } else {
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
      return callback(false);
    });

  });
};

/**
 * Create template for apis page
 *
 * @private
 * @param {string} mockPath
 * @return {null}
 */
function createHtml(mockPath) {
  var src = path.join(__dirname, 'template.html');
  var dest = path.join(mockPath, 'mock-api', 'index.html');
  jetpack.copy(src, dest, {
    overwrite: true,
  });
}

/**
 * Create json data for apis page
 *
 * @private
 * @param {string} mockPath
 * @return {null}
 */
function createMockApis(mockPath) {
  var jsonFilePath = jetpack.find(mockPath, {
    matching: ['*.json'],
  });

  var data = [];
  jsonFilePath.forEach(function(path) {

    if (path.indexOf('mock-api') < 0) {
      var jsonData = jetpack.read(path);
      jsonData = strip(jsonData);

      try {
        var jsonData = jsonData ? JSON.parse(jsonData) : null;
      } catch (e) {
        console.log(colors.red('can not parse josn in file:' + path));
      }

      var item = {
        url: path.split('mocks')[1],
        res: jsonData,
      };
      data.push(item);
    }
  });

  jetpack.write(path.join(mockPath, 'mock-api', 'all.GET.response.200.json'), data);
}
