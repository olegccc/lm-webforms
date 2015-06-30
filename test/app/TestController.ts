///<reference path="../../typings/webforms/WebFormsService.d.ts" />

import NewUser = require('../models/NewUser');

interface TestControllerScope extends ng.IScope {
    returnedObject: string;
    error: string;
    onShowDialog: () => void;
}

class TestController {
    constructor(scope: TestControllerScope, webForms: WebFormsService) {
        scope.returnedObject = '';
        scope.onShowDialog = () => {
            webForms.newObject<NewUser>('test/models/NewUser', null, null).then((user: NewUser) => {
                scope.returnedObject = JSON.stringify(user);
            }, (message: string) => {
                scope.error = message;
            })
        }
    }
}

export = TestController;