var fs = require('fs-extra');
var xml2js = require('xml2js');
var Spectreport = require('../lib/spectreport.min.js');
var Test = Spectreport.Test;

/**
 * @function
 * @internal
 * @param {String} class
 * @property {String} classname - The classname for the suite
 * @param {Object} suiteList - A heirarchal tree built from the python classnames
 * @description
 *   Returns the suite node for the given classname, creating it if necessary.
 *   Also automatically removes the ocNamespace from the front of the node path.
 */
function getSuiteByClassname(classname, suiteList) {
    var tokens = classname.split('.');
    var suiteTitle = tokens.pop();

    if (!suiteList[classname]) {
        var stats = {
            tests: 0,
            pending: 0,
            failures: 0,
            duration: 0,
            timeStart: 0,
            timeStop: 0
        };
        var suite = {
            tests: [],
            suites: [],
            title: suiteTitle,
            stats: stats
        };
        suiteList[classname] = {
            keyPath: tokens,
            suiteObj: suite
        };
    }

    return suiteList[classname].suiteObj;
}

function addTestToSuite(test, suite) {
    suite.tests.push(test);

    suite.stats.tests++;
    if (test.status === Test.TEST_FAIL) {
        suite.stats.failures++;
    } else if (test.status === Test.TEST_PENDING) {
        suite.stats.pending++;
    }

    suite.stats.duration += test.duration;
}

function buildErrorMessage(errorObj) {
    var message = [];

    if (!Array.isArray(errorObj)) {
        errorObj = [errorObj];
    }
    errorObj.forEach(function (item) {
        if (item._) {
            message.push(item._);
        } else {
            message.push(item.$.message);
        }
    });
    return {
        stack: message.join('\n')
    };
}

function buildTest(classname, testObj) {
    var statuses = {
        'PASSED': Test.TEST_PASS,
        'FAILED': Test.TEST_FAIL,
        'SKIPPED': Test.TEST_PENDING
    };

    var attrs = testObj.$;
    var failure = testObj.failure;
    var skipped = testObj.skipped;

    var test = {
        title: attrs.name,
        fullTitle: function () {
            return [classname, attrs.name].join('.');
        },
        duration: parseFloat(attrs.time),
        status: statuses[attrs.result]
    };

    if (failure) {
        test.error = buildErrorMessage(failure);
    }
    if (skipped) {
        test.error = buildErrorMessage(skipped);
    }

    return test;
}

/**
 * @function
 * @internal
 * @param {Object} resultsObj - A section of the parsed results object
 * @param {Object} suiteList - A list built from the python classnames
 * @property {String} ocNamespace - Base namespace string for the test heirarchy
 * @description
 *   Traverse resultsObj recursively looking for testcases, and then add all
 *   test cases to the suiteList object.
 */
function buildSuiteList(resultsObj, suiteList, ocNamespace) {
    for (var key in resultsObj) {
        var obj = resultsObj[key];

        if (key === 'testcase') {
            if (!Array.isArray(obj)) {
                obj = [obj];
            }
            for (var testKey in obj) {
                var testObj = obj[testKey];
                var classname = testObj.$.classname;
                // If the ocNamespace is present, trim it here.
                if (ocNamespace && classname.indexOf(ocNamespace) === 0) {
                    classname = classname.slice(ocNamespace.length);
                }
                var suite = getSuiteByClassname(classname, suiteList);
                var test = buildTest(classname, testObj);
                addTestToSuite(test, suite);
            }
        }
        else if (key === 'testsuite') {
            if (!Array.isArray(obj)) {
                obj = [obj];
            }
            for (var suiteKey in obj) {
                var suiteObj = obj[suiteKey];
                buildSuiteList(suiteObj, suiteList, ocNamespace);
            }
        }
    }

    return suiteList;
}

function createScanFunction(resultsObj, ocNamespace) {
    var suiteList = buildSuiteList(resultsObj, [], ocNamespace);

    return function () {
        for(var key in suiteList) {
            var entry = suiteList[key];

            // Fix up the times
            var stats = entry.suiteObj.stats;
            stats.timeStop = stats.duration * 1000;

            this.addJsonObject(entry.keyPath, entry.suiteObj);
        }

        this.results.stats.duration = parseFloat(resultsObj.testsuite.$.time);
        this.results.stats.timeStop = this.results.stats.duration * 1000;
        return this.results;
    };
}

/**
 * @typedef SpectreportOpenCafeOptions
 * @memberof SpectreportOpenCafe
 * @type {Object}
 * @property {String} ocResultFile - File path for OpenCafe XML test results
 * @property {String} [ocNamespace] - Base namespace string for the test heirarchy
 */

/**
 * @function
 * @param {SpectreportOpenCafeOptions} options - Options for the plugin
 * @param {Object} reporter - An instance of the Spectreport class
 * @param {Function} done - Callback for the plugin when done.
 * @description
 *   Reads in test results from the XML format that OpenCafe generates.  This enables
 *   Spectreport to generate reports and allows other plugins to use OpenCafe tests.  Note
 *   That this plugin works by hooking the Spectreport Aggregator class.
 */
function SpectreportOpenCafe(options, reporter, done) {
    var ocResultFile = options.ocResultFile;
    var ocNamespace = options.ocNamespace || '';

    // We want the namespace to end with a period.
    if (ocNamespace.lastIndexOf('.') !== ocNamespace.length - 1) {
        ocNamespace += '.';
    }

    try {
        var parser = new xml2js.Parser();
        fs.readFile(ocResultFile, function(err, data) {
            if (err) {
                throw new Error(err);
            }
            parser.parseString(data, function(parserErr, resultObj) {
                if (parserErr) {
                    throw new Error(parserErr);
                }

                // Replace the aggregator function with our own scanner.
                reporter.aggregator.scan = createScanFunction(resultObj, ocNamespace);

                done();
            });
        });

    } catch (error) {
        throw new Error('OpenCafe: Error while parsing results\n' + error.message);
    }
}

SpectreportOpenCafe.getUsage = function () {
    var commandLineArgs = require('command-line-args');
    var cla = commandLineArgs();
    var usage = {
        synopsis: [
            '$ node spectreport [bold]{-p} "plugins/spectreport-opencafe.plugin.js' +
            ' [bold]{-x} option:value [option:value, ...]',
            '',
            'This [bold]{input} plugin will read from an OpenCafe XML results file.  It hooks the' +
            ' Spectreport#Aggregator, and so may fail if substantial changes are made to that class.',
            '',
            '[bold]{Required Options:}',
            '',
            '   [bold]{ocResultFile}:test/results.xml  File path for OpenCafe XML test results.',
            '',
            '[bold]{Optional Options:}',
            '',
            '   [bold]{ocNamespace}:ocroast.ocapp      Base namespace string for the test heirarchy.'
        ]
    };
    console.log(cla.getUsage(usage));
};

module.exports = SpectreportOpenCafe;
