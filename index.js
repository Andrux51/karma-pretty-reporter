var xmlbuilder = require('xmlbuilder');

var prettyReporter = function(baseReporterDecorator, config, logger, helper, formatError) {
    var outputFile = config.prettyReporter.outputFile;
    var html, body;

    baseReporterDecorator(this);

    this.onRunStart = function(browsers) {
        html = xmlbuilder.create('html');
        html.doctype();
    };

    this.onBrowserStart = function(browser) {
        // NOTE: each browser is starting
        this.write('browser detected: ' + browser.name + '/r/n')
    };

    this.onSpecComplete = function(browser, result) {
        this.write(result.success + '/r/n');
    };

    this.onBrowserComplete = function(browser) {
        // NOTE: each browser has finished
    };

    this.onRunComplete = function(browsers, results) {
        // NOTE: all browsers have finished
        this.write(html + '/r/n');
    };

    this.onExit = function(callback) {
        // NOTE: before exiting Karma
    };
};

prettyReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError'];

module.exports = {
    'reporter:pretty': ['type', prettyReporter]
}
