// Based on https://github.com/angular-ui/ui-codemirror
// The goal of refactoring is to take advantage of using AMD and TypeScript and integrate it with angular.material

/**
 * @file CodeMirrorDirective
 * @author Oleg Gordeev
 */

/**
 * @interface CodeMirrorDirectiveScope
 */
interface CodeMirrorDirectiveScope extends ng.IScope {
    options: () => any;
    fieldReadonly: boolean;
}

/**
 * @class CodeMirrorDirectivePostLink
 */
class CodeMirrorDirectivePostLink {

    private editor: CodeMirror.CodeMirror;
    private scope: CodeMirrorDirectiveScope;
    private model: ng.INgModelController;
    private inputContainer: IInputContainer;
    private element: JQuery;
    private configuration: WebFormsConfiguration;
    private options: any;

    constructor(scope: CodeMirrorDirectiveScope, element: JQuery, model: ng.INgModelController, container: IInputContainer, configuration: WebFormsConfiguration) {

        this.scope = scope;
        this.model = model;
        this.inputContainer = container;
        this.element = element;
        this.configuration = configuration;

        if (_.isFunction(scope.options)) {
            this.options = scope.options();
        }

        if (!angular.isObject(this.options)) {
            this.options = {};
        }

        var newValue = this.model.$viewValue || '';

        this.options.lineNumbers = true;
        this.options.mode = this.options.mode || "htmlmixed";
        this.options.inputStyle = "textarea";
        this.options.value = newValue;

        if (configuration.loadModulesOnDemand) {
            var requiredModules = ['codemirror'];
            if (configuration.codeMirrorModules && configuration.codeMirrorModules.length) {
                requiredModules = configuration.codeMirrorModules;
            }
            require(requiredModules, (codemirror) => {
                this.prepareEditor(codemirror);
            });
        } else {
            this.prepareEditor(window["CodeMirror"]);
        }
    }

    private prepareEditor(Codemirror: CodeMirror.CodeMirror) {
        this.editor = this.createEditor(Codemirror);
        this.scope.$applyAsync(() => {
            this.configOptionsWatcher(Codemirror);
            this.configNgModelLink();
            this.editor.setOption('readOnly', this.scope.fieldReadonly);
        });
    }

    private createEditor(CodeMirror:any):CodeMirror.CodeMirror {
        return new CodeMirror((editorInstance: HTMLElement) => {
            this.element.append(editorInstance);
        }, this.options);
    }

    private configOptionsWatcher(CodeMirror: any) {

        var codemirrorDefaultsKeys = Object.keys(CodeMirror.defaults);

        this.scope.$watch('options', (newValues, oldValue) => {
            if (!angular.isObject(newValues)) {
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

        this.scope.$watch('fieldReadonly', (newValue, oldValue) => {
            if (newValue === oldValue) {
                return;
            }
            this.editor.setOption('readOnly', newValue);
        });
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
}

webFormsModule.directive('uiCodemirror', ['webFormsConfiguration', (configuration: WebFormsConfiguration) => {
        return <ng.IDirective>{
            restrict: 'E',
            template: templates['views/codemirror.jade'],
            replace: true,
            require: ['?ngModel', '^?mdInputContainer'],
            scope: {
                options: '&',
                fieldReadonly: '=',
                fieldDisabled: '='
            },
            link: (scope: CodeMirrorDirectiveScope, element: JQuery, attrs, controllers: any[]) => {
                new CodeMirrorDirectivePostLink(scope, element, controllers[0], controllers[1], configuration);
            }
        }}]
);
