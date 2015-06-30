/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

///<amd-dependency path="angular" />
import InputFormController = require('./InputFormController');
import DialogControllerScope = require('./DialogControllerScope');
import WebFormsConfiguration = require('../datatypes/WebFormsConfiguration');

class DialogController extends InputFormController {

    private qService:ng.IQService;
    private dialogScope:DialogControllerScope;

    constructor(scope:DialogControllerScope,
                dialogService:angular.material.MDDialogService,
                sceService:ng.ISCEService,
                serverConfiguration:WebFormsConfiguration,
                qService:ng.IQService) {

        super(scope, dialogService, sceService, serverConfiguration, scope.configuration.object, scope.definition, null,
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

import module = require('../module');

module.controller("dialog", [
    '$scope',
    '$mdDialog',
    '$sce',
    'serverConfiguration',
    'commandProcessor',
    '$q',
    DialogController
]);

export = DialogController;
