import Spectreport from '../src/index';

const pluginFixtures = {
    Spectreport: {
        Test: {
            TEST_PASS: Spectreport.Test.TEST_PASS,
            TEST_FAIL: Spectreport.Test.TEST_FAIL,
            TEST_PEND: Spectreport.Test.TEST_PEND,
        }
    },

    options: {
        id: 7,
        repo: 'user/repository',
        reportUrl: 'http://jenkins.internal/job/382/report.html',
        user: 'user',
        pass: 'pass'
    },
    optionsApiKey: {
        id: 7,
        repo: 'user/repository',
        reportUrl: 'http://jenkins.internal/job/382/report.html',
        apiKey: 'A6B5C4DE3F21'
    },
    optionsNoCreds: {
        id: 7,
        repo: 'user/repository',
        reportUrl: 'http://jenkins.internal/job/382/report.html'
    },

    noCredsError: new RegExp('^Github: No valid credentials specified.$'),
    githubError: new RegExp('^Github: Error while posting results\n404 Github Not Found!'),
    requestError: '404 Github Not Found!',

    repoUrl: 'https://user:pass@api.github.com/repos/user/repository/issues/7/comments',
    repoUrlApiKey: 'https://api.github.com/repos/user/repository/issues/7/comments',

    message: '#### Test passed :) ####\nLink: http://jenkins.internal/job/382/report.html\n' +
        '**Pass:** *2*  |  **Pend:** *0*',
    messageFailure: '### Test FAILED!! :(###\nLink: http://jenkins.internal/job/382/report.html\n' +
        '**Pass:** *1*  |  **Pend:** *0*  |  **Fail:** *1*\n\nFailures:\n' +
        '[Suite-1 - Test-1](http://jenkins.internal/job/382/report.html#123456)',

    results: {
        "title":"Test Results",
        "suites": [{
            "title":"Suite-1",
            "tests":[{
                "status":1,
                "title":"Test-1",
                "fullTitle":"Suite-1 - Test-1",
                "duration":10,
                "error":null
            }]
        },
        {
            "title":"Suite-2",
            "tests":[{
                "status":1,
                "title":"Test-2",
                "fullTitle":"Suite-2 - Test-2",
                "duration":5,
                "error":null
            }]
        }],
        "stats": {
            "tests":2,
            "pending":0,
            "failures":0,
            "duration":15,
            "timeStart":0,
            "timeStop":15000
        }
    },
    resultsFailure: {
        "title":"Test Results",
        "suites": [{
            "title":"Suite-1",
            "tests":[{
                "status":0,
                "title":"Test-1",
                "fullTitle":"Suite-1 - Test-1",
                "duration":10,
                "error":null,
                "hash": '123456'
            }]
        },
        {
            "title":"Suite-2",
            "tests":[{
                "status":1,
                "title":"Test-2",
                "fullTitle":"Suite-2 - Test-2",
                "duration":5,
                "error":null
            }]
        }],
        "stats": {
            "tests":2,
            "pending":0,
            "failures":1,
            "duration":15,
            "timeStart":0,
            "timeStop":15000
        }
    }
}

export default pluginFixtures;
