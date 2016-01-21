import fixtures from './spectreport-github.fixtures';
import plugin from './spectreport-github.plugin';

describe('Plugin - Github', () => {
    let options, reporter;

    before(() => {
        reporter = {
            results: fixtures.results,
            summary: () => {
                return fixtures.results.stats;
            }
        };

        options = fixtures.options;
    });

    describe('General', () => {
        before(() => {
            options = fixtures.options;
        });

        it('should build the proper github url with user/pass');
        it('should build the proper github url with API Key');
        it('should report error when no valid credentials supplied');
        it('should report error when the github api call fails');
        it('should properly invoke the summary function');
    });

    describe('Success Report', () => {
        before(() => {

        });

        it('should output the expected body');
        it('should not output on failOnly');
        it('should not log to console on quiet');
    });

    describe('Failure Report', () => {
        before(() => {

        });

        it('should output the expected body');
        it('should output on failOnly');
        it('should not log to console on quiet');
    });
});
