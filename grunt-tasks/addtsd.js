module.exports = function (grunt) {

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
};