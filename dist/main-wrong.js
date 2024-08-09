
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
	exports.liquid = fromStringRenderer("liquid");
	exports.dust = fromStringRenderer("dust");
	exports.swig = fromStringRenderer("swig");
	exports.atpl = fromStringRenderer("atpl");
	exports.liquor = fromStringRenderer("liquor");
	exports.twig = fromStringRenderer("twig");
	exports.ejs = fromStringRenderer("ejs");
	exports.eco = fromStringRenderer("eco");
	exports.jazz = fromStringRenderer("jazz");
	exports.jqtpl = fromStringRenderer("jqtpl");
	exports.haml = fromStringRenderer("haml");
	exports.hamlet = fromStringRenderer("hamlet");
	exports["haml-coffee"] = fromStringRenderer("haml-coffee");
	exports.hogan = fromStringRenderer("hogan");
	exports.templayed = fromStringRenderer("templayed");
	exports.handlebars = fromStringRenderer("handlebars");
	exports.underscore = fromStringRenderer("underscore");
	exports.lodash = fromStringRenderer("lodash");
	exports.qejs = fromStringRenderer("qejs");
	exports.walrus = fromStringRenderer("walrus");
	exports.mustache = fromStringRenderer("mustache");
	exports.mote = fromStringRenderer("mote");
	exports.dot = fromStringRenderer("dot");
	exports.bracket = fromStringRenderer("bracket");
	exports.ractive = fromStringRenderer("ractive");
	exports.nunjucks = fromStringRenderer("nunjucks");
	exports.htmling = fromStringRenderer("htmling");
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
	exports.vash = fromStringRenderer("vash");
	exports.slm = fromStringRenderer("slm");
	exports.squirrelly = fromStringRenderer("squirrelly");
	exports.twing = fromStringRenderer("twing");
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