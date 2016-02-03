var config = {
    noOutput: true,
    plugins: ['plugins/spectreport-github.plugin.js'],
    pluginOpts: {
        ghOnlyFail:true,
        ghUser:'username',
        ghPass:'ABC123DEF456',
        ghRepo:'username/reponame',
        ghId:7,
        ghReportUrl:'https://jenkins.internal/7/report.html'
    },
    jsonDir: 'test/results'
};
module.exports = config;
