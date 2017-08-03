const buster  = require('buster-node');
const util    = require('../lib/util');
const referee = require('referee');
const assert  = referee.assert;

buster.testCase('util - slug', {
  setUp: function () {
    this.mock({});
  },
  'should use class name when text contains package name': function () {
    assert.equals(util.slug('io.jenkisn.embedded.rest.SomeClass'), 'SomeClass');
  },
  'should remove method prefix when text contains method prefix': function () {
    assert.equals(util.slug('getSomeClass'), 'SomeClass');
  },
  'should keep text as slug when it does not contain package name or method prefix': function () {
    assert.equals(util.slug('SomeClass'), 'SomeClass');
  }
});
