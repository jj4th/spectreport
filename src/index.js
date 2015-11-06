const fs = require('fs-extra');
const dot = require('dot');
const path = require('path');

import Aggregator from './classes/aggregator'

const defaults = {
    outputHtml: 'test/results/index.html',
    jsonDir: 'test/results',
    template: path.join(path.relative('.', __dirname), 'assets/results.dot'),
    suiteTitle: 'Test Results'
};

import Stats from './classes/stats';
import Suite from './classes/suite';
import Test from './classes/test';

class Spectreport {
    constructor(opts) {
        this.opts = Object.assign({}, defaults, opts);
        this.aggregator = new Aggregator(this.opts.jsonDir, this.opts.suiteTitle);
    }

    report() {
        let report = null,
            results = this.aggregator.scan();

        if (!results || !results.stats) {
            throw new Error('No results were found.  Did you run the tests?');
        }

        try {
            let tpl = fs.readFileSync(this.opts.template);
            let render = dot.template(tpl);
            report = render(results);
        } catch (ex) {
            throw new Error('There was a problem rendering the HTML report.\n' + ex.message);
        }

        return report;
    }

    reportFile(outputHtml) {
        let report = this.report();

        outputHtml = outputHtml || this.opts.outputHtml;

        try {
            fs.writeFileSync(outputHtml, report);
        } catch (ex) {
            throw new Error('There was a problem outputting the HTML report to disk.\n' + ex.message);
        }

        return true;
    }

    summary() {
        if (!this.results || !this.results.stats) {
            throw new Error('No results were found.  Did you run \'report()\'?');
        }

        return this.results.stats;
    }
}

Spectreport.Stats = Stats;
Spectreport.Suite = Suite;
Spectreport.Test = Test;
Spectreport.DefaultOptions = defaults;
export default Spectreport;
