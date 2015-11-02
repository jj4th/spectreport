class Test {
    constructor(test, status, err) {
        this.status = status;
        this.title = test.title;
        this.fullTitle = test.fullTitle();
        this.duration = Math.round(test.duration / 10) / 100;
        this.error = null;

        if(err) {
            this.error = {};
            Object.getOwnPropertyNames(err).forEach(key => {
                this.error[key] = err[key];
            });
        }
    }
    static fromObject(obj) {
        // Construct faux test object
        let fakeTest = {
            fullTitle: () => { return null; }
        };

        if(obj.error === undefined || obj.error === null) {
            delete obj.error;
        }

        let test = new Test(fakeTest);
        return Object.assign(test, obj);
    }
}

Test.TEST_PENDING = 2;
Test.TEST_PASS = 1;
Test.TEST_FAIL = 0;

export default Test;
