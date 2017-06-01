# enum-files
[![Build Status](https://travis-ci.org/hirowaki/enum-files.svg?branch=master)](https://travis-ci.org/hirowaki/enum-files)

#### Description
* Enumerate files and directories recursively.
* Using Promise ([bluebird](https://www.npmjs.com/package/bluebird)).
* Using *Class*. node.js above 4.x is required.
* [Repo](https://github.com/hirowaki/enum-files)
* [Document](https://hirowaki.github.io/enum-files)

#### How to use?

##### Install
```
$ npm install enum-files
```

##### functions.
* files(dir)
* filesRecursively(dir)
* dir(dir)
* dirRecursively(dir)
* [Reference here](https://hirowaki.github.io/enum-files)

##### Sample code.
```js
const EnumFiles = require('enum-files');

// find all javascript files in the dir recursively.
function findJSFiles(dir) {
    return EnumFiles.filesRecursively(dir)
    .then((files) => {
        return files.filter((file) => {
            return /\.js$/.test(file);
        });
    });
}

// find all directories which has "test" in the path under the dir recursively.
function findTestDirectories(dir) {
    return EnumFiles.dirRecursively(dir)
    .then((directories) => {
        return directories.filter((directory) => {
            return /\/test\//.test(directory);
        });
    });
}
```


#### development 

##### npm install
```
$ make install
```

##### test (using [mocha](https://www.npmjs.com/package/mocha))
```
$ npm test
```

##### linting
```
$ npm run lint
```


## LICENSE

The MIT License (MIT)

Copyright (c) 2017 hirowaki (https://github.com/hirowaki).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
