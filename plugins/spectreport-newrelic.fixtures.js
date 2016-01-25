import Spectreport from '../src/index';

const pluginFixtures = {

    options: {
        nrCollectorUrl: 'https://newrelic/v1/1010/events',
        nrInsertKey: 'LJ134ASkl3j234498asdiFKL341lksFI1115-p',
        nrEventType: 'Test Event',
        nrProduct: 'MyProduct',
        nrEnvironment: 'Local',
    },

    postSuccess: 'NewRelic: Results reported to New Relic!',
    postError: new RegExp('^NewRelic: Error while posting results\n404 NewRelic Not Found!$'),
    newRelicError: '404 NewRelic Not Found!',
    consoleSuccess: 'NewRelic: Results reported to New Relic!',

    postBody: {
            "passingTests": 1,
            "failingTests": 1,
            "pendingTests": 1,
            "totalTests": 3,
            "duration": 20,
            "eventType": 'Test Event',
            "product": 'MyProduct',
            "environment": 'Local',
            "positiveTests": 1,
            "negativeTests": 1
    },
    results: {
        "title":"Test Results",
        "suites": [{
            "title":"Suite-1",
            "tests":[{
                "status":1,
                "title":"Should Test-1",
                "fullTitle":"Suite-1 - Should Test-1",
                "duration":10,
                "error":null
            }]
        },
        {
            "title":"Suite-2",
            "tests":[{
                "status":3,
                "title":"Should Not Test-2",
                "fullTitle":"Suite-2 - Should Not Test-2",
                "duration":5,
                "error":null
            }]
        },
        {
            "title":"Suite-3",
            "tests":[{
                "status":2,
                "title":"Test-3",
                "fullTitle":"Suite-2 - Test-3",
                "duration":5,
                "error":null
            }]
        }],
        "stats": {
            "tests":3,
            "pending":1,
            "failures":1,
            "duration":20,
            "timeStart":0,
            "timeStop":20000
        }
    }
}

export default pluginFixtures;
