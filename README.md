SaxoParser
=========

## Purpose

SaxoParser is a helper to configure a sax parser using a self descriptive configuration object.

## Installation

`npm i -S saxo-parser`

## Usage

```
var SaxoParser = require('saxo-parser');

var saxo = new SaxoParser({
	myTag : {
		_open: function(tag) {
			tag.data = {};
			tag.data.someProp = tag.attributes.someProp;
			tag.data.moreProps = [];
		},
		_close: function(tag) {
			// do something with tag.data
			console.log(JSON.stringify(tag.data));
		},
		mySubTag : {
			_close: function(tag) {
				tag.parent.data.moreProps.push(tag.text);
			}
		}
	}
});

saxo.parseString('<root><myTag someProp="someValue"><mySubTag>Some</mySubTag><mySubTag>Text</mySubTag></myTag></root>');

```

## API

The constructor function takes an object describing what function should be called when parsing each xml element.

The entries of the object can be either a tag element name or a special function `_open`, `_text` (matches both text and cdata nodes) or `_close`. None of the special method is mandatory and should be used depending of the object to be parsed.

The parser can then parse a string with `parseString`, an inputStream with `parseStream` or a file with `parseFile` 
