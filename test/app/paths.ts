var require = {
    paths: {
        'jquery': '/bower_components/jquery/dist/jquery',
        'lodash': '/bower_components/lodash/lodash',
        'angular': '/bower_components/angular/angular',
        'angular.animate': '/bower_components/angular-animate/angular-animate',
        'angular.aria': '/bower_components/angular-aria/angular-aria',
        'angular.material': '/bower_components/angular-material/angular-material',
        'angular.messages': '/bower_components/angular-messages/angular-messages',
        'angular.touch': '/bower_components/angular-touch/angular-touch',
        'autolinker': '/bower_components/Autolinker.js/dist/Autolinker',
        'ckeditor': '/bower_components/ckeditor/ckeditor',
        'domready': '/bower_components/domready/ready',
        'requirejs.text': '/bower_components/requirejs-text/text',
        'Recaptcha': 'http://www.google.com/recaptcha/api/js/recaptcha_ajax',
        'codemirror': '/bower_components/codemirror/lib/codemirror',
        'codemirror.htmlmixed': '/bower_components/codemirror/mode/htmlmixed/htmlmixed',
        'codemirror.htmlembedded': '/bower_components/codemirror/mode/htmlembedded/htmlembedded',
        'codemirror.htmlhint': '/bower_components/codemirror/addon/hint/html-hint',
        'codemirror.xml': '/bower_components/codemirror/mode/xml/xml',
        'codemirror.javascript': '/bower_components/codemirror/mode/javascript/javascript',
        'codemirror.css': '/bower_components/codemirror/mode/css/css',
        'codemirror.multiplex': '/bower_components/codemirror/addon/mode/multiplex',
        'codemirror.xmlhint': '/bower_components/codemirror/addon/hint/xml-hint'
    },
    map: {
        '*': {
            '../lib/codemirror': 'codemirror',
            '../../lib/codemirror': 'codemirror',
            '../xml/xml': 'codemirror.xml',
            '../javascript/javascript': 'codemirror.javascript',
            '../css/css': 'codemirror.css',
            '../htmlmixed/htmlmixed': 'codemirror.htmlmixed',
            '../../addon/mode/multiplex': 'codemirror.multiplex',
            'xml-hint': 'codemirror.xmlhint'
        }
    },
    shim: {
        'angular':{
            exports: 'angular',
            deps: ['jquery', 'requirejs.text']
        },
        'jquery': {
            exports: '$'
        },
        'lodash': {
            exports: '_'
        },
        'angular.animate': {
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
            deps: ['jquery'],
            exports: 'CKEDITOR'
        },
        'codemirror': {
            deps: ['jquery']
        }
    }
};
