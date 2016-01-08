var request = require('sync-request');

function buildRepoUrl(repo, id, user, pass) {
    var repoUrl = 'https://';

    if (user && pass) {
        repoUrl += user + ':' + pass + '@';
    }
    repoUrl += 'api.github.com/repos/' + repo +
        '/issues/' + id + '/comments';

    return repoUrl;
}

function githubBody(summary, reportUrl) {
    var passes = summary.tests - summary.failures - summary.pending;
    var results = '';

    if (summary.failures > 0) {
        results = '### Test FAILED!! :(###\nLink: ' + reportUrl + '\n' +
            '**Pass:** *' + passes + '*  |  **Pend:** *' + summary.pending +
            '*  |  **Fail:** *' + summary.failures + '*';
    } else {
        results = '#### Test passed :) ####\nLink: ' + reportUrl + '\n' +
            '**Pass:** *' + passes + '*  |  **Pend:** *' + summary.pending + '*';
    }
    return results;
}

function SpectreportGithub(options, reporter) {
    var url = buildRepoUrl(options.repo, options.id, options.user, options.pass);
    var summary = reporter.summary();

    var post = {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'git CL - node'
        },
        json: {
            body: githubBody(summary, options.reportUrl)
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
    } catch (e) {
        e.message = 'Github : Error while posting results\n' + e.message;
        throw e;
    }

    if (!options.quiet) {
        console.log('Github : Results reported to github!');
    }
}

module.exports = SpectreportGithub;
