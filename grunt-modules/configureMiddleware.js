module.exports = function(grunt, connectTask, handlers, index) {

    grunt.loadNpmTasks('grunt-contrib-connect');

    var jade = require('jade');
    var template = jade.compile(grunt.file.read(index));

    var handler = function (connect, options, middlewares) {

        middlewares.unshift(function (req, res, next) {

            if (req.url === '/favicon.ico') {
                res.end();
                return;
            }

            grunt.log.debug('Url: ' + req.url);

            match = /^(\/test(?:\/?[^?]*)?)(?:\?(.*))?$/.exec(req.url);
            if (match) {
                var path = match[1];
                var query = match[2] || "";
                match = /^.*(\.[^.]+)/.exec(path);
                if (match) {
                    return next();
                }
                var html = template({path: path, query: query});
                res.end(html);
            } else {
                return next();
            }
        });

        if (handlers) {

            if (typeof handlers === "function") {
                middlewares.unshift(handlers);
            } else {
                handlers.forEach(function(h) {
                    middlewares.unshift(h);
                });
            }
        }

        return middlewares;
    };

    grunt.config(connectTask + '.options.middleware', handler);
};
