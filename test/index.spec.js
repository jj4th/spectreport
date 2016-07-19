const path = require('path');

import Aggregator from '../src/classes/aggregator';
import Stats from '../src/classes/stats';
import Suite from '../src/classes/suite';
import Test from '../src/classes/test';

describe('Index file', () => {
    let Spectreport, readFileSync, writeFileSync,
        jade, aggregator, aggregatorScan;

    class AggregatorMock {
        constructor() {
            aggregator.apply(this, arguments);
        }
        scan() {
            return aggregatorScan.apply(this, arguments);
        }
    }

    before(() => {
        readFileSync = sinon.stub();
        writeFileSync = sinon.stub();
        jade = sinon.stub();

        aggregator = sinon.spy();
        aggregatorScan = sinon.stub();

        // Rewire stub dependencies
        Spectreport = proxyquire(path.resolve(__dirname, '../src/index'), {
            'fs-extra': {
                'readFileSync': readFileSync,
                'writeFileSync': writeFileSync
            },
            'jade': {
                'renderFile': jade
            },
            './classes/aggregator': AggregatorMock
        });
    });

    describe('initialize', () => {
        let spectreport;

        before(() => {
            spectreport = new Spectreport();
        });

        after(() => {
            aggregator.reset();
        });

        it('should properly initialize', () => {
            expect(aggregator).to.have.been.calledWith(f.indexDefaults.jsonDir, f.indexDefaults.suiteTitle);
            expect(aggregator).to.have.been.calledOnce;
        });

        it('should have the proper default options', () => {
            expect(spectreport.opts).to.eql(f.indexDefaults);
        });
    });

    describe('custom options', () => {
        let spectreport;

        before(() => {
            spectreport = new Spectreport(f.indexCustom);
        });

        it('should properly initialize', () => {
            expect(aggregator).to.have.been.calledWith(f.indexCustom.jsonDir, f.indexCustom.suiteTitle);
            expect(aggregator).to.have.been.calledOnce;
        });

        it('should have the proper custom options', () => {
            expect(spectreport.opts).to.eql(f.indexCustom);
        });

        after(() => {
            aggregator.reset();
        });
    });

    describe('scan', () => {
        let spectreport;

        before(() => {
            aggregatorScan.reset();

            spectreport = new Spectreport();
        });

        it('should call aggregator.scan', () => {
            aggregatorScan.returns(f.suite);
            spectreport.scan();
            expect(aggregatorScan).to.have.been.calledOnce;
        });

        it('should throw error when there are no results', () => {
            aggregatorScan.returns();
            expect(spectreport.scan.bind(spectreport)).to.throw(f.noResultsError);
        });

        it('should throw error when there are no result stats', () => {
            aggregatorScan.returns({});
            expect(spectreport.scan.bind(spectreport)).to.throw(f.noResultsError);
        });

        it('should throw error when aggregator.scan fails', () => {
            let errMsg = 'File Not Found';
            aggregatorScan.throws(new Error(errMsg));
            expect(spectreport.scan.bind(spectreport)).to.throw(f.aggregatorScanError + errMsg);
        });
    });

    describe('report', () => {
        let spectreport, scan;

        before(() => {
            spectreport = new Spectreport();
            scan = sinon.spy(function () {
                spectreport.results = f.suite;
            });
            spectreport.scan = scan;
        });

        beforeEach(() => {
            readFileSync.reset();
            readFileSync.resetBehavior();
            readFileSync.returns('template');

            jade.reset();
            jade.resetBehavior();
            jade.returns('rendered');
        });

        it('should call scan when there are no results', () => {
            spectreport.report();
            expect(scan).to.have.been.calledOnce;
        });

        it('should invoke the jade template renderer', () => {
            let jadeOptions = {
                pretty: true,
                results: f.suite
            };

            spectreport.report();
            expect(jade).to.have.been.calledOnce;
            expect(jade).to.have.been.calledWith(f.indexDefaults.template, jadeOptions);
        });

        it('should populate the reportHtml property', () => {
            spectreport.report();
            expect(spectreport.reportHtml).to.not.be.undefined;
            expect(spectreport.reportHtml).to.eql('rendered');
        });

        it('should throw error when the jade renderer fails', () => {
            let errMsg = 'Rendering Failed';
            jade.throws(new Error(errMsg));
            expect(spectreport.report.bind(spectreport)).to.throw(f.renderReportError + errMsg);
        });
    });

    describe('output', () => {
        let spectreport, report;

        before(() => {
            spectreport = new Spectreport();
            report = sinon.spy(function () {
                spectreport.reportHtml = 'report';
            });
            spectreport.report = report;
        });

        beforeEach(() => {
            report.reset();
            writeFileSync.reset();
            writeFileSync.resetBehavior();
            writeFileSync.returns(true);
        });

        it('should invoke report when there is no reportHtml', function () {
            spectreport.output();
            expect(report).to.have.been.calledOnce;
        });

        it('should invoke writeFileSync with default outputHtml', function () {
            spectreport.output();
            expect(writeFileSync).to.have.been.calledOnce;
            expect(writeFileSync).to.have.been.calledWith(f.indexDefaults.outputHtml, 'report');
        });

        it('should invoke writeFileSync with custom outputHtml', function () {
            spectreport.output(f.indexCustom.outputHtml);
            expect(writeFileSync).to.have.been.calledOnce;
            expect(writeFileSync).to.have.been.calledWith(f.indexCustom.outputHtml, 'report');
        });

        it('should throw an error on file write exception', function () {
            let errMsg = 'File Not Found';
            writeFileSync.throws(new Error(errMsg));
            expect(spectreport.output.bind(spectreport)).to.throw(f.writeFileError + errMsg);
        });
    });

    describe('summary', () => {
        let spectreport, summary, scan;

        before(() => {
            spectreport = new Spectreport();
            scan = sinon.spy(function() {
                spectreport.results = { stats: f.stats };
            });
            spectreport.scan = scan;
        });

        it('should call scan when there are no results', () => {
            spectreport.summary();
            expect(scan).to.have.been.calledOnce;
        });

        it('should return the stats object', () => {
            summary = spectreport.summary();
            expect(summary).to.eql(f.stats);
        });
    });
});
