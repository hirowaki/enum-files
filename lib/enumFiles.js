"use strict";

// Copyright (c) 2017 hirowaki https://github.com/hirowaki

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

class EnumFiles {
    static _enumAll(filepath) {
        if (!fs.existsSync(filepath)) {
            // Let's conceal the exception
            //  Error: ENOENT: no such file or directory, scandir 'path'.
            // Instead of exception, let's simply result an empty array.
            return Promise.resolve([]);
        }

        return new Promise((resolve, reject) => {
            fs.readdir(filepath, (err, files) => {
                if (err) {
                    return reject(err);
                }
                return resolve(files.map((file) => {
                    return path.join(filepath, file);
                }).sort());
            });
        });
    }

    static _enumDir(filepath, recursive) {
        // closure is kinda magic.
        const res = [];

        const __enumDir = (dir) => {
            return this._enumAll(dir)
            .then((files) => {
                const subDirs = files.filter((file) => {
                    return fs.statSync(file).isDirectory();
                });

                if (subDirs.length > 0) {
                    if (recursive) {
                        return Promise.resolve(subDirs)
                        .each((subDir) => {
                            res.push(subDir);

                            return __enumDir(subDir);
                        });
                    }
                    Array.prototype.push.apply(res, subDirs);
                }
            });
        };

        return __enumDir(filepath)
        .then(() => {
            return res;
        });
    }

    static _enumFiles(filepath, recursive) {
        // closure is kinda magic.
        const res = [];

        const __enumTargetDirectories = () => {
            if (recursive) {
                return this._enumDir(filepath, recursive)
                .then((subdirs) => {
                    // insert the base directory at the top.
                    subdirs.unshift(filepath);
                    return subdirs;
                });
            }
            return Promise.resolve([filepath]);
        };

        const __enumFiles = (dir) => {
            return this._enumAll(dir)
            .then((files) => {
                Array.prototype.push.apply(res, files.filter((file) => {
                    return fs.statSync(file).isFile();
                }));
            });
        };

        return __enumTargetDirectories()
        .each((dir) => {
           return  __enumFiles(dir);
        })
        .then(() => {
            return res;
        });
    }

    static files(filepath) {
        return this._enumFiles(filepath, false);
    }

    static filesRecursively(filepath) {
        return this._enumFiles(filepath, true);
    }

    static dir(filepath) {
        return this._enumDir(filepath, false);
    }

    static dirRecursively(filepath) {
        return this._enumDir(filepath, true);
    }
}

module.exports = EnumFiles;
