'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Promise = require('bluebird');
const EnumFiles = require('./../index');

describe('EnumFiles', function () {
    let sandbox, spyFiles, spyDir;

    before(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('public functions', function () {
        beforeEach(function () {
            spyFiles = sandbox.stub(EnumFiles, '_enumFiles');
            spyFiles.callsFake(function () {
                return Promise.resolve("_enumFiles");
            });

            spyDir = sandbox.stub(EnumFiles, '_enumDir');
            spyDir.callsFake(function () {
                return Promise.resolve("_enumDir");
            });
        });

        it('files.', function () {
            return EnumFiles.files("TEST PATH")
            .then((res) => {
                // make sure private function was hit as we expected.
                assert.strictEqual(spyFiles.callCount, 1);
                assert.deepEqual(spyFiles.args[0], ["TEST PATH", false]);
                assert.strictEqual(spyDir.callCount, 0);

                // make sure it returns the result itself coming from the private one.
                assert.strictEqual(res, "_enumFiles");
            });
        });

        it('filesRecursively.', function () {
            return EnumFiles.filesRecursively("TEST PATH")
            .then((res) => {
                // make sure private function was hit as we expected.
                assert.strictEqual(spyFiles.callCount, 1);
                assert.deepEqual(spyFiles.args[0], ["TEST PATH", true]);
                assert.strictEqual(spyDir.callCount, 0);

                // make sure it returns the result itself coming from the private one.
                assert.strictEqual(res, "_enumFiles");
            });
        });

        it('dir.', function () {
            return EnumFiles.dir("TEST PATH")
            .then((res) => {
                // make sure private function was hit as we expected.
                assert.strictEqual(spyDir.callCount, 1);
                assert.deepEqual(spyDir.args[0], ["TEST PATH", false]);
                assert.strictEqual(spyFiles.callCount, 0);

                // make sure it returns the result itself coming from the private one.
                assert.strictEqual(res, "_enumDir");
            });
        });

        it('dirRecursively.', function () {
            return EnumFiles.dirRecursively("TEST PATH")
            .then((res) => {
                // make sure private function was hit as we expected.
                assert.strictEqual(spyDir.callCount, 1);
                assert.deepEqual(spyDir.args[0], ["TEST PATH", true]);
                assert.strictEqual(spyFiles.callCount, 0);

                // make sure it returns the result itself coming from the private one.
                assert.strictEqual(res, "_enumDir");
            });
        });
    });

    describe('_enumDir', function () {
        describe('shallow search', function () {
            it('test/testFolder.', function () {
                return EnumFiles._enumDir("test/testFolder")
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1',
                        'test/testFolder/test2'
                    ]);
                });
            });

            it('test/testFolder/test1.', function () {
                return EnumFiles._enumDir("test/testFolder/test1")
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1/test1_1',
                        'test/testFolder/test1/test1_2'
                    ]);
                });
            });

            it('test/testFolder/test1/test1_1.', function () {
                return EnumFiles._enumDir("test/testFolder/test1/test1_1")
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });

            it('run againt a non-exsist directory.', function () {
                return EnumFiles._enumDir("test/testFolder/test100")
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });
        });

        describe('deep search', function () {
            it('test/testFolder.', function () {
                return EnumFiles._enumDir("test/testFolder", true)
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
                return EnumFiles._enumDir("test/testFolder/test1", true)
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1/test1_1',
                        'test/testFolder/test1/test1_2'
                    ]);
                });
            });

            it('test/testFolder/test1/test1_1.', function () {
                return EnumFiles._enumDir("test/testFolder/test1/test1_1", true)
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });
        });
    });

    describe('_enumFiles', function () {
        describe('shallow search', function () {
            it('test/testFolder.', function () {
                return EnumFiles._enumFiles("test/testFolder")
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1.txt',
                        'test/testFolder/test2.txt'
                    ]);
                });
            });

            it('test/testFolder/test1.', function () {
                return EnumFiles._enumFiles("test/testFolder/test1")
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1/test1.txt',
                        'test/testFolder/test1/test2.txt'
                    ]);
                });
            });

            it('test/testFolder/test1/test1_1.', function () {
                return EnumFiles._enumFiles("test/testFolder/test1/test1_1")
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1/test1_1/test1.txt',
                        'test/testFolder/test1/test1_1/test2.txt'
                    ]);
                });
            });

            it('test/testFolder/test1/test1_2.', function () {
                return EnumFiles._enumFiles("test/testFolder/test1/test1_2")
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });

            it('run againt a non-exsist directory.', function () {
                return EnumFiles._enumFiles("test/testFolder/test100")
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });
        });

        describe('deep search', function () {
            it('test/testFolder.', function () {
                return EnumFiles._enumFiles("test/testFolder", true)
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
                return EnumFiles._enumFiles("test/testFolder/test1", true)
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
                return EnumFiles._enumFiles("test/testFolder/test1/test1_1", true)
                .then((res) => {
                    assert.deepEqual(res, [
                        'test/testFolder/test1/test1_1/test1.txt',
                        'test/testFolder/test1/test1_1/test2.txt'
                    ]);
                });
            });

            it('test/testFolder/test1/test1_2.', function () {
                return EnumFiles._enumFiles("test/testFolder/test1/test1_2", true)
                .then((res) => {
                    assert.deepEqual(res, []);
                });
            });
        });
    });
});
