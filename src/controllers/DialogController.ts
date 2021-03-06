/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file DialogController.ts
 * @author Oleg Gordeev
 */

/// <reference path="./InputFormController.ts" />

/**
 * Controller class for dialog page
 * @class DialogController
 */
class DialogController extends InputFormController {

    private qService:ng.IQService;
    private dialogScope:DialogControllerScope;

    constructor(scope:DialogControllerScope,
                dialogService:angular.material.MDDialogService,
                configuration:WebFormsConfiguration,
                qService:ng.IQService) {

        super(scope, dialogService, configuration, scope.configuration.object, scope.definition, null,
                changedObject => this.successFunction(changedObject));

        this.qService = qService;
        this.dialogScope = scope;

        scope.submitError = "";
        scope.submitSuccess = "";
        scope.hasChanges = false;
        scope.changesApplied = false;

        scope.openForm = (form: ng.IFormController) => {
            form.$setPristine();
            scope.changesApplied = false;
            scope.submitError = "";
            scope.submitSuccess = "";
        };

        scope.$watch('object', (newValue, oldValue) => {
            if (newValue !== oldValue) {
                this.onDataChanged();
            }
        }, true);
    }

    protected okDisabled(form: ng.IFormController): boolean {
        return super.okDisabled(form) || !this.dialogScope.hasChanges;
    }

    private onDataChanged() {
        this.dialogScope.hasChanges = true;
        this.dialogScope.submitError = '';
        this.dialogScope.submitSuccess = '';
    }

    protected successFunction(changedObject):ng.IPromise<void> {
        var deferred:ng.IDeferred<void> = this.qService.defer<void>();
        this.dialogScope.submit(changedObject)
            .then((data:any) => {
                this.dialogScope.hasChanges = false;
                this.dialogScope.changesApplied = true;
                this.dialogScope.submitSuccess = data.message;
                deferred.resolve();
            }, (message:string) => deferred.reject(message));

        return deferred.promise;
    }
}

webFormsModule.controller("dialog", [
    '$scope',
    '$mdDialog',
    'webFormsConfiguration',
    'commandProcessor',
    '$q',
    DialogController
]);
