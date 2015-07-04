///<amd-dependency path="angular" />
///<amd-dependency path="angular.material" />
///<amd-dependency path="angular.animate" />
///<amd-dependency path="angular.touch" />
///<amd-dependency path="angular.translate" />

var module = angular.module('lm-webforms', [
    'ngMaterial',
    'ngTouch',
    'ngMessages',
    'ngAnimate',
    'pascalprecht.translate'
]);

export = module;
