/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file InputFieldErrorDirective.ts
 * @author Oleg Gordeev
 */

/**
 * @interface InputFieldErrorDirectiveScope
 */
interface InputFieldErrorDirectiveScope {
    maxLengthMessage: string;
    minLengthMessage: string;
    field: InputFieldDefinition;
    form: ng.IFormController;
    configuration: WebFormsConfiguration;
    requiredMarker: string;
    maxLengthMarker: string;
    minLengthMarker: string;
    emailMarker: string;
    urlMarker: string;
    patternMarker: string;
    dateMarker: string;
    timeMarker: string;
    numberMarker: string;
    equalsMarker: string;
}

/**
 * @class InputFieldErrorDirectiveController
 */
class InputFieldErrorDirectiveController {
    constructor(scope: InputFieldErrorDirectiveScope, translateService: angular.translate.ITranslateService, configuration: WebFormsConfiguration) {
        scope.configuration = configuration;
        scope.maxLengthMessage = '';
        scope.requiredMarker = Constants.VALIDATION_ERROR_REQUIRED;
        scope.maxLengthMarker = Constants.VALIDATION_ERROR_MAX_LENGTH;
        scope.minLengthMarker = Constants.VALIDATION_ERROR_MIN_LENGTH;
        scope.emailMarker = Constants.VALIDATION_ERROR_EMAIL;
        scope.urlMarker = Constants.VALIDATION_ERROR_URL;
        scope.patternMarker = Constants.VALIDATION_ERROR_PATTERN;
        scope.dateMarker = Constants.VALIDATION_ERROR_DATE;
        scope.timeMarker = Constants.VALIDATION_ERROR_TIME;
        scope.numberMarker = Constants.VALIDATION_ERROR_NUMBER;
        scope.equalsMarker = Constants.VALIDATION_ERROR_MATCH;
        if (scope.field.maxLength) {
            translateService(configuration.maxLengthErrorMessage).then(text => scope.maxLengthMessage = StringFormatter.format(text, scope.field.maxLength));
        }
        scope.minLengthMessage = '';
        if (scope.field.minLength) {
            translateService(configuration.minLengthErrorMessage).then(text => scope.minLengthMessage = StringFormatter.format(text, scope.field.minLength));
        }
    }
}

webFormsModule.directive('inputFieldError', [() => {
        return <ng.IDirective> {
            template: templates['views/inputFieldError.jade'],
            restrict: 'E',
            replace: true,
            controller: ['$scope', '$translate', 'webFormsConfiguration', InputFieldErrorDirectiveController]
        };
    }]);
