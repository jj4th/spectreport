import Stats from './stats';
import Test from './test';

class Suite {
    constructor(suite, parent) {
        this.title = suite.title;
        this.suites = [];
        this.tests = [];
        this.parent = parent;
        this.stats = new Stats();
    }
    addStats(stats) {
        this.stats.add(stats);
    }
    addSuite(suite) {
        if (!suite.hasTests()) {
            return false;
        }
        this.suites.push(suite);
        this.addStats(suite.stats);
    }
    addTest(test) {
        this.tests.push(test);
        this.stats.tests++;

        if (test.status === Test.TEST_PENDING) {
            this.stats.pending++;
        }
        else if (test.status === Test.TEST_FAIL) {
            this.stats.failures++;
        }
    }
    hasTests() {
        return (this.stats.tests > 0);
    }
    start(timeStart) {
        this.stats.timeStart = timeStart || Date.now();
    }
    stop(timeStop, duration) {
        if(!duration && !this.stats.timeStart > 0) {
            return false;
        }
        this.stats.timeStop = timeStop || Date.now();
        this.stats.duration = duration || Math.round((this.stats.timeStop - this.stats.timeStart) / 10) / 100;
    }
    fixTimeStats() {
        for (let suite of this.suites) {
            if (this.stats.timeStart === null || this.stats.timeStart > suite.stats.timeStart) {
                this.stats.timeStart = suite.stats.timeStart;
            }
            if (this.stats.timeStop === null || this.stats.timeStop < suite.stats.timeStop) {
                this.stats.timeStop = suite.stats.timeStop;
            }
            this.stats.duration = Math.round((this.stats.timeStop - this.stats.timeStart) / 10) / 100;
        }
    }
    toJSON() {
        // Generate a clean, shallow copy without the parent
        let copy = {
            title: this.title,
            suites: this.suites,
            tests: this.tests,
            stats: this.stats
        };

        return copy;
    }
    static fromObject(obj, parent) {

        let suite = new Suite(obj, parent);
        let suites = [];
        let tests = [];
        let stats = null;

        stats = Stats.fromObject(obj.stats);
        Object.assign(suite, {stats: stats});

        for (let child of obj.suites) {
            suites.push(Suite.fromObject(child, suite));
        }
        Object.assign(suite, {suites: suites});

        for (let test of obj.tests) {
            tests.push(Test.fromObject(test));
        }
        Object.assign(suite, {tests: tests});

        return suite;
    }
}

export default Suite;
