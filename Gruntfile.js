module.exports = function (grunt) {

    var path = require('path');
    var fs = require('fs');
    var _ = require('lodash');

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-umd');

    grunt.initConfig(grunt.file.readJSON('./config/grunt.config.json'));

    grunt.registerTask('wrap-jade', function () {

        var jade = require('jade');

        var files = grunt.file.expand(['src/**/*.jade']);

        var mapping = {};

        _.each(files, function (file) {
            if (file.match(/.*\/_[^\/]/)) {
                return;
            }
            mapping[file.replace('src/', '')] = jade.renderFile(path.resolve(file));
        });

        var body = 'var templates = ' + JSON.stringify(mapping, null, '  ') + ';';

        grunt.file.write('src/templates/templates.ts', body);
    });

    grunt.registerTask('prepare-middleware', function () {
        var jade = require('jade');
        var jadeOptions = {};
        var template = jade.compile(grunt.file.read('./test/views/index.jade'), jadeOptions);

        var handler = function (connect, options, middlewares) {

            var pathChecker = /^\/test\/?$/;

            middlewares.unshift(function (req, res, next) {

                if (req.url === '/favicon.ico') {
                    res.end();
                    return;
                }

                var match = req.url.match(/\/test\/generated_model\/(.+).json/);

                if (match && match.length > 1) {
                    var modelName = match[1];
                    var modelTemplate;
                    var modelPath = './test/models/' + modelName + '.json';
                    if (fs.existsSync(modelPath)) {
                        modelTemplate = fs.readFileSync(modelPath);
                    } else {
                        modelTemplate = JSON.stringify({
                            "title": "Test " + modelName,
                            "fields": {
                                "text_before": {
                                    "title": "Before",
                                    "type": "text"
                                },
                                "required": {
                                    "title": "Field1",
                                    "type": modelName,
                                    "required": true
                                },
                                "not_required": {
                                    "title": "Field2",
                                    "type": modelName,
                                    "required": false
                                },
                                "text_after": {
                                    "title": "After",
                                    "type": "text"
                                }
                            }
                        });
                    }
                    grunt.log.debug('Model request: ' + modelName);
                    res.end(modelTemplate);
                    return;
                }

                grunt.log.debug('Url: ' + req.url);

                match = pathChecker.exec(req.url);
                if (match && match.length > 0) {
                    var path = match[1];
                    var query = match.length > 1 ? match[2] : "";
                    var html = template({path: path, query: query});
                    res.end(html);
                } else {
                    return next();
                }
            });

            return middlewares;
        };

        grunt.config('connect.options.middleware', handler);
    });

    grunt.registerTask('addtsd', function (module) {
        var done = this.async();
        grunt.util.spawn({
            cmd: 'tsd',
            args: ['install', module, '--save', '--config', './config/tsd.config.json']
        }, function (error, result) {
            grunt.log.debug(result.stdout);
            done();
        });
    });

    grunt.registerTask('verify', ['prepare-middleware', 'connect:start', 'protractor']);

    grunt.registerTask('ts-build', ['clean:build', 'wrap-jade', 'ts:build', 'clean:post-build']);

    grunt.registerTask('build', [
        'ts-build',
        'umd',
        'uglify',
        'copy:interfaces',
        'ts:tests'
    ]);

    grunt.registerTask('view', ['prepare-middleware', 'connect:keepalive']);
};
