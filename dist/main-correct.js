
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
//#region node_modules/.pnpm/@vue+consolidate@1.0.0/node_modules/@vue/consolidate/lib/consolidate.js
var require_consolidate = __commonJSMin((exports, module) => {
	var fs = require("node:fs");
	var path = require("node:path");
	var util = require("node:util");
	var join = path.join;
	var resolve = path.resolve;
	var extname = path.extname;
	var dirname = path.dirname;
	var isAbsolute = path.isAbsolute;
	var readCache = {};
	var cacheStore = {};
	var requires = {};
	exports.clearCache = function() {
		readCache = {};
		cacheStore = {};
	};
	function cache(options, compiled) {
		if (compiled && options.filename && options.cache) {
			delete readCache[options.filename];
			cacheStore[options.filename] = compiled;
			return compiled;
		}
		if (options.filename && options.cache) {
			return cacheStore[options.filename];
		}
		return compiled;
	}
	function read(path$1, options, cb) {
		var str = readCache[path$1];
		var cached = options.cache && str && typeof str === "string";
		if (cached) return cb(null, str);
		fs.readFile(path$1, "utf8", function(err, str$1) {
			if (err) return cb(err);
			str$1 = str$1.replace(/^\uFEFF/, "");
			if (options.cache) readCache[path$1] = str$1;
			cb(null, str$1);
		});
	}
	function readPartials(path$1, options, cb) {
		if (!options.partials) return cb();
		var keys = Object.keys(options.partials);
		var partials = {};
		function next(index) {
			if (index === keys.length) return cb(null, partials);
			var key = keys[index];
			var partialPath = options.partials[key];
			if (partialPath === undefined || partialPath === null || partialPath === false) {
				return next(++index);
			}
			var file;
			if (isAbsolute(partialPath)) {
				if (extname(partialPath) !== "") {
					file = partialPath;
				} else {
					file = join(partialPath + extname(path$1));
				}
			} else {
				file = join(dirname(path$1), partialPath + extname(path$1));
			}
			read(file, options, function(err, str) {
				if (err) return cb(err);
				partials[key] = str;
				next(++index);
			});
		}
		next(0);
	}
	function promisify(cb, fn) {
		return new Promise(function(resolve$1, reject) {
			cb = cb || function(err, html) {
				if (err) {
					return reject(err);
				}
				resolve$1(html);
			};
			fn(cb);
		});
	}
	function fromStringRenderer(name) {
		return function(path$1, options, cb) {
			options.filename = path$1;
			return promisify(cb, function(cb$1) {
				readPartials(path$1, options, function(err, partials) {
					var extend = requires.extend || (requires.extend = require("node:util")._extend);
					var opts = extend({}, options);
					opts.partials = partials;
					if (err) return cb$1(err);
					if (cache(opts)) {
						exports[name].render("", opts, cb$1);
					} else {
						read(path$1, opts, function(err$1, str) {
							if (err$1) return cb$1(err$1);
							exports[name].render(str, opts, cb$1);
						});
					}
				});
			});
		};
	}
	exports.velocityjs = fromStringRenderer("velocityjs");
	exports.velocityjs.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.velocityjs || (requires.velocityjs = require("velocityjs"));
			try {
				options.locals = options;
				cb$1(null, engine.render(str, options).trimLeft());
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.liquid = fromStringRenderer("liquid");
	function _renderTinyliquid(engine, str, options, cb) {
		var context = engine.newContext();
		var k;
		if (options.locals) {
			for (k in options.locals) {
				context.setLocals(k, options.locals[k]);
			}
			delete options.locals;
		}
		if (options.meta) {
			context.setLocals("page", options.meta);
			delete options.meta;
		}
		if (options.filters) {
			for (k in options.filters) {
				context.setFilter(k, options.filters[k]);
			}
			delete options.filters;
		}
		var includeDir = options.includeDir || process.cwd();
		context.onInclude(function(name, callback) {
			var extname$1 = path.extname(name) ? "" : ".liquid";
			var filename = path.resolve(includeDir, name + extname$1);
			fs.readFile(filename, { encoding: "utf8" }, function(err, data) {
				if (err) return callback(err);
				callback(null, engine.parse(data));
			});
		});
		delete options.includeDir;
		var compileOptions = { customTags: {} };
		if (options.customTags) {
			var tagFunctions = options.customTags;
			for (k in options.customTags) {
				compileOptions.customTags[k] = function(context$1, name, body) {
					var tpl = tagFunctions[name](body.trim());
					context$1.astStack.push(engine.parse(tpl));
				};
			}
			delete options.customTags;
		}
		for (k in options) {
			context.setLocals(k, options[k]);
		}
		var tmpl = cache(context) || cache(context, engine.compile(str, compileOptions));
		tmpl(context, cb);
	}
	exports.liquid.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.liquid;
			var Liquid;
			try {
				engine = requires.liquid = require("tinyliquid");
				_renderTinyliquid(engine, str, options, cb$1);
				return;
			} catch (err) {
				try {
					Liquid = requires.liquid = require("liquid-node");
					engine = new Liquid.Engine();
				} catch (err$1) {
					throw err$1;
				}
			}
			try {
				var locals = options.locals || {};
				if (options.meta) {
					locals.pages = options.meta;
					delete options.meta;
				}
				if (options.filters) {
					engine.registerFilters(options.filters);
					delete options.filters;
				}
				var includeDir = options.includeDir || process.cwd();
				engine.fileSystem = new Liquid.LocalFileSystem(includeDir, "liquid");
				delete options.includeDir;
				if (options.customTags) {
					var tagFunctions = options.customTags;
					for (k in options.customTags) {
						engine.registerTag(k, tagFunctions[k]);
					}
					delete options.customTags;
				}
				for (var k in options) {
					locals[k] = options[k];
				}
				return engine.parseAndRender(str, locals).nodeify(function(err, result) {
					if (err) {
						throw new Error(err);
					} else {
						return cb$1(null, result);
					}
				});
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.jade = function(path$1, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.jade;
			if (!engine) {
				try {
					engine = requires.jade = require("jade");
				} catch (err) {
					try {
						engine = requires.jade = require("then-jade");
					} catch (otherError) {
						throw err;
					}
				}
			}
			try {
				var tmpl = cache(options) || cache(options, engine.compileFile(path$1, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.jade.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.jade;
			if (!engine) {
				try {
					engine = requires.jade = require("jade");
				} catch (err) {
					try {
						engine = requires.jade = require("then-jade");
					} catch (otherError) {
						throw err;
					}
				}
			}
			try {
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.dust = fromStringRenderer("dust");
	exports.dust.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.dust;
			if (!engine) {
				try {
					engine = requires.dust = require("dust");
				} catch (err) {
					try {
						engine = requires.dust = require("dustjs-helpers");
					} catch (err$1) {
						engine = requires.dust = require("dustjs-linkedin");
					}
				}
			}
			var ext = "dust";
			var views = ".";
			if (options) {
				if (options.ext) ext = options.ext;
				if (options.views) views = options.views;
				if (options.settings && options.settings.views) views = options.settings.views;
			}
			if (!options || options && !options.cache) engine.cache = {};
			engine.onLoad = function(path$1, callback) {
				if (extname(path$1) === "") path$1 += "." + ext;
				if (path$1[0] !== "/") path$1 = views + "/" + path$1;
				read(path$1, options, callback);
			};
			try {
				var templateName;
				if (options.filename) {
					templateName = options.filename.replace(new RegExp("^" + views + "/"), "").replace(new RegExp("\\." + ext), "");
				}
				var tmpl = cache(options) || cache(options, engine.compileFn(str, templateName));
				tmpl(options, cb$1);
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.swig = fromStringRenderer("swig");
	exports.swig.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.swig;
			if (!engine) {
				try {
					engine = requires.swig = require("swig");
				} catch (err) {
					try {
						engine = requires.swig = require("swig-templates");
					} catch (otherError) {
						throw err;
					}
				}
			}
			try {
				if (options.cache === true) options.cache = "memory";
				engine.setDefaults({ cache: options.cache });
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.razor = function(path$1, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.razor;
			if (!engine) {
				try {
					engine = requires.razor = require("razor-tmpl");
				} catch (err) {
					throw err;
				}
			}
			try {
				var tmpl = cache(options) || cache(options, (locals) => {
					console.log("Rendering razor file", path$1);
					return engine.renderFileSync(path$1, locals);
				});
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.razor.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			try {
				var engine = requires.razor = require("razor-tmpl");
			} catch (err) {
				throw err;
			}
			try {
				var tf = engine.compile(str);
				var tmpl = cache(options) || cache(options, tf);
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.atpl = fromStringRenderer("atpl");
	exports.atpl.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.atpl || (requires.atpl = require("atpl"));
			try {
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.liquor = fromStringRenderer("liquor");
	exports.liquor.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.liquor || (requires.liquor = require("liquor"));
			try {
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.twig = fromStringRenderer("twig");
	exports.twig.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.twig || (requires.twig = require("twig").twig);
			var templateData = {
				data: str,
				allowInlineIncludes: options.allowInlineIncludes,
				namespaces: options.namespaces,
				path: options.path
			};
			try {
				var tmpl = cache(templateData) || cache(templateData, engine(templateData));
				cb$1(null, tmpl.render(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.ejs = fromStringRenderer("ejs");
	exports.ejs.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.ejs || (requires.ejs = require("ejs"));
			try {
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.eco = fromStringRenderer("eco");
	exports.eco.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.eco || (requires.eco = require("eco"));
			try {
				cb$1(null, engine.render(str, options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.jazz = fromStringRenderer("jazz");
	exports.jazz.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.jazz || (requires.jazz = require("jazz"));
			try {
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				tmpl.eval(options, function(str$1) {
					cb$1(null, str$1);
				});
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.jqtpl = fromStringRenderer("jqtpl");
	exports.jqtpl.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.jqtpl || (requires.jqtpl = require("jqtpl"));
			try {
				engine.template(str, str);
				cb$1(null, engine.tmpl(str, options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.haml = fromStringRenderer("haml");
	exports.haml.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.haml || (requires.haml = require("hamljs"));
			try {
				options.locals = options;
				cb$1(null, engine.render(str, options).trimLeft());
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.hamlet = fromStringRenderer("hamlet");
	exports.hamlet.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.hamlet || (requires.hamlet = require("hamlet"));
			try {
				options.locals = options;
				cb$1(null, engine.render(str, options).trimLeft());
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.whiskers = function(path$1, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.whiskers || (requires.whiskers = require("whiskers"));
			engine.__express(path$1, options, cb$1);
		});
	};
	exports.whiskers.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.whiskers || (requires.whiskers = require("whiskers"));
			try {
				cb$1(null, engine.render(str, options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports["haml-coffee"] = fromStringRenderer("haml-coffee");
	exports["haml-coffee"].render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires["haml-coffee"] || (requires["haml-coffee"] = require("haml-coffee"));
			try {
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.hogan = fromStringRenderer("hogan");
	exports.hogan.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.hogan || (requires.hogan = require("hogan.js"));
			try {
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				cb$1(null, tmpl.render(options, options.partials));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.templayed = fromStringRenderer("templayed");
	exports.templayed.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.templayed || (requires.templayed = require("templayed"));
			try {
				var tmpl = cache(options) || cache(options, engine(str));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.handlebars = fromStringRenderer("handlebars");
	exports.handlebars.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.handlebars || (requires.handlebars = require("handlebars"));
			try {
				for (var partial in options.partials) {
					engine.registerPartial(partial, options.partials[partial]);
				}
				for (var helper in options.helpers) {
					engine.registerHelper(helper, options.helpers[helper]);
				}
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.underscore = fromStringRenderer("underscore");
	exports.underscore.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.underscore || (requires.underscore = require("underscore"));
			try {
				const partials = {};
				for (var partial in options.partials) {
					partials[partial] = engine.template(options.partials[partial]);
				}
				options.partials = partials;
				var tmpl = cache(options) || cache(options, engine.template(str, null, options));
				cb$1(null, tmpl(options).replace(/\n$/, ""));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.lodash = fromStringRenderer("lodash");
	exports.lodash.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.lodash || (requires.lodash = require("lodash"));
			try {
				var tmpl = cache(options) || cache(options, engine.template(str, options));
				cb$1(null, tmpl(options).replace(/\n$/, ""));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.pug = function(path$1, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.pug;
			if (!engine) {
				try {
					engine = requires.pug = require("pug");
				} catch (err) {
					try {
						engine = requires.pug = require("then-pug");
					} catch (otherError) {
						throw err;
					}
				}
			}
			try {
				var tmpl = cache(options) || cache(options, engine.compileFile(path$1, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.pug.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.pug;
			if (!engine) {
				try {
					engine = requires.pug = require("pug");
				} catch (err) {
					try {
						engine = requires.pug = require("then-pug");
					} catch (otherError) {
						throw err;
					}
				}
			}
			try {
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.qejs = fromStringRenderer("qejs");
	exports.qejs.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			try {
				var engine = requires.qejs || (requires.qejs = require("qejs"));
				engine.render(str, options).then(function(result) {
					cb$1(null, result);
				}, function(err) {
					cb$1(err);
				}).done();
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.walrus = fromStringRenderer("walrus");
	exports.walrus.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.walrus || (requires.walrus = require("walrus"));
			try {
				var tmpl = cache(options) || cache(options, engine.parse(str));
				cb$1(null, tmpl.compile(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.mustache = fromStringRenderer("mustache");
	exports.mustache.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.mustache || (requires.mustache = require("mustache"));
			try {
				cb$1(null, engine.render(str, options, options.partials));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.just = function(path$1, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.just;
			if (!engine) {
				var JUST = require("just");
				engine = requires.just = new JUST();
			}
			engine.configure({ useCache: options.cache });
			engine.render(path$1, options, cb$1);
		});
	};
	exports.just.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var JUST = require("just");
			var engine = new JUST({ root: { page: str } });
			engine.render("page", options, cb$1);
		});
	};
	exports.ect = function(path$1, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.ect;
			if (!engine) {
				var ECT = require("ect");
				engine = requires.ect = new ECT(options);
			}
			engine.configure({ cache: options.cache });
			engine.render(path$1, options, cb$1);
		});
	};
	exports.ect.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var ECT = require("ect");
			var engine = new ECT({ root: { page: str } });
			engine.render("page", options, cb$1);
		});
	};
	exports.mote = fromStringRenderer("mote");
	exports.mote.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.mote || (requires.mote = require("mote"));
			try {
				var tmpl = cache(options) || cache(options, engine.compile(str));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.toffee = function(path$1, options, cb) {
		return promisify(cb, function(cb$1) {
			var toffee = requires.toffee || (requires.toffee = require("toffee"));
			toffee.__consolidate_engine_render(path$1, options, cb$1);
		});
	};
	exports.toffee.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.toffee || (requires.toffee = require("toffee"));
			try {
				engine.str_render(str, options, cb$1);
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.dot = fromStringRenderer("dot");
	exports.dot.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.dot || (requires.dot = require("dot"));
			var extend = requires.extend || (requires.extend = require("node:util")._extend);
			try {
				var settings = {};
				settings = extend(settings, engine.templateSettings);
				settings = extend(settings, options ? options.dot : {});
				var tmpl = cache(options) || cache(options, engine.template(str, settings, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.bracket = fromStringRenderer("bracket");
	exports.bracket.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.bracket || (requires.bracket = require("bracket-template"));
			try {
				var tmpl = cache(options) || cache(options, engine.default.compile(str, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.ractive = fromStringRenderer("ractive");
	exports.ractive.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var Engine = requires.ractive || (requires.ractive = require("ractive"));
			var template = cache(options) || cache(options, Engine.parse(str));
			options.template = template;
			if (options.data === null || options.data === undefined) {
				var extend = requires.extend || (requires.extend = require("node:util")._extend);
				options.data = extend({}, options);
				var i;
				var length;
				var properties = ["template", "filename", "cache", "partials"];
				for (i = 0, length = properties.length; i < length; i++) {
					var property = properties[i];
					delete options.data[property];
				}
			}
			try {
				cb$1(null, new Engine(options).toHTML());
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.nunjucks = fromStringRenderer("nunjucks");
	exports.nunjucks.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			try {
				var engine = options.nunjucksEnv || requires.nunjucks || (requires.nunjucks = require("nunjucks"));
				var env = engine;
				if (options.settings && options.settings.views) {
					env = engine.configure(options.settings.views);
				} else if (options.nunjucks && options.nunjucks.configure) {
					env = engine.configure.apply(engine, options.nunjucks.configure);
				}
				if (options.loader) {
					env = new engine.Environment(options.loader);
				} else if (options.settings && options.settings.views) {
					env = new engine.Environment(new engine.FileSystemLoader(options.settings.views));
				} else if (options.nunjucks && options.nunjucks.loader) {
					if (typeof options.nunjucks.loader === "string") {
						env = new engine.Environment(new engine.FileSystemLoader(options.nunjucks.loader));
					} else {
						env = new engine.Environment(new engine.FileSystemLoader(options.nunjucks.loader[0], options.nunjucks.loader[1]));
					}
				}
				env.renderString(str, options, cb$1);
			} catch (err) {
				throw cb$1(err);
			}
		});
	};
	exports.htmling = fromStringRenderer("htmling");
	exports.htmling.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.htmling || (requires.htmling = require("htmling"));
			try {
				var tmpl = cache(options) || cache(options, engine.string(str));
				cb$1(null, tmpl.render(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	function requireReact(module$1, filename) {
		var babel = requires.babel || (requires.babel = require("babel-core"));
		var compiled = babel.transformFileSync(filename, { presets: ["react"] }).code;
		return module$1._compile(compiled, filename);
	}
	exports.requireReact = requireReact;
	function requireReactString(src, filename) {
		var babel = requires.babel || (requires.babel = require("babel-core"));
		if (!filename) filename = "";
		var m = new module.constructor();
		filename = filename || "";
		var compiled = babel.transform(src, { presets: ["react"] }).code;
		m.paths = module.paths;
		m._compile(compiled, filename);
		return m.exports;
	}
	function reactBaseTmpl(data, options) {
		var exp;
		var regex;
		for (var k in options) {
			if (options.hasOwnProperty(k)) {
				exp = "{{" + k + "}}";
				regex = new RegExp(exp, "g");
				if (data.match(regex)) {
					data = data.replace(regex, options[k]);
				}
			}
		}
		return data;
	}
	exports.plates = fromStringRenderer("plates");
	exports.plates.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.plates || (requires.plates = require("plates"));
			var map = options.map || undefined;
			try {
				var tmpl = engine.bind(str, options, map);
				cb$1(null, tmpl);
			} catch (err) {
				cb$1(err);
			}
		});
	};
	function reactRenderer(type) {
		if (require.extensions) {
			if (!require.extensions[".jsx"]) {
				require.extensions[".jsx"] = requireReact;
			}
			if (!require.extensions[".react"]) {
				require.extensions[".react"] = requireReact;
			}
		}
		return function(str, options, cb) {
			return promisify(cb, function(cb$1) {
				var ReactDOM = requires.ReactDOM || (requires.ReactDOM = require("react-dom/server"));
				var react = requires.react || (requires.react = require("react"));
				var base = options.base;
				delete options.base;
				var enableCache = options.cache;
				delete options.cache;
				var isNonStatic = options.isNonStatic;
				delete options.isNonStatic;
				try {
					var Code;
					var Factory;
					var baseStr;
					var content;
					var parsed;
					if (!cache(options)) {
						if (type === "path") {
							var path$1 = resolve(str);
							delete require.cache[path$1];
							Code = require(path$1);
						} else {
							Code = requireReactString(str);
						}
						Factory = cache(options, react.createFactory(Code));
					} else {
						Factory = cache(options);
					}
					parsed = new Factory(options);
					content = isNonStatic ? ReactDOM.renderToString(parsed) : ReactDOM.renderToStaticMarkup(parsed);
					if (base) {
						baseStr = readCache[str] || fs.readFileSync(resolve(base), "utf8");
						if (enableCache) {
							readCache[str] = baseStr;
						}
						options.content = content;
						content = reactBaseTmpl(baseStr, options);
					}
					cb$1(null, content);
				} catch (err) {
					cb$1(err);
				}
			});
		};
	}
	exports.react = reactRenderer("path");
	exports.react.render = reactRenderer("string");
	exports["arc-templates"] = fromStringRenderer("arc-templates");
	exports["arc-templates"].render = function(str, options, cb) {
		var readFileWithOptions = util.promisify(read);
		var consolidateFileSystem = {};
		consolidateFileSystem.readFile = function(path$1) {
			return readFileWithOptions(path$1, options);
		};
		return promisify(cb, function(cb$1) {
			try {
				var engine = requires["arc-templates"];
				if (!engine) {
					var Engine = require("arc-templates/dist/es5");
					engine = requires["arc-templates"] = new Engine({ filesystem: consolidateFileSystem });
				}
				var compiler = cache(options) || cache(options, engine.compileString(str, options.filename));
				compiler.then(function(func) {
					return func(options);
				}).then(function(result) {
					cb$1(null, result.content);
				}).catch(cb$1);
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.vash = fromStringRenderer("vash");
	exports.vash.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.vash || (requires.vash = require("vash"));
			try {
				if (options.helpers) {
					for (var key in options.helpers) {
						if (!options.helpers.hasOwnProperty(key) || typeof options.helpers[key] !== "function") {
							continue;
						}
						engine.helpers[key] = options.helpers[key];
					}
				}
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				tmpl(options, function sealLayout(err, ctx) {
					if (err) cb$1(err);
					ctx.finishLayout();
					cb$1(null, ctx.toString().replace(/\n$/, ""));
				});
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.slm = fromStringRenderer("slm");
	exports.slm.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.slm || (requires.slm = require("slm"));
			try {
				var tmpl = cache(options) || cache(options, engine.compile(str, options));
				cb$1(null, tmpl(options));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.marko = function(path$1, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.marko || (requires.marko = require("marko"));
			options.writeToDisk = !!options.cache;
			try {
				var tmpl = cache(options) || cache(options, engine.load(path$1, options));
				tmpl.renderToString(options, cb$1);
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.marko.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.marko || (requires.marko = require("marko"));
			options.writeToDisk = !!options.cache;
			options.filename = options.filename || "string.marko";
			try {
				var tmpl = cache(options) || cache(options, engine.load(options.filename, str, options));
				tmpl.renderToString(options, cb$1);
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.teacup = function(path$1, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.teacup || (requires.teacup = require("teacup/lib/express"));
			require.extensions[".teacup"] = require.extensions[".coffee"];
			if (path$1[0] !== "/") {
				path$1 = join(process.cwd(), path$1);
			}
			if (!options.cache) {
				var callback = cb$1;
				cb$1 = function() {
					delete require.cache[path$1];
					callback.apply(this, arguments);
				};
			}
			engine.renderFile(path$1, options, cb$1);
		});
	};
	exports.teacup.render = function(str, options, cb) {
		var coffee = require("coffee-script");
		var vm = require("node:vm");
		var sandbox = {
			module: { exports: {} },
			require
		};
		return promisify(cb, function(cb$1) {
			vm.runInNewContext(coffee.compile(str), sandbox);
			var tmpl = sandbox.module.exports;
			cb$1(null, tmpl(options));
		});
	};
	exports.squirrelly = fromStringRenderer("squirrelly");
	exports.squirrelly.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.squirrelly || (requires.squirrelly = require("squirrelly"));
			try {
				for (var partial in options.partials) {
					engine.definePartial(partial, options.partials[partial]);
				}
				for (var helper in options.helpers) {
					engine.defineHelper(helper, options.helpers[helper]);
				}
				var tmpl = cache(options) || cache(options, engine.Compile(str, options));
				cb$1(null, tmpl(options, engine));
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.twing = fromStringRenderer("twing");
	exports.twing.render = function(str, options, cb) {
		return promisify(cb, function(cb$1) {
			var engine = requires.twing || (requires.twing = require("twing"));
			try {
				new engine.TwingEnvironment(new engine.TwingLoaderNull()).createTemplate(str).then((twingTemplate) => {
					twingTemplate.render(options).then((rendTmpl) => {
						var tmpl = cache(options) || cache(options, rendTmpl);
						cb$1(null, tmpl);
					});
				});
			} catch (err) {
				cb$1(err);
			}
		});
	};
	exports.requires = requires;
});

//#endregion
//#region node_modules/.pnpm/@vue+consolidate@1.0.0/node_modules/@vue/consolidate/index.js
var require_consolidate_index = __commonJSMin((exports, module) => {
	module.exports = require_consolidate();
});

//#endregion
//#region main.js
var import_consolidate_index = __toESM(require_consolidate_index());
console.log(import_consolidate_index.default);

//#endregion