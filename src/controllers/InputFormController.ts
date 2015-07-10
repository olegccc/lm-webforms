/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file InputFormController.ts
 * @author Oleg Gordeev
 */

/**
 * @class InputFormController
 */
class InputFormController {

    private scope: InputFormControllerScope;
    private dialogService: angular.material.MDDialogService;
    private object: any;
    private definition: WebFormDefinition;
    private defer: ng.IDeferred<any>;
    private configuration: WebFormsConfiguration;
    private resolver: (object: any) => ng.IPromise<void>;

    constructor(scope: InputFormControllerScope,
                dialogService: angular.material.MDDialogService,
                configuration: WebFormsConfiguration,
                object: any,
                definition: WebFormDefinition,
                defer: ng.IDeferred<any>,
                resolver: (object: any) => ng.IPromise<void>) {

        this.scope = scope;
        this.dialogService = dialogService;
        this.object = object;
        this.definition = angular.copy(definition);
        this.defer = defer;
        this.configuration = configuration;
        this.resolver = resolver;
        this.scope.title = definition.title;

        scope.useCodemirror = _.some(definition.fields, (field: InputFieldDefinition): boolean => field.type === InputFieldTypes.CODE_TEXT);
        scope.submitError = '';
        scope.isApplying = false;
        scope.submitWithCaptcha = definition.useCaptcha;

        scope.okDisabled = (form) => {
            return this.okDisabled(form);
        };

        scope.codeMirrorDefaultOptions = InputFormController.getCodeMirrorDefaultOptions();

        scope.isNewObject = object === null;
        scope.object = object != null ? _.copy(object) : {};

        scope.fieldVisible = (field) => {
            if (!field.visibleFunction) {
                return true;
            }
            return field.visibleFunction(scope.object);
        };

        scope.submit = form => this.onSubmit(form);
        scope.cancel = () => this.onCancel();

        this.initializeFields();
    }

    protected okDisabled(form: ng.IFormController): boolean {
        return this.scope.isApplying || (!_.isUndefined(form) && form.$invalid);
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

        _.each(dynamicFields, (dynamicField: DynamicInputFieldDefinition) => {
            var dynamicDefinition: InputFieldDefinition = _.copy(dynamicField.field);
            dynamicDefinition.property = field.property + "$" + dynamicDefinition.property;
            dynamicDefinition.dynamicSource = dynamicField;
            dynamicDefinition.reference = null;
            this.addField(dynamicDefinition);
            this.scope.object[dynamicDefinition.property] = dynamicField.value;
        });
    }

    private addField(field: InputFieldDefinition) {

        if (field.repeat) {

            field = angular.copy(field);
            field.reference = null;
            field.repeat = false;

            this.addSimpleField(field);

            var repeatField = angular.copy(field);
            repeatField.property = field.property + Constants.FIELD_REPEAT_SUFFIX;
            repeatField.inlineWithPrevious = true;
            repeatField.reference = field.property;
            repeatField.required = false;
            repeatField.repeat = true;

            this.addSimpleField(repeatField);

        } else {
            field.reference = null;
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
                groupField.reference = null;
                fields[fields.length-1] = groupField;
            }
        }

        switch (field.type) {
            case InputFieldTypes.IMAGE:
            case InputFieldTypes.FILE:
                this.scope.object[field.property] = null;
                break;
            case InputFieldTypes.SELECT:
            case InputFieldTypes.MULTI_SELECT:
                if (!_.isArray(field.items) && _.isString(field.source)) {
                    var dataSource = this.configuration.getDataSource(field.source);
                    if (dataSource) {
                        field.items = dataSource.getSelectItems(field.source, this.object);
                    } else {
                        field.items = {};
                    }
                }
                field.itemsArray = [];
                _.forOwn(field.items, (value: any, key: string) => {
                    var definition = new SelectValueDefinition();
                    if (_.isString(value)) {
                        definition.key = key;
                        definition.text = value;
                        definition.isGroup = false;
                    } else {
                        definition.text = key;
                        definition.isGroup = true;
                        definition.items = [];
                        _.forOwn(value, (value: any, key: string) => {
                            var subDefinition = new SelectValueDefinition();
                            subDefinition.key = key;
                            subDefinition.text = value;
                            subDefinition.isGroup = false;
                            definition.items.push(subDefinition);
                        })
                    }
                    field.itemsArray.push(definition);
                });
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
        _.each(this.definition.fields, (field: InputFieldDefinition) => {
            this.processField(field);
        });
    }

    private onCloseDialog() {
        this.scope.$broadcast(Constants.DIALOG_CLOSE_EVENT);
    }

    private onOk() {
        this.onCloseDialog();
        this.dialogService.hide('ok');
    }

    private onCancel() {
        this.onCloseDialog();
        this.dialogService.hide('cancel');
    }

    private validateField(field: InputFieldDefinition, form: ng.IFormController) {

        if (!this.scope.fieldVisible(field) || field.readOnly || (field.readOnlyFunction && field.readOnlyFunction(this.scope.object))) {
            return;
        }

        if (field.isGroup) {
            _.each(field.children, (child: InputFieldDefinition) => {
                this.validateField(child, form);
            });
            return;
        }

        var formField = form[field.property];

        if (_.isUndefined(formField)) {
            return;
        }

        var value = this.scope.object[field.property];

        FormValidator.validate(this.scope.object, value, field, this.scope.isNewObject, this.configuration, (message: string) => {
            formField.$setDirty();
            formField.$setValidity(message, false);
        });
    }

    private onSubmit(form: ng.IFormController) {

        _.each(this.scope.fields, (field: InputFieldDefinition) => {
            this.validateField(field, form);
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

            var changed = _.copy(this.scope.object);

            _.each(this.scope.fields, (field: InputFieldDefinition) => {
                if (field.dynamicSource) {
                    delete changed[field.property];
                } else if (field.repeat) {
                    delete changed[field.property + Constants.FIELD_REPEAT_SUFFIX];
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
                this.onOk();
                this.defer.resolve(changed);
                return;
            }

            this.resolver(changed).then(() => {
                this.scope.isApplying = false;
                this.onOk();
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

webFormsModule.controller('inputForm', [
    '$scope',
    '$mdDialog',
    'webFormsConfiguration',
    'object',
    'definition',
    'defer',
    'resolver',
    InputFormController
]);
