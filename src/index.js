"use strict";

var sax = require("sax");
var fs = require("fs");

var options = {
  trim: true,
  normalize: true
};

var SaxoParser = function (handler) {
  this.handlers = [handler];
};

var WILDCARD = "*";

SaxoParser.prototype._attachEvents = function (parser) {
  var self = this;

  parser.onopentag = function (tag) {
    var handler,
      parentHandler = self.getHandler.call(self);

    if (tag.name in parentHandler) {
      handler = parentHandler[tag.name];
    } else if (WILDCARD in parentHandler) {
      handler = parentHandler[WILDCARD];
    }
    if (handler) {
      handler._tag = tag;
      tag.parent = parentHandler._tag;
      self.handlers.push(handler);
      if ("_open" in handler) {
        handler._open(tag, handler);
      }
    }
  };

  parser.onclosetag = function (tagName) {
    var handler = self.getHandler.call(self);
    var tag = handler._tag;
    if (tag && tag.name === tagName) {
      if ("_close" in handler) {
        handler._close(tag);
      } else if (typeof(handler) === "function") {
        handler.call(self, tag);
      }
      self.handlers.pop();
    }
  };

  parser.ontext = function (text) {
    var handler = self.getHandler.call(self);
    var tag = handler._tag;
    if (tag) {
      tag.text = text;
      if ("_text" in handler) {
        handler._text(tag);
      }
    }
  };

  return parser;
};

SaxoParser.prototype.getHandler = function () {
  return this.handlers.length > 0 ? this.handlers[this.handlers.length - 1] : {};
};

SaxoParser.prototype.parseStream = function (inputStream, done) {
  var parser = this._attachEvents(sax.createStream(true, options));

  parser.on("error", function (e) {
    // unhandled errors will throw, since this is a proper node
    // event emitter.
    console.error("error!", e);

    // clear the error
    parser.error = null;
    parser.resume();
  });

  parser.on("end", done || function () {
  });

  inputStream.pipe(parser);
};

SaxoParser.prototype.parseFile = function (file, done) {
  this.parseStream(fs.createReadStream(file), done);
};

SaxoParser.prototype.parseString = function (s) {
  var parser = this._attachEvents(sax.parser(true, options));
  parser.write(s).close();
};


module.exports = SaxoParser;
