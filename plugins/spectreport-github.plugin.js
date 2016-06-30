var request = require('request');
var netrc = require('netrc');

function parseNetrc(options) {
    var netrcObj, newOptions = {};

    if (options.ghNetrc && options.ghNetrc.length) {
        netrcObj = netrc(options.ghNetrc);
    }
    else {
        netrcObj = netrc();
    }

    // Create a new copy of the options with ghUser and ghPass
    if (netrcObj && netrcObj['github.com']) {
        for (var key in options) {
            newOptions[key] = options[key];
        }
        newOptions.ghUser = netrcObj['github.com'].login;
        newOptions.ghPass = netrcObj['github.com'].password;
    }
    else {
        newOptions = options;
    }

    return newOptions;
}

function buildRepoUrl(options) {
    var repoUrl = 'https://';

    if (options.ghUser && options.ghPass) {
        repoUrl += options.ghUser + ':' + options.ghPass + '@';
    }
    repoUrl += 'api.github.com/repos/' + options.ghRepo +
        '/issues/' + options.ghId + '/comments';

    return repoUrl;
}

function buildFailureLinks(results, reportUrl, failStatus) {
    var failureLinks = [];
    if (results.tests) {
        for (var i = 0; i < results.tests.length; i++) {
            var test = results.tests[i];
            if (test.status === failStatus) {
                var link = '[' + test.fullTitle + '](' +
                    reportUrl + '#' + test.hash + ')';
                failureLinks.push(link);
            }
        }
    }
    if (results.suites) {
        for (var j = 0; j < results.suites.length; j++) {
            var suite = results.suites[j];
            var links = buildFailureLinks(suite, reportUrl, failStatus);
            if (links.length) {
                failureLinks.push(links);
            }
        }
    }
    return failureLinks.length ? failureLinks.join('\n'): '';
}

function buildGithubBody(summary, results, reportUrl, failStatus) {
    var passes = summary.tests - summary.failures - summary.pending;
    var body = '';

    if (summary.failures > 0) {
        body = '### Test FAILED!! :(###\nLink: ' + reportUrl + '\n' +
            '**Pass:** *' + passes + '*  |  **Pend:** *' + summary.pending +
            '*  |  **Fail:** *' + summary.failures + '*\n\nFailures:\n';
        body += buildFailureLinks(results, reportUrl, failStatus);
    } else {
        body = '#### Test passed :) ####\nLink: ' + reportUrl + '\n' +
            '**Pass:** *' + passes + '*  |  **Pend:** *' + summary.pending + '*';
    }
    return body;
}

/**
 * @typedef SpectreportGithubOptions
 * @memberof SpectreportGithub
 * @type {Object}
 * @property {String} ghReportUrl - The base url for the Spectreport report
 * @property {String} ghRepo - The base repository to report to, in the form of 'user-or-org/reponame'
 * @property {Number} ghId - The id of the issue or pull request to post the message to
 * @property {String} [ghUser] - Username for authentication with github
 * @property {String} [ghPass] - Password for authentication with github
 * @property {String} [ghApiKey] - Api key for alternative authenication with github
 * @property {String} [ghNetrc] - [~/.netrc] Use the netrc file entry for github.com authentication
 * @property {Boolean} [ghQuiet] - Suppress output to stdout
 * @property {Boolean} [ghOnlyFail] - Only post report on test failure
 */

/**
 * @function
 * @param {SpectreportGithubOptions} options - Options for the plugin
 * @param {Object} reporter - An instance of the Spectreport class
 * @param {Function} done - Callback for the plugin when done.
 * @description
 *   Post a success or failure message to github, along with links to the specific
 *   failed cases (if any), and a link to the overall Spectreport report.
 *
 *   This plugin supports two authentication methods.  If you want to authenticate
 *   with username and password, provide the 'ghUser' and 'ghPass' options.  If you want to
 *   authenticate via an api key or token, provide the 'ghApiKey' option.
 *
 *   The 'ghRepo' and 'ghId' are required options and will be used to construct the github
 *   api endpoint url as follows:
 *   'https://api.github.com/repos/<options.repo>/issues/<options.id>/comments'
 */
function SpectreportGithub(options, reporter, done) {
    var failStatus = reporter.constructor.Test.TEST_FAIL;
    var summary = reporter.summary();
    var results = reporter.results;
    var reportUrl = options.ghReportUrl;

    if (summary.failures === 0 && options.ghOnlyFail) {
        if (!options.ghQuiet) {
            console.log('Github: No failures reported.');
        }
        return false;
    }

    var post = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'git CL - node'
        },
        json: {
            body: buildGithubBody(summary, results, reportUrl, failStatus)
        }
    };

    if (Object.keys(options).indexOf('ghNetrc') !== -1) {
        options = parseNetrc(options);
    }

    if (options.ghApiKey) {
        post.headers.Authorization = 'token ' + options.ghApiKey;
    } else if (!(options.ghUser && options.ghPass)) {
        throw new Error('Github: No valid credentials specified.');
    }

    post.uri = buildRepoUrl(options);

    request(post, function (error) {
        if(error) {
            throw new Error('Github: Error while posting results\n' + error);
        }

        if (!options.ghQuiet) {
            console.log('Github: Results reported to github!');
        }
        done();
    });
}

SpectreportGithub.getUsage = function () {
    var commandLineArgs = require('command-line-args');
    var cla = commandLineArgs();
    var usage = {
        synopsis: [
            '$ node spectreport [bold]{-p} "plugins/spectreport-github.plugin.js' +
            ' [bold]{-x} option:value [option:value, ...]',
            '',
            '[bold]{Authentication Options:}',
            '',
            '   Either           [bold]{ghUser}:username             Github username and password.',
            '                    [bold]{ghPass:}password',
            '   Or               [bold]{ghApiKey}:YOUR_API_KEY       A github API key.',
            '   Or               [bold]{ghNetrc}:path/to/.netrc      [~/.netrc] Use specified netrc.',
            '',
            '[bold]{Required Options:}',
            '',
            '   [bold]{ghReportUrl}:http://server/path/report.html   Url to the Spectreport report.',
            '   [bold]{ghRepo}:user/repository                       Github repository slug.',
            '   [bold]{ghId}:37                                      The Issue or Pull Request id.',
            '',
            '[bold]{Optional Options:}',
            '',
            '   [bold]{ghQuiet}         Suppress output to console',
            '   [bold]{ghFailOnly}      Only send messages if a failure is detected'
        ]
    };
    console.log(cla.getUsage(usage));
};

module.exports = SpectreportGithub;
