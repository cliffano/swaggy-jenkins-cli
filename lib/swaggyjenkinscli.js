const colors       = require('colors');
const fs           = require('fs');
const p            = require('path');
const remoteAccess = require('./remoteaccess');
const reporter     = require('./reporter');
const util         = require('util');

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

SwaggyJenkinsCli.prototype._generateDefinitions = function (responses, cb) {

  var processor;
  if (this.apiType === 'remote-access') {
    var definitions = {};
    remoteAccess.generateDefinitions(responses, definitions);
    cb(null, definitions);
  } else {
    cb(new Error(util.format('Unsupported API type %s', this.apiType)));
  }
};

SwaggyJenkinsCli.prototype._report = function (definitions, opts) {

  opts.reporter.forEach(function (type) {
    reporter[type](definitions, opts);
  });

};

module.exports = SwaggyJenkinsCli;
