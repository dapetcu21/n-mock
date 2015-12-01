#! /usr/bin/env node

var os = require('os');
var program = require('commander');
var colors = require('colors');
var connect = require('connect');
var opn = require('opn');
var devip = require('dev-ip');
var mock = require('../index');
var pkg = require('../package.json');

program
  .version('v' + pkg.version)
  .option('-v, --version', 'display version')
  .option('-b, --baseDir <path>', 'Add pineapple')
  .option('-p, --port [port]', 'Add peppers');


program.on('--help', function() {
  console.log('  Examples:');
  console.log();
  console.log('    n-mock -b .');
  console.log();
});

program.parse(process.argv);


if (!program.baseDir) return console.log('baseDir is required'.red);
var baseDir = getBaseDir(program.baseDir);
var port = program.port || 12306;

var app = connect();
app.use(mock(baseDir));
app.listen(port);

openBrowser(port)


function getBaseDir(baseDir) {
  return (program.baseDir === '.') ? baseDir = process.cwd() : baseDir;
}

function openBrowser(port) {
  var externalUrl = 'http://' + devip()[0] + ':' + port + '/mock-api'
  var localUrl = 'http://localhost:' + port + '/mock-api'
  console.log('Access URLs');
  console.log('--------------------------------------');
  console.log('   Local:  ' + externalUrl.green);
  console.log('External:  ' + localUrl.green);
  opn(externalUrl);
}
