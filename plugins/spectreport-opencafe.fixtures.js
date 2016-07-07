import Spectreport from '../src/index';

const testPass = {
    $: {
        classname: "example.exampleClass.TestPass",
        name: "test_pass",
        result: "PASSED",
        time: "5"
    }
};
const testPassFixed = {
    title: "test_pass",
    status: Spectreport.Test.TEST_PASS,
    duration: 5
};
const testPass2 = {
    $: {
        classname: "example.exampleClass.TestPass",
        name: "test_pass2",
        result: "PASSED",
        time: "5"
    }
};
const testPass2Fixed = {
    title: "test_pass2",
    status: Spectreport.Test.TEST_PASS,
    duration: 5
};

const testFail = {
    $: {
        classname: "example.exampleClass.TestFail",
        name: "test_fail",
        result: "FAILED",
        time: "9"
    },
    failure: [{
        _: "Traceback",
        $: {
            message: "Error Message",
            type: "AssertionError"
        }
    }]
};
const testFail2 = {
    $: {
        classname: "example.exampleClass.TestFail",
        name: "test_fail",
        result: "FAILED",
        time: "9"
    },
    failure: {
        _: "Traceback",
        $: {
            message: "Error Message",
            type: "AssertionError"
        }
    }
};
const testFailFixed = {
    title: "test_fail",
    status: Spectreport.Test.TEST_FAIL,
    duration: 9,
    error: { stack: "Traceback" }
};

const testSkip = {
    $: {
        classname: "example.exampleClass.TestSkip",
        name: "test_skip",
        result: "SKIPPED",
        time: "1"
    },
    skipped: [{
        $: {
            message: "Skipped Test"
        }
    }]
};
const testSkipFixed = {
    title: "test_skip",
    status: Spectreport.Test.TEST_PENDING,
    duration: 1,
    error: { stack: "Skipped Test" }
};

const pluginFixtures = {
    options: {
        ocResultFile: 'test/results/results.xml',
        ocNamespace: 'example.exampleClass'
    },
    optionsNoNamespace: {
        ocResultFile: 'test/results/results.xml',
        ocNamespace: ''
    },

    fileErrorMessage: 'File Not Found!',
    fileError: new RegExp('^OpenCafe: Error while parsing results\nFile Not Found!$'),

    parserErrorMessage: 'Bad XML!',
    parserError: new RegExp('^OpenCafe: Error while parsing results\nBad XML!$'),

    resultsXml: '<fakexml />',

    testPass: testPass,
    testPassFixed: testPassFixed,
    testPassFullTitle: 'TestPass.test_pass',
    testPass2: testPass2,
    testPass2Fixed: testPass2Fixed,
    testPass2FullTitle: 'TestPass.test_pass2',
    testFail: testFail,
    testFailFixed: testFailFixed,
    testFailFullTitle: 'TestFail.test_fail',
    testSkip: testSkip,
    testSkipFixed: testSkipFixed,
    testSkipFullTitle: 'TestSkip.test_skip',
    testPassNoNamespaceFullTitle: 'example.exampleClass.TestPass.test_pass',

    addJsonPass: [
        [],
        {
            title: 'TestPass',
            stats: { duration: 5, failures: 0, pending: 0, tests: 1, timeStart: 0, timeStop: 5000 },
            suites: [],
            tests: [testPassFixed]
        }
    ],
    addJsonFail: [
        [],
        {
            title: 'TestFail',
            stats: { duration: 9, failures: 1, pending: 0, tests: 1, timeStart: 0, timeStop: 9000 },
            suites: [],
            tests: [testFailFixed]
        }
    ],
    addJsonSkip: [
        [],
        {
            title: 'TestSkip',
            stats: { duration: 1, failures: 0, pending: 1, tests: 1, timeStart: 0, timeStop: 1000 },
            suites: [],
            tests: [testSkipFixed]
        }
    ],
    addJsonSameClasspath: [
        [],
        {
            title: 'TestPass',
            stats: { duration: 10, failures: 0, pending: 0, tests: 2, timeStart: 0, timeStop: 10000 },
            suites: [],
            tests: [testPassFixed, testPass2Fixed]
        }
    ],
    addJsonNoNamespace: [
        ['example', 'exampleClass'],
        {
            title: 'TestPass',
            stats: { duration: 5, failures: 0, pending: 0, tests: 1, timeStart: 0, timeStop: 5000 },
            suites: [],
            tests: [testPassFixed]
        }
    ],

    xml2jsSimple: {
        testsuite: {
            $: { errors: "0", failures: "0", name: "", skips: "0", tests: "1", time: "5" },
            testcase: testPass
        }
    },
    xml2jsMulti: {
        testsuite: {
            $: { errors: "0", failures: "1", name: "", skips: "1", tests: "3", time: "15" },
            testcase: [testPass, testFail, testSkip]
        }
    },
    xml2jsNested: {
        testsuite: {
            $: { errors: "0", failures: "1", name: "", skips: "1", tests: "3", time: "15" },
            testcase: testPass,
            testsuite: [{
                $: { errors: "0", failures: "0", name: "", skips: "1", tests: "2", time: "10" },
                testcase: [testFail, testSkip]
            }]
        }
    },
    xml2jsSameClasspath: {
        testsuite: {
            $: { errors: "0", failures: "0", name: "", skips: "0", tests: "2", time: "10" },
            testcase: [testPass, testPass2]
        }
    },
    xml2jsFailObject: {
        testsuite: {
            $: { errors: "0", failures: "1", name: "", skips: "0", tests: "1", time: "9" },
            testcase: testFail2
        }
    },

    statsSimple: {
        timeStop: 5000,
        duration: 5
    },
    statsMulti: {
        timeStop: 15000,
        duration: 15
    },
};

export default pluginFixtures;
