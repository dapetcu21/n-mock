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
    } else if(req.url === '/mock-api/all') {
      var allData = jetpack.read(path.join(root, '/mock-api/all.GET.json'), 'json');
      // allData = JSON.parse(allData);
      allData = JSON.stringify(allData);
      console.log(allData);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      res.end(allData);
      next();
    } else {

      // response json
      var query = url.parse(req.url).query;
      var status = querystring.parse(query)._status || '200';
      getMockJsonPath(root, req.url, req.method, function(mockJsonPath) {

        if (mockJsonPath) {
          var reg = /```[js| js|javascript| javascript]([^`]+)```/gi;
          var str = fs.readFileSync(mockJsonPath, 'utf8');
          var arr = str.match(reg);
          var resStr = null;
          if (arr.length) {
            arr.forEach(function(item) {
              if (item.toString().indexOf('<response>' > -1)) {
                resStr = item.toString();
              }
            });
          }

          try {
            resStr = resStr.replace(/```js|``` js|```javascript|``` javascript|```/gi, '');
            resStr = strip(resStr);
            resStr = eval(resStr);
            resStr = resStr ? JSON.stringify(resStr) : null;
          } catch (e) {
            console.log(colors.red('can not parse josn in file:' + mockJsonPath))
          }

          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json;charset=utf-8');
          if (resStr) {
            res.end(resStr);
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
}
;

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
  var mockJsonPath = path.join(root, mockUrlPath + '.' + method + '.' + '.md');

  fs.exists(mockJsonPath, function(exists) {
    if (exists) return callback(mockJsonPath);
    return callback(false);
  });
}
;


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
    overwrite: true
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
  var mdFilePath = jetpack.find(mockPath, {
    matching: ['*.md']
  });

  var data = [];
  mdFilePath.forEach(function(path) {

    if (path.indexOf('mock-api') < 0) {
      var mdData = jetpack.read(path);
      mdData = strip(mdData);

      var item = {
        url: path.split('mocks')[1],
        res: mdData
      }
      data.push(item);
    }
  });

  jetpack.write(path.join(mockPath, 'mock-api', 'all.GET.json'), data);
}
