/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file InputFormQuestionController.ts
 * @author Oleg Gordeev
 */

/**
 * @interface InputFormQuestionControllerScope
 * @see InputFormQuestionController
 */
interface InputFormQuestionControllerScope extends ng.IScope {
    message: string;
    title: string;
    close: () => void;
    submitError: string;
    isApplying: boolean;
}

/**
 * @class InputFormQuestionController
 */
class InputFormQuestionController {
    constructor(scope: InputFormQuestionControllerScope,
                dialogService: angular.material.MDDialogService,
                message: string,
                title: string,
                defer: ng.IDeferred<any>,
                resolver: () => ng.IPromise<void>) {

        scope.message = message;
        scope.title = title;
        scope.submitError = "";
        scope.isApplying = false;
        scope.close = () => {
            if (resolver == null) {
                dialogService.hide();
                defer.resolve();
            }

            scope.submitError = "";
            scope.isApplying = true;
            var promise: ng.IPromise<void> = resolver();
            promise.then(() => {
                dialogService.hide();
                scope.isApplying = false;
                defer.resolve();
            }, (message: string) => {
                scope.submitError = message;
                scope.isApplying = false;
            });
        };
    }
}

webFormsModule.controller('inputFormQuestion', [
    '$scope',
    '$mdDialog',
    'message',
    'title',
    'defer',
    'resolver',
    InputFormQuestionController
]);
