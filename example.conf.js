var config = {
    noOuput: true,
    plugins: ['plugins/spectreport-github.plugin.js'],
    pluginOpts: {
        onlyFail:true,
        user:'username',
        pass:'ABC123DEF456',
        repo:'username/reponame',
        id:7,
        reportUrl:'https://jenkins.internal/7/report.html'
    },
    jsonDir: 'test/results'
};
module.exports = config;
