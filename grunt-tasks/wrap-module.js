module.exports = function (grunt) {

    grunt.registerMultiTask('wrap-module', function() {

        var options = {
            functionName: "___f$"
        };

        var footerTemplate = "} if (typeof define === 'function' && define.amd) { define(<%= modulesArray %>, " +
            "function (<%= moduleVariables %>) { <%= functionName %>(<%= requiredVariables %>); }); } " +
            "else if (typeof exports === 'object') { <%= namedCjsModules %><%= unnamedCjsModules %> " +
            "module.exports = <%= functionName %>(<%= requiredVariables %>); } else " +
            " { <%= functionName %>(<%= globalWindowVariables %>); } })();";

        var headerTemplate = "(function() { function <%= functionName %>(<%= globalVariables %>) {";

        var keys = Object.keys(this.data.modules);
        var variables = [];
        var unnamedIndex = 0;
        var requiredVariables = [];
        var globalVariables = [];
        var namedCjsModules = [];
        var unnamedCjsModules = [];
        var globalWindowVariables = [];

        var _this = this;

        options.modulesArray = JSON.stringify(keys);

        keys.forEach(function(module) {
            var variable = _this.data.modules[module];
            var generatedVariable = "$_v" + (unnamedIndex++);
            if (variable.length === 0) {
                unnamedCjsModules.push('require(\'' + module + '\');');
            } else {
                requiredVariables.push(generatedVariable);
                globalVariables.push(variable);
                globalWindowVariables.push('window[\'' + variable + '\']');
                namedCjsModules.push('var ' + generatedVariable + ' = require(\'' + module + '\');')
            }
            variables.push(generatedVariable);
        });

        options.moduleVariables = variables.join(",");
        options.requiredVariables = requiredVariables.join(",");
        options.namedCjsModules = namedCjsModules.join("");
        options.unnamedCjsModules = unnamedCjsModules.join("");
        options.globalVariables = globalVariables.join(",");
        options.globalWindowVariables = globalWindowVariables.join(",");

        var header = grunt.template.process(headerTemplate, { data: options });
        var footer = grunt.template.process(footerTemplate, { data: options });

        this.files.forEach(function(file) {
            var module = "";
            file.src.forEach(function(src) {
                module += grunt.file.read(src);
            });

            grunt.file.write(file.dest, header + module + footer);
        });
    });
};