const buster           = require('buster-node');
const fs               = require('fs');
const processor        = require('../lib/processor');
const reporter         = require('../lib/reporter');
const SwaggyJenkinsCli = require('../lib/swaggyjenkinscli');
const referee          = require('referee');
const assert           = referee.assert;

buster.testCase('SwaggyJenkinsCli - constructor', {
  setUp: function () {
    this.mock({});
  },
  'should set API type': function () {
    var swaggyJenkinsCli = new SwaggyJenkinsCli('remote-access');
    assert.equals(swaggyJenkinsCli.apiType, 'remote-access');
  }
});

buster.testCase('SwaggyJenkinsCli - responseToDefinition', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.mockFs = this.mock(fs);
  },
  'should call report after reading response files and generating definitions': function (done) {
    function cb(err) {
      done();
    }
    var swaggyJenkinsCli = new SwaggyJenkinsCli('remote-access');
    swaggyJenkinsCli._readResponseFiles = function (inputPath) {
      return [];
    };
    swaggyJenkinsCli._generateDefinitions = function (responses, definitionsCb) {
      definitionsCb(null, {});
    };
    swaggyJenkinsCli._report = function (result, opts) {
      assert.equals(opts.inputPath, 'some/input/path');
    };
    swaggyJenkinsCli.responseToDefinition({ inputPath: 'some/input/path' }, cb);
  },
  'should pass the error when an error occurs': function (done) {
    function cb(err) {
      assert.equals(err.message, 'some error');
      done();
    }
    var swaggyJenkinsCli = new SwaggyJenkinsCli('remote-access');
    swaggyJenkinsCli._readResponseFiles = function (inputPath) {
      return [];
    };
    swaggyJenkinsCli._generateDefinitions = function (responses, definitionsCb) {
      definitionsCb(new Error('some error'), {});
    };
    swaggyJenkinsCli.responseToDefinition({ inputPath: 'some/input/path' }, cb);
  }
});

buster.testCase('SwaggyJenkinsCli - _readResponseFiles', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.mockFs = this.mock(fs);
  },
  'should read all files in directory': function () {
    var mockStat = {
      isDirectory: function() {
        return true;
      }
    };
    var files = [
      'file1.json',
      'file2.json'
    ];
    this.mockConsole.expects('log').once().withExactArgs('Reading response file %s...'.cyan, 'some/input/path/file1.json');
    this.mockConsole.expects('log').once().withExactArgs('Reading response file %s...'.cyan, 'some/input/path/file2.json');
    this.mockFs.expects('lstatSync').once().withExactArgs('some/input/path').returns(mockStat);
    this.mockFs.expects('readdirSync').once().withExactArgs('some/input/path').returns(files);
    this.mockFs.expects('readFileSync').once().withExactArgs('some/input/path/file1.json', 'utf8').returns('{}');
    this.mockFs.expects('readFileSync').once().withExactArgs('some/input/path/file2.json', 'utf8').returns('{}');
    var swaggyJenkinsCli = new SwaggyJenkinsCli('remote-access');
    responses = swaggyJenkinsCli._readResponseFiles('some/input/path');
    assert.equals(responses.length, 2);
    assert.equals(responses[0].__sourcePath, 'some/input/path/file1.json');
    assert.equals(responses[1].__sourcePath, 'some/input/path/file2.json');
  },
  'should read a single file': function () {
    var mockStat = {
      isDirectory: function() {
        return false;
      }
    };
    this.mockConsole.expects('log').once().withExactArgs('Reading response file %s...'.cyan, 'some/input/path/file0.json');
    this.mockFs.expects('lstatSync').once().withExactArgs('some/input/path/file0.json').returns(mockStat);
    this.mockFs.expects('readFileSync').once().withExactArgs('some/input/path/file0.json', 'utf8').returns('{}');
    var swaggyJenkinsCli = new SwaggyJenkinsCli('remote-access');
    responses = swaggyJenkinsCli._readResponseFiles('some/input/path/file0.json');
    assert.equals(responses.length, 1);
    assert.equals(responses[0].__sourcePath, 'some/input/path/file0.json');
  }
});

buster.testCase('SwaggyJenkinsCli - _generateDefinitions', {
  setUp: function () {
    this.mockProcessor = this.mock(processor);
  },
  'should pass error to callback when API type is unsupported': function (done) {
    function cb(err) {
      assert.equals(err.message, 'Unsupported API type some-unsupported-api-type');
      done();
    }
    var swaggyJenkinsCli = new SwaggyJenkinsCli('some-unsupported-api-type');
    swaggyJenkinsCli._generateDefinitions({}, cb);
  },
  'should generate definitions when API type is supported': function (done) {
    this.mockProcessor.expects('generateDefinitions').once().withExactArgs({}, {});
    var swaggyJenkinsCli = new SwaggyJenkinsCli('blue-ocean');
    swaggyJenkinsCli._generateDefinitions({}, done);
  }
});

buster.testCase('SwaggyJenkinsCli - _report', {
  setUp: function () {
    this.mockReporter = this.mock(reporter);
  },
  'should call all reporters': function () {
    var opts = { reporter: ['console', 'file'] };
    this.mockReporter.expects('console').once().withExactArgs({}, opts);
    this.mockReporter.expects('file').once().withExactArgs({}, opts);
    var swaggyJenkinsCli = new SwaggyJenkinsCli('remote-access');
    swaggyJenkinsCli._report({}, opts);
  }
});
