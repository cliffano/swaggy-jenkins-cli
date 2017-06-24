const slug = require('slug');
const util = require('util');

slug.defaults.mode = 'rfc3986';
slug.defaults.modes.rfc3986 = {
  replacement: '_',
  symbols: true,
  remove: /\.|dollar/g,
  lower: false,
  charmap: slug.charmap,
  multicharmap: slug.multicharmap
};

function generateDefinitions(responses, definitions) {
  responses.forEach(function(response) {
    processObject(response, definitions);
  });
}

function processObject(response, definitions) {
  var definitionId = slug(response._class || response.__sourcePath);
  console.log('Constructing definition %s...'.green, definitionId);

  var definition = {
    type: 'object',
    properties: {},
    id: definitionId
  };

  Object.keys(response).forEach(function (key) {
    value = response[key];
    console.log('Processing property %s'.grey, key);
    var opts = {};
    if (value === null) {
      processNullProperty(key, value, definition, definitions, opts);
    } else if (typeof value === 'string') {
      processStringProperty(key, value, definition, definitions, opts);
    } else if (typeof value === 'number') {
      processNumberProperty(key, value, definition, definitions, opts);
    } else if (typeof value === 'boolean') {
      processBooleanProperty(key, value, definition, definitions, opts);
    } else if (Array.isArray(value)) {
      opts.parentDefinitionId = definitionId;
      processArrayProperty(key, value, definition, definitions, opts);
    } else if (typeof value === 'object') {
      processObjectProperty(key, value, definition, definitions, opts);
    } else {
      processUnknownProperty(key, value, definition, definitions, opts);
    }
  });

  delete definition.id;
  if (definitions[definitionId]) {
    console.warn('Definition %s already exists and properties will be merged'.yellow, definitionId);
    Object.keys(definition.properties).forEach(function (key) {
      if (definitions[definitionId].properties[key]) {
        console.warn('Merging property %s'.gray, key);
      }
      definitions[definitionId].properties[key] = definition.properties[key];
    });
  } else {
    definitions[definitionId] = definition;
  }
}

function processStringProperty(key, value, definition, definitions, opts) {
  definition.properties[key] = {
    type: 'string'
  };
}

function processNullProperty(key, value, definition, definitions, opts) {
  definition.properties[key] = {
    type: 'string'
  };
}

function processNumberProperty(key, value, definition, definitions, opts) {
  definition.properties[key] = {
    type: 'integer'
  };
}

function processArrayProperty(key, value, definition, definitions, opts) {
  if (value.length > 0) {
    if (!value[0]._class) {
      console.warn('Setting placeholder _class %s -  value is an array with classless first item', opts.parentDefinitionId + key);
      value[0]._class = opts.parentDefinitionId + key;
    }
    var propertyDefinitionId = slug(value[0]._class);
    definition.properties[key] = {
      type: 'array',
      items: {
        '$ref': util.format('#/definitions/%s', propertyDefinitionId)
      }
    };
    processObject(value[0], definitions);
  } else {
    console.warn('Ignoring property %s - value is an empty array'.yellow, key);
  }
}

function processObjectProperty(key, value, definition, definitions, opts) {
  if (Object.keys(value).length > 0) {
    if (value._class === undefined) {
      console.warn('Property %s does not have any _class property'.yellow, key);
      value._class = util.format('%s_%s', definition.id, key);
    }
    var propertyDefinitionId = slug(value._class);
    definition.properties[key] = {
      '$ref': util.format('#/definitions/%s', propertyDefinitionId)
    };
    processObject(value, definitions);
  } else {
    console.warn('Ignoring property %s - a keyless object'.yellow, key);
  }
}

function processBooleanProperty(key, value, definition, definitions, opts) {
  definition.properties[key] = {
    type: 'boolean'
  };
}

function processUnknownProperty(key, value, definition, definitions, opts) {
  console.error('Unsupported property type %s'.red, typeof value);
}

exports.generateDefinitions    = generateDefinitions;
exports.processObject          = processObject;
exports.processObjectProperty  = processObjectProperty;
exports.processStringProperty  = processStringProperty;
exports.processNullProperty    = processNullProperty;
exports.processNumberProperty  = processNumberProperty;
exports.processArrayProperty   = processArrayProperty;
exports.processBooleanProperty = processBooleanProperty;
exports.processUnknownProperty = processUnknownProperty;