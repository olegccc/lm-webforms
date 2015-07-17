///<reference path="../../release/interfaces/IWebFormsService.ts" />

import NewUser = require('../models/NewUser');
import NewRecaptcha = require('../models/NewRecaptcha');

interface TestControllerScope extends ng.IScope {
    returnedObject: string;
    error: string;
    onShowDialog: () => void;
    testedTypes: Array<string>;
    testType: (type: string) => void;
    testRecaptcha: () => void;
}

class TestController {
    constructor(scope: TestControllerScope, webForms: IWebFormsService) {

        scope.returnedObject = '';

        scope.onShowDialog = () => {
            scope.returnedObject = '';
            scope.error = '';
            webForms.newObject<NewUser>('/test/models/NewUser', null, null).then((user: NewUser) => {
                scope.returnedObject = JSON.stringify(user);
            }, (message: string) => {
                scope.error = message;
            });
        };

        scope.testRecaptcha = () => {
            scope.returnedObject = '';
            scope.error = '';
            webForms.newObject<NewRecaptcha>('/test/models/recaptcha', null, null).then((data: NewRecaptcha) => {
                scope.returnedObject = JSON.stringify(data);
            }, (message: string) => {
                scope.error = message;
            });
        };

        scope.testType = (type: string) => {

            var obj = null;

            if (type === 'label') {
                obj = {
                    required: "Description1",
                    not_required: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac convallis sapien, sit amet congue dui. " +
                        "Aliquam eu purus vitae orci pharetra maximus. Suspendisse ac libero metus. Cras dignissim sollicitudin hendrerit. " +
                        "Sed eget dapibus tortor. Suspendisse dignissim, lectus at finibus tincidunt, tortor enim vestibulum nibh, a tincidunt " +
                        "felis orci et erat. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vestibulum ultrices erat in ultricies " +
                        "efficitur. Etiam fermentum viverra nunc ut tempor."
                }
            }

            webForms.newObject<NewUser>('/test/generated_model/' + type, obj, null).then((user: NewUser) => {
                scope.returnedObject = JSON.stringify(user);
            }, (message: string) => {
                scope.error = message;
            });
        };

        scope.testedTypes = [
            'dynamic_field_list',
            'rich_text',
            'code_text',
            'select',
            'multi_select',
            'file',
            'file_list',
            'password',
            'number',
            'email',
            'image',
            'date',
            'text',
            'boolean',
            'typeahead',
            'multiline_text',
            'label'
        ];
    }
}

export = TestController;
