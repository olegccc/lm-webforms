    }

    if (typeof define === 'function' && define.amd) {
        // AMD
        define([
            "angular",
            "angular.animate",
            "angular.translate",
            "angular.messages",
            "angular.material",
            "angular.aria",
            "angular.touch",
            "autolinker",
            "recaptcha"],
            function (ng,ng_animate,ng_translate,ng_messages,ng_material,ng_aria,ng_touch,autolinker,recaptcha) {
                webFormsFactory(ng, autolinker, recaptcha);
            }
        );
    } else if (typeof exports === 'object') {
        // CommonJS
        var ng = require("angular");
        require("angular.animate");
        require("angular.translate");
        require("angular.messages");
        require("angular.material");
        require("angular.aria");
        require("angular.touch");
        var autolinker = require("autolinker");
        var recaptcha = require("recaptcha");

        module.exports = webFormsFactory(ng, autolinker, recaptcha);
    } else {
        // Regular
        webFormsFactory(angular, Autolinker, Recaptcha);
    }

})();