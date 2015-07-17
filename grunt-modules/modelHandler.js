module.exports = function(grunt) {

    var fs = require('fs');

    function modelHandler(req, res, next) {
        var match = req.url.match(/[^?]*\/test\/generated_model\/(.+).json/);

        if (!match) {
            return next();
        }

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
    }

    return modelHandler;
};