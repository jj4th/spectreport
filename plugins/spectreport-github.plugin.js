var request = require('sync-request');

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
        for (var test of results.tests) {
            if (test.status === failStatus) {
                var link = '[' + test.fullTitle + '](' +
                    reportUrl + '#' + test.hash + ')';
                failureLinks.push(link);
            }
        }
    }
    if (results.suites) {
        for (var suite of results.suites) {
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
 * @property {Boolean} [ghQuiet] - Suppress output to stdout
 * @property {Boolean} [ghOnlyFail] - Only post report on test failure
 */

/**
 * @function
 * @param {SpectreportGithubOptions} options - Options for the plugin
 * @param {Object} reporter - An instance of the Spectreport class
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
function SpectreportGithub(options, reporter) {
    var failStatus = reporter.constructor.Test.TEST_FAIL;
    var summary = reporter.summary();
    var results = reporter.results;
    var reportUrl = options.ghReportUrl;

    var githubUrl = buildRepoUrl(options);

    if (summary.failures === 0 && options.ghOnlyFail) {
        if (!options.ghQuiet) {
            console.log('Github: No failures reported.');
        }
        return false;
    }

    var post = {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'git CL - node'
        },
        json: {
            body: buildGithubBody(summary, results, reportUrl, failStatus)
        }
    };

    if (options.ghApiKey) {
        post.headers.Authorization = 'token ' + options.ghApiKey;
    } else if (!options.ghUser || !options.ghPass) {
        throw new Error('Github: No valid credentials specified.');
    }

    try {
        var response = request('POST', githubUrl, post);
        response.getBody('utf-8');
    } catch (ex) {
        ex.message = 'Github: Error while posting results\n' + ex.message;
        throw ex;
    }

    if (!options.ghQuiet) {
        console.log('Github: Results reported to github!');
    }
    return true;
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
            '   Either                [bold]{ghUser}:username [bold]{ghPass:}password',
            '   Or                    [bold]{ghApiKey}:YOUR_API_KEY',
            '',
            '[bold]{Required Options:}',
            '',
            '   [bold]{ghReportUrl}:http://server/path/report.html   Url to the Spectreport report.',
            '   [bold]{ghRepo}:user/repository                       Github repository slug.',
            '   [bold]{ghId}:37                                      The Issue or Pull Request id.',
            '',
            '[bold]{Optional Options:}',
            '',
            '   [bold]{ghQuiet}              Suppress output to console',
            '   [bold]{ghFailOnly}           Only send messages if a failure is detected'
        ]
    };
    console.log(cla.getUsage(usage));
};

module.exports = SpectreportGithub;
