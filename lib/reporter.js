const colors = require('colors');
const p      = require('path');
const yaml   = require('node-yaml');

/**
 * Write definitions YAML to console stdout.
 *
 * @param {Array} definitions: an array of definitions object
 * @param {Object} opts: unused, only here for signature consistency
 */
function _console(definitions, opts) {
  console.log(yaml.dump(definitions));
}

/**
 * Write definitions YAML to file.
 *
 * @param {Array} definitions: an array of definitions object
 * @param {Object} opts: optional
 *   - outFile: path to output file, relative to where the process runs
 */
function file(definitions, opts) {
  var outFile = p.join(process.cwd(), opts.outFile);
  console.log('Writing output file %s...'.cyan, outFile);
  yaml.writeSync(outFile, definitions);
}

exports.console = _console;
exports.file    = file;
