///<amd-dependency path="build/lm-webforms" />

import document = require('domready');
import TestController = require('./TestController');

function initializeApp() {
    var appModule = angular.module('testApp', [
        'lm-webforms'
    ]);

    appModule.config([() => {
    }]);

    appModule.controller('test', ['$scope', 'webForms', TestController]);

    angular.bootstrap(<any>document, ['testApp']);
}

export = initializeApp;
