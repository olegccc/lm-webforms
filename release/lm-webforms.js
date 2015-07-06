/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('datatypes/InputFieldTypes',["require", "exports"], function (require, exports) {
    var InputFieldTypes = (function () {
        function InputFieldTypes() {
        }
        InputFieldTypes.DYNAMIC_FIELD_LIST = "dynamic_field_list";
        InputFieldTypes.RICH_TEXT = "rich_text";
        InputFieldTypes.CODE_TEXT = "code_text";
        InputFieldTypes.SELECT = "select";
        InputFieldTypes.MULTI_SELECT = "multi_select";
        InputFieldTypes.FILE = "file";
        InputFieldTypes.FILE_LIST = "file_list";
        InputFieldTypes.PASSWORD = "password";
        InputFieldTypes.PASSWORD_REPEAT = "password_repeat";
        InputFieldTypes.NUMBER = "number";
        InputFieldTypes.EMAIL = "email";
        InputFieldTypes.IMAGE = "image";
        InputFieldTypes.DATE = "date";
        InputFieldTypes.HIDDEN = "hidden";
        InputFieldTypes.TEXT = "text";
        InputFieldTypes.BOOLEAN = "boolean";
        InputFieldTypes.TYPEAHEAD = "typeahead";
        InputFieldTypes.MULTILINE_TEXT = "multiline_text";
        InputFieldTypes.LABEL = "label";
        return InputFieldTypes;
    })();
    return InputFieldTypes;
});

define('datatypes/Constants',["require", "exports"], function (require, exports) {
    var Constants = (function () {
        function Constants() {
        }
        Constants.PASSWORD_REPEAT_SUFFIX = "$Repeat";
        return Constants;
    })();
    return Constants;
});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('common/FormValidator',["require", "exports", 'datatypes/Constants', 'datatypes/InputFieldTypes', "angular"], function (require, exports, Constants, InputFieldTypes) {
    var FormValidator = (function () {
        function FormValidator() {
        }
        FormValidator.validate = function (object, value, field, isNewObject, configuration, onFieldInvalid) {
            switch (field.type) {
                case InputFieldTypes.FILE:
                    if (field.required && isNewObject && (value === null || value.file === null || value.file.length === 0)) {
                        onFieldInvalid('required');
                    }
                    if (configuration.maximumFileSize > 0 && value !== null && value.file.length > configuration.maximumFileSize) {
                        onFieldInvalid('maxlength');
                    }
                    return;
                case InputFieldTypes.FILE_LIST:
                    if (field.required && isNewObject && (value === null || value.length === 0)) {
                        onFieldInvalid('required');
                    }
                    if (value !== null) {
                        for (var j = 0; j < value.length; j++) {
                            var file = value[j];
                            if (file.file !== null && file.file.length > configuration.maximumFileSize) {
                                onFieldInvalid('maxlength');
                                break;
                            }
                        }
                    }
                    return;
                case InputFieldTypes.MULTI_SELECT:
                    return;
            }
            if (typeof (value) === 'undefined' || value === null || value.toString().trim().length === 0) {
                if (field.required) {
                    onFieldInvalid('required');
                }
                return;
            }
            switch (field.type) {
                case InputFieldTypes.NUMBER:
                    if (_.isNaN(parseFloat(value))) {
                        onFieldInvalid('number');
                    }
                    break;
                case InputFieldTypes.EMAIL:
                    if (!_.isString(value) || !value.search(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/)) {
                        onFieldInvalid('email');
                    }
                    break;
                case InputFieldTypes.PASSWORD_REPEAT:
                    var repeatPassword = object[field.property + Constants.PASSWORD_REPEAT_SUFFIX];
                    if (!_.isString(repeatPassword) || repeatPassword !== value) {
                        onFieldInvalid('password_match');
                    }
            }
        };
        return FormValidator;
    })();
    return FormValidator;
});

///<amd-dependency path="angular" />
///<amd-dependency path="angular.material" />
///<amd-dependency path="angular.animate" />
///<amd-dependency path="angular.touch" />
///<amd-dependency path="angular.translate" />
define('modules/WebFormsModule',["require", "exports", "angular", "angular.material", "angular.animate", "angular.touch", "angular.translate"], function (require, exports) {
    var module = angular.module('lm-webforms', [
        'ngMaterial',
        'ngTouch',
        'ngMessages',
        'ngAnimate',
        'pascalprecht.translate'
    ]);
    return module;
});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('controllers/InputFormController',["require", "exports", 'lodash', 'datatypes/InputFieldTypes', 'common/FormValidator', 'datatypes/Constants', 'modules/WebFormsModule', "Recaptcha", "angular"], function (require, exports, _, InputFieldTypes, FormValidator, Constants, module) {
    var InputFormController = (function () {
        function InputFormController(scope, dialogService, sceService, configuration, object, definition, defer, resolver) {
            var _this = this;
            this.scope = scope;
            this.dialogService = dialogService;
            this.object = object;
            this.definition = definition;
            this.defer = defer;
            this.sceService = sceService;
            this.configuration = configuration;
            this.resolver = resolver;
            this.scope.title = definition.title;
            scope.useCodemirror = _.some(definition.fields, function (field) { return field.type == InputFieldTypes.CODE_TEXT; });
            scope.submitError = '';
            scope.isApplying = false;
            scope.submitWithCaptcha = definition.useCaptcha;
            scope.okDisabled = function (form) { return _this.okDisabled(form); };
            scope.codeMirrorDefaultOptions = InputFormController.getCodeMirrorDefaultOptions();
            scope.isNewObject = object === null;
            scope.object = object != null ? _.cloneDeep(object) : {};
            scope.fieldValueSelected = function (field, select) { return _this.onFieldValueSelected(field, select); };
            scope.getValue = function (field) {
                if (field.type === InputFieldTypes.RICH_TEXT && scope.readOnly(field).length > 0) {
                    return sceService.trustAsHtml(object[field.property]);
                }
                return object[field.property];
            };
            scope.getHelpText = function (field) { return InputFormController.onGetHelpText(field); };
            scope.fieldVisible = function (field) {
                if (!field.visibleFunction) {
                    return true;
                }
                return field.visibleFunction(scope.object);
            };
            scope.readOnly = function (field) {
                if (!field.readOnlyFunction) {
                    return field.readOnly ? "readonly" : "";
                }
                return field.readOnlyFunction(scope.object) ? "readonly" : "";
            };
            scope.submit = function (form) { return _this.onSubmit(form); };
            scope.cancel = function () { return _this.onCancel(); };
            scope.showDateTimeField = function (event, field) {
                event.preventDefault();
                event.stopPropagation();
                field.isOpen = true;
            };
            this.initializeFields();
        }
        InputFormController.prototype.okDisabled = function (form) {
            return this.scope.isApplying || (!_.isUndefined(form) && form.$invalid);
        };
        InputFormController.onGetHelpText = function (field) {
            var ret = field.helpText;
            if (ret == null) {
                ret = "";
            }
            return ret;
        };
        InputFormController.getCodeMirrorDefaultOptions = function () {
            return {
                mode: 'text/html',
                lineNumbers: true,
                lineWrapping: true,
                indentWithTabs: true,
                theme: 'default',
                extraKeys: {
                    "F11": function (cm) {
                        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                    },
                    "Esc": function (cm) {
                        if (cm.getOption("fullScreen"))
                            cm.setOption("fullScreen", false);
                    }
                }
            };
        };
        InputFormController.prototype.onFieldValueSelected = function (field, select) {
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
        };
        InputFormController.prototype.processField = function (field) {
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
        };
        InputFormController.prototype.processDynamicFields = function (field) {
            var _this = this;
            var dynamicFields = this.scope.object[field.property];
            if (!_.isArray(dynamicFields)) {
                return;
            }
            _.forEach(dynamicFields, function (dynamicField) {
                var dynamicDefinition = _.cloneDeep(dynamicField.field);
                dynamicDefinition.property = field.property + "$" + dynamicDefinition.property;
                dynamicDefinition.dynamicSource = dynamicField;
                _this.addField(dynamicDefinition);
                _this.scope.object[dynamicDefinition.property] = dynamicField.value;
            });
        };
        InputFormController.prototype.addField = function (field) {
            if (field.type === InputFieldTypes.PASSWORD_REPEAT) {
                field = _.cloneDeep(field);
                field.type = InputFieldTypes.PASSWORD;
                this.addSimpleField(field);
                var passwordRepeat = _.cloneDeep(field);
                passwordRepeat.property = field.property + Constants.PASSWORD_REPEAT_SUFFIX;
                passwordRepeat.inlineWithPrevious = true;
                passwordRepeat.reference = field.property;
                passwordRepeat.type = InputFieldTypes.PASSWORD_REPEAT;
                passwordRepeat.required = false;
                this.addSimpleField(passwordRepeat);
            }
            else {
                this.addSimpleField(field);
            }
        };
        InputFormController.prototype.addSimpleField = function (field) {
            if (!this.scope.object.hasOwnProperty(field.property)) {
                if (_.isUndefined(field.defaultValue)) {
                    this.scope.object[field.property] = "";
                }
                else {
                    this.scope.object[field.property] = field.defaultValue;
                }
            }
            var fields = this.scope.fields;
            if (!field.inlineWithPrevious || fields.length === 0) {
                fields.push(field);
            }
            else {
                var lastField = fields[fields.length - 1];
                if (lastField.isGroup) {
                    lastField.children.push(field);
                }
                else {
                    var groupField = {};
                    groupField.isGroup = true;
                    groupField.type = "";
                    groupField.children = [];
                    groupField.children.push(lastField);
                    groupField.children.push(field);
                    groupField.position = lastField.position;
                    fields[fields.length - 1] = groupField;
                }
            }
            switch (field.type) {
                case InputFieldTypes.IMAGE:
                case InputFieldTypes.FILE:
                    this.scope.object[field.property] = null;
                    break;
                case InputFieldTypes.SELECT:
                    if (_.isArray(field.selectValues)) {
                        var valueDefinitions = field.selectValues;
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
                    var fieldVisible = field.visible;
                    field.visibleFunction = function (obj) { return fieldVisible; };
                }
                else {
                    field.visibleFunction = (new Function("obj", "with(obj) { return " + field.visible + "; }"));
                }
            }
            else {
                field.visibleFunction = null;
            }
            if (_.isBoolean(field.readOnly) || (_.isString(field.readOnly))) {
                if (_.isBoolean(field.readOnly)) {
                    var fieldReadOnly = field.readOnly;
                    field.readOnlyFunction = function (obj) { return fieldReadOnly; };
                }
                else {
                    field.readOnlyFunction = (new Function("obj", "with(obj) { return " + field.readOnly + "; }"));
                }
            }
            else {
                field.readOnlyFunction = null;
            }
        };
        InputFormController.prototype.initializeFields = function () {
            var _this = this;
            this.scope.fields = [];
            _.forEach(this.definition.fields, function (field) {
                _this.processField(field);
            });
        };
        InputFormController.prototype.onCancel = function () {
            this.dialogService.hide('cancel');
        };
        InputFormController.prototype.onSubmit = function (form) {
            var _this = this;
            _.each(this.scope.fields, function (field) {
                if (!_this.scope.fieldVisible(field) || _this.scope.readOnly(field)) {
                    return;
                }
                var formField = form[field.property];
                if (_.isObject(formField)) {
                    formField.$setDirty();
                }
                var value = _this.scope.object[field.property];
                FormValidator.validate(_this.scope.object, value, field, _this.scope.isNewObject, _this.configuration, function (message) {
                    formField.$setValidity(message, false);
                });
            });
            if (form.$invalid) {
                return;
            }
            _.each(this.scope.fields, function (field) {
                if (field.dynamicSource) {
                    field.dynamicSource.value = _this.scope.object[field.property];
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
                _.each(this.scope.fields, function (field) {
                    if (field.dynamicSource) {
                        delete changed[field.property];
                    }
                    else if (field.type == InputFieldTypes.PASSWORD_REPEAT) {
                        delete changed[field.property + Constants.PASSWORD_REPEAT_SUFFIX];
                    }
                });
                _.each(this.definition.fields, function (field) {
                    if (field.type == InputFieldTypes.DYNAMIC_FIELD_LIST) {
                        var dynamicFields = changed[field.property];
                        if (dynamicFields != null) {
                            _.each(dynamicFields, function (dynamicField) {
                                var property = dynamicField.field.property;
                                dynamicField.field = {};
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
                this.resolver(changed).then(function () {
                    _this.scope.isApplying = false;
                    _this.dialogService.hide();
                    if (_this.defer != null) {
                        _this.defer.resolve(changed);
                    }
                }, function (message) {
                    _this.scope.isApplying = false;
                    _this.scope.submitError = message;
                    if (_this.scope.submitWithCaptcha) {
                        Recaptcha.reload();
                    }
                });
            }
            catch (err) {
                this.scope.isApplying = false;
                this.scope.submitError = err.toString();
            }
        };
        return InputFormController;
    })();
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
    return InputFormController;
});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define('controllers/DialogController',["require", "exports", 'controllers/InputFormController', 'modules/WebFormsModule', "angular"], function (require, exports, InputFormController, module) {
    var DialogController = (function (_super) {
        __extends(DialogController, _super);
        function DialogController(scope, dialogService, sceService, configuration, qService) {
            var _this = this;
            _super.call(this, scope, dialogService, sceService, configuration, scope.configuration.object, scope.definition, null, function (changedObject) { return _this.successFunction(changedObject); });
            this.qService = qService;
            this.dialogScope = scope;
            scope.submitError = "";
            scope.submitSuccess = "";
            scope.hasChanges = false;
            scope.changesApplied = false;
            scope.openForm = function (form) {
                form.$setPristine();
                scope.changesApplied = false;
                scope.submitError = "";
                scope.submitSuccess = "";
            };
            scope.$watch('object', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    _this.onDataChanged();
                }
            }, true);
        }
        DialogController.prototype.okDisabled = function (form) {
            return _super.prototype.okDisabled.call(this, form) || !this.dialogScope.hasChanges;
        };
        DialogController.prototype.onDataChanged = function () {
            this.dialogScope.hasChanges = true;
            this.dialogScope.submitError = '';
            this.dialogScope.submitSuccess = '';
        };
        DialogController.prototype.successFunction = function (changedObject) {
            var _this = this;
            var deferred = this.qService.defer();
            this.dialogScope.submit(changedObject)
                .then(function (data) {
                _this.dialogScope.hasChanges = false;
                _this.dialogScope.changesApplied = true;
                _this.dialogScope.submitSuccess = data.message;
                deferred.resolve();
            }, function (message) { return deferred.reject(message); });
            return deferred.promise;
        };
        return DialogController;
    })(InputFormController);
    module.controller("dialog", [
        '$scope',
        '$mdDialog',
        '$sce',
        'webFormsConfiguration',
        'commandProcessor',
        '$q',
        DialogController
    ]);
    return DialogController;
});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('controllers/InputFormMessageController',["require", "exports", 'modules/WebFormsModule', "angular"], function (require, exports, module) {
    var InputFormMessageController = (function () {
        function InputFormMessageController(scope, dialogService, message, title, defer) {
            scope.message = message;
            scope.title = title;
            scope.close = function () {
                dialogService.hide();
                defer.resolve();
            };
        }
        return InputFormMessageController;
    })();
    module.controller('inputFormMessage', [
        '$scope',
        '$mdDialog',
        'message',
        'title',
        'defer',
        InputFormMessageController
    ]);
});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('controllers/InputFormQuestionController',["require", "exports", 'modules/WebFormsModule', "angular"], function (require, exports, module) {
    var InputFormQuestionController = (function () {
        function InputFormQuestionController(scope, dialogService, message, title, defer, resolver) {
            scope.message = message;
            scope.title = title;
            scope.submitError = "";
            scope.isApplying = false;
            scope.close = function () {
                if (resolver == null) {
                    dialogService.hide();
                    defer.resolve();
                }
                scope.submitError = "";
                scope.isApplying = true;
                var promise = resolver();
                promise.then(function () {
                    dialogService.hide();
                    scope.isApplying = false;
                    defer.resolve();
                }, function (message) {
                    scope.submitError = message;
                    scope.isApplying = false;
                });
            };
        }
        return InputFormQuestionController;
    })();
    module.controller('inputFormQuestion', [
        '$scope',
        '$mdDialog',
        'message',
        'title',
        'defer',
        'resolver',
        InputFormQuestionController
    ]);
});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('directives/CkEditorDirective',["require", "exports", 'lodash', 'modules/WebFormsModule', "angular"], function (require, exports, _, module) {
    var CkEditorOptions = (function () {
        function CkEditorOptions() {
        }
        return CkEditorOptions;
    })();
    var CkEditorDirectiveLink = (function () {
        function CkEditorDirectiveLink(scope, element, model, inputContainer, configuration, friendlyFormatting, ckeditor) {
            var _this = this;
            this.smileIdToCode = {};
            this.smileCodeToId = {};
            this.configuration = configuration;
            this.options = new CkEditorOptions();
            this.scope = scope;
            this.friendlyFormatting = friendlyFormatting;
            this.model = model;
            this.inputContainer = inputContainer;
            this.initializeSmiles();
            inputContainer.setHasValue(true);
            this.editor = ckeditor.appendTo(element[0], this.options);
            this.editor.on('change', function () { return _this.applyChanges(); });
            this.editor.on('key', function () { return _this.applyChanges(); });
            this.editor.on('focus', function () { return _this.inputContainer.setFocused(true); });
            this.editor.on('blur', function () { return _this.inputContainer.setFocused(false); });
            model.$render = function () { return _this.render(); };
        }
        CkEditorDirectiveLink.prototype.updateEditorState = function (newValue) {
            this.inputContainer.setHasValue(true);
            this.inputContainer.setInvalid(this.model.$invalid && this.model.$touched);
        };
        CkEditorDirectiveLink.prototype.render = function () {
            var text = this.model.$viewValue || '';
            if (text && this.friendlyFormatting.getSmilesExpression()) {
                text = this.friendlyFormatting.smilesToImg(text);
            }
            this.editor.setData(text);
            this.updateEditorState(text);
        };
        CkEditorDirectiveLink.prototype.applyChanges = function () {
            var _this = this;
            this.scope.$apply(function () { return _this.setViewValue(); });
        };
        CkEditorDirectiveLink.prototype.setViewValue = function () {
            var _this = this;
            var text = this.editor.getData();
            if (this.friendlyFormatting.getSmilesExpression() != null) {
                text = text.replace(/<img\s+alt="([^"]*)"\s+src="[^"]*"\s+(?:style="[^"]*"\s+)?title="([^"]*)"\s+\/?>/gi, function (match, alt, title) {
                    if (!alt || !title || alt != title) {
                        return match;
                    }
                    if (!_this.smileCodeToId.hasOwnProperty(alt)) {
                        return match;
                    }
                    return alt;
                });
            }
            this.model.$setViewValue(text);
            this.model.$setTouched();
            this.updateEditorState(text);
        };
        CkEditorDirectiveLink.prototype.initializeSmiles = function () {
            var _this = this;
            if (!this.configuration.smilesBase || this.configuration.smilesBase.length === 0 || !this.configuration.smiles || this.configuration.smiles.length === 0) {
                return;
            }
            this.options.smiley_path = this.configuration.smilesBase;
            this.options.smiley_descriptions = [];
            this.options.smiley_images = [];
            _.forEach(this.configuration.smiles, function (smile) {
                _this.smileCodeToId[smile.code] = smile.id;
                _this.smileIdToCode[smile.id] = smile.code;
                _this.options.smiley_descriptions.push(smile.code);
                _this.options.smiley_images.push(smile.id);
            });
        };
        return CkEditorDirectiveLink;
    })();
    module.directive('ckEditor', ['webFormsConfiguration', 'friendlyFormatting', function (configuration, friendlyFormatting) {
            return {
                require: ['?ngModel', '^?mdInputContainer'],
                restrict: 'AE',
                replace: false,
                scope: {
                    options: '=',
                    readonly: '='
                },
                link: function (scope, element, attrs, controllers) {
                    require(['ckeditor'], function (ckeditor) {
                        return new CkEditorDirectiveLink(scope, element, controllers[0], controllers[1], configuration, friendlyFormatting, ckeditor);
                    });
                }
            };
        }]);
});


define('text!views/codemirror.html',[],function () { return '<div class="md-input CodeMirrorInput"></div>';});

// Based on https://github.com/angular-ui/ui-codemirror
// The goal of refactoring is to take advantage of using AMD and TypeScript and integrate it with angular.material
define('directives/CodeMirrorDirective',["require", "exports", 'modules/WebFormsModule', "angular", "text!views/codemirror.html"], function (require, exports, module) {
    /// <reference path="../../typings/requirejs/require.d.ts" />
    var template = require('text!views/codemirror.html');
    var CodeMirrorDirectivePostLink = (function () {
        function CodeMirrorDirectivePostLink(scope, element, iAttrs, model, Codemirror, container) {
            var _this = this;
            this.scope = scope;
            this.model = model;
            this.inputContainer = container;
            if (_.isUndefined(scope.options)) {
                scope.options = {};
            }
            var newValue = this.model.$viewValue || '';
            scope.options.lineNumbers = true;
            scope.options.mode = "htmlmixed";
            scope.options.inputStyle = "textarea";
            scope.options.value = newValue;
            this.editor = this.createEditor(element, scope.options, Codemirror);
            this.configOptionsWatcher(iAttrs.uiCodemirror || iAttrs.uiCodemirrorOpts);
            this.configNgModelLink();
            this.configUiRefreshAttribute(iAttrs.uiRefresh);
            scope.$on('CodeMirror', function (event, callback) {
                if (_.isFunction(callback)) {
                    callback(_this.editor);
                }
                else {
                    throw new Error('the CodeMirror event requires a callback function');
                }
            });
            this.updateEditorState(newValue);
        }
        CodeMirrorDirectivePostLink.prototype.createEditor = function (element, codemirrorOptions, CodeMirror) {
            return new CodeMirror(function (editorInstance) {
                element.append(editorInstance);
            }, codemirrorOptions);
        };
        CodeMirrorDirectivePostLink.prototype.configOptionsWatcher = function (uiCodemirrorAttr) {
            var _this = this;
            if (!uiCodemirrorAttr) {
                return;
            }
            var codemirrorDefaultsKeys = Object.keys(CodeMirror.CodeMirror.defaults);
            this.scope.$watch('options', function (newValues, oldValue) {
                if (!_.isObject(newValues)) {
                    return;
                }
                codemirrorDefaultsKeys.forEach(function (key) {
                    if (newValues.hasOwnProperty(key)) {
                        if (oldValue && newValues[key] === oldValue[key]) {
                            return;
                        }
                        _this.editor.setOption(key, newValues[key]);
                    }
                });
            }, true);
        };
        CodeMirrorDirectivePostLink.prototype.updateEditorState = function (newValue) {
            this.inputContainer.setHasValue(!_.isEmpty(newValue));
            this.inputContainer.setInvalid(this.model.$invalid && this.model.$touched);
        };
        CodeMirrorDirectivePostLink.prototype.configNgModelLink = function () {
            var _this = this;
            if (!this.model) {
                return;
            }
            this.model.$formatters.push(function (value) {
                if (angular.isUndefined(value) || value === null) {
                    return '';
                }
                else if (angular.isObject(value) || angular.isArray(value)) {
                    throw new Error('ui-codemirror cannot use an object or an array as a model');
                }
                return value;
            });
            this.model.$render = function () {
                var safeViewValue = _this.model.$viewValue || '';
                _this.editor.setValue(safeViewValue);
                _this.updateEditorState(safeViewValue);
            };
            this.editor.on('change', function (instance) {
                var newValue = instance.getValue();
                if (newValue !== _this.model.$viewValue) {
                    _this.scope.$evalAsync(function () {
                        _this.model.$setViewValue(newValue);
                        _this.model.$setTouched();
                        _this.updateEditorState(newValue);
                    });
                }
            });
            this.editor.on('focus', function () {
                _this.inputContainer.setFocused(true);
            });
            this.editor.on('blur', function () {
                _this.inputContainer.setFocused(false);
            });
        };
        CodeMirrorDirectivePostLink.prototype.configUiRefreshAttribute = function (uiRefreshAttr) {
            var _this = this;
            if (!uiRefreshAttr) {
                return;
            }
            this.scope.$watch(uiRefreshAttr, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    _this.scope.$evalAsync(function () {
                        _this.editor.refresh();
                    });
                }
            });
        };
        return CodeMirrorDirectivePostLink;
    })();
    module.directive('uiCodemirror', ['webFormsConfiguration', function (configuration) {
            return {
                restrict: 'E',
                template: template,
                replace: true,
                require: ['?ngModel', '^?mdInputContainer'],
                scope: {
                    options: '=',
                    readonly: '='
                },
                link: function (scope, element, attrs, controllers) {
                    var requiredModules = ['codemirror'];
                    if (configuration.codeMirrorModules && configuration.codeMirrorModules.length) {
                        requiredModules = _.union(requiredModules, configuration.codeMirrorModules);
                    }
                    require(requiredModules, function (codemirror) {
                        new CodeMirrorDirectivePostLink(scope, element, attrs, controllers[0], codemirror, controllers[1]);
                    });
                }
            };
        }]);
});


define('text!views/webDialog.html',[],function () { return '<div ng-form="form"><div ng-if="!changesApplied"><md-content layout-padding="layout-padding" layout="column"><style>md-input-container.inputfield-file label {\n    flex: none;\n    -webkit-flex: none;\n    transform: none !important;\n}\n</style><div ng-repeat="field in fields | orderBy: \'position\'"><input-field field="field" object="object" form="form" ng-if="fieldVisible(field) &amp;&amp; !field.isGroup"></input-field><div ng-if="field.isGroup" layout="row" layout-sm="column"><input-field ng-repeat="child in field.children" field="child" object="object" form="form" ng-if="fieldVisible(child)" flex=""></input-field></div></div><div ng-if="submitWithCaptcha" captcha="recaptchaPublicKey"></div><div ng-if="submitError.length &gt; 0" class="bg-danger dialog-notification"><span class="glyphicon glyphicon-exclamation-sign"></span><span ng-bind="submitError"></span></div><div ng-if="submitSuccess.length &gt; 0" class="bg-success dialog-notification"><span class="glyphicon glyphicon-ok-circle"></span><span ng-bind="submitSuccess"></span></div></md-content><md-content layout-padding="layout-padding"><md-button ng-click="submit(form)" ng-disabled="okDisabled(form)" class="md-raised md-primary"><span ng-bind="applyCaption | translate"></span><md-progress-circular ng-show="isApplying" md-mode="indeterminate" md-diameter="10"></md-progress-circular></md-button></md-content></div><div ng-if="changesApplied"><div ng-bind="submitSuccess" class="bg-success dialog-notification"></div><md-content layout-padding="layout-padding"><md-button ng-click="openForm(form)" ng-bind="\'Open Form\' | translate" aria-label="Open" class="md-raised"></md-button></md-content></div></div>';});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('directives/DialogDirective',["require", "exports", 'modules/WebFormsModule', 'controllers/DialogController', "angular", "text!views/webDialog.html"], function (require, exports, module, DialogController) {
    var template = require('text!views/webDialog.html');
    module.directive('lmDialog', [function () {
            return {
                template: template,
                restrict: 'E',
                replace: false,
                scope: {
                    configuration: '='
                },
                controller: DialogController
            };
        }]);
});


define('text!views/fileRead.html',[],function () { return '<input type="file" style="display: none"/><md-button ng-click="chooseFile()">{{ configuration.chooseFileMessage | translate }}</md-button><md-button ng-click="clear()" ng-show="valueSet">{{ configuration.clearFileMessage | translate }}</md-button><span>{{comment}}</span>';});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('directives/FileReadDirective',["require", "exports", 'modules/WebFormsModule', "angular", "text!views/fileRead.html"], function (require, exports, module) {
    var FileReadDirectiveLink = (function () {
        function FileReadDirectiveLink(scope, element, configuration, model, container) {
            var _this = this;
            this.scope = scope;
            this.scope.comment = "";
            this.scope.configuration = configuration;
            this.model = model;
            this.container = container;
            this.scope.valueSet = _.isObject(this.model.$modelValue);
            var fileElement = element.find('input[type=file]');
            scope.chooseFile = function () {
                fileElement.click();
            };
            scope.clear = function () {
                fileElement.val('');
                fileElement.html('');
                _this.model.$setViewValue(null);
                _this.scope.comment = "";
                _this.container.setHasValue(false);
                _this.scope.valueSet = false;
            };
            fileElement.bind("change", function (changeEvent) { return _this.onFileSelected(changeEvent); });
        }
        FileReadDirectiveLink.prototype.onFileSelected = function (changeEvent) {
            var _this = this;
            if (changeEvent.target.files.length === 0) {
                return;
            }
            var file = changeEvent.target.files[0];
            this.scope.comment = file.name;
            var reader = new FileReader();
            reader.onload = function (loadEvent) {
                _this.scope.$apply(function () { return _this.onReadFinished(loadEvent, changeEvent); });
            };
            reader.readAsDataURL(file);
        };
        FileReadDirectiveLink.prototype.onReadFinished = function (loadEvent, changeEvent) {
            var value = loadEvent.target.result;
            var pos = value.indexOf("base64,");
            if (pos > 0) {
                value = value.substring(pos + 7);
            }
            var file = changeEvent.target.files[0];
            this.container.setHasValue(true);
            this.model.$setViewValue({
                file: value,
                type: file.type,
                name: file.name,
                id: null
            });
            this.model.$setDirty();
            this.model.$setTouched();
            this.scope.valueSet = true;
        };
        return FileReadDirectiveLink;
    })();
    var template = require('text!views/fileRead.html');
    module.directive('fileRead', ['webFormsConfiguration', function (webFormsConfiguration) {
            return {
                template: template,
                restrict: 'E',
                replace: false,
                require: ['?ngModel', '^?mdInputContainer'],
                scope: true,
                link: function (scope, element, attrs, controllers) {
                    new FileReadDirectiveLink(scope, element, webFormsConfiguration, controllers[0], controllers[1]);
                }
            };
        }]);
});

define('directives/InputFieldDirective',["require", "exports", 'datatypes/InputFieldTypes', 'lodash', 'modules/WebFormsModule'], function (require, exports, InputFieldTypes, _, module) {
    function getFieldTemplate(type) {
        switch (type) {
            case InputFieldTypes.TEXT:
                return 'text';
            case InputFieldTypes.CODE_TEXT:
                return 'codeText';
            case InputFieldTypes.BOOLEAN:
                return 'checkBox';
            case InputFieldTypes.DATE:
                return 'date';
            case InputFieldTypes.EMAIL:
                return 'email';
            case InputFieldTypes.FILE:
                return 'file';
            case InputFieldTypes.FILE_LIST:
                return 'fileList';
            case InputFieldTypes.IMAGE:
                return 'image';
            case InputFieldTypes.LABEL:
                return 'label';
            case InputFieldTypes.MULTILINE_TEXT:
                return 'multilineText';
            case InputFieldTypes.MULTI_SELECT:
                return 'multiSelect';
            case InputFieldTypes.NUMBER:
                return 'number';
            case InputFieldTypes.PASSWORD:
                return 'password';
            case InputFieldTypes.PASSWORD_REPEAT:
                return 'passwordRepeat';
            case InputFieldTypes.RICH_TEXT:
                return 'richText';
            case InputFieldTypes.SELECT:
                return 'select';
            case InputFieldTypes.TYPEAHEAD:
                return 'typeahead';
        }
    }
    var InputFieldDirectiveLink = (function () {
        function InputFieldDirectiveLink(scope, element, compileService, configuration) {
            var _this = this;
            this.scope = scope;
            this.scope.configuration = configuration;
            this.element = element;
            this.compileService = compileService;
            this.configuration = configuration;
            scope.$watch('field', function () { return _this.render(); });
        }
        InputFieldDirectiveLink.prototype.getTemplateUrl = function () {
            return 'text!views/inputFields/' + getFieldTemplate(this.scope.field.type.toLowerCase()) + '.html';
        };
        InputFieldDirectiveLink.prototype.render = function () {
            var _this = this;
            require([this.getTemplateUrl()], function (template) {
                _this.onContentLoaded(template);
            });
        };
        InputFieldDirectiveLink.prototype.onContentLoaded = function (content) {
            this.element.contents().remove();
            if (!_.isObject(this.scope.field)) {
                return;
            }
            content = "<md-input-container class='inputfield-" + this.scope.field.type + "'>" + content + "<input-field-error></input-field-error></md-input-container>";
            var element = angular.element(content).appendTo(this.element);
            this.compileService(element)(this.scope);
        };
        return InputFieldDirectiveLink;
    })();
    module.directive('inputField', ['$compile', 'webFormsConfiguration',
        function (compileService, webFormsConfiguration) {
            return {
                restrict: 'EA',
                require: ['^form'],
                scope: {
                    field: '=',
                    object: '=',
                    form: '='
                },
                link: function (scope, element) {
                    new InputFieldDirectiveLink(scope, element, compileService, webFormsConfiguration);
                }
            };
        }]);
});

define('utilities/StringFormatter',["require", "exports", 'lodash'], function (require, exports, _) {
    var StringFormatter = (function () {
        function StringFormatter() {
        }
        StringFormatter.format = function (format) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return format.replace(/{(\d+)}/g, function (match, number) {
                return _.isUndefined(args[number]) ? match : args[number];
            });
        };
        return StringFormatter;
    })();
    return StringFormatter;
});


define('text!views/inputFieldError.html',[],function () { return '<div ng-messages="form[field.property].$error" ng-show="form[field.property].$dirty"><div ng-message="required">{{ configuration.requiredErrorMessage | translate }}</div><div ng-message="maxlength">{{ maxLengthMessage }}</div><div ng-message="minlength">{{ minLengthMessage }}</div><div ng-message="email">{{ configuration.emailErrorMessage | translate }}</div><div ng-message="url">{{ configuration.urlErrorMessage | translate }}</div><div ng-message="pattern">{{ configuration.patternErrorMessage | translate }}</div><div ng-message="date">{{ configuration.dateErrorMessage | translate }}</div><div ng-message="time">{{ configuration.timeErrorMessage | translate }}</div><div ng-message="number">{{ configuration.numberErrorMessage | translate }}</div><div ng-message="password_match">{{ configuration.passwordErrorMessage | translate }}</div><div ng-message="equals">{{ configuration.notEqualErrorMessage | translate }}</div></div>';});

///<amd-dependency path="angular" />
///<amd-dependency path="text!views/inputFieldError.html" />
define('directives/InputFieldErrorDirective',["require", "exports", 'utilities/StringFormatter', 'modules/WebFormsModule', "angular", "text!views/inputFieldError.html"], function (require, exports, StringFormatter, module) {
    var InputFieldErrorDirectiveController = (function () {
        function InputFieldErrorDirectiveController(scope, translateService, configuration) {
            scope.configuration = configuration;
            scope.maxLengthMessage = '';
            if (scope.field.maxLength) {
                translateService(configuration.maxLengthErrorMessage).then(function (text) { return scope.maxLengthMessage = StringFormatter.format(text, scope.field.maxLength); });
            }
            scope.minLengthMessage = '';
            if (scope.field.minLength) {
                translateService(configuration.minLengthErrorMessage).then(function (text) { return scope.minLengthMessage = StringFormatter.format(text, scope.field.minLength); });
            }
        }
        return InputFieldErrorDirectiveController;
    })();
    var template = require('text!views/inputFieldError.html');
    module.directive('inputFieldError', [function () {
            return {
                template: template,
                restrict: 'E',
                replace: true,
                controller: ['$scope', '$translate', 'webFormsConfiguration', InputFieldErrorDirectiveController]
            };
        }]);
});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
;
define("datatypes/FileReadResponse", function(){});


define('text!views/multiFileRead.html',[],function () { return '<style>.file-choose-list, .file-choose-list li {\n    margin: 0;\n    padding: 0;\n    list-style-type: none;\n}\n\n.file-choose-list li {\n    display: inline-block;\n}\n\n.file-choose-list li:not(:first-child) {\n    margin-left: 0.5em;\n}\n\n.file-choose-list li:first-child {\n    margin-top: 0.5em;\n}\n\n.file-choose-list li:last-child {\n    margin-bottom: 1em;\n}\n\n.file-choose-list li md-icon {\n    margin-left: 5px;\n    cursor: pointer;\n}\n\n</style><ul class="file-choose-list"><li ng-repeat="file in files"><span>{{file.name}}</span><md-icon ng-click="removeFile(file)" class="file-remove">clear</md-icon></li></ul><input type="file" style="display: none" multiple="multiple"/><md-button ng-click="chooseFile()">{{ \'Main.ChooseFile\' | translate }}</md-button>';});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('directives/MultiFileReadDirective',["require", "exports", 'modules/WebFormsModule', "datatypes/FileReadResponse", "angular", "text!views/multiFileRead.html"], function (require, exports, module) {
    var MultiFileReadResponse = (function () {
        function MultiFileReadResponse() {
            this.files = [];
        }
        return MultiFileReadResponse;
    })();
    var MultiFileReadDirectiveLink = (function () {
        function MultiFileReadDirectiveLink(scope, element, configuration, model, container) {
            var _this = this;
            this.fileId = 1;
            this.model = model;
            this.container = container;
            this.scope = scope;
            this.scope.configuration = configuration;
            this.value = this.model.$modelValue;
            this.scope.valueSet = _.isObject(this.value);
            this.scope.comment = "";
            if (!this.scope.valueSet) {
                this.value = new MultiFileReadResponse();
                this.fileReadBefore = 0;
                this.model.$setViewValue(null);
            }
            else {
                this.fileReadBefore = this.value.files.length;
            }
            this.scope.files = this.value.files;
            this.fileElement = element.find('input[type=file]');
            scope.chooseFile = function () {
                _this.fileElement.click();
            };
            scope.removeFile = function (file) {
                _this.removeFile(file);
            };
            this.fileElement.bind('change', function (changeEvent) { return _this.onFilesSelected(changeEvent); });
        }
        MultiFileReadDirectiveLink.prototype.removeFile = function (file) {
            for (var i = 0; i < this.value.files.length; i++) {
                if (this.value.files[i].id == file.id) {
                    this.value.files.splice(i, 1);
                    break;
                }
            }
            if (this.value.files.length === 0) {
                this.model.$setViewValue(null);
                this.scope.comment = "";
                this.container.setHasValue(false);
                this.scope.valueSet = false;
            }
        };
        MultiFileReadDirectiveLink.prototype.onFilesSelected = function (changeEvent) {
            var _this = this;
            var sourceFiles = changeEvent.target.files;
            _.each(sourceFiles, function (file) {
                _this.readFile(file, sourceFiles);
            });
        };
        MultiFileReadDirectiveLink.prototype.onReadFinished = function (loadEvent, sourceFile, sourceFiles) {
            var value = loadEvent.target.result;
            var pos = value.indexOf("base64,");
            if (pos > 0) {
                value = value.substring(pos + 7);
            }
            var file = {
                file: value,
                type: sourceFile.type,
                name: sourceFile.name,
                id: this.fileId++
            };
            this.value.files.push(file);
            if (this.value.files.length - this.fileReadBefore == sourceFiles.length) {
                this.fileElement.val('');
            }
            if (this.value.files.length === 1) {
                this.model.$setViewValue(this.value);
                this.scope.valueSet = true;
            }
            this.model.$setDirty();
            this.model.$setTouched();
        };
        MultiFileReadDirectiveLink.prototype.readFile = function (sourceFile, sourceFiles) {
            var _this = this;
            var reader = new FileReader();
            reader.onload = function (loadEvent) {
                _this.scope.$apply(function () { return _this.onReadFinished(loadEvent, sourceFile, sourceFiles); });
            };
            reader.readAsDataURL(sourceFile);
        };
        return MultiFileReadDirectiveLink;
    })();
    var template = require('text!views/multiFileRead.html');
    module.directive('multiFileRead', ['webFormsConfiguration', function (webFormsConfiguration) {
            return {
                template: template,
                restrict: 'E',
                replace: false,
                require: ['?ngModel', '^?mdInputContainer'],
                scope: true,
                link: function (scope, element, attrs, controllers) {
                    new MultiFileReadDirectiveLink(scope, element, webFormsConfiguration, controllers[0], controllers[1]);
                }
            };
        }]);
});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('directives/ValidateEqualsDirective',["require", "exports", 'lodash', 'modules/WebFormsModule'], function (require, exports, _, module) {
    var ValidateEqualsLink = (function () {
        function ValidateEqualsLink(scope, attrs, model) {
            var _this = this;
            this.model = model;
            this.attrs = attrs;
            scope.$watch(attrs.ngModel, function () { return _this.validate(); });
            attrs.$observe('reference', function () { return _this.validate(); });
        }
        ValidateEqualsLink.prototype.validate = function () {
            var val1 = this.model.$viewValue;
            var val2 = this.attrs.reference;
            this.model.$setValidity('equals', _.isEqual(val1, val2));
        };
        return ValidateEqualsLink;
    })();
    module.directive('validateEquals', [function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, element, attrs, model) {
                    new ValidateEqualsLink(scope, attrs, model);
                }
            };
        }]);
});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('services/FriendlyFormattingService',["require", "exports", 'autolinker', 'modules/WebFormsModule', "angular"], function (require, exports, Autolinker, module) {
    var FriendlyFormattingService = (function () {
        function FriendlyFormattingService(configuration) {
            this.smiles = {};
            this.smilesString = "";
            this.smilesBase = configuration.smilesBase;
            this.autoLinker = new Autolinker();
            this.autoLinker.newWindow = false;
            this.autoLinker.truncate = 30;
            for (var i = 0; i < configuration.smiles.length; i++) {
                var smile = configuration.smiles[i];
                this.smiles[smile.code] = smile.id;
                if (this.smilesString.length > 0) {
                    this.smilesString += "|";
                }
                for (var j = 0; j < smile.code.length; j++) {
                    switch (smile.code[j]) {
                        case '(':
                        case ')':
                        case '[':
                        case ']':
                        case '-':
                        case '?':
                        case '|':
                            this.smilesString += '\\';
                            break;
                    }
                    this.smilesString += smile.code[j];
                }
            }
            if (this.smilesString.length > 0) {
                this.smilesExpression = new RegExp(this.smilesString, "g");
            }
            else {
                this.smilesExpression = null;
            }
        }
        FriendlyFormattingService.prototype.getSmilesExpression = function () {
            return this.smilesExpression;
        };
        FriendlyFormattingService.prototype.getSmileUrl = function (code) {
            if (!code.length || !this.smilesBase) {
                return "";
            }
            return "<img alt=\"" + code + "\" src=\"" + this.smilesBase + this.smiles[code] + "\" title=\"" + code + "\" />";
        };
        FriendlyFormattingService.prototype.smilesToImg = function (text) {
            if (this.smilesExpression != null) {
                text = text.replace(/([^<>]*)(<[^<>]*>)/gi, function (match, left, tag) {
                    if (!left || left.length == 0) {
                        return match;
                    }
                    left = left.replace(this.smilesExpression, this.getSmileUrl);
                    return tag ? left + tag : left;
                });
            }
            return text;
        };
        FriendlyFormattingService.prototype.getFriendlyHtml = function (text) {
            if (text == null || text.length == 0) {
                return text;
            }
            text = this.smilesToImg(text);
            return this.autoLinker.link(text);
        };
        return FriendlyFormattingService;
    })();
    module.service('friendlyFormatting', [
        'webFormsConfiguration',
        FriendlyFormattingService]);
    return FriendlyFormattingService;
});


define('text!views/webForm.html',[],function () { return '<md-dialog ng-form="form" aria-label="{{title}}" flex="80"><md-toolbar><div class="md-toolbar-tools"><h2>{{title}}</h2></div></md-toolbar><md-content layout-padding="layout-padding" layout="column"><style>md-input-container.inputfield-file label {\n    flex: none;\n    -webkit-flex: none;\n    transform: none !important;\n}\n</style><div ng-repeat="field in fields | orderBy: \'position\'"><input-field field="field" object="object" form="form" ng-if="fieldVisible(field) &amp;&amp; !field.isGroup"></input-field><div ng-if="field.isGroup" layout="row" layout-sm="column"><input-field ng-repeat="child in field.children" field="child" object="object" form="form" ng-if="fieldVisible(child)" flex=""></input-field></div></div><div ng-if="submitWithCaptcha" captcha="recaptchaPublicKey"></div><div ng-if="submitError.length &gt; 0" class="bg-danger dialog-notification"><span class="glyphicon glyphicon-exclamation-sign"></span><span ng-bind="submitError"></span></div><div ng-if="submitSuccess.length &gt; 0" class="bg-success dialog-notification"><span class="glyphicon glyphicon-ok-circle"></span><span ng-bind="submitSuccess"></span></div></md-content><div class="md-actions"><md-button ng-click="submit(form)" aria-label="OK" class="md-raised md-primary"><span>{{ \'OK\' | translate }}</span><md-progress-circular ng-show="isApplying" md-mode="indeterminate" md-diameter="10"></md-progress-circular></md-button><md-button ng-click="cancel()" ng-disabled="isApplying" class="md-raised">{{ \'Cancel\' | translate }}</md-button></div></md-dialog>';});


define('text!views/webFormQuestion.html',[],function () { return '<div class="modal-header"><h3 class="modal-title">{{title}}</h3></div><div class="modal-body"><p>{{message}}</p></div><div class="modal-footer"><div ng-if="submitError.length &gt; 0" class="bg-danger dialog-notification"><span class="glyphicon glyphicon-exclamation-sign"></span><span ng-bind="submitError"></span></div><md-button ng-click="submit()" class="md-raised"><span>{{ \'Main.ButtonYes\' | translate }}</span><md-progress-circular ng-show="isApplying" md-mode="indeterminate"></md-progress-circular></md-button><md-button ng-click="cancel()" class="md-raised md-warn">{{ \'Main.ButtonNo\' | translate }}</md-button></div>';});


define('text!views/webFormMessage.html',[],function () { return '<md-dialog aria-label="{{title}}" class="input-form"><md-dialog-content><md-subheader>{{title}}</md-subheader></md-dialog-content><md-content><p>{{message}}</p></md-content><div class="md-actions"><md-button ng-click="close()" class="md-primary">{{ \'Main.ButtonOk\' | translate }}</md-button></div></md-dialog>';});

/// <reference path="../../typings/requirejs/require.d.ts" />
define('services/WebFormsService',["require", "exports", 'datatypes/InputFieldTypes', "angular", "text!views/webForm.html", "text!views/webFormQuestion.html", "text!views/webFormMessage.html"], function (require, exports, InputFieldTypes) {
    var template = require('text!views/webForm.html');
    var questionTemplate = require('text!views/webFormQuestion.html');
    var messageTemplate = require('text!views/webFormMessage.html');
    var WebFormsService = (function () {
        function WebFormsService(httpService, qService, cacheFactory, dialogService) {
            this.httpService = httpService;
            this.qService = qService;
            this.cache = cacheFactory("lm-webforms");
            this.dialogService = dialogService;
        }
        WebFormsService.prototype.newObject = function (typeId, initialObject, resolver) {
            if (initialObject === void 0) { initialObject = null; }
            if (resolver === void 0) { resolver = null; }
            return this.getTemplateAndExecute(typeId, initialObject, true, resolver);
        };
        WebFormsService.prototype.editObject = function (typeId, object, resolver) {
            if (resolver === void 0) { resolver = null; }
            return this.getTemplateAndExecute(typeId, object, false, resolver);
        };
        WebFormsService.prototype.question = function (message, title, resolver) {
            if (resolver === void 0) { resolver = null; }
            var defer = this.qService.defer();
            this.dialogService.show({
                template: questionTemplate,
                locals: {
                    message: message,
                    title: title,
                    defer: defer,
                    resolver: resolver
                },
                controller: 'inputFormQuestion'
            }).catch(function () {
                defer.reject();
            });
            return defer.promise;
        };
        WebFormsService.prototype.message = function (message, title) {
            if (title === void 0) { title = null; }
            var defer = this.qService.defer();
            this.dialogService.show({
                template: messageTemplate,
                locals: {
                    message: message,
                    title: title,
                    defer: defer
                },
                controller: 'inputFormMessage'
            });
            return defer.promise;
        };
        WebFormsService.prototype.getTemplateAndExecute = function (typeId, object, isNew, resolver) {
            var _this = this;
            if (resolver === void 0) { resolver = null; }
            var defer = this.qService.defer();
            this.httpService.get(typeId + '.json', { cache: this.cache })
                .then(function (data) {
                _this.executeWithDefinitionLoaded(object, data.data, isNew, defer, resolver);
            }, function (message) { return defer.reject(message); });
            return defer.promise;
        };
        WebFormsService.fillRichTextModules = function (requires) {
            requires.push("directives/CkEditorDirective");
        };
        WebFormsService.fillCodeTextModules = function (requires) {
            requires.push("directives/CodeMirrorDirective");
        };
        WebFormsService.prototype.executeWithDefinitionLoaded = function (object, definition, isNew, defer, resolver) {
            var _this = this;
            var hasTinyMce = false;
            var hasCodeMirror = false;
            var hasDynamicFields = false;
            _.forOwn(definition.fields, function (field, property) {
                field.property = property;
            });
            var requires = [];
            _.forEach(definition.fields, function (field) {
                switch (field.type) {
                    case InputFieldTypes.DYNAMIC_FIELD_LIST:
                        hasDynamicFields = true;
                        break;
                    case InputFieldTypes.RICH_TEXT:
                        if (!hasTinyMce) {
                            hasTinyMce = true;
                            WebFormsService.fillRichTextModules(requires);
                        }
                        break;
                    case InputFieldTypes.CODE_TEXT:
                        if (!hasCodeMirror) {
                            hasCodeMirror = true;
                            WebFormsService.fillCodeTextModules(requires);
                        }
                        break;
                }
            });
            if (hasDynamicFields && object == null) {
                defer.reject("Cannot edit uninitialized object");
            }
            if (requires.length > 0) {
                require(requires, function () {
                    _this.executeWithDefinitionAndModulesLoaded(object, definition, isNew, defer, resolver);
                });
            }
            else {
                this.executeWithDefinitionAndModulesLoaded(object, definition, isNew, defer, resolver);
            }
        };
        WebFormsService.prototype.executeWithDefinitionAndModulesLoaded = function (object, typeDefinition, isNew, defer, resolver) {
            if (resolver === void 0) { resolver = null; }
            this.dialogService.show({
                template: template,
                locals: {
                    object: object,
                    definition: typeDefinition,
                    defer: defer,
                    resolver: resolver,
                    isNew: isNew
                },
                controller: 'inputForm'
            }).catch(function () {
                defer.reject("Cancelled");
            });
        };
        return WebFormsService;
    })();
    return WebFormsService;
});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('datatypes/WebFormsConfiguration',["require", "exports"], function (require, exports) {
    var WebFormsConfiguration = (function () {
        function WebFormsConfiguration() {
            this.codeMirrorModules = [];
            this.smilesBase = null;
            this.smiles = [];
            this.maximumFileSize = 0;
            this.requiredErrorMessage = "This field is mandatory";
            this.notEqualErrorMessage = "Fields are not equal";
            this.maxLengthErrorMessage = "This field has to be less than {0} characters long";
            this.minLengthErrorMessage = "This field has to be greater than {0} characters long";
            this.emailErrorMessage = "Wrong e-mail address";
            this.dateErrorMessage = "Wrong date";
            this.timeErrorMessage = "Wrong time";
            this.numberErrorMessage = "Wrong number";
            this.patternErrorMessage = "The field doesn't match the pattern specified";
            this.urlErrorMessage = "Wrong URL";
            this.passwordErrorMessage = "Wrong password";
            this.chooseFileMessage = "Choose File";
            this.clearFileMessage = "Clear";
        }
        return WebFormsConfiguration;
    })();
    return WebFormsConfiguration;
});

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define('services/WebFormsServiceProvider',["require", "exports", 'modules/WebFormsModule', 'services/WebFormsService', 'datatypes/WebFormsConfiguration', "angular"], function (require, exports, module, WebFormsService, WebFormsConfiguration) {
    var configuration = new WebFormsConfiguration();
    module.value('webFormsConfiguration', configuration);
    var WebFormsServiceProvider = (function () {
        function WebFormsServiceProvider() {
            this.$get = ['$http', '$q', '$cacheFactory', '$mdDialog',
                function (httpService, qService, cacheFactory, dialogService) {
                    return new WebFormsService(httpService, qService, cacheFactory, dialogService);
                }];
        }
        return WebFormsServiceProvider;
    })();
    module.provider('webForms', [WebFormsServiceProvider]);
});


define('text!views/inputFields/checkBox.html',[],function () { return '<md-checkbox name="{{field.property}}" ng-model="object[field.property]" ng-disabled="readOnly(field)">{{field.title | translate}}</md-checkbox>';});


define('text!views/inputFields/codeText.html',[],function () { return '<style>.CodeMirror {\n    line-height: normal;\n    height: 200px;\n}\n.CodeMirrorInput {\n    border-width: 1px !important;\n    border-style: solid;\n    border-radius: 3px;\n}\n.md-input-focused .CodeMirrorInput {\n    border-width: 2px !important;\n}\nmd-input-container:not(.md-input-focused):not(.md-input-has-value) .CodeMirrorLabel {\n    padding-left: 40px;\n}\n</style><label class="CodeMirrorLabel">{{field.title | translate}}</label><link href="../../bower_components/codemirror/lib/codemirror.css" rel="stylesheet" type="text/css"/><ui-codemirror ng-model="object[field.property]" name="{{field.property}}" ng-required="field.required" readonly="readOnly(field)" options="{}"></ui-codemirror>';});


define('text!views/inputFields/date.html',[],function () { return '<label>{{field.title | translate}}</label><input type="date" name="{{field.property}}" ng-model="object[field.property]" ng-readonly="readonly(field)" ng-required="field.required"/>';});


define('text!views/inputFields/email.html',[],function () { return '<label>{{field.title | translate}}</label><input type="email" name="{{field.property}}" ng-model="object[field.property]" ng-readonly="readOnly(field)" ng-required="field.required" ng-minlength="field.minLength" ng-maxlength="field.maxLength"/>';});


define('text!views/inputFields/file.html',[],function () { return '<label>{{field.title | translate}}</label><style>md-input-container file-read.md-input {\n    border-width: 0;\n}\nmd-input-container file-read.md-input.ng-invalid.ng-dirty {\n    border-width: 2px;\n    border-style: solid;\n}\nmd-input-container.md-input-focused file-read.md-input {\n    border-width: 2px;\n    border-style: solid;\n}\n</style><file-read ng-model="object[field.property]" style="height: auto" ng-required="field.required" name="{{field.property}}" class="md-input"></file-read>';});


define('text!views/inputFields/fileList.html',[],function () { return '<label>{{field.title | translate}}</label><style>md-input-container multi-file-read.md-input {\n    border-width: 0;\n}\nmd-input-container multi-file-read.md-input.ng-invalid.ng-dirty {\n    border-width: 2px;\n    border-style: solid;\n}\nmd-input-container.md-input-focused multi-file-read.md-input {\n    border-width: 2px;\n    border-style: solid;\n}\n</style><multi-file-read ng-model="object[field.property]" ng-required="field.required" name="{{field.property}}" class="md-input"></multi-file-read>';});


define('text!views/inputFields/image.html',[],function () { return '<label>{{field.title | translate}}</label><div><div><input ng-if="!readOnly(field)" type="file" fileread="object[field.property]"/></div><div style="margin-top: 1em;"><img ng-if="object[field.property] != null" ng-src="/Image/Thumbnail/{{object[field.property]}}"/></div></div>';});


define('text!views/inputFields/label.html',[],function () { return '<label>{{field.title | translate}}</label><span ng-bind="object[field.property]"></span>';});


define('text!views/inputFields/multilineText.html',[],function () { return '<label>{{field.title | translate}}</label><textarea ng-model="object[field.property]" ng-readonly="readOnly(field)"></textarea>';});


define('text!views/inputFields/multiSelect.html',[],function () { return '<label>{{field.title | translate}}</label><select ng-model="object[field.property]" multiple="multiple" ng-options="item.value as item.text for item in field.selectValues"></select>';});


define('text!views/inputFields/number.html',[],function () { return '<label>{{field.title | translate}}</label><input type="number" ng-model="object[field.property]" ng-readonly="readOnly(field)" ng-required="required"/>';});


define('text!views/inputFields/password.html',[],function () { return '<label>{{field.title | translate}}</label><input type="password" name="{{field.property}}" ng-model="object[field.property]" ng-readonly="readOnly(field)" ng-required="field.required" ng-minlength="field.minLength" ng-maxlength="field.maxLength"/>';});


define('text!views/inputFields/passwordRepeat.html',[],function () { return '<label>{{field.title | translate}}</label><input type="password" name="{{field.property}}" ng-model="object[field.property]" ng-readonly="readOnly(field)" ng-required="field.required" ng-minlength="field.minLength" ng-maxlength="field.maxLength" validate-equals="" reference="{{object[field.reference]}}"/>';});


define('text!views/inputFields/richText.html',[],function () { return '<label>{{field.title | translate}}</label><style>md-input-container ck-editor.md-input {\n    border-width: 0;\n}\nmd-input-container ck-editor.md-input.ng-invalid.ng-dirty {\n    border-width: 2px;\n    border-style: solid;\n}\nmd-input-container.md-input-focused ck-editor.md-input {\n    border-width: 2px;\n    border-style: solid;\n}\n</style><ck-editor ng-if="!readOnly(field)" ng-model="object[field.property]" options="{}" readonly="false" ng-required="field.required" name="{{field.property}}" class="md-input"></ck-editor><div ng-if="readOnly(field)" ng-bind-html="object[field.property]"></div>';});


define('text!views/inputFields/select.html',[],function () { return '<label>{{field.title | translate}}</label><select ng-model="object[field.property]" class="form-control"><option ng-repeat="select in field.selectValues" value="{{select.value}}" ng-bind="select.text" ng-selected="fieldValueSelected(model, field, select)"></option></select>';});


define('text!views/inputFields/text.html',[],function () { return '<label>{{field.title | translate}}</label><input type="text" name="{{field.property}}" ng-model="object[field.property]" ng-readonly="readOnly(field)" ng-required="field.required" ng-minlength="field.minLength" ng-maxlength="field.maxLength"/>';});


define('text!views/inputFields/typeahead.html',[],function () { return '<label>{{field.title | translate}}</label><input type="text" ng-model="object[field.property]" ng-readonly="readOnly(field)" typeahead="name for name in getTypeahead(field, $viewValue)"/>';});

///<amd-dependency path="angular" />
///<amd-dependency path="controllers/DialogController" />
///<amd-dependency path="controllers/InputFormController" />
///<amd-dependency path="controllers/InputFormMessageController" />
///<amd-dependency path="controllers/InputFormQuestionController" />
///<amd-dependency path="directives/CkEditorDirective" />
///<amd-dependency path="directives/CodeMirrorDirective" />
///<amd-dependency path="directives/DialogDirective" />
///<amd-dependency path="directives/FileReadDirective" />
///<amd-dependency path="directives/InputFieldDirective" />
///<amd-dependency path="directives/InputFieldErrorDirective" />
///<amd-dependency path="directives/MultiFileReadDirective" />
///<amd-dependency path="directives/ValidateEqualsDirective" />
///<amd-dependency path="services/FriendlyFormattingService" />
///<amd-dependency path="services/WebFormsServiceProvider" />
///<amd-dependency path="text!views/inputFields/checkBox.html" />
///<amd-dependency path="text!views/inputFields/codeText.html" />
///<amd-dependency path="text!views/inputFields/date.html" />
///<amd-dependency path="text!views/inputFields/email.html" />
///<amd-dependency path="text!views/inputFields/file.html" />
///<amd-dependency path="text!views/inputFields/fileList.html" />
///<amd-dependency path="text!views/inputFields/image.html" />
///<amd-dependency path="text!views/inputFields/label.html" />
///<amd-dependency path="text!views/inputFields/multilineText.html" />
///<amd-dependency path="text!views/inputFields/multiSelect.html" />
///<amd-dependency path="text!views/inputFields/number.html" />
///<amd-dependency path="text!views/inputFields/password.html" />
///<amd-dependency path="text!views/inputFields/passwordRepeat.html" />
///<amd-dependency path="text!views/inputFields/richText.html" />
///<amd-dependency path="text!views/inputFields/select.html" />
///<amd-dependency path="text!views/inputFields/text.html" />
///<amd-dependency path="text!views/inputFields/typeahead.html" />
define('lm-webforms',["require", "exports", "angular", "controllers/DialogController", "controllers/InputFormController", "controllers/InputFormMessageController", "controllers/InputFormQuestionController", "directives/CkEditorDirective", "directives/CodeMirrorDirective", "directives/DialogDirective", "directives/FileReadDirective", "directives/InputFieldDirective", "directives/InputFieldErrorDirective", "directives/MultiFileReadDirective", "directives/ValidateEqualsDirective", "services/FriendlyFormattingService", "services/WebFormsServiceProvider", "text!views/inputFields/checkBox.html", "text!views/inputFields/codeText.html", "text!views/inputFields/date.html", "text!views/inputFields/email.html", "text!views/inputFields/file.html", "text!views/inputFields/fileList.html", "text!views/inputFields/image.html", "text!views/inputFields/label.html", "text!views/inputFields/multilineText.html", "text!views/inputFields/multiSelect.html", "text!views/inputFields/number.html", "text!views/inputFields/password.html", "text!views/inputFields/passwordRepeat.html", "text!views/inputFields/richText.html", "text!views/inputFields/select.html", "text!views/inputFields/text.html", "text!views/inputFields/typeahead.html"], function (require, exports) {
});

