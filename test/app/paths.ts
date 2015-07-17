var require: any = {
    baseUrl: "/",
    paths: {
        'jquery': '/bower_components/jquery/dist/jquery',
        'angular': '/bower_components/angular/angular',
        'angular.animate': '/bower_components/angular-animate/angular-animate',
        'angular.aria': '/bower_components/angular-aria/angular-aria',
        'angular.material': '/bower_components/angular-material/angular-material',
        'angular.messages': '/bower_components/angular-messages/angular-messages',
        'angular.touch': '/bower_components/angular-touch/angular-touch',
        'angular.translate': 'bower_components/angular-translate/angular-translate',
        'autolinker': '/bower_components/Autolinker.js/dist/Autolinker',
        'ckeditor': '/bower_components/ckeditor/ckeditor',
        'domready': '/bower_components/domready/ready',
        'recaptcha': 'http://www.google.com/recaptcha/api/js/recaptcha_ajax',
        'codemirror': '/bower_components/codemirror'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'jquery': {
            exports: '$'
        },
        'angular.animate': {
            deps: ['angular']
        },
        'angular.translate': {
            deps: ['angular']
        },
        'angular.messages': {
            deps: ['angular']
        },
        'angular.material': {
            deps: ['angular', 'angular.animate', 'angular.aria', 'angular.messages']
        },
        'angular.aria': {
            deps: ['angular']
        },
        'angular.touch': {
            deps: ['angular']
        },
        'ckeditor': {
            exports: 'CKEDITOR'
        },
        'recaptcha': {
            exports: 'Recaptcha'
        }
    }
};
