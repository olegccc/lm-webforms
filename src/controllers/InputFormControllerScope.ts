/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

///<amd-dependency path="angular" />

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
    getFieldTemplate: (field: InputFieldDefinition) => string;
    fieldValueSelected: (field: InputFieldDefinition, select: SelectValueDefinition) => boolean;
    getValue: (field: InputFieldDefinition) => any;
    readOnly: (field: InputFieldDefinition) => string;
    getHelpText: (field: InputFieldDefinition) => string;
    fieldVisible: (field: InputFieldDefinition) => boolean;
    getTypeahead: (field: InputFieldDefinition, searchText: string) => string[];
    submit: (form: ng.IFormController) => void;
    cancel: () => void;
    showDateTimeField: (event, field: InputFieldDefinition) => void;
}

export = InputFormControllerScope;