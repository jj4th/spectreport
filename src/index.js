const fs = require('fs-extra');
const dot = require('dot');
const path = require('path');

import Aggregator from './classes/aggregator';

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
        this.results = null;
        this.opts = Object.assign({}, defaults, opts);
        this.aggregator = new Aggregator(this.opts.jsonDir, this.opts.suiteTitle);
    }

    scan() {
        try {
            this.results = this.aggregator.scan();
        } catch (ex) {
            ex.message = 'There was a problem aggregating the JSON results.\n' + ex.message;
            throw ex;
        }

        if (!this.results || !this.results.stats) {
            throw new Error('No results were found.  Did you run the tests?');
        }
    }

    report() {
        if(!this.results) {
            this.scan();
        }

        try {
            let tpl = fs.readFileSync(this.opts.template);
            let render = dot.template(tpl);
            this.reportHtml = render(this.results);
        } catch (ex) {
            ex.message = 'There was a problem rendering the HTML report.\n' + ex.message;
            throw ex;
        }
    }

    output(outputHtml) {
        if(!this.reportHtml) {
            this.report();
        }

        outputHtml = outputHtml || this.opts.outputHtml;

        try {
            fs.writeFileSync(outputHtml, this.reportHtml);
        } catch (ex) {
            ex.message = 'There was a problem outputting the HTML report to disk.\n' + ex.message;
            throw ex;
        }
    }

    summary() {
        if(!this.results) {
            this.scan();
        }

        return this.results.stats;
    }
}

Spectreport.Stats = Stats;
Spectreport.Suite = Suite;
Spectreport.Test = Test;
Spectreport.DefaultOptions = defaults;
export default Spectreport;
