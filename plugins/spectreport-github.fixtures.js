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
        ghId: 7,
        ghRepo: 'user/repository',
        ghReportUrl: 'http://jenkins.internal/job/382/report.html',
        ghUser: 'user',
        ghPass: 'pass'
    },
    optionsApiKey: {
        ghId: 7,
        ghRepo: 'user/repository',
        ghReportUrl: 'http://jenkins.internal/job/382/report.html',
        ghApiKey: 'A6B5C4DE3F21'
    },
    optionsNetrc: {
        ghId: 7,
        ghRepo: 'user/repository',
        ghReportUrl: 'http://jenkins.internal/job/382/report.html',
        ghNetrc: 'path/to/.netrc'
    },
    optionsNetrcDefault: {
        ghId: 7,
        ghRepo: 'user/repository',
        ghReportUrl: 'http://jenkins.internal/job/382/report.html',
        ghNetrc: ''
    },
    optionsNoCreds: {
        ghId: 7,
        ghRepo: 'user/repository',
        ghReportUrl: 'http://jenkins.internal/job/382/report.html'
    },
    netrc: {
        'github.com': {
            login: 'netrcUser',
            password: 'netrcPass'
        }
    },
    netrcDefault: {
        'github.com': {
            login: 'netrcDefaultUser',
            password: 'netrcDefaultPass'
        }
    },

    noCredsError: new RegExp('^Github: No valid credentials specified.$'),
    postError: new RegExp('^Github: Error while posting results\n404 Github Not Found!'),
    githubError: '404 Github Not Found!',
    consoleSuccess: 'Github: Results reported to github!',

    repoUrl: 'https://user:pass@api.github.com/repos/user/repository/issues/7/comments',
    repoUrlNetrc: 'https://netrcUser:netrcPass@api.github.com/repos/user/repository/issues/7/comments',
    repoUrlNetrcDefault: 'https://netrcDefaultUser:netrcDefaultPass@api.github.com/repos/user/repository/issues/7/comments',
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
