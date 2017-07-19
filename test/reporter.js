const buster   = require('buster-node');
const reporter = require('../lib/reporter');
const yaml     = require('node-yaml');
const referee  = require('referee');
const assert   = referee.assert;

buster.testCase('reporter - _console', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should log a YAML dump of the definitions': function () {
    this.mockConsole.expects('log').once().withExactArgs('somekey:\n  type: object\n  properties: {}\n  id: somedefinitionid\n');
    var definitions = { somekey: {
      type: 'object',
      properties: {},
      id: 'somedefinitionid'
    }};
    reporter.console(definitions, {});
  }
});

buster.testCase('reporter - file', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.mockProcess = this.mock(process);
    this.mockYaml = this.mock(yaml);
  },
  'should write YAML definition to output file': function () {
    var definitions = { somekey: {
      type: 'object',
      properties: {},
      id: 'somedefinitionid'
    }};
    this.mockConsole.expects('log').once().withExactArgs('Writing output file %s...'.cyan, '/tmp/someoutfile');
    this.mockProcess.expects('cwd').once().withExactArgs().returns('/tmp/');
    // this.mockYaml.expects('writeSync').once().withExactArgs('someoutfile', definitions);
    reporter.file(definitions, { outFile: 'someoutfile' });
  }
});
