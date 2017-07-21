const bag              = require('bagofcli');
const buster           = require('buster-node');
const cli              = require('../lib/cli');
const referee          = require('referee');
const assert           = referee.assert;
const SwaggyJenkinsCli = new require('../lib/swaggyjenkinscli');

buster.testCase('cli - exec', {
  'should contain commands with actions': function (done) {
    var mockCommand = function (base, actions) {
      assert.defined(base);
      assert.defined(actions.commands.response2definition.action);
      done();
    };
    this.mock({});
    this.stub(bag, 'command', mockCommand);
    cli.exec();
  }
});

buster.testCase('cli - response2definition', {
  setUp: function () {
    this.mock({});
  },
  'should contain response2definition command and delegate to SwaggyJenkinsCli responseToDefinition when exec is called': function (done) {
    this.stub(bag, 'command', function (base, actions) {
      actions.commands.response2definition.action('somedir', { _name: 'response2definition', parent: { apiType: 'remote-access', outFile: 'someoutfile.yml' } });
    });
    var opts = { inputPath: 'somedir', reporter: 'console,file', outFile: 'someoutfile.yml' };
    this.stub(SwaggyJenkinsCli.prototype, 'responseToDefinition', function (opts, cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  },
  'should set default API type and handle multiple reporters': function (done) {
    this.stub(bag, 'command', function (base, actions) {
      actions.commands.response2definition.action('somedir', { _name: 'response2definition', reporter: 'console,file', parent: { outFile: 'someoutfile.yml' } });
    });
    var opts = { inputPath: 'somedir', reporter: 'console,file', outFile: 'someoutfile.yml' };
    this.stub(SwaggyJenkinsCli.prototype, 'responseToDefinition', function (opts, cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  }
});
