module.exports = function (grunt) {

    var path = require('path');
    var _ = require('lodash');

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-umd');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.initConfig(grunt.file.readJSON('./config/grunt.config.json'));

    grunt.registerTask('wrap-html', function () {
        var files = grunt.file.expandMapping(['./build/views/**/*.html'], '', {
            rename: function (base, path) {
                return path.replace(/\.html$/, '.js');
            }
        });

        _.each(files, function (file) {
            //console.log(file.src + ' -> ' + file.dest);
            var input = grunt.file.read(file.src);
            var output = "define(function() {\n  return '";
            var firstLine = true;
            _.each(input.match(/[^\r\n]+/g), function (line) {
                if (firstLine) {
                    firstLine = false;
                } else {
                    output += "' + \n  '";
                }
                output += line.replace(/\\/, '\\\\').replace(/'/g, '\\\'');
            });
            output += "';\n});";
            grunt.file.write(file.dest, output);
        });
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
                    var modelTemplate = JSON.stringify({
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

    grunt.registerTask('run-jade', function () {

        var files = grunt.file.expandMapping(['./src/views/**/*.jade', '!./src/views/**/_*.jade'], './build/views/', {
            rename: function (base, path) {
                return base + path.replace(/\.jade$/, '.html').replace('./src/views/', '');
            }
        });

        grunt.config('jade.default.files', files);
        grunt.task.run(['jade']);
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

    grunt.registerTask('build', [
        'clean:build',
        'copy:bootstrap',
        'ts:build',
        'run-jade',
        'wrap-html',
        'requirejs',
        'uglify',
        "ts:tests"]);

    grunt.registerTask('view', ['prepare-middleware', 'connect:keepalive']);
};
