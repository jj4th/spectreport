import fixtures from './spectreport-github.fixtures';
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

describe('Plugin - Github', () => {
    let options, reporter, plugin, usage, request, summary, netrc, error, done;

    before(() => {
        summary = sinon.mock().returns(fixtures.results.stats);
        reporter = {
            results: fixtures.results,
            summary: summary,
            constructor: fixtures.Spectreport
        };

        options = fixtures.options;

        request = sinon.spy(function () {
            arguments[1](error, null, null);
        });

        netrc = sinon.mock().returns(fixtures.netrc);
        done = sinon.spy();

        // Rewire stub dependencies
        plugin = proxyquire(path.join(__dirname, 'spectreport-github.plugin'), {
            'request': request,
            'netrc': netrc
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
            netrc.reset();
            error = undefined;
        });

        it('should properly invoke the summary function', function () {
            plugin(options, reporter, done);
            expect(summary).to.have.been.calledOnce;
        });

        it('should build the proper github url with user/pass', () => {
            options = fixtures.options;
            plugin(options, reporter, done);
            let call = request.args[0];

            expect(call[0].method).to.eql('POST');
            expect(call[0].uri).to.eql(fixtures.repoUrl);
        });

        it('should not have the the auth header with user/pass', () => {
            options = fixtures.options;
            plugin(options, reporter, done);
            let call = request.args[0];

            expect(call[0].headers).to.not.have.property('Authorization');
        });

        it('should call netrc correctly with default netrc', () => {
            options = fixtures.optionsNetrcDefault;
            netrc.returns(fixtures.netrcDefault);
            plugin(options, reporter, done);
            let call = netrc.args[0];

            expect(call[0]).to.be.undefined;
        });

        it('should build the proper github url with default netrc', () => {
            options = fixtures.optionsNetrcDefault;
            netrc.returns(fixtures.netrcDefault);
            plugin(options, reporter, done);
            let call = request.args[0];

            expect(call[0].uri).to.eql(fixtures.repoUrlNetrcDefault);
        });

        it('should call netrc correctly with specific netrc', () => {
            options = fixtures.optionsNetrc;
            netrc.returns(fixtures.netrc);
            plugin(options, reporter, done);
            let call = netrc.args[0];

            expect(call[0]).to.eql(options.ghNetrc);
        });

        it('should build the proper github url with specified netrc', () => {
            options = fixtures.optionsNetrc;
            netrc.returns(fixtures.netrc);
            plugin(options, reporter, done);
            let call = request.args[0];

            expect(call[0].uri).to.eql(fixtures.repoUrlNetrc);
        });

        it('should report error when no matching credentials in the netrc', () => {
            options = fixtures.optionsNetrc;
            netrc.returns({});

            expect(plugin.bind(plugin, options, reporter)).to.throw(fixtures.noCredsError);
        });

        it('should build the proper github url with API Key', () => {
            options = fixtures.optionsApiKey;
            plugin(options, reporter, done);
            let call = request.args[0];

            expect(call[0].method).to.eql('POST');
            expect(call[0].uri).to.eql(fixtures.repoUrlApiKey);
        });

        it('should have the auth header with API Key', () => {
            options = fixtures.optionsApiKey;
            plugin(options, reporter, done);
            let call = request.args[0];

            expect(call[0].headers).to.have.property('Authorization', 'token ' + fixtures.optionsApiKey.ghApiKey);
        });

        it('should log to console on success', () => {
            let log = plugin(options, reporter, done);

            expect(log).to.have.been.calledWith(fixtures.consoleSuccess);
        });

        it('should call done() method on success', () => {
            plugin(options, reporter, done);

            expect(done).to.have.been.calledOnce;
        });

        it('should report error when no valid credentials supplied', () => {
            options = fixtures.optionsNoCreds;

            expect(plugin.bind(plugin, options, reporter)).to.throw(fixtures.noCredsError);
        });

        it('should report error when the github api call fails', () => {
            options = fixtures.options;
            error = fixtures.githubError;

            expect(plugin.bind(plugin, options, reporter)).to.throw(fixtures.postError);
        });
    });

    describe('Success Report', () => {
        beforeEach(() => {
            request.reset();
            done.reset();
            summary.reset();
            error = undefined;
        });

        it('should output the expected body to github', () => {
            plugin(options, reporter, done);
            let call = request.args[0];

            expect(call[0]).to.have.property('json').eql({body: fixtures.message});
        });

        it('should not send report on failOnly', () => {
            options.ghOnlyFail = true;
            plugin(options, reporter, done);

            expect(request).to.not.have.been.called;
        });

        it('should not log to console on quiet', () => {
            options.ghQuiet = true;
            let log = plugin(options, reporter, done);

            expect(log).to.not.have.been.called;
        });
    });

    describe('Failure Report', () => {
        before(() => {
            summary = sinon.mock().returns(fixtures.resultsFailure.stats);
            reporter = {
                results: fixtures.resultsFailure,
                summary: summary,
                constructor: fixtures.Spectreport
            };
        });
        beforeEach(() => {
            request.reset();
            done.reset();
            summary.reset();
            error = undefined;
        });

        it('should output the expected body to github', () => {
            plugin(options, reporter, done);
            let call = request.args[0];

            expect(call[0]).to.have.property('json').eql({body: fixtures.messageFailure});
        });
        it('should send report on failOnly', () => {
            options.ghOnlyFail = true;
            plugin(options, reporter, done);

            expect(request).to.have.been.calledOnce;
        });
        it('should not log to console on quiet', () => {
            options.ghQuiet = true;
            let log = plugin(options, reporter, done);

            expect(log).to.not.have.been.called;
        });
    });

    describe('getUsage', () => {
        it('should log something to the console', () => {
            let log = usage();

            expect(log).to.have.been.calledOnce;
        });
    });
});
