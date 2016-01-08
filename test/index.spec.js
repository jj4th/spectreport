const path = require('path');

import Aggregator from '../src/classes/aggregator';
import Stats from '../src/classes/stats';
import Suite from '../src/classes/suite';
import Test from '../src/classes/test';

describe('Index file', () => {
    let Spectreport, readFileSync, writeFileSync,
        dot, dotRender, aggregator, aggregatorScan;

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
        dotRender = sinon.stub();
        dot = sinon.stub();

        aggregator = sinon.spy();
        aggregatorScan = sinon.stub();

        // Rewire stub dependencies
        Spectreport = proxyquire(path.resolve(__dirname, '../src/index'), {
            'fs-extra': {
                'readFileSync': readFileSync,
                'writeFileSync': writeFileSync
            },
            'dot': {
                'template': dot
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
        it('should call aggregator.scan');
        it('should throw error when aggregator.scan fails');
        it('should throw error when there are no results');
        it('should throw error when there are no result stats');
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

            dot.reset();
            dot.resetBehavior();
            dot.returns(dotRender);

            dotRender.reset();
            dotRender.resetBehavior();
            dotRender.returns('rendered');
        });

        it('should call scan when there are no results', () => {
            spectreport.report();
            expect(scan).to.have.been.calledOnce;
        });

        it('should read the template file', () => {
            spectreport.report();
            expect(readFileSync).to.have.been.calledOnce;
            expect(readFileSync).to.have.been.calledWith(f.indexDefaults.template);
        });

        it('should invoke the dot template renderer', () => {
            spectreport.report();
            expect(dot).to.have.been.calledOnce;
            expect(dot).to.have.been.calledWith('template');
        });

        it('should render the template', () => {
            spectreport.report();
            expect(dotRender).to.have.been.calledOnce;
            expect(dotRender).to.have.been.calledWith(f.suite);
        });

        it('should populate the reportHtml property', () => {
            spectreport.report();
            expect(spectreport.reportHtml).to.not.be.undefined;
            expect(spectreport.reportHtml).to.eql('rendered');
        });

        it('should throw error when the template file cannot be read', () => {
            let errMsg = 'File Not Found';
            readFileSync.throws(new Error(errMsg));
            expect(spectreport.report.bind(spectreport)).to.throw(f.renderReportError + errMsg);
        });

        it('should throw error when the dot renderer fails', () => {
            let errMsg = 'Rendering Failed';
            dot.throws(new Error(errMsg));
            expect(spectreport.report.bind(spectreport)).to.throw(f.renderReportError + errMsg);
        });

        it('should throw error when the template cannot be rendered', () => {
            let errMsg = 'Runtime Error';
            dotRender.throws(new Error(errMsg));
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