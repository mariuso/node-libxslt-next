libxslt-next
============

[![CI](https://github.com/mariuso/node-libxslt-next/actions/workflows/ci.yml/badge.svg)](https://github.com/mariuso/node-libxslt-next/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/libxslt-next.svg)](https://www.npmjs.com/package/libxslt-next)
[![node](https://img.shields.io/node/v/libxslt-next.svg)](https://www.npmjs.com/package/libxslt-next)
[![license](https://img.shields.io/npm/l/libxslt-next.svg)](./LICENSE)

Node.js bindings for [libxslt](http://xmlsoft.org/libxslt/), compatible with [libxmljs2](https://github.com/libxmljs/libxmljs2).

A modern, maintained fork of [node-libxslt](https://github.com/albanm/node-libxslt) with updated
dependencies, TypeScript types, and support for current Node.js LTS releases.

- **Node.js 22.x and 24.x** (Node 20 is not supported — `libxmljs2@0.37` requires Node ≥ 22)
- **Linux (glibc & musl/Alpine), macOS (Intel & Apple Silicon), Windows** — all built from source
- **TypeScript types** included
- Install paths containing spaces are supported (Linux, macOS and Windows)

Installation
------------

    npm install libxslt-next

From source:

```sh
git clone https://github.com/mariuso/node-libxslt-next.git
cd node-libxslt-next
git submodule update --init
npm install
npm test
```

**Manual rebuild**: if you need to rebuild the native bindings:

```sh
npm run rebuild
```

The native addon is compiled on install, so a C/C++ toolchain and Python 3 must be
present (see [Environment compatibility](#environment-compatibility) below).

### Alpine / musl

The native addon is built from source on install, so the build toolchain must be
present. On Alpine (musl libc) install it first:

    apk add --no-cache build-base python3

This is also required in Alpine-based Docker images, e.g. `node:24-alpine`:

```dockerfile
FROM node:24-alpine
RUN apk add --no-cache build-base python3
# ... npm install
```

> Versions before 1.0.10 failed to load on musl with
> `Error loading shared library xmljs.node ... (ERR_DLOPEN_FAILED)`.
> 1.0.10 adds an rpath so the addon resolves its libxmljs2 dependency on musl.

Basic usage
-----------

### JavaScript
```js
var libxslt = require('libxslt-next');

libxslt.parse(stylesheetString, function(err, stylesheet){
  var params = {
    MyParam: 'my value'
  };

  // 'params' parameter is optional
  stylesheet.apply(documentString, params, function(err, result){
    // err contains any error from parsing the document or applying the stylesheet
    // result is a string containing the result of the transformation
  });  
});
```

### TypeScript
```typescript
import * as libxslt from 'libxslt-next';
import { Stylesheet, ApplyOptions } from 'libxslt-next';

// Parse stylesheet with type safety
libxslt.parse(stylesheetString, (err, stylesheet: Stylesheet | undefined) => {
  if (err) {
    console.error('Parse error:', err);
    return;
  }
  
  if (!stylesheet) return;
  
  const params = {
    MyParam: 'my value'
  };
  
  const options: ApplyOptions = {
    outputFormat: 'string'
  };
  
  // Apply with full type checking
  stylesheet.apply(documentString, params, options, (err, result) => {
    if (err) {
      console.error('Apply error:', err);
      return;
    }
    
    // result is properly typed as string | libxmljs.Document
    console.log('Transform result:', result);
  });
});

// Synchronous usage with types
const stylesheet: Stylesheet = libxslt.parse(stylesheetString);
const result: string = stylesheet.apply(documentString);
```

Libxmljs integration
--------------------

libxslt-next depends on [libxmljs2](https://github.com/libxmljs/libxmljs2) in the same way that [libxslt](http://xmlsoft.org/libxslt/) depends on [libxml](http://xmlsoft.org/). This dependancy makes possible to bundle and to load in memory libxml only once for users of both libraries.

The libxmljs module required by libxslt-next is exposed as ```require('libxslt-next').libxmljs```. This prevents depending on libxmljs twice which is not optimal and source of weird bugs.

It is possible to work with libxmljs documents instead of strings:

```js
var libxslt = require('libxslt-next');
var libxmljs = libxslt.libxmljs;

var stylesheetObj = libxmljs.parseXml(stylesheetString, { nocdata: true });
var stylesheet = libxslt.parse(stylesheetObj);

var document = libxmljs.parseXml(documentString);
stylesheet.apply(document, function(err, result){
  // result is now a libxmljs document containing the result of the transformation
});

```

This is only useful if you already needed to parse a document before applying the stylesheet for previous manipulations.
Or if you wish to be returned a document instead of a string for ulterior manipulations.
In these cases you will prevent extraneous parsings and serializations.

Includes
--------

XSL includes are supported but relative paths must be given from the execution directory, usually the root of the project.

Includes are resolved when parsing the stylesheet by libxml. Therefore the parsing task becomes IO bound, which is why you should not use synchronous parsing when you expect some includes.

Sync or async
-------------

The same *parse()* and *apply()* functions can be used in synchronous mode simply by removing the callback parameter.
In this case if a parsing error occurs it will be thrown.

```js
var lixslt = require('libxslt-next');

var stylesheet = libxslt.parse(stylesheetString);

var result = stylesheet.apply(documentString);

```

When a callback is given, *parse()* and *apply()* run the transform on the main
thread but invoke the callback on a later tick of the event loop (via
`setImmediate`). The call returns immediately and errors are delivered to the
callback instead of being thrown.

> **Note on parallelism:** earlier versions ran the libxslt computation on a
> libuv worker thread. That was removed because libxslt/libxml2 share global
> state with libxmljs2 and are not safe to run off the main thread, which caused
> intermittent empty results and crashes. The callback form therefore does **not**
> parallelize CPU work across threads — it only defers it. If you need true
> parallelism for CPU-bound transforms, run libxslt-next inside your own
> [`worker_threads`](https://nodejs.org/api/worker_threads.html) pool.

A small benchmark is available in the project (it always runs the same small
transformation a few thousand times):

    node benchmark.js

Guidance:
  - the synchronous and callback forms do the same amount of work; the callback
    form only differs in that it yields to the event loop before running.
  - of course you can use synchronous simply to reduce code depth.
  - DO NOT USE synchronous parsing if there are includes in your XSL stylesheets
    (include resolution makes parsing IO-bound).

Environment compatibility
-------------------------

**Node.js Support**: This package supports Node.js 22.x and 24.x LTS versions.
Node.js 20 is not supported because `libxmljs2@0.37` requires Node.js >= 22.

**Platform Support**: 
- ✅ Linux (64-bit, glibc and musl/Alpine)
- ✅ macOS (Intel & Apple Silicon)
- ✅ Windows (64-bit)

**Build Requirements**: libxslt-next depends on [node-gyp](https://github.com/nodejs/node-gyp) for native compilation. You will need:
- Node.js 22.0.0 or higher
- Python 3.x
- C++ build tools (Visual Studio Build Tools on Windows). Note: node-gyp does not
  yet detect Visual Studio 2026 ([node-gyp#3282](https://github.com/nodejs/node-gyp/issues/3282));
  use Visual Studio 2022 build tools.

**Dependencies**: This package uses:
- [libxmljs2](https://github.com/libxmljs/libxmljs2) for XML parsing (replaces deprecated libxmljs)
- [NaN](https://github.com/nodejs/nan) 2.22.2+ for Node.js API compatibility
- Bundled libxslt (no system dependencies required)

**TypeScript Support**: This package includes built-in TypeScript definitions:
- No need to install separate `@types` packages
- Full type safety for all API methods
- Compatible with TypeScript 3.0+
- Auto-completion and IntelliSense support in modern IDEs

API Reference
=============
  Node.js bindings for libxslt compatible with libxmljs

<a name="module_libxslt.libxmljs"></a>
### libxslt.libxmljs
The libxmljs module. Prevents the need for a user's code to require it a second time. Also prevent weird bugs.

**Kind**: static property of <code>[libxslt](#module_libxslt)</code>  
<a name="module_libxslt.parse"></a>
### libxslt.parse(source, [callback]) ⇒ <code>Stylesheet</code>
Parse a XSL stylesheet

If no callback is given the function will run synchronously and return the result or throw an error.

**Kind**: static method of <code>[libxslt](#module_libxslt)</code>  
**Returns**: <code>Stylesheet</code> - Only if no callback is given.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> &#124; <code>Document</code> | The content of the stylesheet as a string or a [libxmljs document](https://github.com/polotek/libxmljs/wiki/Document) |
| [callback] | <code>parseCallback</code> | The callback that handles the response. Expects err and Stylesheet object. |

<a name="module_libxslt.parseFile"></a>
### libxslt.parseFile(sourcePath, callback)
Parse a XSL stylesheet

**Kind**: static method of <code>[libxslt](#module_libxslt)</code>  

| Param | Type | Description |
| --- | --- | --- |
| sourcePath | <code>stringPath</code> | The path of the file |
| callback | <code>parseFileCallback</code> | The callback that handles the response. Expects err and Stylesheet object. |

<a name="module_libxslt..Stylesheet"></a>
### libxslt~Stylesheet
**Kind**: inner class of <code>[libxslt](#module_libxslt)</code>  

* [~Stylesheet](#module_libxslt..Stylesheet)
    * [new Stylesheet(stylesheetDoc, stylesheetObj)](#new_module_libxslt..Stylesheet_new)
    * [.apply(source, [params], [options], [callback])](#module_libxslt..Stylesheet+apply) ⇒ <code>string</code> &#124; <code>Document</code>
    * [.applyToFile(sourcePath, [params], [options], callback)](#module_libxslt..Stylesheet+applyToFile)

<a name="new_module_libxslt..Stylesheet_new"></a>
#### new Stylesheet(stylesheetDoc, stylesheetObj)
A compiled stylesheet. Do not call this constructor, instead use parse or parseFile.

store both the source document and the parsed stylesheet
if we don't store the stylesheet doc it will be deleted by garbage collector and it will result in segfaults.


| Param | Type | Description |
| --- | --- | --- |
| stylesheetDoc | <code>Document</code> | XML document source of the stylesheet |
| stylesheetObj | <code>Document</code> | Simple wrapper of a libxslt stylesheet |

<a name="module_libxslt..Stylesheet+apply"></a>
#### stylesheet.apply(source, [params], [options], [callback]) ⇒ <code>string</code> &#124; <code>Document</code>
Apply a stylesheet to a XML document

If no callback is given the function will run synchronously and return the result or throw an error.

**Kind**: instance method of <code>[Stylesheet](#module_libxslt..Stylesheet)</code>  
**Returns**: <code>string</code> &#124; <code>Document</code> - Only if no callback is given. Type is the same as the source param.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> &#124; <code>Document</code> | The XML content to apply the stylesheet to given as a string or a [libxmljs document](https://github.com/polotek/libxmljs/wiki/Document) |
| [params] | <code>object</code> | Parameters passed to the stylesheet ([http://www.w3schools.com/xsl/el_with-param.asp](http://www.w3schools.com/xsl/el_with-param.asp)) |
| [options] | <code>applyOptions</code> | Options |
| [callback] | <code>applyCallback</code> | The callback that handles the response. Expects err and result of the same type as the source param passed to apply. |

<a name="module_libxslt..Stylesheet+applyToFile"></a>
#### stylesheet.applyToFile(sourcePath, [params], [options], callback)
Apply a stylesheet to a XML file

**Kind**: instance method of <code>[Stylesheet](#module_libxslt..Stylesheet)</code>  

| Param | Type | Description |
| --- | --- | --- |
| sourcePath | <code>string</code> | The path of the file to read |
| [params] | <code>object</code> | Parameters passed to the stylesheet ([http://www.w3schools.com/xsl/el_with-param.asp](http://www.w3schools.com/xsl/el_with-param.asp)) |
| [options] | <code>applyOptions</code> | Options |
| callback | <code>applyToFileCallback</code> | The callback that handles the response. Expects err and result as string. |

<a name="module_libxslt..parseCallback"></a>
### libxslt~parseCallback : <code>function</code>
Callback to the parse function

**Kind**: inner typedef of <code>[libxslt](#module_libxslt)</code>  

| Param | Type |
| --- | --- |
| [err] | <code>error</code> |
| [stylesheet] | <code>Stylesheet</code> |

<a name="module_libxslt..parseFileCallback"></a>
### libxslt~parseFileCallback : <code>function</code>
Callback to the parseFile function

**Kind**: inner typedef of <code>[libxslt](#module_libxslt)</code>  

| Param | Type |
| --- | --- |
| [err] | <code>error</code> |
| [stylesheet] | <code>Stylesheet</code> |

<a name="module_libxslt..applyOptions"></a>
### libxslt~applyOptions
Options for applying a stylesheet

**Kind**: inner typedef of <code>[libxslt](#module_libxslt)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| outputFormat | <code>String</code> | Force the type of the output, either 'document' or 'string'. Default is to use the type of the input. |
| noWrapParams | <code>boolean</code> | If true then the parameters are XPath expressions, otherwise they are treated as strings. Default is false. |

<a name="module_libxslt..applyCallback"></a>
### libxslt~applyCallback : <code>function</code>
Callback to the Stylesheet.apply function

**Kind**: inner typedef of <code>[libxslt](#module_libxslt)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [err] | <code>error</code> | Error either from parsing the XML document if given as a string or from applying the styleshet |
| [result] | <code>string</code> &#124; <code>Document</code> | Result of the same type as the source param passed to apply |

<a name="module_libxslt..applyToFileCallback"></a>
### libxslt~applyToFileCallback : <code>function</code>
Callback to the Stylesheet.applyToFile function

**Kind**: inner typedef of <code>[libxslt](#module_libxslt)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [err] | <code>error</code> | Error either from reading the file, parsing the XML document or applying the styleshet |
| [result] | <code>string</code> |  |

*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*.
