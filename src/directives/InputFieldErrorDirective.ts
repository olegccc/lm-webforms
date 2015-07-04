import StringFormatter = require('utilities/StringFormatter');
import _ = require('lodash');
import WebFormsConfiguration = require('datatypes/WebFormsConfiguration');

interface InputFieldErrorDirectiveScope {
    maxLengthMessage: string;
    minLengthMessage: string;
    field: InputFieldDefinition;
    form: ng.IFormController;
    configuration: WebFormsConfiguration;
}

class InputFieldErrorDirectiveController {
    constructor(scope: InputFieldErrorDirectiveScope, translateService: angular.translate.ITranslateService, configuration: WebFormsConfiguration) {
        scope.configuration = configuration;
        scope.maxLengthMessage = '';
        if (scope.field.maxLength) {
            translateService(configuration.maxLengthErrorMessage).then(text => scope.maxLengthMessage = StringFormatter.format(text, scope.field.maxLength));
        }
        scope.minLengthMessage = '';
        if (scope.field.minLength) {
            translateService(configuration.minLengthErrorMessage).then(text => scope.minLengthMessage = StringFormatter.format(text, scope.field.minLength));
        }
    }
}

import module = require('modules/WebFormsModule');
import template = require('views/inputFieldError');

module.directive('inputFieldError', [() => {
        return <ng.IDirective> {
            template: template,
            restrict: 'E',
            replace: true,
            controller: ['$scope', '$translate', 'webFormsConfiguration', InputFieldErrorDirectiveController]
        };
    }]);
