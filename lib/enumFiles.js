"use strict";

// enum files/directories recursively if you want.
// Copyright (c) 2017 hirowaki https://github.com/hirowaki

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

/**
 * @class
 * @classdesc Class for EnumFiles.
 * This class has static functions only. No fields.
 * Class is being used as kinda namespace here.
 */
class EnumFiles {
    /**
     * Enumerate files and directories under the filepath.
     * Please note this is NOT searching files recursively.
     * @private
     * @static
     * @param {string} filepath - filepath to find.
     * @return {Promise<Array>}
     */
    static _enumAll(filepath) {
        if (!fs.existsSync(filepath)) {
            // Let's implicitly hide the exception
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

    /**
     * Enumerate directories under the filepath.
     * @private
     * @static
     * @param {string} filepath - filepath to find.
     * @param {bool} recursive - find recursively?
     * @return {Promise<Array>}
     */
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
                        // Running in serial.
                        // You might want to have this parallel using Promise.all then sort the result.
                        // But let's just simply run it in serial for now.
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

    /**
     * Enumerate files under the filepath.
     * @private
     * @static
     * @param {string} filepath - filepath to find.
     * @param {bool} recursive - find recursively?
     * @return {Promise<Array>}
     */
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

    /**
     * @summary Enumerate files under the filepath.
     * @public
     * @static
     * @param {string} filepath - filepath to find.
     * @return {Promise<Array>} - Promise.([string, string, string, ...])
     * @see {@link EnumFiles.filesRecursively}
     * @description - You can get the files just under the directory (filepath).
     * - This function does not run search against sub directories.
     * - When you'd like to run it recursively, call `filesRecursively` instead.
     *    ```
     *    return EnumFiles.files('test')
     *    .then((files) => {
     *      // Here, the files would be like this.
     *      //  [
     *      //      'test/test1.txt',
     *      //      'test/test2.txt'
     *      //  ]
     *    });
     *    ```
     * - If the file path does not exist, the result would simply be an empty array instead of an error.
     */
    static files(filepath) {
        return this._enumFiles(filepath, false);
    }

    /**
     * @summary Enumerate files under the filepath *recursively*.
     * @public
     * @static
     * @param {string} filepath - filepath to find.
     * @return {Promise<Array>} - Promise.([string, string, string, ...])
     * @see {@link EnumFiles.files}
     * @description - You can get the all files under the directory and its child-directories.
     * - This function does run search recursively.
     *    ```
     *    return EnumFiles.filesRecursively('test')
     *    .then((files) => {
     *      // Here, the files would be like this.
     *      //  [
     *      //      'test/test1.txt',
     *      //      'test/test2.txt'
     *      //      'test/test1/test1.txt',
     *      //      'test/test1/test2.txt'
     *      //      'test/test1/test1_1/test1.txt',
     *      //      'test/test1/test1_1/test2.txt'
     *      //  ]
     *    });
     *    ```
     * - If the file path does not exist, the result would simply be an empty array instead of an error.
     */
    static filesRecursively(filepath) {
        return this._enumFiles(filepath, true);
    }

    /**
     * @summary Enumerate directories under the filepath.
     * @public
     * @static
     * @param {string} filepath - filepath to find.
     * @return {Promise<Array>} - Promise.([string, string, string, ...])
     * @see {@link EnumFiles.dirRecursively}
     * @description - You can get the directories just under the directory (filepath).
     * - This function does not run search against sub directories.
     * - When you'd like to run it recursively, call `dirRecursively` instead.
     *    ```
     *    return EnumFiles.dir('test')
     *    .then((directories) => {
     *      // Here, the directories would be like this.
     *      //  [
     *      //      'test/test1',
     *      //      'test/test2'
     *      //  ]
     *    });
     *    ```
     * - If the file path does not exist, the result would simply be an empty array instead of an error.
     */
    static dir(filepath) {
        return this._enumDir(filepath, false);
    }

    /**
     * @summary Enumerate directories under the filepath *recursively*.
     * @public
     * @static
     * @param {string} filepath - filepath to find.
     * @return {Promise<Array>} - Promise.([string, string, string, ...])
     * @see {@link EnumFiles.dir}
     * @description - You can get the all directories under the directory and its child-directories.
     * - This function does run search recursively.
     *    ```
     *    return EnumFiles.dirRecursively('test')
     *    .then((directories) => {
     *      // Here, the directories would be like this.
     *      //  [
     *      //      'test/test1',
     *      //      'test/test1/test1_1',
     *      //      'test/test1/test1_2',
     *      //      'test/test2'
     *      //  ]
     *    });
     *    ```
     * - If the file path does not exist, the result would simply be an empty array instead of an error.
     */
    static dirRecursively(filepath) {
        return this._enumDir(filepath, true);
    }
}

module.exports = EnumFiles;
