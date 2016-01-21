const path = require('path');

import Suite from '../../src/classes/suite';

describe('Aggregator class', () => {
    let Aggregator, readdirSync, readJsonSync, statSync;

    before(() => {
        readdirSync = sinon.spy((filename) => {
            return f.aggregatorFS.readdir[filename];
        });

        readJsonSync = sinon.spy((filename) => {
            if (filename.indexOf('.notjson') > 0) {
                throw 'Not JSON';
            }
            return f.aggregatorFS.json[filename];
        });

        statSync = sinon.spy((filename) => {
            return {
                isDirectory: () => {
                    return !(filename.indexOf('.json') > 0 ||
                        filename.indexOf('.html') > 0);
                }
            };
        });

        // Rewire stub dependencies
        Aggregator = proxyquire(path.join(__dirname, '../../src/classes/aggregator'), {
            'fs-extra': {
                'readdirSync': readdirSync,
                'readJsonSync': readJsonSync,
                'statSync': statSync
            }
        });
    });

    describe('initialize', () => {
        let aggregator;

        before(() => {
            aggregator = new Aggregator(f.aggregatorFS.jsonDir, f.suite.title);
        });

        it('should properly initialize a default parent suite', () => {
            expect(aggregator).to.have.property('results').to.be.an.instanceOf(Suite);
            expect(aggregator.results).to.have.property('title', f.suite.title);
            expect(aggregator.results).to.have.property('parent').to.be.undefined;
        });
    });

    describe('listFiles', () => {
        let aggregator;

        before(() => {
            aggregator = new Aggregator(f.aggregatorFS.jsonDir, f.suite.title);
        });

        it('should have the correct list of files according to the fixtures', () => {
            expect(aggregator.listFiles()).to.have.members(f.aggregatorFS.fileList);
        });
    });

    describe('addJsonObject', () => {
        let filename, json, keyPath, aggregator;

        before(() => {
            aggregator = new Aggregator(f.aggregatorFS.jsonDir, f.suite.title);
        });

        it('should correctly add a JSON suite to the results', () => {
            filename = f.aggregatorFS.fileList[1];
            json = f.aggregatorFS.json[filename];
            keyPath = f.aggregatorFS.keyPath[1];
            aggregator.addJsonObject(keyPath, json);

            let stats = aggregator.results.stats;
            let cursor = aggregator.results.suites[0];

            expect(stats).to.have.property('tests', 2);
            expect(stats).to.have.property('duration', 15);
            expect(stats).to.have.property('timeStart', 0);
            expect(stats).to.have.property('timeStop', 15000);
            expect(cursor).to.have.property('title', 'product1');
            expect(cursor = cursor.suites[0]).to.have.property('title', 'subproduct1');
            expect(cursor = cursor.suites[0]).to.have.property('title', 'action');
            expect(cursor = cursor.suites[0]).to.have.property('title', 'Suite-1');
        });
        it('should correctly add a second JSON suite to the results', () => {
            filename = f.aggregatorFS.fileList[2];
            json = f.aggregatorFS.json[filename];
            keyPath = f.aggregatorFS.keyPath[2];
            aggregator.addJsonObject(keyPath, json);

            let stats = aggregator.results.stats;
            let cursor = aggregator.results.suites[0];

            expect(stats).to.have.property('tests', 4);
            expect(stats).to.have.property('duration', 35);
            expect(stats).to.have.property('timeStart', 0);
            expect(stats).to.have.property('timeStop', 35000);
            expect(cursor).to.have.property('title', 'product1');
            expect(cursor = cursor.suites[1]).to.have.property('title', 'subproduct2');
            expect(cursor = cursor.suites[0]).to.have.property('title', 'action');
            expect(cursor = cursor.suites[0]).to.have.property('title', 'Suite-2');
        });
        it('should correctly add a third JSON suite to the results', () => {
            filename = f.aggregatorFS.fileList[3];
            json = f.aggregatorFS.json[filename];
            keyPath = f.aggregatorFS.keyPath[3];
            aggregator.addJsonObject(keyPath, json);

            let stats = aggregator.results.stats;
            let cursor = aggregator.results.suites[1];

            expect(stats).to.have.property('tests', 6);
            expect(stats).to.have.property('duration', 75);
            expect(stats).to.have.property('timeStart', 0);
            expect(stats).to.have.property('timeStop', 75000);
            expect(cursor).to.have.property('title', 'product2');
            expect(cursor = cursor.suites[0]).to.have.property('title', 'action');
            expect(cursor = cursor.suites[0]).to.have.property('title', 'Suite-3');
        });
        it('should correctly add a fourth JSON suite to the results', () => {
            filename = f.aggregatorFS.fileList[4];
            json = f.aggregatorFS.json[filename];
            keyPath = f.aggregatorFS.keyPath[4];
            aggregator.addJsonObject(keyPath, json);

            let stats = aggregator.results.stats;
            let cursor = aggregator.results.suites[1];

            expect(stats).to.have.property('tests', 8);
            expect(stats).to.have.property('duration', 100);
            expect(stats).to.have.property('timeStart', 0);
            expect(stats).to.have.property('timeStop', 100000);
            expect(cursor).to.have.property('title', 'product2');
            expect(cursor = cursor.suites[0]).to.have.property('title', 'action');
            expect(cursor = cursor.suites[1]).to.have.property('title', 'Suite-4');
        });
        it('should correctly add a JSON file to the results', () => {
            filename = f.aggregatorFS.fileList[0];
            json = f.aggregatorFS.json[filename];
            keyPath = f.aggregatorFS.keyPath[0];
            aggregator.addJsonObject(keyPath, json);

            let stats = aggregator.results.stats;
            let cursor = aggregator.results;

            expect(stats).to.have.property('tests', 10);
            expect(stats).to.have.property('duration', 125);
            expect(stats).to.have.property('timeStart', 0);
            expect(stats).to.have.property('timeStop', 125000);
            expect(cursor).to.have.property('title', 'Test Suite');
            expect(cursor = cursor.suites[2]).to.have.property('title', 'Suite-5');

        });
    });

    describe('addJsonFileList', () => {
        let aggregator, addJsonObject, json, keyPath, filename;

        before(() => {
            readJsonSync.reset();

            aggregator = new Aggregator(f.aggregatorFS.jsonDir, f.suite.title);
            addJsonObject = sinon.stub(aggregator, 'addJsonObject');

            aggregator.addJsonFileList(f.aggregatorFS.fileList);
        });

        it('should call the fs.readJsonSync method with the expected arguments', () => {
            expect(readJsonSync.callCount).to.eql(f.aggregatorFS.fileList.length);

            for(let x = 0; x < f.aggregatorFS.fileList; x++) {
                filename = f.aggregatorFS.fileList[x];
                expect(readJsonSync.getCall(x)).to.have.been.calledWith(x);
            }
        });

        it('should call the addJsonObject method with the expected arguments', () => {
            expect(addJsonObject.callCount).to.eql(f.aggregatorFS.fileList.length);

            for(let x = 0; x < f.aggregatorFS.fileList; x++) {
                filename = f.aggregatorFS.fileList[x];
                keyPath = f.aggregatorFS.keyPath[x];
                json = f.aggregatorFS.json[filename];
                expect(addJsonObject.getCall(x)).to.have.been.calledWith(keyPath, json);
            }
        });

        it('should throw the expected error on Exception', () => {
            readJsonSync.reset();
            let fn = aggregator.addJsonFileList.bind(aggregator, f.aggregatorFS.fakeFileList);
            expect(fn).to.throw(Error, /There was a problem reading a results file/);
        });
    });

    describe('scan', () => {
        let aggregator, listFiles, addJsonFileList;

        before(() => {
            aggregator = new Aggregator(f.aggregatorFS.jsonDir, f.suite.title);
            listFiles = sinon.stub(aggregator, 'listFiles', () => {
                return f.aggregatorFS.fileList;
            });
            addJsonFileList = sinon.stub(aggregator, 'addJsonFileList');
            aggregator.scan();
        });

        it('should call the listFiles method once', () => {
            expect(listFiles).to.have.been.calledOnce;
        });

        it('should call the addJsonFileList method with the expected arguments', () => {
            expect(addJsonFileList).to.have.been.calledOnce;
            expect(addJsonFileList).to.have.been.calledWith(f.aggregatorFS.fileList);
        });

        it('should throw the expected error on Exception', () => {
            listFiles.restore();
            sinon.stub(aggregator, 'listFiles').throws();
            expect(aggregator.scan).to.throw(Error, /There was a problem reading the results directory/);
        });
    });
});
