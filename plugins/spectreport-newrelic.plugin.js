//var request = require('request');

// Our newRelic reporting wants to track positive and negative test cases
// heuristically, your mileage may vary.

function buildTestEvents(reporter, eventType, product, environment, body, results) {
    if (results.tests) {
        for (var i = 0; i < results.tests.length; i++) {
            var test = results.tests[i];
            var title = test.title.toLowerCase();
            if (title.indexOf('should not ') === 0) {
                test.positive = false;
            } else if (title.indexOf('should ') === 0) {
                test.positive = true;
            }

            test.statusCode = test.status;
            if (test.status === reporter.Test.TEST_FAIL) {
                test.status = 'PASS';
            } else if (test.status === reporter.Test.TEST_PENDING) {
                test.status = 'PENDING';
            } else {
                test.status = 'FAIL';
            }

            test.eventType = eventType;
            test.product = product;
            test.environment = environment;

            body.push(test);
        }
    }

    if (results.suites) {
        for (var j = 0; j < results.suites.length; j++) {
            var suite = results.suites[j];
            buildTestEvents(reporter, eventType, product, environment, body, suite);
        }
    }

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
 * @param {Function} done - Callback for the plugin when done.
 * @description
 *   Post a test result event to newRelic.
 *
 */
function SpectreportNewRelic(options, reporter, done) {
    //var summary = reporter.summary();
    var results = reporter.results;
    var insertKey = options.nrInsertKey;
    var collectorUrl = options.nrCollectorUrl;
    var eventType = options.nrEventType;
    var environment = options.nrEnvironment;
    var product = options.nrProduct;

    var post = {
        method: 'POST',
        uri: collectorUrl,
        headers: {
            'Content-Type': 'application/json',
            'X-Insert-Key': insertKey
        },
        json: buildTestEvents(reporter, eventType, product, environment, [], results)
    };

    console.log(post);
    // request(post, function (error) {
    //     if(error) {
    //         throw new Error('NewRelic: Error while posting results\n' + error);
    //     }

    //     if (!options.nrQuiet) {
    //         console.log('NewRelic: Results reported to New Relic!');
    //     }
    //     done();
    // });
    done();
}

SpectreportNewRelic.getUsage = function () {
    var commandLineArgs = require('command-line-args');
    var cla = commandLineArgs();
    var usage = {
        synopsis: [
            '$ node spectreport [bold]{-p} "plugins/spectreport-newrelic.plugin.js' +
            ' [bold]{-x} option:value [option:value, ...]',
            '',
            'This plugin will publish results as events to a New Relic account.',
            '',
            '[bold]{Required Options:}',
            '',
            '   [bold]{nrReportUrl}:https://newrelic/v1/1010/events   The New Relic Collector URL.',
            '   [bold]{nrRepo}:MjFua2xoNDM1bnAwOD                     The New Relic Insert Key.',
            '   [bold]{nrEventType}:"Spectreport Test Results"        The Event Type to register in New Relic',
            '   [bold]{nrProduct}:"MyCoolProduct"                     The Event Type to register in New Relic',
            '   [bold]{nrEnvironment}:"Staging"                       The Event Type to register in New Relic',
            '',
            '[bold]{Optional Options:}',
            '',
            '   [bold]{nrQuiet}                                       Suppress output to console'
        ]
    };
    console.log(cla.getUsage(usage));
};

module.exports = SpectreportNewRelic;
