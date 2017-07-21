var buster = require('buster-node');
var processor = require('../lib/processor');
var referee = require('referee');
var assert = referee.assert;

buster.testCase('processor - generateDefinitions', {
  setUp: function () {
    this.mock({});
    this.arrayCount = 0;
    this.objectCount = 0;
    var self = this;
    this.stub(processor, 'processArray', function (response, definitions) {
      self.arrayCount++;
    });
    this.stub(processor, 'processObject', function (response, definitions) {
      self.objectCount++;
    });
  },
  'should process response when top level element is an array': function () {
    var responses = [ [] ];
    processor.generateDefinitions(responses, {});
    assert.equals(this.arrayCount, 1);
    assert.equals(this.objectCount, 0);
  },
  'should process response when top level element is an object': function () {
    var responses = [ {} ];
    processor.generateDefinitions(responses, {});
    assert.equals(this.arrayCount, 0);
    assert.equals(this.objectCount, 1);
  }
});

buster.testCase('processor - processObject', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should process all properties': function () {
    var count = 0;
    this.stub(processor, '_processNullProperty', function (key, value, definition, definitions, opts) {
      count++;
    });
    this.stub(processor, '_processStringProperty', function (key, value, definition, definitions, opts) {
      count++;
    });
    this.stub(processor, '_processNumberProperty', function (key, value, definition, definitions, opts) {
      count++;
    });
    this.stub(processor, '_processBooleanProperty', function (key, value, definition, definitions, opts) {
      count++;
    });
    this.stub(processor, '_processArrayProperty', function (key, value, definition, definitions, opts) {
      count++;
    });
    this.stub(processor, '_processObjectProperty', function (key, value, definition, definitions, opts) {
      count++;
    });
    this.stub(processor, '_processUnknownProperty', function (key, value, definition, definitions, opts) {
      count++;
    });
    this.mockConsole.expects('warn').once().withExactArgs('Setting placeholder _class %s -  value is a classless object', 'file0');
    this.mockConsole.expects('log').once().withExactArgs('Constructing definition %s...'.green, 'file0');
    this.mockConsole.expects('log').once().withExactArgs('Processing property %s'.grey, 'someNullProperty');
    this.mockConsole.expects('log').once().withExactArgs('Processing property %s'.grey, 'someStringProperty');
    this.mockConsole.expects('log').once().withExactArgs('Processing property %s'.grey, 'someNumberProperty');
    this.mockConsole.expects('log').once().withExactArgs('Processing property %s'.grey, 'someBooleanProperty');
    this.mockConsole.expects('log').once().withExactArgs('Processing property %s'.grey, 'someArrayProperty');
    this.mockConsole.expects('log').once().withExactArgs('Processing property %s'.grey, 'someObjectProperty');
    this.mockConsole.expects('log').once().withExactArgs('Processing property %s'.grey, 'someUnknownProperty');
    var response = {};
    response.__sourcePath = 'some/path/file0.json';
    response.someNullProperty = null;
    response.someStringProperty = 'string';
    response.someNumberProperty = 8;
    response.someBooleanProperty = true;
    response.someArrayProperty = [];
    response.someObjectProperty = {};
    response.someUnknownProperty = undefined;
    var definitions = {};
    processor.processObject(response, definitions);
    assert.equals(count, 7);
    assert.equals(definitions.file0.type, 'object');
    assert.equals(definitions.file0.properties, {});
  },
  'should merge properties when definition already exists': function () {
    var count = 0;
    this.stub(processor, '_processStringProperty', function (key, value, definition, definitions, opts) {
      definition.properties.someStringProperty = 'string';
      count++;
    });
    this.mockConsole.expects('log').once().withExactArgs('Constructing definition %s...'.green, 'someclass');
    this.mockConsole.expects('log').once().withExactArgs('Processing property %s'.grey, 'someStringProperty');
    this.mockConsole.expects('warn').once().withExactArgs('Definition %s already exists and properties will be merged'.yellow, 'someclass');
    this.mockConsole.expects('warn').once().withExactArgs('Merging property %s'.gray, 'someStringProperty');
    var response = { _class: 'someclass' };
    response.__sourcePath = 'some/path/file0.json';
    response.someStringProperty = 'string';
    var definitions = { someclass: { type: 'object', properties: { someNumberProperty: 23 }}};
    processor.processObject(response, definitions);
    assert.equals(count, 1);
    assert.equals(definitions.someclass.type, 'object');
    assert.equals(definitions.someclass.properties.someStringProperty, 'string');
    assert.equals(definitions.someclass.properties.someNumberProperty, 23);
  },
  'should ignore property when definition already exists and it already has the property': function () {
    var count = 0;
    this.stub(processor, '_processStringProperty', function (key, value, definition, definitions, opts) {
      definition.properties.someStringProperty = 'string';
      count++;
    });
    this.mockConsole.expects('log').once().withExactArgs('Constructing definition %s...'.green, 'someclass');
    this.mockConsole.expects('log').once().withExactArgs('Processing property %s'.grey, 'someStringProperty');
    this.mockConsole.expects('warn').once().withExactArgs('Definition %s already exists and properties will be merged'.yellow, 'someclass');
    var response = { _class: 'someclass' };
    response.__sourcePath = 'some/path/file0.json';
    response.someStringProperty = 'string';
    var definitions = { someclass: { type: 'object', properties: { someStringProperty: '23' }}};
    processor.processObject(response, definitions);
    assert.equals(count, 1);
    assert.equals(definitions.someclass.type, 'object');
    assert.equals(definitions.someclass.properties.someStringProperty, '23');
  }
});

buster.testCase('processor - processArray', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should log warn message when array is empty': function () {
    this.mockConsole.expects('warn').once().withExactArgs('Ignoring root array %s - value is empty'.yellow, 'file0');
    var response = [];
    response.__sourcePath = 'some/path/file0.json';
    processor.processArray(response, {});
  },
  'should log error message when array item is unsupported': function () {
    this.mockConsole.expects('log').once().withExactArgs('Constructing definition %s...'.green, 'file0');
    this.mockConsole.expects('error').once().withExactArgs('Unsupported root array item type %s'.red, 'boolean');
    var response = [true];
    response.__sourcePath = 'some/path/file0.json';
    processor.processArray(response, {});
  },
  'should set definition type to string when item is string': function () {
    this.mockConsole.expects('log').once().withExactArgs('Constructing definition %s...'.green, 'file0');
    var response = ['string'];
    response.__sourcePath = 'some/path/file0.json';
    var definitions = {};
    processor.processArray(response, definitions);
    assert.equals(definitions.file0.type, 'array');
    assert.equals(definitions.file0.items.type, 'string');
  },
  'should set definition type to definition reference when item is an object': function () {
    var count = 0;
    this.stub(processor, 'processObject', function (response, definitions) {
      count++;
    });
    this.mockConsole.expects('log').once().withExactArgs('Constructing definition %s...'.green, 'file0');
    this.mockConsole.expects('warn').once().withExactArgs('Setting placeholder _class %s -  value is a classless object', 'file0item');
    var response = [{}];
    response.__sourcePath = 'some/path/file0.json';
    var definitions = {};
    processor.processArray(response, definitions);
    assert.equals(count, 1);
    assert.equals(definitions.file0.type, 'array');
    assert.equals(definitions.file0.items.$ref, '#/definitions/file0item');
  },
  'should use class in definition when class is set': function () {
    var count = 0;
    this.stub(processor, 'processObject', function (response, definitions) {
      count++;
    });
    this.mockConsole.expects('log').once().withExactArgs('Constructing definition %s...'.green, 'file0');
    var response = [{ _class: 'someclass' }];
    response.__sourcePath = 'some/path/file0.json';
    var definitions = {};
    processor.processArray(response, definitions);
    assert.equals(count, 1);
    assert.equals(definitions.file0.type, 'array');
    assert.equals(definitions.file0.items.$ref, '#/definitions/someclass');
  }
});

buster.testCase('processor - _processStringProperty', {
  setUp: function () {
    this.mock({});
  },
  'should set definition property type to string': function () {
    var definition = { properties: {} };
    var value = 'somevalue';
    processor._processStringProperty('somekey', value, definition, {}, {});
    assert.equals(definition.properties.somekey.type, 'string');
  }
});

buster.testCase('processor - _processNullProperty', {
  setUp: function () {
    this.mock({});
  },
  'should set definition property type to string': function () {
    var definition = { properties: {} };
    var value = null;
    processor._processNullProperty('somekey', value, definition, {}, {});
    assert.equals(definition.properties.somekey.type, 'string');
  }
});

buster.testCase('processor - _processNumberProperty', {
  setUp: function () {
    this.mock({});
  },
  'should set definition property type to integer': function () {
    var definition = { properties: {} };
    var value = 8;
    processor._processNumberProperty('somekey', value, definition, {}, {});
    assert.equals(definition.properties.somekey.type, 'integer');
  }
});

buster.testCase('processor - _processArrayProperty', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should log warning message showing the ignored property key when value is empty': function () {
    this.mockConsole.expects('warn').once().withExactArgs('Ignoring property %s - value is an empty array'.yellow, 'somekey');
    var value = [];
    processor._processArrayProperty('somekey', value, {}, {}, {});
  },
  'should log error message when array item type is unsupported': function () {
    this.mockConsole.expects('error').once().withExactArgs('Unsupported array item type %s'.red, 'boolean');
    var value = [ true ];
    processor._processArrayProperty('somekey', value, {}, {}, {});
  },
  'should set definition type when array item is a string': function () {
    var definition = { id: 'someid', properties: {} };
    var value = [ 'somestring' ];
    processor._processArrayProperty('somekey', value, definition, {}, {});
    assert.equals(definition.properties.somekey.type, 'array');
    assert.equals(definition.properties.somekey.items.type, 'string');
  },
  'should set definition type when array item is an object': function (done) {
    var definition = { id: 'someid', properties: {} };
    var value = [ { _class: 'some.class' } ];
    this.stub(processor, 'processObject', function (response, definitions) {
      assert.equals(definition.properties.somekey.type, 'array');
      assert.equals(definition.properties.somekey.items.$ref, '#/definitions/someclass');
      done();
    });
    processor._processArrayProperty('somekey', value, definition, {}, {});
  },
  'should assign _class and log warning message when value is classless': function (done) {
    this.mockConsole.expects('warn').once().withExactArgs('Setting placeholder _class %s -  value is an array with classless first item'.yellow, 'someparentidsomekey');
    var definition = { id: 'someid', properties: {} };
    var value = [ { foo: 'bar' } ];
    this.stub(processor, 'processObject', function (response, definitions) {
      assert.equals(definition.properties.somekey.type, 'array');
      assert.equals(definition.properties.somekey.items.$ref, '#/definitions/someparentidsomekey');
      done();
    });
    var opt = { parentDefinitionId: 'someparentid' };
    processor._processArrayProperty('somekey', value, definition, {}, opt);
  }
});

buster.testCase('processor - _processObjectProperty', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should log warning message showing the ignored property key when value is empty': function () {
    this.mockConsole.expects('warn').once().withExactArgs('Ignoring property %s - a keyless object'.yellow, 'somekey');
    var value = {};
    processor._processObjectProperty('somekey', value, {}, {}, {});
  },
  'should assign _class and log warning message when value is classless': function (done) {
    this.mockConsole.expects('warn').once().withExactArgs('Property %s does not have any _class property'.yellow, 'somekey');
    this.stub(processor, 'processObject', function (response, definitions) {
      assert.equals(definition.properties.somekey.$ref, '#/definitions/someid_somekey');
      done();
    });
    var definition = { id: 'someid', properties: {} };
    var value = { somekey: {} };
    processor._processObjectProperty('somekey', value, definition, {}, {});
  },
  'should pass value and definitions for further object processing': function (done) {
    this.stub(processor, 'processObject', function (response, definitions) {
      assert.equals(definition.properties.somekey.$ref, '#/definitions/someclass');
      done();
    });
    var definition = { id: 'someid', properties: {} };
    var value = { _class: 'someclass', somekey: {} };
    processor._processObjectProperty('somekey', value, definition, {}, {});
  }
});

buster.testCase('processor - _processBooleanProperty', {
  setUp: function () {
    this.mock({});
  },
  'should set definition property type to boolean': function () {
    var definition = { properties: {} };
    processor._processBooleanProperty('somekey', 'somevalue', definition, {}, {});
    assert.equals(definition.properties.somekey.type, 'boolean');
  }
});

buster.testCase('processor - _processUnknownProperty', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should log error message showing the property value type': function () {
    this.mockConsole.expects('error').once().withExactArgs('Unsupported property type %s'.red, 'string');
    processor._processUnknownProperty('somekey', 'somevalue', {}, {}, {});
  }
});
