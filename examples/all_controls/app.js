function TestController($scope, webForms) {
    $scope.userName = '';
    $scope.userEmail = '';
    $scope.userCreated = false;
    $scope.onShowDialog = function() {
        webForms.newObject('/examples/models/user_max').then(function(user) {
            $scope.userName = user.name;
            $scope.userEmail = user.email;
            $scope.userCreated = true;
        });
    }
}

var testApp = angular.module('testApp', ['lm-webforms']);
testApp.controller('testController', ['$scope', 'webForms', TestController]);
