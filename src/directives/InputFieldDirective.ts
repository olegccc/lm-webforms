import InputFieldTypes = require('datatypes/InputFieldTypes');
import WebFormsConfiguration = require('datatypes/WebFormsConfiguration');
import _ = require('lodash');

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
        case InputFieldTypes.PASSWORD_REPEAT:
            return 'passwordRepeat';
        case InputFieldTypes.RICH_TEXT:
            return 'richText';
        case InputFieldTypes.SELECT:
            return 'select';
        case InputFieldTypes.TYPEAHEAD:
            return 'typeahead';
    }
}

interface InputFieldDirectiveScope extends ng.IScope {
    field: InputFieldDefinition;
    object: any;
    configuration: WebFormsConfiguration;
}

class InputFieldDirectiveLink {

    private scope: InputFieldDirectiveScope;
    private element: ng.IAugmentedJQuery;
    private compileService: ng.ICompileService;
    private configuration: WebFormsConfiguration;

    constructor(scope: InputFieldDirectiveScope, element: ng.IAugmentedJQuery, compileService: ng.ICompileService, configuration: WebFormsConfiguration) {

        this.scope = scope;
        this.scope.configuration = configuration;
        this.element = element;
        this.compileService = compileService;
        this.configuration = configuration;

        scope.$watch('field', () => this.render());
    }

    private getTemplateUrl() {
        return '../views/inputFields/' + getFieldTemplate(this.scope.field.type.toLowerCase());
    }

    private render() {
        require([this.getTemplateUrl()], (template: string) => {
            this.onContentLoaded(template);
        });
    }

    private onContentLoaded(content: string) {
        this.element.contents().remove();

        if (!_.isObject(this.scope.field)) {
            return;
        }

        content =  "<md-input-container class='inputfield-" + this.scope.field.type + "'>" + content + "<input-field-error></input-field-error></md-input-container>";

        var element = angular.element(content).appendTo(this.element);

        this.compileService(element)(this.scope);
    }
}

import module = require('modules/WebFormsModule');

module.directive('inputField', ['$compile', 'webFormsConfiguration',
        (compileService: ng.ICompileService, webFormsConfiguration: WebFormsConfiguration) => {
    return <ng.IDirective>{
        restrict: 'EA',
        require: ['^form'],
        scope: {
            field: '=',
            object: '=',
            form: '='
        },
        link: (scope: InputFieldDirectiveScope, element: ng.IAugmentedJQuery) => {
            new InputFieldDirectiveLink(scope, element, compileService, webFormsConfiguration);
        }
    }}]
);
