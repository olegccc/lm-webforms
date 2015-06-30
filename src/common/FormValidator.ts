/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

///<amd-dependency path="angular" />
import InputFormController = require('../controllers/InputFormController');
import InputFieldTypes = require('../datatypes/InputFieldTypes');
import WebFormsConfiguration = require('../datatypes/WebFormsConfiguration');

class FormValidator {

    public static validate(object:any, value:any, field:InputFieldDefinition, isNewObject: boolean, configuration: WebFormsConfiguration, onFieldInvalid:(string) => void):void {
        switch (field.type) {
            case InputFieldTypes.FILE:
                if (field.required && isNewObject && (value == null || value.file == null || value.file.length == 0)) {
                    onFieldInvalid('required');
                }

                if (value.file.length > configuration.maximumFileSize) {
                    onFieldInvalid('maxlength');
                }
                return;

            case InputFieldTypes.FILE_LIST:
                if (field.required && isNewObject && (value == null || value.length == 0)) {
                    onFieldInvalid('required');
                }

                if (value != null) {
                    for (var j = 0; j < value.length; j++) {
                        var file = value[j];
                        if (file.file != null && file.file.length > configuration.maximumFileSize) {
                            onFieldInvalid('maxlength');
                            break;
                        }
                    }
                }

                return;
            case InputFieldTypes.MULTI_SELECT:
                return;
        }

        if (typeof (value) == 'undefined' || value == null || value.toString().trim().length == 0) {
            if (field.required) {
                onFieldInvalid('required');
            }
            return;
        }

        switch (field.type) {
            case InputFieldTypes.NUMBER:
                if (_.isNaN(parseFloat(value))) {
                    onFieldInvalid('number');
                }
                break;
            case InputFieldTypes.EMAIL:
                if (!_.isString(value) || !value.search(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/)) {
                    onFieldInvalid('email');
                }
                break;
            case InputFieldTypes.PASSWORD_REPEAT:
                var repeatPassword = object[field.property + InputFormController.PASSWORD_REPEAT_SUFFIX];
                if (!_.isString(repeatPassword) || repeatPassword != value) {
                    onFieldInvalid('password_match');
                }
        }
    }
}

export = FormValidator;