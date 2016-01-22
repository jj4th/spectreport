var request = require('sync-request');

// Our newRelic reporting wants to track positive and negative test cases
// heuristically, your mileage may vary.
function countTestCharge(body, results) {
    if (results.tests) {
        for (var test of results.tests) {
            var title = test.title.toLowerCase();
            if (title.indexOf('should not ') === 0) {
                body.negativeTests++;
            } else if (title.indexOf('should ') === 0) {
                body.positiveTests++;
            }
        }
    }
    if (results.suites) {
        for (var suite of results.suites) {
            countTestCharge(body, suite);
        }
    }
}

function buildTestEvent(eventType, product, environment, summary, results) {
    var body = {};
    body.passingTests = summary.tests - (summary.pending + summary.failures);
    body.failingTests = summary.failures;
    body.pendingTests = summary.pending;
    body.totalTests = summary.tests;
    body.duration = summary.duration;
    body.eventType = eventType;
    body.product = product;
    body.environment = environment;

    body.positiveTests = body.negativeTests = 0;

    countTestCharge(body, results);

    return body;
}

/**
 * @typedef SpectreportNewRelicOptions
 * @memberof SpectreportNewRelic
 * @type {Object}
 * @property {String} [nrCollectorUrl] - URL for New Relic Insights API
 * @property {String} [nrInsertKey] - API Key for data submission to New Relic
 * @property {String} [nrEventType] - The event type to log in New Relic
 */

/**
 * @function
 * @param {SpectreportNewRelicOptions} options - Options for the plugin
 * @param {Object} reporter - An instance of the Spectreport class
 * @description
 *
 */
function SpectreportNewRelic(options, reporter) {
    var summary = reporter.summary();
    var results = reporter.results;
    var insertKey = options.nrInsertKey;
    var collectorUrl = options.nrCollectorUrl;
    var eventType = options.nrEventType;
    var environment = options.nrEnvironment;
    var product = options.nrProduct;

    var post = {
        headers: {
            'Content-Type': 'application/json',
            'X-Insert-Key': insertKey
        },
        json: buildTestEvent(eventType, product, environment, summary, results)
    };

    try {
        var response = request('POST', collectorUrl, post);
        response.getBody('utf-8');
    } catch (ex) {
        ex.message = 'NewRelic: Error while posting results\n' + ex.message;
        throw ex;
    }

    if (!options.quiet) {
        console.log('NewRelic: Results reported to New Relic!');
    }
    return true;
}

SpectreportNewRelic.getUsage = function () {
    var commandLineArgs = require('command-line-args');
    var cla = commandLineArgs();
    var usage = {
        synopsis: [
            '$ node spectreport [bold]{-p} "plugins/spectreport-newrelic.plugin.js' +
            ' [bold]{-x} option:value [option:value, ...]',
            '',
            '[bold]{Required Options:}',
            '',
            '   [bold]{nrReportUrl}:https://newrelic/v1/1010/events   The New Relic Collector URL.',
            '   [bold]{nrRepo}:MjFua2xoNDM1bnAwOD                     The New Relic Insert Key.',
            '   [bold]{nrEventType}:"Spectreport Test Results"        The Event Type to register in New Relic',
            '   [bold]{nrProduct}:"MyCoolProduct"                     The Event Type to register in New Relic',
            '   [bold]{nrEnvironment}:"Staging"                       The Event Type to register in New Relic',
        ]
    };
    console.log(cla.getUsage(usage));
};

module.exports = SpectreportNewRelic;
