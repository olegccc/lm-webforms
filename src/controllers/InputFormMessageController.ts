/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

///<amd-dependency path="angular" />

interface InputFormMessageControllerScope extends ng.IScope {
    message: string;
    title: string;
    close: () => void;
}

class InputFormMessageController {
    constructor(scope: InputFormMessageControllerScope,
                dialogService: angular.material.MDDialogService,
                message: string,
                title: string,
                defer: ng.IDeferred<any>) {

        scope.message = message;
        scope.title = title;
        scope.close = () => {
            dialogService.hide();
            defer.resolve();
        };
    }
}

import module = require('../module');

module.controller('inputFormMessage', [
    '$scope',
    '$mdDialog',
    'message',
    'title',
    'defer',
    InputFormMessageController
]);
