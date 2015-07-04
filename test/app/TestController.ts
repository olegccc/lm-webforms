///<reference path="../../typings/webforms/WebFormsService.d.ts" />

import NewUser = require('../models/NewUser');
import InputFieldTypes = require('../../src/datatypes/InputFieldTypes');

interface TestControllerScope extends ng.IScope {
    returnedObject: string;
    error: string;
    onShowDialog: () => void;
    testedTypes: Array<string>;
    testType: (type: string) => void;
}

class TestController {
    constructor(scope: TestControllerScope, webForms: WebFormsService) {
        scope.returnedObject = '';
        scope.onShowDialog = () => {
            scope.returnedObject = '';
            scope.error = '';
            webForms.newObject<NewUser>('test/models/NewUser', null, null).then((user: NewUser) => {
                scope.returnedObject = JSON.stringify(user);
            }, (message: string) => {
                scope.error = message;
            });
        };

        scope.testType = (type: string) => {
            webForms.newObject<NewUser>('test/generated_model/' + type, null, null).then((user: NewUser) => {
                scope.returnedObject = JSON.stringify(user);
            }, (message: string) => {
                scope.error = message;
            });
        };

        scope.testedTypes = [
            InputFieldTypes.DYNAMIC_FIELD_LIST,
            InputFieldTypes.RICH_TEXT,
            InputFieldTypes.CODE_TEXT,
            InputFieldTypes.SELECT,
            InputFieldTypes.MULTI_SELECT,
            InputFieldTypes.FILE,
            InputFieldTypes.FILE_LIST,
            InputFieldTypes.PASSWORD,
            InputFieldTypes.PASSWORD_REPEAT,
            InputFieldTypes.NUMBER,
            InputFieldTypes.EMAIL,
            InputFieldTypes.IMAGE,
            InputFieldTypes.DATE,
            InputFieldTypes.HIDDEN,
            InputFieldTypes.TEXT,
            InputFieldTypes.BOOLEAN,
            InputFieldTypes.TYPEAHEAD,
            InputFieldTypes.MULTILINE_TEXT,
            InputFieldTypes.LABEL
        ];
    }
}

export = TestController;