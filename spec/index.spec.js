var SaxoParser = require("../src/index.js");


describe("SaxoParser", function() {

	// --- helpers for the test -----------------------------------------------

	var lastId = 0;
	var getUniqueId = function() {
		return "#"+(lastId++);
	};

	// --- test suite ---------------------------------------------------------

	describe("when parsing some xml string", function() {

		describe("and an opening tag is found", function() {

			it("should call _open handler", function() {
				var count = 0;

				var handler = {

					'anyName': {
						_open: function (tag) {
							count++;
						}
					}
				};

				var saxo = new SaxoParser(handler);

				saxo.parseString("<root><anyName><someInnerNode></someInnerNode></anyName><anyName></anyName><notAnyName></notAnyName></root>");

				expect(count).toBe(2);
			});

			it("should call _open handler with a wild card", function() {
				var count = 0;

				var handler = {

					'root' : {
						'*': {
							_open: function (tag) {
								count++;
							}
						},
						'notAnyName': function (tag) {
							// do nothing
						}
					}
				};

				var saxo = new SaxoParser(handler);

				saxo.parseString("<root><anyName><someInnerNode></someInnerNode></anyName><anyName></anyName><notAnyName></notAnyName></root>");

				expect(count).toBe(2);
			});

			it("should provide the tag attributes to the _open handler", function() {
				var sum = 0;

				var handler = {

					'anyName': {
						_open: function (tag) {
							sum += parseInt(tag.attributes.value, 10);
						}
					}
				};

				var saxo = new SaxoParser(handler);

				saxo.parseString("<root><anyName value='7'></anyName><anyName value='5'></anyName></root>");

				expect(sum).toBe(5+7);
			});

			// this is the documentation sample
			it("should provide the parent data to sub nodes", function() {
				var objAsJsonString = "";
				var saxo = new SaxoParser({
					myTag : {
						_open: function(tag) {
							tag.data = {};
							tag.data.someProp = tag.attributes.someProp;
							tag.data.moreProps = [];
						},
						_close: function(tag) {
							// do something with tag.data
							objAsJsonString = JSON.stringify(tag.data);
						},
						mySubTag : {
							_close: function(tag) {
								tag.parent.data.moreProps.push(tag.text);
							}
						}
					}
				});

				saxo.parseString('<root><myTag someProp="someValue"><mySubTag>Some</mySubTag><mySubTag>Text</mySubTag></myTag></root>');

				expect(objAsJsonString.replace(" ","")).toBe('{"someProp":"someValue","moreProps":["Some","Text"]}');
			});
		});

		describe("and a closing tag is found", function() {

			it("should call the _close handler with associated data even if no _open or _text was declared", function() {
				var attrValue = 0;
				var tagText = void 0;
				var anyValue = getUniqueId();
				var anyText  = getUniqueId();

				var handler = {
					'anyName' : {
						_close: function(tag) {
							attrValue = tag.attributes.value;
							tagText = tag.text;
						}
					}
				};

				var saxo = new SaxoParser(handler);

				saxo.parseString("<root><anyName value='"+anyValue+"'>"+anyText+"</anyName></root>");

				expect(attrValue).toBe(anyValue);
				expect(tagText).toBe(anyText);
			});

			it("should return any object added by the _open handler", function() {
				var theData = 0;
				var anyValue = getUniqueId();

				var handler = {
					'anyName' : {
						_open: function (tag) {
							tag.data = anyValue;
						},
						_close: function(tag) {
							theData = tag.data;
						}
					}
				};
				var saxo = new SaxoParser(handler);

				saxo.parseString("<root><anyName></anyName></root>");

				expect(theData).toBe(anyValue);
			});

			it("should call _close if a wildcard is used", function() {
				var count = 0;
				var anyValue = getUniqueId();

				var handler = {
					root: {
						'*' : {
							_close: function(tag) {
								count++;
							}
						}
					}
				};
				var saxo = new SaxoParser(handler);

				saxo.parseString("<root><anyName></anyName></root>");

				expect(count).toBe(1);
			});
		});


		describe("and a text node is found", function() {
			it("should read node text and give the tag associated data", function() {
				var theData = 0;
				var theText = void 0;
				var id = getUniqueId();

				var handler = {
					'anyName' : {
						_open: function (tag) {
							tag.data = id;
						},
						_text: function(tag) {
							theText = tag.text;
							theData = tag.data;
						}
					}
				};

				var saxo = new SaxoParser(handler);

				saxo.parseString("<root><anyName>anyText</anyName></root>");

				expect(theText).toBe("anyText");
				expect(theData).toBe(id);
			});

			it("should read node text and give the tag associated data (with a wild card)", function() {
				var theData = 0;
				var theText = void 0;
				var id = getUniqueId();

				var handler = {
					root: {
						'*' : {
							_open: function (tag) {
								tag.data = id;
							},
							_text: function(tag) {
								theText = tag.text;
								theData = tag.data;
							}
						}
					}

				};

				var saxo = new SaxoParser(handler);

				saxo.parseString("<root><anyName>anyText</anyName></root>");

				expect(theText).toBe("anyText");
				expect(theData).toBe(id);
			});
		});

		describe("and handler is a function", function() {

			it("should call the handler when the tag is closed", function() {
				var attrValue = 0;
				var tagText = void 0;
				var anyValue = getUniqueId();
				var anyText  = getUniqueId();

				var handler = {
					'anyName' : function(tag) {
						attrValue = tag.attributes.value;
						tagText = tag.text;
					}
				};

				var saxo = new SaxoParser(handler);

				saxo.parseString("<root><anyName value='"+anyValue+"'>"+anyText+"</anyName></root>");

				expect(attrValue).toBe(anyValue);
				expect(tagText).toBe(anyText);

			});

			it("should call the handler when the tag is closed (with a wildcard)", function() {
				var attrValue = 0;
				var tagText = void 0;
				var anyValue = getUniqueId();
				var anyText  = getUniqueId();

				var handler = {
					root : {
						'*': function (tag) {
							attrValue = tag.attributes.value;
							tagText = tag.text;
						}
					}
				};

				var saxo = new SaxoParser(handler);

				saxo.parseString("<root><anyName value='"+anyValue+"'>"+anyText+"</anyName></root>");

				expect(attrValue).toBe(anyValue);
				expect(tagText).toBe(anyText);

			});

			it('should call the done callback with a non null error if the xml is malformed', function(done) {
				var saxo = new SaxoParser({});
				var error;
				var counter = 0;

				var cb = 

				saxo.parseString("<WHAT!!></BUG>", function(error) {
					counter ++;
					expect(error).toBeDefined();
					expect(counter).toBe(1);
					done();
				});
			});
		});
	});

	describe("when parsing an xml file", function() {


		it("should parse", function(done) {
			var theText = void 0;
			var parentFound = false;
			var openHandlerCalled = false;

			var saxo = new SaxoParser({
				anyNodeName : {
					_open: function(tag) {
						openHandlerCalled = true;
					},
					anyAnotherName : {
						_close: function(tag) {
							theText = tag.text;
							parentFound = tag.parent.attributes.anyAttr === "anyValue";
						}
					}
				}
			});

			saxo.parseFile(__dirname+"/assets/text.xml", function() {
				expect(openHandlerCalled).toBe(true);
				expect(parentFound).toBe(true);
				expect(theText).toBe("text1 text2");
				done();
			});
		});

		it('should call the done callback with a non null error if the xml is malformed', function(done) {
			var saxo = new SaxoParser({});
			var error;
			var counter = 0;

			saxo.parseFile(__dirname+"/assets/text_with_error.xml", function(error) {
				counter++;
				expect(error).toBeDefined();
				expect(counter).toBe(1);
				done();
			});
		});
	});
});

