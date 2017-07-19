var buster = require('buster-node');
var processor = require('../lib/processor');
var referee = require('referee');
var assert = referee.assert;

buster.testCase('processor - processStringProperty', {
  setUp: function () {
    this.mock({});
  },
  'should set definition property type to string': function () {
    var definition = { properties: {} };
    var value = 'somevalue';
    processor.processStringProperty('somekey', value, definition, {}, {});
    assert.equals(definition.properties.somekey.type, 'string');
  }
});

buster.testCase('processor - processNullProperty', {
  setUp: function () {
    this.mock({});
  },
  'should set definition property type to string': function () {
    var definition = { properties: {} };
    var value = null;
    processor.processNullProperty('somekey', value, definition, {}, {});
    assert.equals(definition.properties.somekey.type, 'string');
  }
});

buster.testCase('processor - processNumberProperty', {
  setUp: function () {
    this.mock({});
  },
  'should set definition property type to integer': function () {
    var definition = { properties: {} };
    var value = 8;
    processor.processNumberProperty('somekey', value, definition, {}, {});
    assert.equals(definition.properties.somekey.type, 'integer');
  }
});

buster.testCase('processor - processArrayProperty', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should log warning message showing the ignored property key when value is empty': function () {
    this.mockConsole.expects('warn').once().withExactArgs('Ignoring property %s - value is an empty array'.yellow, 'somekey');
    var value = [];
    processor.processArrayProperty('somekey', value, {}, {}, {});
  },
  'should log error message when array item type is unsupported': function () {
    this.mockConsole.expects('error').once().withExactArgs('Unsupported array item type %s'.red, 'boolean');
    var value = [ true ];
    processor.processArrayProperty('somekey', value, {}, {}, {});
  },
  'should set definition type when array item is a string': function () {
    var definition = { id: 'someid', properties: {} };
    var value = [ 'somestring' ];
    processor.processArrayProperty('somekey', value, definition, {}, {});
    assert.equals(definition.properties.somekey.type, 'array');
    assert.equals(definition.properties.somekey.items.type, 'string');
  },
  'should set definition type when array item is an object': function (done) {
    var definition = { id: 'someid', properties: {} };
    var value = [ { _class: 'some.class' } ];
    processor.processObject = function(value, definitions) {
      assert.equals(definition.properties.somekey.type, 'array');
      assert.equals(definition.properties.somekey.items.$ref, '#/definitions/someclass');
      done();
    };
    processor.processArrayProperty('somekey', value, definition, {}, {});
  },
  'should assign _class and log warning message when value is classless': function (done) {
    this.mockConsole.expects('warn').once().withExactArgs('Setting placeholder _class %s -  value is an array with classless first item'.yellow, 'someparentidsomekey');
    var definition = { id: 'someid', properties: {} };
    var value = [ { foo: 'bar' } ];
    processor.processObject = function(value, definitions) {
      assert.equals(definition.properties.somekey.type, 'array');
      assert.equals(definition.properties.somekey.items.$ref, '#/definitions/someparentidsomekey');
      done();
    };
    var opt = { parentDefinitionId: 'someparentid' };
    processor.processArrayProperty('somekey', value, definition, {}, opt);
  }
});

buster.testCase('processor - processObjectProperty', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should log warning message showing the ignored property key when value is empty': function () {
    this.mockConsole.expects('warn').once().withExactArgs('Ignoring property %s - a keyless object'.yellow, 'somekey');
    var value = {};
    processor.processObjectProperty('somekey', value, {}, {}, {});
  },
  'should assign _class and log warning message when value is classless': function (done) {
    this.mockConsole.expects('warn').once().withExactArgs('Property %s does not have any _class property'.yellow, 'somekey');
    processor.processObject = function(value, definitions) {
      assert.equals(definition.properties.somekey.$ref, '#/definitions/someid_somekey');
      done();
    };

    var definition = { id: 'someid', properties: {} };
    var value = { somekey: {} };
    processor.processObjectProperty('somekey', value, definition, {}, {});
  },
  'should pass value and definitions for further object processing': function (done) {
    processor.processObject = function(value, definitions) {
      assert.equals(definition.properties.somekey.$ref, '#/definitions/someclass');
      done();
    };

    var definition = { id: 'someid', properties: {} };
    var value = { _class: 'someclass', somekey: {} };
    processor.processObjectProperty('somekey', value, definition, {}, {});
  }
});

buster.testCase('processor - processBooleanProperty', {
  setUp: function () {
    this.mock({});
  },
  'should set definition property type to boolean': function () {
    var definition = { properties: {} };
    processor.processBooleanProperty('somekey', 'somevalue', definition, {}, {});
    assert.equals(definition.properties.somekey.type, 'boolean');
  }
});

buster.testCase('processor - processUnknownProperty', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should log error message showing the property value type': function () {
    this.mockConsole.expects('error').once().withExactArgs('Unsupported property type %s'.red, 'string');
    processor.processUnknownProperty('somekey', 'somevalue', {}, {}, {});
  }
});
