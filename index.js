var path = require('path');
var fs = require('fs');
var xmlbuilder = require('xmlbuilder');
var _ = require('lodash');

var prettyReporter = function(baseReporterDecorator, config, logger, helper, formatError) {
    var outputFile = config.prettyReporter.outputFile || 'pretty-report.html';
    var pageTitle = config.prettyReporter.pageTitle || 'Karma Pretty Report';
    var html, body, container;

    var describes, suites;

    var karma = this;

    baseReporterDecorator(karma);

    this.onRunStart = function(browsers) {
        html = xmlbuilder.create('html');
        html.dtd();

        buildHtmlHead();
        buildHtmlBody();
    };

    this.onBrowserStart = function(browser) {
        // NOTE: each browser is starting
        karma.write('[karma-pretty-reporter] Browser detected: ' + browser.name + '\r\n');

        describes = [];
    };

    this.onSpecComplete = function(browser, result) {
        // NOTE: each test has finished
        result.suite.forEach(function(suite) {
            if(!describes.some(function(desc) {
                return desc['h4'] === suite;
            })) {
                describes.push({
                    'h4': suite,
                    'ul': {
                        'li': []
                    }
                });
            }
        });

        var describe = describes.filter(function(desc) {
            return desc['h4'] === result.suite[result.suite.length - 1];
        })[0];

        describe['ul']['li'].push({
            i: [
                { '#text': '', '@class': 'fa fa-fw ' + (result.skipped ? 'fa-circle-thin' : result.success ? 'fa-check' : 'fa-close') }
            ],
            span: result.description
        });

        prettyAppCtrl += "console.log(\'"+JSON.stringify(result)+"\');";
    };

    this.onBrowserComplete = function(browser) {
        // NOTE: each browser has finished
        describes.forEach(function(desc) {
            if(desc.ul.li.length === 0) delete desc.ul;
            container.ele(desc);
        });
    };

    this.onRunComplete = function(browsers, results) {
        prettyAppCtrl += "console.log(\'"+JSON.stringify(results)+"\');";

        // NOTE: all browsers have finished
        var prettyApp = "angular.module('pretty', ['ui.bootstrap'])" +
            ".controller('prettyCtrl', function() {" +
                prettyAppCtrl +
            "});";

        body.ele('script', {}, prettyApp);

        var basePath = path.resolve(config.basePath || './');
        var filePath = path.join(basePath, outputFile);
        filePath = helper.normalizeWinPath(filePath);

        helper.mkdirIfNotExists(path.dirname(filePath), function() {
            fs.writeFile(filePath, html.end({pretty: true}), function(err) {
                if(err) {
                    karma.write('[karma-pretty-reporter] ERROR: could not save to file \"' + filePath + '\"\r\n');
                } else {
                    karma.write('[karma-pretty-reporter] FINISHED: saved to file \"' + filePath + '\"\r\n');
                }
            });
        });
    };

    this.onExit = function(callback) {
        // NOTE: before exiting Karma
    };

    var buildHtmlHead = function() {
        var head = html.ele('head');
        head.ele('meta', {charset: 'utf-8'});
        head.ele('title', {}, pageTitle);
        head.ele('link', {rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css'});
        head.ele('link', {rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css'});
        head.ele('link', {rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css'});
    };

    var buildHtmlBody = function() {
        body = html.ele('body', {'ng-app': 'pretty'});
        container = body.ele('div', {'class': 'container', 'ng-controller': 'prettyCtrl as pretty', 'ng-init': 'pretty.initialize()'});

        body.ele('script', {src: 'https://code.jquery.com/jquery-2.1.4.min.js'}, '');
        body.ele('script', {src: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js'}, '');
        body.ele('script', {src: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js'}, '');
        body.ele('script', {src: 'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.14.3/ui-bootstrap.min.js'}, '');
        body.ele('script', {src: 'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.14.3/ui-bootstrap-tpls.min.js'}, '');
    };

    var prettyAppCtrl = "this.initilize = function() {" +
            "console.log('angular initialized')" +
        "};";

};

prettyReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError'];

module.exports = {
    'reporter:pretty': ['type', prettyReporter]
};
