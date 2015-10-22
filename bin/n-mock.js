#! /usr/bin/env node

var fs = require('fs');
var program = require('commander');

program
  .version('v1.1.3')
  .option('-v, --version', 'display version');

program
  .command('exec <cmd>')
  .alias('ex')
  .description('execute the given remote cmd')
  .option('-e, --exec_mode <mode>', 'Which exec mode to use')
  .action(function(cmd, options) {
    console.log('ee');
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ deploy exec sequential');
    console.log('    $ deploy exec async');
    console.log();
  });

program
  .command('*')
  .action(function(env) {
    console.log('deploying "%s"', env);
  });

program.parse(process.argv);
