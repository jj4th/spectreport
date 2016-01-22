const Mocha = require('mocha'),
    Suite = Mocha.Suite,
    Runner = Mocha.Runner,
    Test = Mocha.Test,
    path = require('path');

const srcPath = path.relative('.', path.resolve(__dirname, '../../src'));
// static fixtures
const fixtures = {
    indexDefaults: {
        outputHtml: 'test/results/index.html',
        jsonDir: 'test/results',
        template: path.join(srcPath, 'assets/results.dot'),
        suiteTitle: 'Test Results'
    },
    indexCustom: {
        outputHtml: 'test/results/index2.html',
        jsonDir: 'test/results2',
        template: path.join(srcPath, 'assets/results2.dot'),
        suiteTitle: 'Test Results 2'
    },
    aggregatorScanError: 'There was a problem aggregating the JSON results.\n',
    noResultsError: 'No results were found.  Did you run the tests?',
    noSummaryError: 'No results were found.  Did you run \'report()\'?',
    renderReportError: 'There was a problem rendering the HTML report.\n',
    writeFileError: 'There was a problem outputting the HTML report to disk.\n',
    aggregatorFS: {
        jsonDir: 'test/json',
        readdir: {
            'test/json': ['product1', 'product2', 'results5.json'],
            'test/json/product1': ['subproduct1', 'subproduct2'],
            'test/json/product1/subproduct1': ['action'],
            'test/json/product1/subproduct2': ['action'],
            'test/json/product1/subproduct1/action': ['results1.json'],
            'test/json/product1/subproduct2/action': ['results2.json'],
            'test/json/product2': ['action'],
            'test/json/product2/action': ['results3.json', 'results4.json', 'otherfile.html']
        },
        fileList: [
            'test/json/results5.json',
            'test/json/product1/subproduct1/action/results1.json',
            'test/json/product1/subproduct2/action/results2.json',
            'test/json/product2/action/results3.json',
            'test/json/product2/action/results4.json'
        ],
        fakeFileList: [
            'test/json/fakeFile.notjson'
        ],
        keyPath: [
            [],
            ['product1', 'subproduct1', 'action'],
            ['product1', 'subproduct2', 'action'],
            ['product2', 'action'],
            ['product2', 'action']
        ],
        json: {
            'test/json/results5.json': require('./fixtures/results5'),
            'test/json/product1/subproduct1/action/results1.json': require('./fixtures/results1'),
            'test/json/product1/subproduct2/action/results2.json': require('./fixtures/results2'),
            'test/json/product2/action/results3.json': require('./fixtures/results3'),
            'test/json/product2/action/results4.json': require('./fixtures/results4')
        }
    },
    stats: {
        tests: 10,
        failures: 5,
        pending: 2,
        duration: 15
    },
    suite: {
        title: 'Test Suite',
        stats: {},
        hasTests: () => { return true; }
    },
    suiteParent: {
        title: 'Test Suite Parent',
        stats: {},
        hasTests: () => { return true; }
    },
    suiteChild: {
        title: 'Test Suite Child',
        stats: {},
        hasTests: () => { return true; }
    },
    testPass: {
        title: 'Test Pass',
        fullTitle() {
            return 'Test Suite Test Pass';
        },
        status: 1,
        duration: 10
    },
    testPassHash: '2fc2177907d3df9fb5b44686d6e04090ccd4b10c',
    testPending: {
        title: 'Test Pending',
        fullTitle() {
            return 'Test Suite Test Pending';
        },
        status: 2,
        duration: 10
    },
    testFail: {
        title: 'Test Failed',
        fullTitle() {
            return 'Test Suite Test Failed';
        },
        status: 0,
        duration: 10
    },
    testFailError: {
        message: 'There was an error',
        stack: 'Error: Line 1, colume 1'
    },
    screenshot: {
        test: {
            title: 'Test Screenshot',
            status: 0,
            parent: {
                title: 'Suite Screenshot'
            }
        },
        dir: 'test/screenshot',
        dirAlt: 'test/screens',
        path: 'test/screenshot/Suite_Screenshot_Test_Screenshot.png',
        pathAlt: 'test/screens/Suite_Screenshot_Test_Screenshot.png',
        data: 'c2NyZWVuc2hvdC5wbmc=',
        base64: 'screenshot.png'
    },
    spec: {
        path: 'test/stories/suite/test.spec.js',
        storyDir: 'test/stories',
        outputDir: 'test/output',
        outputFilename: 'test.spec.js',
        outputPath: 'test/output/suite',
        outputJSON: 'test/output/suite/test.spec.json',
        pathAlt: 'test/specs/suite/testAlt.spec.js',
        storyDirAlt: 'test/specs',
        outputDirAlt: 'test/results',
        outputFilenameAlt: 'testAlt.spec.js',
        outputPathAlt: 'test/results/suite',
        outputJSONAlt: 'test/results/suite/testAlt.spec.json'
    },
    mochaFixtures(specPath) {
        var obj = {}
        obj.suite = new Suite(fixtures.suite.title, '');
        obj.suite.file = specPath || fixtures.spec.path;

        obj.suiteChild1 = new Suite(fixtures.suiteChild.title, obj.suite);
        obj.suiteChild2 = new Suite(fixtures.suiteChild.title, obj.suite);
        obj.suite.addSuite(obj.suiteChild1);
        obj.suite.addSuite(obj.suiteChild2);

        obj.testPass = new Test(fixtures.testPass.title, done => {
            setTimeout(() => {
                done();
            }, 62);
        });
        obj.testPending = new Test(fixtures.testPending.title);
        obj.testFail = new Test(fixtures.testFail.title, done => {
            setTimeout(() => {
                done(new Error(fixtures.testFailError.message));
            }, 38);
        });

        obj.suiteChild1.addTest(obj.testPass);
        obj.suiteChild1.addTest(obj.testPending);
        obj.suiteChild2.addTest(obj.testFail);

        obj.runner = new Runner(obj.suite);

        return obj;
    }
};

export default fixtures;
