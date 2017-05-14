const colors = require('colors');
const p      = require('path');
const yaml   = require('node-yaml');

function _console(definitions, opts) {
  console.log(yaml.dump(definitions));
}

function file(definitions, opts) {
  var outFile = p.join(process.cwd(), opts.outFile);
  console.log('Writing output file %s...'.cyan, outFile);
  yaml.writeSync(outFile, definitions);
}

exports.console = _console;
exports.file    = file;
