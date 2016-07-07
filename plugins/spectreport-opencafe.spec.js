import fixtures from './spectreport-opencafe.fixtures';
import path from 'path';

// Wrap all console logging within a function
function trapConsole(func) {
    return function () {
        let oldConsole = console.log;
        let consoleLog = sinon.mock();
        console.log = consoleLog;

        try {
            func.apply(func, arguments);
        } catch (e) {
            console.log = oldConsole;
            throw (e);
        }
        console.log = oldConsole;

        return consoleLog;
    };
}

describe('Plugin - OpenCafe', () => {
    let plugin, usage, options, reporter, done, readFile, xml2js, addJsonObject,
        fileError, resultsXml, parserError, resultsJson, call;

    before(() => {
        fileError = parserError = null;
        resultsXml = fixtures.resultsXml;
        resultsJson = fixtures.xml2jsSimple;
        options = fixtures.options;

        readFile = sinon.spy((filename, fn) => {
            fn(fileError, resultsXml);
        });
        xml2js = sinon.spy((xml, fn) => {
            fn(parserError, resultsJson);
        });
        done = sinon.spy();

        addJsonObject = sinon.spy();

        reporter = {
            aggregator: {
                addJsonObject: addJsonObject,
                results: {
                    stats: {}
                }
            }
        };
        // Rewire stub dependencies
        plugin = proxyquire(path.join(__dirname, 'spectreport-opencafe.plugin'), {
            'xml2js': {
                'Parser': () => {
                    return {
                        parseString: xml2js
                    };
                }
            },
            'fs-extra': {
                'readFile': readFile
            }
        });

        // Trap the console on the plugin and the usage function
        usage = trapConsole(plugin.getUsage.bind(plugin));
        plugin = trapConsole(plugin.bind(plugin));
    });

    beforeEach(() => {
        done.reset();
        readFile.reset();
        xml2js.reset();
        addJsonObject.reset();
        fileError = parserError = null;
        resultsXml = fixtures.resultsXml;
        resultsJson = fixtures.xml2jsSimple;
        options = fixtures.options;
    });

    describe('General', () => {
        it('should properly call readFile', () => {
            plugin(options, reporter, done);
            expect(readFile).to.have.been.calledOnce;
            expect(readFile).to.have.been.calledWith(fixtures.options.ocResultFile);
        });
        it('should properly call xml2js.Parser', () => {
            plugin(options, reporter, done);
            expect(xml2js).to.have.been.calledOnce;
            expect(xml2js).to.have.been.calledWith(fixtures.resultsXml);

        });
        it('should replace the Spectreport.Aggregator.scan() routine', () => {
            plugin(options, reporter, done);
            expect(reporter.aggregator.scan).to.not.be.undefined;
        });
        it('should handle a readFile error', () => {
            fileError = fixtures.fileErrorMessage;
            expect(plugin.bind(plugin, options, reporter, done)).to.throw(fixtures.fileError);
        });
        it('should handle a xml2js error', () => {
            parserError = fixtures.parserErrorMessage;
            expect(plugin.bind(plugin, options, reporter, done)).to.throw(fixtures.parserError);
        });
        it('should create a results object when invoked', () => {
            plugin(options, reporter, done);
            reporter.aggregator.scan();
            expect(reporter.aggregator.results).to.not.be.undefined;
        });
    });

    describe('Sacn Routine', () => {
        it('should properly set the result stats for a single suite and test', () => {
            plugin(options, reporter, done);
            reporter.aggregator.scan();
            expect(reporter.aggregator.results.stats).to.eql(fixtures.statsSimple);
        });

        it('should properly set the result stats for a single suite and test', () => {
            resultsJson = fixtures.xml2jsMulti;
            plugin(options, reporter, done);
            reporter.aggregator.scan();
            expect(reporter.aggregator.results.stats).to.eql(fixtures.statsMulti);
        });

        it('should properly build the suite object for a single suite and test', () => {
            plugin(options, reporter, done);
            reporter.aggregator.scan();
            expect(addJsonObject).to.have.been.calledOnce;

            call = addJsonObject.getCall(0);
            expect(call.args[1].tests[0].fullTitle()).to.eql(fixtures.testPassFullTitle);
            delete call.args[1].tests[0].fullTitle;
            expect(call.args).to.eql(fixtures.addJsonPass);
        });

        it('should properly build the suite objects for multiple suites and tests', () => {
            resultsJson = fixtures.xml2jsMulti;
            plugin(options, reporter, done);
            reporter.aggregator.scan();
            expect(addJsonObject.callCount).to.eql(3);

            call = addJsonObject.getCall(0);
            expect(call.args[1].tests[0].fullTitle()).to.eql(fixtures.testPassFullTitle);
            delete call.args[1].tests[0].fullTitle;
            expect(call.args).to.eql(fixtures.addJsonPass);

            call = addJsonObject.getCall(1);
            expect(call.args[1].tests[0].fullTitle()).to.eql(fixtures.testFailFullTitle);
            delete call.args[1].tests[0].fullTitle;
            expect(call.args).to.eql(fixtures.addJsonFail);

            call = addJsonObject.getCall(2);
            expect(call.args[1].tests[0].fullTitle()).to.eql(fixtures.testSkipFullTitle);
            delete call.args[1].tests[0].fullTitle;
            expect(call.args).to.eql(fixtures.addJsonSkip);
        });

        it('should properly build the suite objects for nested test suites', () => {
            resultsJson = fixtures.xml2jsNested;
            plugin(options, reporter, done);
            reporter.aggregator.scan();
            expect(addJsonObject.callCount).to.eql(3);

            call = addJsonObject.getCall(0);
            expect(call.args[1].tests[0].fullTitle()).to.eql(fixtures.testPassFullTitle);
            delete call.args[1].tests[0].fullTitle;
            expect(call.args).to.eql(fixtures.addJsonPass);

            call = addJsonObject.getCall(1);
            expect(call.args[1].tests[0].fullTitle()).to.eql(fixtures.testFailFullTitle);
            delete call.args[1].tests[0].fullTitle;
            expect(call.args).to.eql(fixtures.addJsonFail);

            call = addJsonObject.getCall(2);
            expect(call.args[1].tests[0].fullTitle()).to.eql(fixtures.testSkipFullTitle);
            delete call.args[1].tests[0].fullTitle;
            expect(call.args).to.eql(fixtures.addJsonSkip);
        });

        it('should properly build the suite objects with tests in shared classpath', () => {
            resultsJson = fixtures.xml2jsSameClasspath;
            plugin(options, reporter, done);
            reporter.aggregator.scan();
            expect(addJsonObject).to.have.been.calledOnce;

            call = addJsonObject.getCall(0);
            expect(call.args[1].tests[0].fullTitle()).to.eql(fixtures.testPassFullTitle);
            expect(call.args[1].tests[1].fullTitle()).to.eql(fixtures.testPass2FullTitle);
            delete call.args[1].tests[0].fullTitle;
            delete call.args[1].tests[1].fullTitle;
            expect(call.args).to.eql(fixtures.addJsonSameClasspath);
        });

        it('should properly build the suite objects with no ocNamespace argument', () => {
            options = fixtures.optionsNoNamespace;
            plugin(options, reporter, done);
            reporter.aggregator.scan();
            expect(addJsonObject).to.have.been.calledOnce;

            call = addJsonObject.getCall(0);
            expect(call.args[1].tests[0].fullTitle()).to.eql(fixtures.testPassNoNamespaceFullTitle);
            delete call.args[1].tests[0].fullTitle;
            expect(call.args).to.eql(fixtures.addJsonNoNamespace);
        });

        it('should properly handle the case of non-array failure objects', () => {
            resultsJson = fixtures.xml2jsFailObject;
            plugin(options, reporter, done);
            reporter.aggregator.scan();
            expect(addJsonObject).to.have.been.calledOnce;

            call = addJsonObject.getCall(0);
            expect(call.args[1].tests[0].fullTitle()).to.eql(fixtures.testFailFullTitle);
            delete call.args[1].tests[0].fullTitle;
            expect(call.args).to.eql(fixtures.addJsonFail);
        });
    });

    describe('getUsage', () => {
        it('should log something to the console', () => {
            let log = usage();

            expect(log).to.have.been.calledOnce;
        });
    });
});
