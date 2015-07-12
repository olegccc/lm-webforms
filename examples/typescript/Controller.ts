///<reference path="../../typings/angularjs/angular.d.ts" />
///<reference path="../../release/interfaces/IWebFormsService.ts" />
///<reference path="./User.ts" />

interface ControllerScope extends ng.IScope {
    userName: string;
    userEmail: string;
    userCreated: boolean;
    onShowDialog: () => void;
}

class Controller {

    public constructor(scope: ControllerScope, webForms: IWebFormsService) {

        scope.userName = '';
        scope.userEmail = '';
        scope.userCreated = false;
        scope.onShowDialog = function() {

            webForms.newObject('/examples/models/user', null, null).then(function(user: User) {

                scope.userName = user.name;
                scope.userEmail = user.email;
                scope.userCreated = true;
            });
        }
    }
}
