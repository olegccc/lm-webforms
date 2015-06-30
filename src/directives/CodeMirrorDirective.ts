// Based on https://github.com/angular-ui/ui-codemirror
// The goal of refactoring is to take advantage of using AMD and TypeScript and integrate it with angular.material

/// <reference path="../../typings/requirejs/require.d.ts" />
///<amd-dependency path="angular" />

import template = require('../views/codemirror');
import WebFormsConfiguration = require('../datatypes/WebFormsConfiguration');

interface CodeMirrorDirectiveScope extends ng.IScope {
    options: any;
    readonly: boolean;
}

class CodeMirrorDirectivePostLink {

    private editor: CodeMirror.CodeMirror;
    private scope: ng.IScope;
    private model: ng.INgModelController;
    private inputContainer: IInputContainer;

    constructor(scope: CodeMirrorDirectiveScope, element: JQuery, iAttrs: any, model: ng.INgModelController, Codemirror: CodeMirror.CodeMirror, container: IInputContainer) {

        this.scope = scope;
        this.model = model;
        this.inputContainer = container;

        if (_.isUndefined(scope.options)) {
            scope.options = {};
        }

        var newValue = this.model.$viewValue || '';

        scope.options.lineNumbers = true;
        scope.options.mode = "htmlmixed";
        scope.options.inputStyle = "textarea";
        scope.options.value = newValue;

        this.editor = this.createEditor(element, scope.options, Codemirror);

        this.configOptionsWatcher(iAttrs.uiCodemirror || iAttrs.uiCodemirrorOpts);

        this.configNgModelLink();

        this.configUiRefreshAttribute(iAttrs.uiRefresh);

        // Allow access to the CodeMirror instance through a broadcasted event
        // eg: $broadcast('CodeMirror', function(cm){...});

        scope.$on('CodeMirror', (event, callback) => {
            if (_.isFunction(callback)) {
                callback(this.editor);
            } else {
                throw new Error('the CodeMirror event requires a callback function');
            }
        });

        this.updateEditorState(newValue);
    }

    private createEditor(element: JQuery, codemirrorOptions: any, CodeMirror: any): CodeMirror.CodeMirror {
        return new CodeMirror((editorInstance: HTMLElement) => {
            element.append(editorInstance);
        }, codemirrorOptions);
    }

    private configOptionsWatcher(uiCodemirrorAttr: any) {

        if (!uiCodemirrorAttr) {
            return;
        }

        var codemirrorDefaultsKeys = Object.keys(CodeMirror.CodeMirror.defaults);

        this.scope.$watch('options', (newValues, oldValue) => {
            if (!_.isObject(newValues)) {
                return;
            }
            codemirrorDefaultsKeys.forEach((key) => {
                if (newValues.hasOwnProperty(key)) {

                    if (oldValue && newValues[key] === oldValue[key]) {
                        return;
                    }

                    this.editor.setOption(key, newValues[key]);
                }
            });
        }, true);
    }

    private updateEditorState(newValue: any) {
        this.inputContainer.setHasValue(!_.isEmpty(newValue));
        this.inputContainer.setInvalid(this.model.$invalid && this.model.$touched);
    }

    private configNgModelLink() {

        if (!this.model) {
            return;
        }
        // CodeMirror expects a string, so make sure it gets one.
        // This does not change the model.
        this.model.$formatters.push((value) => {
            if (angular.isUndefined(value) || value === null) {
                return '';
            } else if (angular.isObject(value) || angular.isArray(value)) {
                throw new Error('ui-codemirror cannot use an object or an array as a model');
            }
            return value;
        });

        // Override the ngModelController $render method, which is what gets called when the model is updated.
        // This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
        this.model.$render = () => {
            //Code mirror expects a string so make sure it gets one
            //Although the formatter have already done this, it can be possible that another formatter returns undefined (for example the required directive)
            var safeViewValue = this.model.$viewValue || '';
            this.editor.setValue(safeViewValue);
            this.updateEditorState(safeViewValue);
        };


        // Keep the ngModel in sync with changes from CodeMirror
        this.editor.on('change', (instance:CodeMirror.CodeMirror) => {
            var newValue = instance.getValue();
            if (newValue !== this.model.$viewValue) {
                this.scope.$evalAsync(() => {
                    this.model.$setViewValue(newValue);
                    this.model.$setTouched();
                    this.updateEditorState(newValue);
                });
            }
        });

        this.editor.on('focus', () => {
            this.inputContainer.setFocused(true);
        });

        this.editor.on('blur', () => {
            this.inputContainer.setFocused(false);
        });
    }

    private configUiRefreshAttribute(uiRefreshAttr) {
        if (!uiRefreshAttr) { return; }

        this.scope.$watch(uiRefreshAttr, (newVal, oldVal) => {
            // Skip the initial watch firing
            if (newVal !== oldVal) {
                this.scope.$evalAsync(() => {
                    this.editor.refresh();
                });
            }
        });
    }
}

import module = require('../module');

module.directive('uiCodemirror', ['webFormsConfiguration', (configuration: WebFormsConfiguration) => {
        return <ng.IDirective>{
            restrict: 'E',
            template: template,
            replace: true,
            require: ['?ngModel', '^?mdInputContainer'],
            scope: {
                options: '=',
                readonly: '='
            },
            link: (scope: CodeMirrorDirectiveScope, element: JQuery, attrs, controllers: any[]) => {
                var requiredModules = ['codemirror'];
                if (configuration.codeMirrorModules && configuration.codeMirrorModules.length) {
                    requiredModules = _.union(requiredModules, configuration.codeMirrorModules);
                }
                require(requiredModules, (codemirror) => {
                    new CodeMirrorDirectivePostLink(scope, element, attrs, controllers[0], codemirror, controllers[1]);
                });
            }
        }}]
);
