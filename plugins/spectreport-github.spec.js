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
    let options, reporter, plugin, usage, request, getBody, summary, response;

    before(() => {
        summary = sinon.mock().returns(fixtures.results.stats);
        reporter = {
            results: fixtures.results,
            summary: summary,
            constructor: fixtures.Spectreport
        };

        options = fixtures.options;
        getBody = sinon.mock();
        response = {
            getBody: getBody
        };

        request = sinon.mock().returns(response);

        // Rewire stub dependencies
        plugin = proxyquire(path.join(__dirname, 'spectreport-github.plugin'), {
            'sync-request': request
        });

        // Trap the console on the plugin and the usage function
        usage = trapConsole(plugin.getUsage.bind(plugin));
        plugin = trapConsole(plugin.bind(plugin));
    });

    describe('General', () => {
        beforeEach(() => {
            request.reset();
            getBody.reset();
            summary.reset();
        });

        it('should properly invoke the summary function', function () {
            plugin(options, reporter);
            expect(summary).to.have.been.calledOnce;
        });

        it('should build the proper github url with user/pass', () => {
            options = fixtures.options;
            plugin(options, reporter);
            let call = request.args[0];

            expect(call[0]).to.eql('POST');
            expect(call[1]).to.eql(fixtures.repoUrl);
        });

        it('should not have the the auth header with user/pass', () => {
            options = fixtures.options;
            plugin(options, reporter);
            let call = request.args[0];

            expect(call[2].headers).to.not.have.property('Authorization');
        });

        it('should build the proper github url with API Key', () => {
            options = fixtures.optionsApiKey;
            plugin(options, reporter);
            let call = request.args[0];

            expect(call[0]).to.eql('POST');
            expect(call[1]).to.eql(fixtures.repoUrlApiKey);
        });

        it('should have the auth header with API Key', () => {
            options = fixtures.optionsApiKey;
            plugin(options, reporter);
            let call = request.args[0];

            expect(call[2].headers).to.have.property('Authorization', 'token ' + fixtures.optionsApiKey.apiKey);
        });

        it('should report error when no valid credentials supplied', () => {
            options = fixtures.optionsNoCreds;

            expect(plugin.bind(plugin, options, reporter)).to.throw(fixtures.noCredsError);
        });

        it('should report error when the github api call fails', () => {
            options = fixtures.options;
            request.throws(new Error(fixtures.requestError));

            expect(plugin.bind(plugin, options, reporter)).to.throw(fixtures.githubError);
        });
    });

    describe('Success Report', () => {
        beforeEach(() => {
            request.returns(response);
            request.reset();
            getBody.reset();
            summary.reset();
        });

        it('should output the expected body to github', () => {
            plugin(options, reporter);
            let call = request.args[0];

            expect(call[2]).to.have.property('json').eql({body: fixtures.message});
        });

        it('should not send report on failOnly', () => {
            options.onlyFail = true;
            plugin(options, reporter);

            expect(request).to.not.have.been.called;
        });

        it('should not log to console on quiet', () => {
            options.quiet = true;
            let log = plugin(options, reporter);

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
            request.returns(response);
            request.reset();
            getBody.reset();
            summary.reset();
        });

        it('should output the expected body to github', () => {
            plugin(options, reporter);
            let call = request.args[0];

            expect(call[2]).to.have.property('json').eql({body: fixtures.messageFailure});
        });
        it('should send report on failOnly', () => {
            options.onlyFail = true;
            plugin(options, reporter);

            expect(request).to.have.been.calledOnce;
        });
        it('should not log to console on quiet', () => {
            options.quiet = true;
            let log = plugin(options, reporter);

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
