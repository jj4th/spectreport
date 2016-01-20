var request = require('sync-request');

function SpectreportGithub(options, reporter, Spectreport) {
    var summary = reporter.summary();
    var results = reporter.results;
    var reportUrl = options.reportUrl;

    var buildRepoUrl = function () {
        var repoUrl = 'https://';

        if (options.user && options.pass) {
            repoUrl += options.user + ':' + options.pass + '@';
        }
        repoUrl += 'api.github.com/repos/' + options.repo +
            '/issues/' + options.id + '/comments';

        return repoUrl;
    }
    var url = buildRepoUrl(options.repo, options.id, options.user, options.pass);

    var buildFailureLinks = function (results) {
        var failureLinks = [];
        for (test of results.tests) {
            if (test.status === Spectreport.Test.TEST_FAIL) {
                var link = '[' + test.fullTitle + '](' +
                    reportUrl + '#' + test.hash + ')';
                failureLinks.push(link);
            }
        }
        for (suite of results.suites) {
            var links = buildFailureLinks(suite);
            if (links) {
                failureLinks.push(links);
            }
        }
        return failureLinks.length ? failureLinks.join('\n'): null;
    }

    var buildGithubBody = function () {
        var passes = summary.tests - summary.failures - summary.pending;
        var body = '';

        if (summary.failures > 0) {
            body = '### Test FAILED!! :(###\nLink: ' + reportUrl + '\n' +
                '**Pass:** *' + passes + '*  |  **Pend:** *' + summary.pending +
                '*  |  **Fail:** *' + summary.failures + '*\n\nFailures:\n';
            body += buildFailureLinks(results, '')
        } else {
            body = '#### Test passed :) ####\nLink: ' + reportUrl + '\n' +
                '**Pass:** *' + passes + '*  |  **Pend:** *' + summary.pending + '*';
        }
        return body;
    }

    if (summary.failures === 0 && options.onlyFail) {
        if (!options.quiet) {
            console.log('Github : No failures reported.');
        }
        return false;
    }

    var post = {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'git CL - node'
        },
        json: {
            body: buildGithubBody(reporter, options.reportUrl)
        }
    };

    if (options.apiKey) {
        post.headers['Authorization'] = 'token ' + apiKey;
    } else if (!options.user || !options.pass) {
        throw new Error('No valid credentials specified.');
    }

    try {
        var response = request('POST', url, post);
        response.getBody('utf-8');
        console.log(post.json.body);
    } catch (e) {
        e.message = 'Github : Error while posting results\n' + e.message;
        throw e;
    }

    if (!options.quiet) {
        console.log('Github : Results reported to github!');
    }
    return true;
}

module.exports = SpectreportGithub;
