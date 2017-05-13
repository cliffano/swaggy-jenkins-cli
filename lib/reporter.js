const yaml = require('node-yaml');

function _console(definitions, opts) {
  console.log(yaml.dump(definitions));
}

function file(definitions, opts) {
  yaml.writeSync(opts.outFile, definitions);
}

exports.console = _console;
exports.file    = file;
