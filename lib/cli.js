"use strict"
import bag from 'bagofcli';
import SwaggyJenkinsCli from './swaggyjenkinscli.js';

const DIRNAME = p.dirname(import.meta.url).replace('file://', '');

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

  const actions = {
    commands: {
      response2definition: { action: _responseToDefinition }
    }
  };

  bag.command(DIRNAME, actions);
}

const exports = {
  exec: exec
};

export {
  exports as default
};