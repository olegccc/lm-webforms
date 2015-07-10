/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file DialogControllerScope.ts
 * @author Oleg Gordeev
 */

/**
 * Scope definition for DialogController
 * @interface DialogControllerScope
 * @see DialogController
 */
interface DialogControllerScope extends InputFormControllerScope {
    changesApplied: boolean;
    hasChanges: boolean;
    openForm(form: ng.IFormController);
    definition: WebFormDefinition;
    submit: (changedObject: any) => ng.IPromise<any>;
    configuration: DialogControllerConfiguration;
    submitSuccess: string;
    submitError: string;
}
