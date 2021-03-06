import fixtures from './spectreport-newrelic.fixtures';
import path from 'path';

// Wrap all console logging within a function
function trapConsole(func) {
    return function () {
        let oldConsole = console.log;
        let consoleLog = sinon.mock();
        console.log = consoleLog;

        try {
            func.apply(func, arguments);
        } catch (e) {
            console.log = oldConsole;
            throw (e);
        }
        console.log = oldConsole;

        return consoleLog;
    };
}

describe('Plugin - NewRelic', () => {
    let options, reporter, plugin, usage, request, summary, error, done;

    before(() => {
        summary = sinon.mock().returns(fixtures.results.stats);
        reporter = {
            results: fixtures.results,
            summary: summary
        };

        options = fixtures.options;

        request = sinon.spy(function () {
            arguments[1](error, null, null);
        });
        done = sinon.spy();

        // Rewire stub dependencies
        plugin = proxyquire(path.join(__dirname, 'spectreport-newrelic.plugin'), {
            'request': request
        });

        // Trap the console on the plugin and the usage function
        usage = trapConsole(plugin.getUsage.bind(plugin));
        plugin = trapConsole(plugin.bind(plugin));
    });

    describe('General', () => {
        beforeEach(() => {
            request.reset();
            done.reset();
            summary.reset();
            error = undefined;
        });

        it('should properly invoke the summary function', function () {
            plugin(options, reporter, done);
            expect(summary).to.have.been.calledOnce;
        });

        it('should have the proper newRelic url', () => {
            plugin(options, reporter, done);
            let call = request.args[0];

            expect(call[0].method).to.eql('POST');
            expect(call[0].uri).to.eql(fixtures.options.nrCollectorUrl);
        });

        it('should have the auth header with Insert Key', () => {
            plugin(options, reporter, done);
            let call = request.args[0];

            expect(call[0].headers).to.have.property('X-Insert-Key', fixtures.options.nrInsertKey);
        });

        it('should have the expected results in the post body', () => {
            plugin(options, reporter, done);
            let call = request.args[0];

            expect(call[0].json).to.eql(fixtures.postBody);
        });

        it('should log to console on success', () => {
            let log = plugin(options, reporter, done);

            expect(log).to.have.been.calledWith(fixtures.consoleSuccess);
        });

        it('should call done() method on success', () => {
            plugin(options, reporter, done);

            expect(done).to.have.been.calledOnce;
        });

        it('should not log to console on quiet', () => {
            options.nrQuiet = true;
            let log = plugin(options, reporter, done);

            expect(log).to.have.not.been.called;
        });

        it('should report error when the newrelic API fails', () => {
            error = fixtures.newRelicError;

            expect(plugin.bind(plugin, options, reporter)).to.throw(fixtures.postError);
        });
    });

    describe('getUsage', () => {
        it('should log something to the console', () => {
            let log = usage();

            expect(log).to.have.been.calledOnce;
        });
    });
});
