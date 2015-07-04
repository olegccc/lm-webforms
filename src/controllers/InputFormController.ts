/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

///<amd-dependency path="Recaptcha" />
///<amd-dependency path="angular" />
/// <reference path="../../typings/recaptcha/recaptcha.d.ts" />

import _ = require('lodash');

import InputFormControllerScope = require('controllers/InputFormControllerScope');
import InputFieldTypes = require('datatypes/InputFieldTypes');
import FormValidator = require('common/FormValidator');
import WebFormsConfiguration = require('datatypes/WebFormsConfiguration');
import Constants = require('datatypes/Constants')

class InputFormController {

    private scope: InputFormControllerScope;
    private dialogService: angular.material.MDDialogService;
    private object: any;
    private definition: WebFormDefinition;
    private defer: ng.IDeferred<any>;
    private sceService: ng.ISCEService;
    private configuration: WebFormsConfiguration;
    private resolver: (object: any) => ng.IPromise<void>;

    constructor(scope: InputFormControllerScope,
                dialogService: angular.material.MDDialogService,
                sceService: ng.ISCEService,
                configuration: WebFormsConfiguration,
                object: any,
                definition: WebFormDefinition,
                defer: ng.IDeferred<any>,
                resolver: (object: any) => ng.IPromise<void>) {

        this.scope = scope;
        this.dialogService = dialogService;
        this.object = object;
        this.definition = definition;
        this.defer = defer;
        this.sceService = sceService;
        this.configuration = configuration;
        this.resolver = resolver;
        this.scope.title = definition.title;

        scope.useCodemirror = _.some(definition.fields, (field: InputFieldDefinition): boolean => field.type == InputFieldTypes.CODE_TEXT);
        scope.submitError = '';
        scope.isApplying = false;
        scope.submitWithCaptcha = definition.useCaptcha;

        scope.okDisabled = (form) => this.okDisabled(form);

        scope.codeMirrorDefaultOptions = InputFormController.getCodeMirrorDefaultOptions();

        scope.isNewObject = object === null;
        scope.object = object != null ? _.cloneDeep(object) : {};

        scope.fieldValueSelected = (field, select) => this.onFieldValueSelected(field, select);

        scope.getValue = (field: InputFieldDefinition) => {
            if (field.type === InputFieldTypes.RICH_TEXT && scope.readOnly(field).length > 0) {
                return sceService.trustAsHtml(object[field.property]);
            }
            return object[field.property];
        };

        scope.getHelpText = (field) => InputFormController.onGetHelpText(field);

        scope.fieldVisible = (field) => {
            if (!field.visibleFunction) {
                return true;
            }
            return field.visibleFunction(scope.object);
        };

        scope.readOnly = (field: InputFieldDefinition): string => {
            if (!field.readOnlyFunction) {
                return field.readOnly ? "readonly" : "";
            }
            return field.readOnlyFunction(scope.object) ? "readonly" : "";
        };

        scope.submit = form => this.onSubmit(form);
        scope.cancel = () => this.onCancel();

        scope.showDateTimeField = (event, field: InputFieldDefinition) => {
            event.preventDefault();
            event.stopPropagation();
            field.isOpen = true;
        };

        this.initializeFields();
    }

    protected okDisabled(form: ng.IFormController): boolean {
        return this.scope.isApplying || (!_.isUndefined(form) && form.$invalid);
    }

    private static onGetHelpText(field: InputFieldDefinition): string {
        var ret = field.helpText;
        if (ret == null) {
            ret = "";
        }
        return ret;
    }

    private static getCodeMirrorDefaultOptions(): any {
        return {
            mode: 'text/html',
            lineNumbers: true,
            lineWrapping: true,
            indentWithTabs: true,
            theme: 'default',
            extraKeys: {
                "F11": (cm: any) => {
                    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                },
                "Esc": (cm: any) => {
                    if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                }
            }
        };
    }

    private onFieldValueSelected (field: InputFieldDefinition, select: SelectValueDefinition) {
        var value = this.scope.object[field.property];
        switch (field.type) {
            case InputFieldTypes.SELECT:
                return select.value == value;
            case InputFieldTypes.MULTI_SELECT:
                if (!value) {
                    return false;
                }
                for (var i = 0; i < value.length; i++) {
                    if (value[i] == select.value) {
                        return true;
                    }
                }
                return false;
            default:
                return false;
        }
    }

    private processField(field: InputFieldDefinition) {

        switch (field.type) {
            case InputFieldTypes.DYNAMIC_FIELD_LIST:
                this.processDynamicFields(field);
                break;
            case InputFieldTypes.HIDDEN:
                break;
            default:
                this.addField(field);
                break;
        }
    }

    private processDynamicFields(field: InputFieldDefinition) {

        var dynamicFields: DynamicInputFieldDefinition[] = this.scope.object[field.property];

        if (!_.isArray(dynamicFields)) {
            return;
        }

        _.forEach(dynamicFields, (dynamicField: DynamicInputFieldDefinition) => {
            var dynamicDefinition: InputFieldDefinition = _.cloneDeep<InputFieldDefinition>(dynamicField.field);
            dynamicDefinition.property = field.property + "$" + dynamicDefinition.property;
            dynamicDefinition.dynamicSource = dynamicField;
            this.addField(dynamicDefinition);
            this.scope.object[dynamicDefinition.property] = dynamicField.value;
        });
    }

    private addField(field: InputFieldDefinition) {

        if (field.type === InputFieldTypes.PASSWORD_REPEAT) {

            field = _.cloneDeep<InputFieldDefinition>(field);
            field.type = InputFieldTypes.PASSWORD;

            this.addSimpleField(field);

            var passwordRepeat = _.cloneDeep<InputFieldDefinition>(field);
            passwordRepeat.property = field.property + Constants.PASSWORD_REPEAT_SUFFIX;
            passwordRepeat.inlineWithPrevious = true;
            passwordRepeat.reference = field.property;
            passwordRepeat.type = InputFieldTypes.PASSWORD_REPEAT;
            passwordRepeat.required = false;

            this.addSimpleField(passwordRepeat);

        } else {
            this.addSimpleField(field);
        }
    }

    private addSimpleField(field: InputFieldDefinition) {

        if (!this.scope.object.hasOwnProperty(field.property)) {
            if (_.isUndefined(field.defaultValue)) {
                this.scope.object[field.property] = "";
            } else {
                this.scope.object[field.property] = field.defaultValue;
            }
        }

        var fields: InputFieldDefinition[] = this.scope.fields;

        if (!field.inlineWithPrevious || fields.length === 0) {
            fields.push(field);
        } else {
            var lastField = fields[fields.length - 1];
            if (lastField.isGroup) {
                lastField.children.push(field);
            } else {
                var groupField: InputFieldDefinition = <any>{};
                groupField.isGroup = true;
                groupField.type = "";
                groupField.children = [];
                groupField.children.push(lastField);
                groupField.children.push(field);
                groupField.position = lastField.position;
                fields[fields.length-1] = groupField;
            }
        }

        switch (field.type) {
            case InputFieldTypes.IMAGE:
            case InputFieldTypes.FILE:
                this.scope.object[field.property] = null;
                break;
            case InputFieldTypes.SELECT:
                if (_.isArray(field.selectValues)) {
                    var valueDefinitions: SelectValueDefinition[] = <any> field.selectValues; // to hide compilation bug in IntelliJ IDEA
                    if (valueDefinitions.length > 0) {
                        this.scope.object[field.property] = valueDefinitions[0].value;
                    }
                }
                break;
            case InputFieldTypes.DATE:
                field.isOpen = false;
                break;
        }

        if (_.isBoolean(field.visible) || _.isString(field.visible)) {
            if (_.isBoolean(field.visible)) {
                var fieldVisible: boolean = <any>field.visible;
                field.visibleFunction = (obj:any) => fieldVisible;
            } else {
                field.visibleFunction = <(obj:any)=>boolean>(new Function("obj", "with(obj) { return " + field.visible + "; }"));
            }
        } else {
            field.visibleFunction = null;
        }

        if (_.isBoolean(field.readOnly) || (_.isString(field.readOnly))) {
            if (_.isBoolean(field.readOnly)) {
                var fieldReadOnly: boolean = <any> field.readOnly;
                field.readOnlyFunction = (obj:any) => fieldReadOnly;
            } else {
                field.readOnlyFunction = <(obj:any)=>boolean>(new Function("obj", "with(obj) { return " + field.readOnly + "; }"));
            }
        } else {
            field.readOnlyFunction = null;
        }
    }

    private initializeFields() {
        this.scope.fields = [];
        _.forEach(this.definition.fields, (field: InputFieldDefinition) => {
            this.processField(field);
        });
    }

    private onCancel() {
        this.dialogService.hide('cancel');
    }

    private onSubmit(form: ng.IFormController) {

        _.each(this.scope.fields, (field: InputFieldDefinition) => {

            if (!this.scope.fieldVisible(field) || this.scope.readOnly(field)) {
                return;
            }

            var formField = form[field.property];
            if (_.isObject(formField)) {
                formField.$setDirty();
            }

            var value = this.scope.object[field.property];

            FormValidator.validate(this.scope.object, value, field, this.scope.isNewObject, this.configuration, (message: string) => {
                formField.$setValidity(message, false);
            });
        });

        if (form.$invalid) {
            return;
        }

        _.each(this.scope.fields, (field: InputFieldDefinition) => {
            if (field.dynamicSource) {
                field.dynamicSource.value = this.scope.object[field.property];
            }
        });

        if (this.scope.submitWithCaptcha) {
            this.scope.object["-RecaptchaChallenge-"] = Recaptcha.get_challenge();
            this.scope.object["-RecaptchaResponse-"] = Recaptcha.get_response();
        }

        this.scope.submitError = "";
        this.scope.isApplying = true;

        try {

            var changed = _.cloneDeep(this.scope.object);

            _.each(this.scope.fields, (field: InputFieldDefinition) => {
                if (field.dynamicSource) {
                    delete changed[field.property];
                } else if (field.type == InputFieldTypes.PASSWORD_REPEAT) {
                    delete changed[field.property + Constants.PASSWORD_REPEAT_SUFFIX];
                }
            });

            _.each(this.definition.fields, (field: InputFieldDefinition) => {
                if (field.type == InputFieldTypes.DYNAMIC_FIELD_LIST) {
                    var dynamicFields: DynamicInputFieldDefinition[] = changed[field.property];
                    if (dynamicFields != null) {
                        _.each(dynamicFields, (dynamicField: DynamicInputFieldDefinition) => {
                            var property = dynamicField.field.property;
                            dynamicField.field = <any>{};
                            dynamicField.field.property = property;
                        });
                    }
                }
            });

            if (this.resolver == null) {
                this.dialogService.hide();
                this.defer.resolve(changed);
                return;
            }

            this.resolver(changed).then(() => {
                this.scope.isApplying = false;
                this.dialogService.hide();
                if (this.defer != null) {
                    this.defer.resolve(changed);
                }
            }, (message: string) => {
                this.scope.isApplying = false;
                this.scope.submitError = message;
                if (this.scope.submitWithCaptcha) {
                    Recaptcha.reload();
                }
            });
        } catch (err) {
            this.scope.isApplying = false;
            this.scope.submitError = err.toString();
        }
    }
}

import module = require('modules/WebFormsModule');

module.controller('inputForm', [
    '$scope',
    '$mdDialog',
    '$sce',
    'webFormsConfiguration',
    'object',
    'definition',
    'defer',
    'resolver',
    InputFormController
]);

export = InputFormController;
