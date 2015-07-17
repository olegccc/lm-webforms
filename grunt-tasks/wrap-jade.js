module.exports = function (grunt) {

    grunt.registerMultiTask('wrap-jade', function () {

        var jade = require('jade');
        var mapping = {};

        this.files.forEach(function(file) {
            mapping[file.dest] = "";
            file.src.forEach(function(src) {
                mapping[file.dest] += jade.renderFile(src);
            });
        });

        var variableName = this.data.variable || 'templates';

        var body = 'var ' + variableName + ' = ' + JSON.stringify(mapping, null, '  ') + ';';

        grunt.file.write(this.data.output, body);
    });
};