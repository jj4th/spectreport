import Test from '../../src/classes/test';

describe('Test class', () => {
    let fullTitle;

    beforeEach(() => {
        fullTitle = spy(f.testPass, 'fullTitle');
    });

    describe('initialize', () => {
        it('should properly initialize a test object', () => {
            let passTest = new Test(f.testPass, Test.TEST_PASS);
            expect(fullTitle).to.have.been.calledOnce;
            expect(passTest).to.have.property('title', f.testPass.title);
            expect(passTest).to.have.property('fullTitle', f.testPass.fullTitle());
            expect(passTest).to.have.property('duration', 0.01);
            expect(passTest).to.have.property('error').to.be.null;
            expect(passTest).to.have.property('hash', f.testPassHash);
        });

        it('should properly initalize a test object with error', () => {
            let failTest = new Test(f.testFail, Test.TEST_FAIL, f.testFailError);

            expect(failTest).to.have.property('error').to.deep.equal(f.testFailError);
        });
    });

    describe('fromObject', () => {
        it('should properly import a JSON-parsed test object without error', () => {
            let passTest = new Test(f.testPass, Test.TEST_PASS);
            let objTest = JSON.parse(JSON.stringify(passTest));
            let jsonTest = Test.fromObject(objTest);
            expect(passTest).to.eql(jsonTest);
        });

        it('should properly import a JSON-parsed test object with error', () => {
            let failTest = new Test(f.testFail, Test.TEST_FAIL, f.testFailError);
            let objTest = JSON.parse(JSON.stringify(failTest));
            let jsonTest = Test.fromObject(objTest);
            expect(failTest).to.eql(jsonTest);
        });
    });
});
