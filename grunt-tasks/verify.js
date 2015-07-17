module.exports = function(grunt) {
    grunt.registerTask('verify', function(browser) {
        browser = browser || "firefox";
        grunt.config('protractor.options.args.browser', browser);
        grunt.task.run(['connect:start', 'protractor']);
    });
};