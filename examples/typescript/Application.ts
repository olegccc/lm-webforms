///<reference path="../../typings/angularjs/angular.d.ts" />

var testApp = angular.module('testApp', ['lm-webforms']);
testApp.controller('testController', ['$scope', 'webForms', Controller]);
