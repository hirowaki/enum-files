'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Promise = require('bluebird');
const fsExtra = require('fs-extra-promise').usePromise(Promise); // using bluebird.
const EnumFiles = require('./../index');

// structure.
// test -
//      - testFolder
//                   - test1
//                           - test1.txt
//                           - test1_1
//                                       - test1.txt
//                                       - test2.txt
//                           - test1_2
//                           - test2.txt
//                   - test1.txt
//                   - test2
//                   - test2.txt

function createTestFolders() {
    return removeTestFolders()
    .then(() => {
        // build up directories.
        return Promise.resolve([
            'test/testFolder',
            'test/testFolder/test1',
            'test/testFolder/test2',
            'test/testFolder/test1/test1_1',
            'test/testFolder/test1/test1_2'
        ])
        .each((dir) => {
            return fsExtra.ensureDirAsync(dir);
        })
    })
    .then(() => {
        // build up files.
        return Promise.resolve([
            'test/testFolder/test1.txt',
            'test/testFolder/test2.txt',
            'test/testFolder/test1/test1.txt',
            'test/testFolder/test1/test2.txt',
            'test/testFolder/test1/test1_1/test1.txt',
            'test/testFolder/test1/test1_1/test2.txt'
        ])
        .each((file) => {
            return fsExtra.outputJson(file, {test: 'test file'});
        })
    });
}

function removeTestFolders() {
    return fsExtra.removeAsync('test/testFolder');
}

describe('EnumFiles', function () {
    let sandbox, spyFiles, spyDir;

    before(function () {
        sandbox = sinon.sandbox.create();

        // oh my god.
        return createTestFolders();
    });

    after(function () {
        return removeTestFolders();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('public functions', function () {
        beforeEach(function () {
            spyFiles = sandbox.stub(EnumFiles, '_enumFiles');
            spyFiles.callsFake(function () {
                return Promise.resolve('_enumFiles');
            });

            spyDir = sandbox.stub(EnumFiles, '_enumDir');
            spyDir.callsFake(function () {
                return Promise.resolve('_enumDir');
            });
        });

        it('files.', function () {
            return EnumFiles.files('TEST PATH')
            .then((res) => {
                // make sure private function was hit as we expected.
                assert.strictEqual(spyFiles.callCount, 1);
                assert.deepEqual(spyFiles.args[0], ['TEST PATH', false]);
                assert.strictEqual(spyDir.callCount, 0);

                // make sure it returns the result itself coming from the private one.
                assert.strictEqual(res, '_enumFiles');
            });
        });

        it('filesRecursively.', function () {
            return EnumFiles.filesRecursively('TEST PATH')
            .then((res) => {
                // make sure private function was hit as we expected.
                assert.strictEqual(spyFiles.callCount, 1);
                assert.deepEqual(spyFiles.args[0], ['TEST PATH', true]);
                assert.strictEqual(spyDir.callCount, 0);

                // make sure it returns the result itself coming from the private one.
                assert.strictEqual(res, '_enumFiles');
            });
        });

        it('dir.', function () {
            return EnumFiles.dir('TEST PATH')
            .then((res) => {
                // make sure private function was hit as we expected.
                assert.strictEqual(spyDir.callCount, 1);
                assert.deepEqual(spyDir.args[0], ['TEST PATH', false]);
                assert.strictEqual(spyFiles.callCount, 0);

                // make sure it returns the result itself coming from the private one.
                assert.strictEqual(res, '_enumDir');
            });
        });

        it('dirRecursively.', function () {
            return EnumFiles.dirRecursively('TEST PATH')
            .then((res) => {
                // make sure private function was hit as we expected.
                assert.strictEqual(spyDir.callCount, 1);
                assert.deepEqual(spyDir.args[0], ['TEST PATH', true]);
                assert.strictEqual(spyFiles.callCount, 0);

                // make sure it returns the result itself coming from the private one.
                assert.strictEqual(res, '_enumDir');
            });
        });
    });

    describe('_enumAll', function () {
        it('regular case success.', function () {
            return EnumFiles._enumAll('test/testFolder')
            .then((res) => {
                assert.deepEqual(res, [
                    'test/testFolder/test1',
                    'test/testFolder/test1.txt',
                    'test/testFolder/test2',
                    'test/testFolder/test2.txt'
                ]);
            });
        });

        it('regular case success against an empty folder.', function () {
            return EnumFiles._enumAll('test/testFolder/test999')
            .then((res) => {
                // It should not throw an exception.
                // Just an empty array would be expected to come.
                assert.deepEqual(res, []);
            });
        });

        it('readdir gave us an error!', function () {
            const spyError = sandbox.stub(require('fs'), 'readdir');
            spyError.callsFake(function (path, cb) {
                return cb(new Error('TEST ERROR'));
            });

            return EnumFiles._enumAll('test/testFolder')
            .then(() => {
                assert.ok(false);   // should not come here.
            })
            .catch((err) => {
                assert.ok(true);    // should hit this.
                assert.strictEqual(err.message, 'TEST ERROR');
            });
        });
    });

    describe('_enumDir', function () {
        describe('shallow search', function () {
            it('test/testFolder.', function () {
                return EnumFiles._enumDir('test/testFolder')
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1',
                        'test/testFolder/test2'
                    ]);
                });
            });

            it('test/testFolder/test1.', function () {
                return EnumFiles._enumDir('test/testFolder/test1')
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1/test1_1',
                        'test/testFolder/test1/test1_2'
                    ]);
                });
            });

            it('test/testFolder/test1/test1_1.', function () {
                return EnumFiles._enumDir('test/testFolder/test1/test1_1')
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });

            it('run againt a non-exsist directory.', function () {
                return EnumFiles._enumDir('test/testFolder/test100')
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });
        });

        describe('deep search', function () {
            it('test/testFolder.', function () {
                return EnumFiles._enumDir('test/testFolder', true)
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1',
                        'test/testFolder/test1/test1_1',
                        'test/testFolder/test1/test1_2',
                        'test/testFolder/test2'
                    ]);
                });
            });

            it('test/testFolder/test1.', function () {
                return EnumFiles._enumDir('test/testFolder/test1', true)
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1/test1_1',
                        'test/testFolder/test1/test1_2'
                    ]);
                });
            });

            it('test/testFolder/test1/test1_1.', function () {
                return EnumFiles._enumDir('test/testFolder/test1/test1_1', true)
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });
        });
    });

    describe('_enumFiles', function () {
        describe('shallow search', function () {
            it('test/testFolder.', function () {
                return EnumFiles._enumFiles('test/testFolder')
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1.txt',
                        'test/testFolder/test2.txt'
                    ]);
                });
            });

            it('test/testFolder/test1.', function () {
                return EnumFiles._enumFiles('test/testFolder/test1')
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1/test1.txt',
                        'test/testFolder/test1/test2.txt'
                    ]);
                });
            });

            it('test/testFolder/test1/test1_1.', function () {
                return EnumFiles._enumFiles('test/testFolder/test1/test1_1')
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1/test1_1/test1.txt',
                        'test/testFolder/test1/test1_1/test2.txt'
                    ]);
                });
            });

            it('test/testFolder/test1/test1_2.', function () {
                return EnumFiles._enumFiles('test/testFolder/test1/test1_2')
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });

            it('run againt a non-exsist directory.', function () {
                return EnumFiles._enumFiles('test/testFolder/test100')
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });
        });

        describe('deep search', function () {
            it('test/testFolder.', function () {
                return EnumFiles._enumFiles('test/testFolder', true)
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1.txt',
                        'test/testFolder/test2.txt',
                        'test/testFolder/test1/test1.txt',
                        'test/testFolder/test1/test2.txt',
                        'test/testFolder/test1/test1_1/test1.txt',
                        'test/testFolder/test1/test1_1/test2.txt'
                    ]);
                });
            });

            it('test/testFolder/test1.', function () {
                return EnumFiles._enumFiles('test/testFolder/test1', true)
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1/test1.txt',
                        'test/testFolder/test1/test2.txt',
                        'test/testFolder/test1/test1_1/test1.txt',
                        'test/testFolder/test1/test1_1/test2.txt'
                    ]);
                });
            });

            it('test/testFolder/test1/test1_1.', function () {
                return EnumFiles._enumFiles('test/testFolder/test1/test1_1', true)
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1/test1_1/test1.txt',
                        'test/testFolder/test1/test1_1/test2.txt'
                    ]);
                });
            });

            it('test/testFolder/test1/test1_2.', function () {
                return EnumFiles._enumFiles('test/testFolder/test1/test1_2', true)
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });
        });
    });

    describe('Just to make sure, hit all public functions. Black box tests.', function () {
        it('dir.', function () {
            return EnumFiles.dir('test/testFolder')
            .then((res) => {
                assert.deepEqual(res, [
                    'test/testFolder/test1',
                    'test/testFolder/test2'
                ]);
            });
        });

        it('dirRecursively.', function () {
            return EnumFiles.dirRecursively('test/testFolder', true)
            .then((res) => {
                assert.deepEqual(res, [
                    'test/testFolder/test1',
                    'test/testFolder/test1/test1_1',
                    'test/testFolder/test1/test1_2',
                    'test/testFolder/test2'
                ]);
            });
        });

        it('files.', function () {
            return EnumFiles.files('test/testFolder')
            .then((res) => {
                assert.deepEqual(res, [
                    'test/testFolder/test1.txt',
                    'test/testFolder/test2.txt'
                ]);
            });
        });

        it('filesRecursively.', function () {
            return EnumFiles.filesRecursively('test/testFolder', true)
            .then((res) => {
                assert.deepEqual(res, [
                    'test/testFolder/test1.txt',
                    'test/testFolder/test2.txt',
                    'test/testFolder/test1/test1.txt',
                    'test/testFolder/test1/test2.txt',
                    'test/testFolder/test1/test1_1/test1.txt',
                    'test/testFolder/test1/test1_1/test2.txt'
                ]);
            });
        });
    });
});
