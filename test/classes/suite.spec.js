import Stats from '../../src/classes/stats';
import Suite from '../../src/classes/suite';
import Test from '../../src/classes/test';

describe('Suite class', () => {
    let suite1;

    beforeEach(() => {
        suite1 = new Suite(f.suite, f.suiteParent);
    });

    describe('initialize', () => {
        it('should properly initialize a suite object', () => {
            expect(suite1).to.have.property('title', f.suite.title);
            expect(suite1).to.have.property('suites').to.be.a('array');
            expect(suite1).to.have.property('tests').to.be.a('array');
            expect(suite1).to.have.property('parent', f.suiteParent);
            expect(suite1).to.have.property('stats').to.be.an.instanceOf(Stats);
        });
    });

    describe('addStats', () => {
        it('should properly add a stats object', () => {
            let addStats = stub(suite1.stats, 'add');

            suite1.addStats(f.stats);
            expect(addStats).have.been.calledOnce;
            expect(addStats).have.been.calledWith(f.stats);
        });
    });

    describe('addSuite', () => {
        it('should properly add a suite with tests', () => {
            let hasTests = stub(f.suiteChild, 'hasTests', () => { return true; });

            suite1.addSuite(f.suiteChild);

            expect(hasTests).have.been.calledOnce;
            expect(suite1).to.have.property('suites').to.have.length(1);
            expect(suite1).to.have.property('suites').to.contain(f.suiteChild);
            hasTests.restore();
        });

        it('should properly not add a suite without tests', () => {
            let hasTests = stub(f.suiteChild, 'hasTests', () => { return false; });

            suite1.addSuite(f.suiteChild);

            expect(hasTests).have.been.calledOnce;
            expect(suite1).to.have.property('suites').to.be.empty;
            hasTests.restore();
        });
    });

    describe('addTest', () => {
        it('should properly add a test', () => {
            suite1.addTest(f.testPass);

            expect(suite1).to.have.property('tests').to.have.length(1);
            expect(suite1).to.have.property('tests').to.contain(f.testPass);
            expect(suite1).to.have.property('stats').to.have.property('tests', 1);
            expect(suite1).to.have.property('stats').to.have.property('pending', 0);
            expect(suite1).to.have.property('stats').to.have.property('failures', 0);
        });

        it('should properly add a pending test', () => {
            suite1.addTest(f.testPending);

            expect(suite1).to.have.property('tests').to.have.length(1);
            expect(suite1).to.have.property('tests').to.contain(f.testPending);
            expect(suite1).to.have.property('stats').to.have.property('tests', 1);
            expect(suite1).to.have.property('stats').to.have.property('pending', 1);
            expect(suite1).to.have.property('stats').to.have.property('failures', 0);

        });

        it('should properly add a failed test', () => {
            suite1.addTest(f.testFail);

            expect(suite1).to.have.property('tests').to.have.length(1);
            expect(suite1).to.have.property('tests').to.contain(f.testFail);
            expect(suite1).to.have.property('stats').to.have.property('tests', 1);
            expect(suite1).to.have.property('stats').to.have.property('pending', 0);
            expect(suite1).to.have.property('stats').to.have.property('failures', 1);
        });
    });

    describe('hasTests', () => {
        it('should return false when it does not have tests', () => {
            expect(suite1.hasTests()).to.be.false;
        });

        it('should return true when it does have tests', () => {
            suite1.stats.tests = 1;
            expect(suite1.hasTests()).to.be.true;
        });
    });

    describe('start/stop', () => {
        it('should properly set the start time', () => {
            let lower = Date.now();
            suite1.start();
            let upper = Date.now();

            expect(suite1).to.have.property('stats')
                .to.have.property('timeStart')
                .to.be.within(lower, upper);
        });

        it('should properly set the stop time and duration', (done) => {
            let lower = Date.now();
            suite1.stats.timeStart = Date.now();

            setTimeout(() => {
                suite1.stop();
                let upper = Date.now();
                let duration = Math.round((upper - lower) / 10) / 100;

                expect(suite1).to.have.property('stats')
                    .to.have.property('timeStop')
                    .to.be.within(lower, upper);
                expect(suite1).to.have.property('stats')
                    .to.have.property('duration')
                    .to.be.within(0, duration);
                done();
            }, 10);
        });

        it('should silently fail if stop is called before start', () => {
            suite1.stop();

            expect(suite1).to.have.property('stats')
                .to.have.property('timeStop').to.be.null;
            expect(suite1).to.have.property('stats')
                .to.have.property('duration').to.be.equal(0);
        });
    });

    describe('fixTimeStats', () => {
        it('should reset the time stats when the times are not set, but child suites have times.', () => {
            // This requires creating a slightly more complex suite object
            let suite2 = new Suite(f.suiteChild, suite1);
            suite2.addTest(new Test(f.testPass));
            suite2.start(1000);
            suite2.stop(3000);

            suite1.addSuite(suite2);

            suite1.fixTimeStats();

            expect(suite1).to.have.property('stats')
                .to.have.property('duration').to.be.equal(2);
            expect(suite1).to.have.property('stats')
                .to.have.property('timeStart').to.be.equal(1000);
            expect(suite1).to.have.property('stats')
                .to.have.property('timeStop').to.be.equal(3000);
        });

        it('should reset the time stats when the times are set, but child suite times are out of range.', () => {
            // This requires creating a slightly more complex suite object
            let suite2 = new Suite(f.suiteChild, suite1);
            suite2.addTest(new Test(f.testPass));
            suite2.start(1000);
            suite2.stop(3000);

            suite1.start(1500);
            suite1.stop(2500);
            suite1.addSuite(suite2);

            suite1.fixTimeStats();

            expect(suite1).to.have.property('stats')
                .to.have.property('duration').to.be.equal(2);
            expect(suite1).to.have.property('stats')
                .to.have.property('timeStart').to.be.equal(1000);
            expect(suite1).to.have.property('stats')
                .to.have.property('timeStop').to.be.equal(3000);
        });
    });

    describe('toJSON', () => {
        it('should generate JSON of the suite without its parent.', () =>{
            let jsonSuite = JSON.stringify(suite1);

            // We don't need to test that JSON.stringify works, we just need
            // to make sure that the parent key is successfully removed
            expect(jsonSuite).to.not.contain('parent');
        });
    });

    describe('fromObject', () => {
        it('should properly import a JSON-parsed suite object', () => {
            // This requires creating a slightly more complex suite object
            let suite2 = new Suite(f.suiteChild, suite1);
            suite2.addTest(new Test(f.testPass));
            suite1.addTest(new Test(f.testFail, f.testFailError));
            suite1.addSuite(suite2);

            let objSuite = JSON.parse(JSON.stringify(suite1));
            let passSuite = Suite.fromObject(objSuite, f.suiteParent);
            expect(passSuite).to.eql(suite1);
        });
    });
});
