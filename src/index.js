"use strict";

var sax = require("sax");
var fs = require("fs");

var options = {
  trim: true,
  normalize: true
};

var SaxoParser = function(handler) {
  this.handlers = [handler];
};

var WILDCARD = "*";

SaxoParser.prototype._attachEvents = function(parser) {
  var self = this;

  parser.onopentag = function(tag) {
    var handler,
      parentHandler = self.getHandler.call(self);

    if (parentHandler.hasOwnProperty(tag.name)) {
      handler = parentHandler[tag.name];
    } else if (parentHandler.hasOwnProperty(WILDCARD)) {
      handler = parentHandler[WILDCARD];
    }
    if (handler) {
      handler._tag = tag;
      tag.parent = parentHandler._tag;
      self.handlers.push(handler);
      if (handler.hasOwnProperty("_open")) {
        handler._open(tag, handler);
      }
    }
  };

  parser.onclosetag = function(tagName) {
    var handler = self.getHandler.call(self);
    var tag = handler._tag;
    if (tag && tag.name === tagName) {
      if (handler.hasOwnProperty("_close")) {
        handler._close(tag);
      } else if (typeof handler === "function") {
        handler.call(self, tag);
      }
      self.handlers.pop();
    }
  };

  parser.ontext = function(text) {
    var handler = self.getHandler.call(self);
    var tag = handler._tag;
    if (tag) {
      tag.text = text;
      if (handler.hasOwnProperty("_text")) {
        handler._text(tag);
      }
    }
  };

  return parser;
};

SaxoParser.prototype.getHandler = function() {
  return this.handlers.length > 0 ? this.handlers[this.handlers.length - 1] : {};
};

SaxoParser.prototype.parseStream = function(inputStream, done) {
  var parser = this._attachEvents(sax.createStream(true, options));

  parser.on("error", function(err) {
    done(err);
  });

  parser.on("end", done || function() {});

  inputStream.pipe(parser);
};

SaxoParser.prototype.parseFile = function(file, done) {
  this.parseStream(fs.createReadStream(file), done);
};

SaxoParser.prototype.parseString = function(s) {
  var parser = this._attachEvents(sax.parser(true, options));
  parser.write(s).close();
};

module.exports = SaxoParser;
