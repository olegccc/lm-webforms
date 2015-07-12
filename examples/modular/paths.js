var require = {
    paths: {
        'lodash': '/bower_components/lodash/lodash',
        'angular': '/bower_components/angular/angular',
        'angular_animate': '/bower_components/angular-animate/angular-animate',
        'angular_aria': '/bower_components/angular-aria/angular-aria',
        'angular_material': '/bower_components/angular-material/angular-material',
        'angular_messages': '/bower_components/angular-messages/angular-messages',
        'angular_touch': '/bower_components/angular-touch/angular-touch',
        'angular_translate': 'bower_components/angular-translate/angular-translate',
        'autolinker': '/bower_components/Autolinker.js/dist/Autolinker',
        'ckeditor': '/bower_components/ckeditor/ckeditor',
        'domready': '/bower_components/domready/ready',
        'recaptcha': 'http://www.google.com/recaptcha/api/js/recaptcha_ajax',
        'codemirror': '/bower_components/codemirror'
    },
    shim: {
        'angular':{
            exports: 'angular'
        },
        'lodash': {
            exports: '_'
        },
        'angular_animate': {
            deps: ['angular']
        },
        'angular_translate': {
            deps: ['angular']
        },
        'angular_messages': {
            deps: ['angular']
        },
        'angular_material': {
            deps: ['angular', 'angular_animate', 'angular_aria', 'angular_messages']
        },
        'angular_aria': {
            deps: ['angular']
        },
        'angular_touch': {
            deps: ['angular']
        },
        'ckeditor': {
            exports: 'CKEDITOR'
        }
    }
};
