///<amd-dependency path="angular" />
///<amd-dependency path="angular.material" />
///<amd-dependency path="angular.animate" />
///<amd-dependency path="angular.touch" />

var module = angular.module('lm-webforms', [
    'ngMaterial',
    'ngTouch',
    'ngMessages',
    'ngAnimate'
]);

export = module;
