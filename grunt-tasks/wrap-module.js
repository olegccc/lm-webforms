module.exports = function (grunt) {

    grunt.registerMultiTask('wrap-module', function() {

        var options = {
            functionName: "___f$"
        };

        var footerTemplate = "} if (typeof define === 'function' && define.amd) { define(<%= modulesArray %>, " +
            "function (<%= moduleVariables %>) { <%= functionName %>(<%= requiredVariables %>); }); } " +
            "else if (typeof exports === 'object') { <%= namedCjsModules %><%= unnamedCjsModules %> " +
            "module.exports = <%= functionName %>(<%= requiredVariables %>); } else " +
            " { <%= functionName %>(<%= requiredVariables %>); } })();";

        var headerTemplate = "(function() { function <%= functionName %>(<%= requiredVariables %>) {";

        var keys = Object.keys(this.data.modules);
        var variables = [];
        var unnamedIndex = 0;
        var requiredVariables = [];
        var namedCjsModules = [];
        var unnamedCjsModules = [];

        var _this = this;

        options.modulesArray = JSON.stringify(keys);

        keys.forEach(function(module) {
            var variable = _this.data.modules[module];
            if (variable.length === 0) {
                variable = "$_v" + (unnamedIndex++);
                unnamedCjsModules.push('require(\'' + module + '\');');
            } else {
                requiredVariables.push(variable);
                namedCjsModules.push('var ' + variable + ' = require(\'' + module + '\');')
            }
            variables.push(variable);
        });

        options.moduleVariables = variables.join(",");
        options.requiredVariables = requiredVariables.join(",");
        options.namedCjsModules = namedCjsModules.join("");
        options.unnamedCjsModules = unnamedCjsModules.join("");

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