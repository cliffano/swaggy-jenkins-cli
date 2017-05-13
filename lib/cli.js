var bag              = require('bagofcli');
var SwaggyJenkinsCli = require('./swaggyjenkinscli');

function _responseToDefinition(inputPath) {

  var lastArg = arguments[arguments.length - 1];
  var apiType = lastArg.parent.apiType || 'remote-access';

  var opts = {
    inputPath: inputPath,
    reporter: lastArg.reporter ? lastArg.reporter.split(',') : ['console'],
    outFile: lastArg.outFile || 'definitions.yml'
  };

  new SwaggyJenkinsCli(apiType).responseToDefinition(opts, bag.exit);
}

/**
 * Execute Swaggy Jenkins CLI.
 */
function exec() {

  var actions = {
    commands: {
      response2definition: { action: _responseToDefinition }
    }
  };

  bag.command(__dirname, actions);
}

exports.exec = exec;
