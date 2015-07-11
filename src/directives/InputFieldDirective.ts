/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file InputFieldDirective
 * @author Oleg Gordeev
 */

/**
 * Gets html template associated with the specified field
 * @param type
 * @returns string
 */
function getFieldTemplate(type: String):string {
    switch (type) {
        case InputFieldTypes.TEXT:
            return 'text';
        case InputFieldTypes.CODE_TEXT:
            return 'codeText';
        case InputFieldTypes.BOOLEAN:
            return 'checkBox';
        case InputFieldTypes.DATE:
            return 'date';
        case InputFieldTypes.EMAIL:
            return 'email';
        case InputFieldTypes.FILE:
            return 'file';
        case InputFieldTypes.FILE_LIST:
            return 'fileList';
        case InputFieldTypes.IMAGE:
            return 'image';
        case InputFieldTypes.LABEL:
            return 'label';
        case InputFieldTypes.MULTILINE_TEXT:
            return 'multilineText';
        case InputFieldTypes.MULTI_SELECT:
            return 'multiSelect';
        case InputFieldTypes.NUMBER:
            return 'number';
        case InputFieldTypes.PASSWORD:
            return 'password';
        case InputFieldTypes.RICH_TEXT:
            return 'richText';
        case InputFieldTypes.SELECT:
            return 'select';
        case InputFieldTypes.TYPEAHEAD:
            return 'typeahead';
    }
}

/**
 * @interface InputFieldDirectiveScope
 */
interface InputFieldDirectiveScope extends ng.IScope {
    field: InputFieldDefinition;
    fieldDisabled: boolean;
    object: any;
    configuration: WebFormsConfiguration;
    readOnly: () => string;
    getValue: () => any;
    getHelpText: () => string;
    getTypeahead: (searchText: string) => string[];
    onSearchTextChange: (text: string) => void;
    onSelectedItemChange: (item: string) => void;
    getCodeMirrorOptions: () => any;
}

/**
 * @class InputFieldDirectiveLink
 */
class InputFieldDirectiveLink {

    private scope: InputFieldDirectiveScope;
    private element: JQuery;
    private compileService: ng.ICompileService;
    private configuration: WebFormsConfiguration;

    constructor(scope: InputFieldDirectiveScope, element: JQuery, compileService: ng.ICompileService, sceService: ng.ISCEService,
                configuration: WebFormsConfiguration, form: ng.IFormController) {

        this.scope = scope;
        this.scope.configuration = configuration;
        this.element = element;
        this.compileService = compileService;
        this.configuration = configuration;
        this.scope.getCodeMirrorOptions = () => {
            return {};
        };

        scope.getValue = () => {
            if (scope.field.type === InputFieldTypes.RICH_TEXT && scope.readOnly().length > 0) {
                return sceService.trustAsHtml(scope.object[scope.field.property]);
            }
            return scope.object[scope.field.property];
        };

        scope.getTypeahead = (searchText: string) => {
            var source = configuration.getDataSource(scope.field.source);
            if (source) {
                return source.searchItems(searchText);
            }
            return [];
        };

        scope.onSearchTextChange = () => {
        };

        scope.onSelectedItemChange = (item: string) => {
            var control = form[scope.field.property];
        };

        scope.getHelpText = () => {
            return this.onGetHelpText();
        };

        scope.readOnly = (): string => {
            if (!scope.field.readOnlyFunction) {
                return scope.field.readOnly ? "readonly" : "";
            }
            return scope.field.readOnlyFunction(scope.object) ? "readonly" : "";
        };

        scope.$watch('field', () => this.render());
    }

    private onGetHelpText(): string {
        var ret = this.scope.field.helpText;
        if (ret == null) {
            ret = "";
        }
        return ret;
    }

    private getTemplateUrl() {
        return 'views/inputFields/' + getFieldTemplate(this.scope.field.type.toLowerCase()) + '.jade';
    }

    private render() {
        this.onContentLoaded(templates[this.getTemplateUrl()]);
    }

    private onContentLoaded(content: string) {
        this.element.contents().remove();

        if (!_.isObject(this.scope.field)) {
            return;
        }

        content = StringFormatter.format(content, this.scope.field.property);

        switch (this.scope.field.type) {
            case InputFieldTypes.TYPEAHEAD:
                break;
            default:
                content = "<md-input-container class='inputfield-" + this.scope.field.type + "'>" + content +
                    "<input-field-error></input-field-error></md-input-container>";
                break;
        }

        var container = angular.element(this.element);
        container.append(content);
        var newElement = container.children('md-input-container:last-child')[0];
        this.compileService(newElement)(this.scope);
    }
}

webFormsModule.directive('inputField', ['$compile', 'webFormsConfiguration', '$sce',
        (compileService: ng.ICompileService, webFormsConfiguration: WebFormsConfiguration, sceService: ng.ISCEService) => {
    return <ng.IDirective>{
        restrict: 'EA',
        require: ['^form'],
        scope: {
            field: '=',
            object: '=',
            fieldDisabled: '=',
            form: '='
        },
        link: (scope: InputFieldDirectiveScope, element: JQuery, attrs, controllers: any[]) => {
            new InputFieldDirectiveLink(scope, element, compileService, sceService, webFormsConfiguration, controllers[0]);
        }
    }}]
);
