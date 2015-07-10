var require: any = {
    paths: {
        'jquery': '/bower_components/jquery/dist/jquery',
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
        'codemirror': '/bower_components/codemirror/lib/codemirror',
        'codemirror_htmlmixed': '/bower_components/codemirror/mode/htmlmixed/htmlmixed',
        'codemirror_htmlembedded': '/bower_components/codemirror/mode/htmlembedded/htmlembedded',
        'codemirror_htmlhint': '/bower_components/codemirror/addon/hint/html-hint',
        'codemirror_xml': '/bower_components/codemirror/mode/xml/xml',
        'codemirror_javascript': '/bower_components/codemirror/mode/javascript/javascript',
        'codemirror_css': '/bower_components/codemirror/mode/css/css',
        'codemirror_multiplex': '/bower_components/codemirror/addon/mode/multiplex',
        'codemirror_xmlhint': '/bower_components/codemirror/addon/hint/xml-hint',
        'text': '/bower_components/requirejs-text/text'
    },
    map: {
        '*': {
            '../lib/codemirror': 'codemirror',
            '../../lib/codemirror': 'codemirror',
            '../xml/xml': 'codemirror_xml',
            '../javascript/javascript': 'codemirror_javascript',
            '../css/css': 'codemirror_css',
            '../htmlmixed/htmlmixed': 'codemirror_htmlmixed',
            '../../addon/mode/multiplex': 'codemirror_multiplex',
            'xml-hint': 'codemirror_xmlhint'
        }
    },
    shim: {
        'angular':{
            exports: 'angular',
            deps: ['text']
        },
        'jquery': {
            exports: '$'
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
            deps: ['jquery'],
            exports: 'CKEDITOR'
        },
        'codemirror': {
            deps: ['jquery']
        }
    }
};
