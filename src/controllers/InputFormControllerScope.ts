/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file InputFormControllerScope.ts
 * @author Oleg Gordeev
 */

/**
 * @interface InputFormControllerScope
 * @see InputFormController
 */
interface InputFormControllerScope extends ng.IScope {
    fields: InputFieldDefinition[];
    title: string;
    submitError: string;
    isApplying: boolean;
    submitWithCaptcha: boolean;
    okDisabled(form: ng.IFormController): boolean;
    codeMirrorDefaultOptions: any;
    useCodemirror: boolean;
    isNewObject: boolean;
    object: any;
    fieldValueSelected: (field: InputFieldDefinition, select: SelectValueDefinition) => boolean;
    fieldVisible: (field: InputFieldDefinition) => boolean;
    submit: (form: ng.IFormController) => void;
    cancel: () => void;
}
