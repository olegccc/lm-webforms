/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file FormValidator.ts
 * @author Oleg Gordeev
 */

/**
 * Validates input form contents
 * @class FormValidator
 */
class FormValidator {

    public static validate(object:any, value:any, field:InputFieldDefinition, isNewObject: boolean, configuration: WebFormsConfiguration, onFieldInvalid:(string) => void):void {
        switch (field.type) {
            case InputFieldTypes.FILE:
                if (field.required && isNewObject && (value === null || value.file === null || value.file.length === 0)) {
                    onFieldInvalid(Constants.VALIDATION_ERROR_REQUIRED);
                }

                if (configuration.maximumFileSize > 0 && value !== null && value.file.length > configuration.maximumFileSize) {
                    onFieldInvalid(Constants.VALIDATION_ERROR_MAX_LENGTH);
                }
                return;

            case InputFieldTypes.FILE_LIST:
                if (field.required && isNewObject && (value === null || value.length === 0)) {
                    onFieldInvalid(Constants.VALIDATION_ERROR_REQUIRED);
                }

                if (value !== null) {
                    for (var j = 0; j < value.length; j++) {
                        var file = value[j];
                        if (file.file !== null && file.file.length > configuration.maximumFileSize) {
                            onFieldInvalid(Constants.VALIDATION_ERROR_MAX_LENGTH);
                            break;
                        }
                    }
                }

                return;
        }

        if (field.repeat) {
            var repeat = object[field.reference];
            if (!_.isEqual(repeat, value)) {
                onFieldInvalid(Constants.VALIDATION_ERROR_MATCH);
            }
        }

        if (_.isEmpty(value)) {
            if (field.required) {
                onFieldInvalid(Constants.VALIDATION_ERROR_REQUIRED);
            }
            return;
        }

        switch (field.type) {
            case InputFieldTypes.NUMBER:
                if (isNaN(parseFloat(value))) {
                    onFieldInvalid(Constants.VALIDATION_ERROR_NUMBER);
                }
                break;
            case InputFieldTypes.EMAIL:
                if (!_.isString(value) || !value.search(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/)) {
                    onFieldInvalid(Constants.VALIDATION_ERROR_EMAIL);
                }
                break;
        }
    }
}
