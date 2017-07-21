const colors    = require('colors');
const fs        = require('fs');
const p         = require('path');
const processor = require('./processor');
const reporter  = require('./reporter');
const util      = require('util');

/**
 * class SwaggyJenkinsCli
 *
 * @param {String} apiType: Jenkins API type, currently only supports 'remote-access'
 */
function SwaggyJenkinsCli(apiType) {
  this.apiType = apiType;
}

/**
 * Convert Jenkins response JSON to OpenAPI definition YAML.
 *
 * @param {Object} opts: optional
 *   - inputPath: path to directory containing response files, or path to a single response file
 *   - reporter: an array of reporters, available reporters: console and file
 *   - outFile: path to output file, used when 'file' reporter is set
 * @param {Function} cb: standard cb(err, result) callback
 */
SwaggyJenkinsCli.prototype.responseToDefinition = function (opts, cb) {

  var self = this;
  function definitionsCb(err, result) {
    if (!err) {
      self._report(result, opts);
    }
    cb(err);
  }

  var responses = this._readResponseFiles(opts.inputPath);
  this._generateDefinitions(responses, definitionsCb);
};

/**
 * Read response files and create response objects.
 *
 * @param {String} inputPath: input path, either a directory of response files, or a single response file
 * @return {Array} an array of response objects
 */
SwaggyJenkinsCli.prototype._readResponseFiles = function (inputPath) {

  var inputIsDir = fs.lstatSync(inputPath).isDirectory();
  var files = (inputIsDir) ? fs.readdirSync(inputPath) : [inputPath];

  var responses = [];
  files.forEach(function (file) {
    var path = (inputIsDir) ? p.join(inputPath, file) : file;
    console.log('Reading response file %s...'.cyan, path);
    var response = JSON.parse(fs.readFileSync(path, 'utf8'));
    response.__sourcePath = path; // used as definition ID when response object doesn't have any class
    responses.push(response);
  });
  return responses;

};

/**
 * Generate definitions from a given set of responses.
 * Currently supports blue-ocean and remote-access API types.
 *
 * @param {Array} responses: an array of response objects
 * @param {Function} cb: standard cb(err, result) callback
 */
SwaggyJenkinsCli.prototype._generateDefinitions = function (responses, cb) {
  if (['blue-ocean', 'remote-access'].includes(this.apiType)) {
    var definitions = {};
    processor.generateDefinitions(responses, definitions);
    cb(null, definitions);
  } else {
    cb(new Error(util.format('Unsupported API type %s', this.apiType)));
  }
};

/**
 * Report generated definitions based on reporter types.
 *
 * @param {Object} definitions: generated definitions object
 * @param {Object} opts: optional
 *   - reporter: an array of reporters, available reporters: console and file
 *   - outFile: path to output file, used when 'file' reporter is set
 */
SwaggyJenkinsCli.prototype._report = function (definitions, opts) {

  opts.reporter.forEach(function (type) {
    reporter[type](definitions, opts);
  });

};

module.exports = SwaggyJenkinsCli;
