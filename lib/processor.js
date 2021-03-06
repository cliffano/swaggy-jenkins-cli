const p     = require('path');
const util  = require('util');
const _util = require('./util');

/**
 * Iterate and process each response based on its root data type.
 *
 * @param {Array} responses: an array of responses
 * @param {Array} definitions: will be populated with definition object
 */
function generateDefinitions(responses, definitions) {
  responses.forEach(function(response) {
    if (Array.isArray(response)) {
      exports.processArray(response, definitions);
    } else {
      exports.processObject(response, definitions);
    }
  });
}

/**
 * Process a single response object by traversing its properties, each one will
 * be processed based on its data type.
 *
 * @param {Object} response: response object
 * @param {Object} definitions: the definition generated from the response will
 * be added to this definitions object
 */
function processObject(response, definitions) {
  if (!response._class) {
    response._class = p.basename(response.__sourcePath, p.extname(response.__sourcePath));
    console.warn('Setting placeholder _class %s -  value is a classless object', response._class);
  }

  var definitionId = _util.slug(response._class);
  console.log('Constructing definition %s...'.green, definitionId);

  var definition = {
    type: 'object',
    properties: {},
    id: definitionId
  };

  Object.keys(response).forEach(function (key) {
    if (['__sourcePath'].includes(key)) {
      return;
    }
    value = response[key];
    console.log('Processing property %s'.grey, key);
    var opts = {};
    if (value === null) {
      exports._processNullProperty(key, value, definition, definitions, opts);
    } else if (typeof value === 'string') {
      exports._processStringProperty(key, value, definition, definitions, opts);
    } else if (typeof value === 'number') {
      exports._processNumberProperty(key, value, definition, definitions, opts);
    } else if (typeof value === 'boolean') {
      exports._processBooleanProperty(key, value, definition, definitions, opts);
    } else if (Array.isArray(value)) {
      opts.parentDefinitionId = definitionId;
      exports._processArrayProperty(key, value, definition, definitions, opts);
    } else if (typeof value === 'object') {
      exports._processObjectProperty(key, value, definition, definitions, opts);
    } else {
      exports._processUnknownProperty(key, value, definition, definitions, opts);
    }
  });

  delete definition.id;
  if (definitions[definitionId]) {
    console.warn('Definition %s already exists and properties will be merged'.yellow, definitionId);
    Object.keys(definition.properties).forEach(function (key) {
      if (!definitions[definitionId].properties[key]) {
        console.warn('Merging property %s'.gray, key);
        definitions[definitionId].properties[key] = definition.properties[key];
      }
    });
  } else {
    definitions[definitionId] = definition;
  }
}

/**
 * Process a single response array by iterating its properties, each one will
 * be processed based on its data type.
 *
 * @param {Array} response: response array
 * @param {Object} definitions: the definition generated from the response will
 * be added to this definitions object
 */
function processArray(response, definitions) {
  var placeholderClass = p.basename(response.__sourcePath, p.extname(response.__sourcePath));
  var definitionId = _util.slug(placeholderClass);
  if (response.length > 0) {
    console.log('Constructing definition %s...'.green, definitionId);

    var definition = {
      type: 'array',
    };
    if (typeof response[0] === 'string') {
      definition.items = {
        type: 'string'
      };
      definitions[definitionId] = definition;
    } else if (typeof response[0] === 'object') {
      if (!response[0]._class) {
        response[0]._class = placeholderClass + 'item';
        console.warn('Setting placeholder _class %s -  value is a classless object', response[0]._class);
      }
      exports.processObject(response[0], definitions);
      definition.items = {
        '$ref': util.format('#/definitions/%s', _util.slug(response[0]._class))
      };
      definitions[definitionId] = definition;
    } else {
      console.error('Unsupported root array item type %s'.red, typeof response[0]);
    }
  } else {
    console.warn('Ignoring root array %s - value is empty'.yellow, definitionId);
  }
}

function _processStringProperty(key, value, definition, definitions, opts) {
  definition.properties[key] = {
    type: 'string'
  };
}

function _processNullProperty(key, value, definition, definitions, opts) {
  definition.properties[key] = {
    type: 'string'
  };
}

function _processNumberProperty(key, value, definition, definitions, opts) {
  definition.properties[key] = {
    type: 'integer'
  };
}

function _processArrayProperty(key, value, definition, definitions, opts) {
  if (value.length > 0) {
    if (typeof value[0] === 'string') {
      definition.properties[key] = {
        type: 'array',
        items: {
          type: 'string'
        }
      };
    } else if (typeof value[0] === 'object') {
      if (!value[0]._class) {
        value[0]._class = opts.parentDefinitionId + key;
        console.warn('Setting placeholder _class %s -  value is an array with classless first item', value[0]._class);
      }
      var propertyDefinitionId = _util.slug(value[0]._class);
      definition.properties[key] = {
        type: 'array',
        items: {
          '$ref': util.format('#/definitions/%s', propertyDefinitionId)
        }
      };
      exports.processObject(value[0], definitions);
    } else {
      console.error('Unsupported array item type %s'.red, typeof value[0]);
    }
  } else {
    console.warn('Ignoring property %s - value is an empty array'.yellow, key);
  }
}

function _processObjectProperty(key, value, definition, definitions, opts) {
  if (Object.keys(value).length > 0) {
    if (value._class === undefined) {
      console.warn('Property %s does not have any _class property'.yellow, key);
      value._class = util.format('%s_%s', definition.id, key);
    }
    var propertyDefinitionId = _util.slug(value._class);
    definition.properties[key] = {
      '$ref': util.format('#/definitions/%s', propertyDefinitionId)
    };
    exports.processObject(value, definitions);
  } else {
    console.warn('Ignoring property %s - a keyless object'.yellow, key);
  }
}

function _processBooleanProperty(key, value, definition, definitions, opts) {
  definition.properties[key] = {
    type: 'boolean'
  };
}

function _processUnknownProperty(key, value, definition, definitions, opts) {
  console.error('Unsupported property type %s'.red, typeof value);
}

exports.generateDefinitions     = generateDefinitions;
exports.processArray            = processArray;
exports.processObject           = processObject;
exports._processObjectProperty  = _processObjectProperty;
exports._processStringProperty  = _processStringProperty;
exports._processNullProperty    = _processNullProperty;
exports._processNumberProperty  = _processNumberProperty;
exports._processArrayProperty   = _processArrayProperty;
exports._processBooleanProperty = _processBooleanProperty;
exports._processUnknownProperty = _processUnknownProperty;
