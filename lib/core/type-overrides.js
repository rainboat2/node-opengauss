'use strict'

var types = require('pg-types')
const ogg_parse = require('./ogg_parse.js');

function makeParser(startRuleName) {
  return function (rawStr) {
      if (!rawStr) return null;
      return ogg_parse.parse(rawStr, {startRule: startRuleName})
  }
}

// add graph data types
types.setTypeParser(8111, makeParser('_Vertex'));
types.setTypeParser(8112, makeParser('VertexArray'));
types.setTypeParser(8121, makeParser('_Edge'));
types.setTypeParser(8122, makeParser('EdgeArray'));
types.setTypeParser(1019, makeParser('_Path'));

function TypeOverrides(userTypes) {
  this._types = userTypes || types
  this.text = {}
  this.binary = {}
}

TypeOverrides.prototype.getOverrides = function (format) {
  switch (format) {
    case 'text':
      return this.text
    case 'binary':
      return this.binary
    default:
      return {}
  }
}

TypeOverrides.prototype.setTypeParser = function (oid, format, parseFn) {
  if (typeof format === 'function') {
    parseFn = format
    format = 'text'
  }
  this.getOverrides(format)[oid] = parseFn
}

TypeOverrides.prototype.getTypeParser = function (oid, format) {
  format = format || 'text'
  return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format)
}

module.exports = TypeOverrides
