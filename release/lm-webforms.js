(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["angular","angular_animate","angular_translate","angular_messages","angular_material","angular_aria","angular_touch","autolinker","recaptcha"], function (a0,b1,c2,d3,e4,f5,g6,h7,i8) {
      return (factory(a0,b1,c2,d3,e4,f5,g6,h7,i8));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("angular"),require("angular_animate"),require("angular_translate"),require("angular_messages"),require("angular_material"),require("angular_aria"),require("angular_touch"),require("autolinker"),require("recaptcha"));
  } else {
    factory(angular,angular_animate,angular_translate,angular_messages,angular_material,angular_aria,angular_touch,autolinker,recaptcha);
  }
}(this, function (angular, angular_animate, angular_translate, angular_messages, angular_material, angular_aria, angular_touch, autolinker, recaptcha) {

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file WebFormsModule.ts
 * @author Oleg Gordeev
 */
var webFormsModule = angular.module('lm-webforms', [
    'ngMaterial',
    'ngTouch',
    'ngMessages',
    'ngAnimate',
    'pascalprecht.translate'
]);
var templates = {
    "views/codemirror.jade": "<div class=\"md-input CodeMirrorInput\"></div>",
    "views/fileRead.jade": "<input type=\"file\" style=\"opacity: 0; height: 0; width: 0; display: inline\"/><md-button ng-click=\"chooseFile()\"><md-icon>attach_file</md-icon></md-button><md-button ng-click=\"clear()\" ng-show=\"valueSet\"><md-icon>clear</md-icon></md-button><span>{{comment}}</span><div ng-if=\"showImage\" class=\"file-image\"><canvas style=\"width:150px;height:150px\" ng-show=\"imageLoaded\"></canvas></div>",
    "views/inputFieldError.jade": "<div ng-messages=\"form[field.property].$error\" ng-show=\"form[field.property].$dirty\"><div ng-message=\"{{requiredMarker}}\">{{ configuration.requiredErrorMessage | translate }}</div><div ng-message=\"{{maxLengthMarker}}\">{{ maxLengthMessage }}</div><div ng-message=\"{{minLengthMarker}}\">{{ minLengthMessage }}</div><div ng-message=\"{{emailMarker}}\">{{ configuration.emailErrorMessage | translate }}</div><div ng-message=\"{{urlMarker}}\">{{ configuration.urlErrorMessage | translate }}</div><div ng-message=\"{{patternMarker}}\">{{ configuration.patternErrorMessage | translate }}</div><div ng-message=\"{{dateMarker}}\">{{ configuration.dateErrorMessage | translate }}</div><div ng-message=\"{{timeMarker}}\">{{ configuration.timeErrorMessage | translate }}</div><div ng-message=\"{{numberMarker}}\">{{ configuration.numberErrorMessage | translate }}</div><div ng-message=\"{{equalsMarker}}\">{{ configuration.notEqualErrorMessage | translate }}</div></div>",
    "views/inputFields/checkBox.jade": "<md-checkbox name=\"{{field.property}}\" ng-model=\"object[field.property]\" ng-disabled=\"readOnly(field)\">{{field.title | translate}}</md-checkbox>",
    "views/inputFields/codeText.jade": "<style>.CodeMirror {\n    line-height: normal;\n    height: 200px !important;\n}\n.CodeMirrorInput {\n    border-width: 1px !important;\n    border-style: solid;\n    border-radius: 3px;\n}\n.md-input-focused .CodeMirrorInput {\n    border-width: 2px !important;\n}\nmd-input-container:not(.md-input-focused):not(.md-input-has-value) .CodeMirrorLabel {\n    padding-left: 40px;\n}\n</style><label class=\"CodeMirrorLabel\">{{field.title | translate}}</label><link href=\"../../bower_components/codemirror/lib/codemirror.css\" rel=\"stylesheet\" type=\"text/css\"/><ui-codemirror ng-model=\"object[field.property]\" name=\"{{field.property}}\" ng-required=\"field.required\" field-readonly=\"readOnly(field) || fieldDisabled\" options=\"getCodeMirrorOptions()\"></ui-codemirror>",
    "views/inputFields/date.jade": "<label>{{field.title | translate}}</label><input type=\"date\" name=\"{{field.property}}\" ng-model=\"object[field.property]\" ng-readonly=\"readonly(field)\" ng-required=\"field.required\"/>",
    "views/inputFields/email.jade": "<label>{{field.title | translate}}</label><input type=\"email\" name=\"{{field.property}}\" ng-model=\"object[field.property]\" ng-readonly=\"readOnly(field)\" ng-disabled=\"fieldDisabled\" ng-required=\"field.required\" ng-minlength=\"field.minLength\" ng-maxlength=\"field.maxLength\" validate-equals=\"{{field.reference}}\" reference=\"{{field.reference === null || object[field.reference]}}\"/>",
    "views/inputFields/file.jade": "<label>{{field.title | translate}}</label><style>md-input-container file-read.md-input {\n    border-width: 1px !important;\n}\nmd-input-container file-read.md-input.ng-invalid.ng-dirty {\n    border-width: 1px;\n    border-style: solid;\n}\nmd-input-container.md-input-focused file-read.md-input {\n    border-width: 1px;\n    border-style: solid;\n}\n</style><file-read ng-model=\"object[field.property]\" style=\"height: auto\" ng-required=\"field.required\" name=\"{{field.property}}\" class=\"md-input\"></file-read>",
    "views/inputFields/fileList.jade": "<label>{{field.title | translate}}</label><style>md-input-container multi-file-read.md-input {\n    border-width: 1px !important;\n}\nmd-input-container multi-file-read.md-input.ng-invalid.ng-dirty {\n    border-width: 1px;\n    border-style: solid;\n}\nmd-input-container.md-input-focused multi-file-read.md-input {\n    border-width: 1px;\n    border-style: solid;\n}\n</style><multi-file-read ng-model=\"object[field.property]\" ng-required=\"field.required\" name=\"{{field.property}}\" class=\"md-input\"></multi-file-read>",
    "views/inputFields/image.jade": "<label>{{field.title | translate}}</label><style>md-input-container file-read.md-input {\n    border-width: 1px !important;\n}\n\nmd-input-container file-read.md-input.ng-invalid.ng-dirty {\n    border-width: 1px;\n    border-style: solid;\n}\n\nmd-input-container.md-input-focused file-read.md-input {\n    border-width: 1px;\n    border-style: solid;\n}</style><file-read ng-model=\"object[field.property]\" style=\"height: auto\" ng-required=\"field.required\" name=\"{{field.property}}\" show-image=\"true\" class=\"md-input\"></file-read>",
    "views/inputFields/label.jade": "<label>{{field.title | translate}}</label><div ng-bind=\"object[field.property]\" style=\"position: relative; top: 1.5em;\" class=\"md-input\"></div>",
    "views/inputFields/multiSelect.jade": "<md-select name=\"{0}\" ng-model=\"object[field.property]\" ng-readonly=\"readOnly(field) || fieldDisabled\" placeholder=\"{{ field.title | translate }}\" ng-disabled=\"fieldDisabled\" ng-required=\"field.required\" validate-equals=\"{{field.reference}}\" reference=\"{{field.reference === null || object[field.reference]}}\" multiple=\"true\"><md-optgroup ng-repeat=\"group in field.itemsArray | filter: { isGroup: true }\" label=\"{{group.text}}\"><md-option ng-repeat=\"item in group.items\" ng-value=\"item.key\">{{ item.text }}</md-option></md-optgroup><md-option ng-repeat=\"item in field.itemsArray | filter: { isGroup: false }\" value=\"{{item.key}}\">{{ item.text }}</md-option></md-select>",
    "views/inputFields/multilineText.jade": "<label>{{field.title | translate}}</label><textarea ng-model=\"object[field.property]\" ng-readonly=\"readOnly(field)\"></textarea>",
    "views/inputFields/number.jade": "<label>{{field.title | translate}}</label><input type=\"number\" name=\"{{field.property}}\" ng-model=\"object[field.property]\" ng-readonly=\"readOnly(field) || fieldDisabled\" ng-disabled=\"fieldDisabled\" ng-required=\"required\" ng-minlength=\"field.minLength\" ng-maxlength=\"field.maxLength\" validate-equals=\"{{field.reference}}\" reference=\"{{field.reference === null || object[field.reference]}}\"/>",
    "views/inputFields/password.jade": "<label>{{field.title | translate}}</label><input type=\"password\" name=\"{{field.property}}\" ng-model=\"object[field.property]\" ng-readonly=\"readOnly(field)\" ng-required=\"field.required\" ng-minlength=\"field.minLength\" ng-maxlength=\"field.maxLength\" validate-equals=\"{{field.reference}}\" reference=\"{{field.reference === null || object[field.reference]}}\"/>",
    "views/inputFields/richText.jade": "<label>{{field.title | translate}}</label><style>md-input-container ck-editor.md-input {\n    border-width: 0;\n}\nmd-input-container ck-editor.md-input.ng-invalid.ng-dirty {\n    border-width: 2px;\n    border-style: solid;\n}\nmd-input-container.md-input-focused ck-editor.md-input {\n    border-width: 2px;\n    border-style: solid;\n}\n</style><ck-editor ng-if=\"!readOnly(field)\" ng-model=\"object[field.property]\" options=\"{}\" readonly=\"false\" ng-required=\"field.required\" name=\"{{field.property}}\" class=\"md-input\"></ck-editor><div ng-if=\"readOnly(field)\" ng-bind-html=\"object[field.property]\"></div>",
    "views/inputFields/select.jade": "<md-select name=\"{0}\" ng-model=\"object[field.property]\" ng-readonly=\"readOnly(field) || fieldDisabled\" placeholder=\"{{ field.title | translate }}\" ng-disabled=\"fieldDisabled\" ng-required=\"field.required\" validate-equals=\"{{field.reference}}\" reference=\"{{field.reference === null || object[field.reference]}}\"><md-optgroup ng-repeat=\"group in field.itemsArray | filter: { isGroup: true }\" label=\"{{group.text}}\"><md-option ng-repeat=\"item in group.items\" ng-value=\"item.key\">{{ item.text }}</md-option></md-optgroup><md-option ng-repeat=\"item in field.itemsArray | filter: { isGroup: false }\" value=\"{{item.key}}\">{{ item.text }}</md-option></md-select>",
    "views/inputFields/text.jade": "<label>{{field.title | translate}}</label><input type=\"text\" name=\"{{field.property}}\" ng-model=\"object[field.property]\" ng-readonly=\"readOnly(field) || fieldDisabled\" ng-disabled=\"fieldDisabled\" ng-required=\"field.required\" ng-minlength=\"field.minLength\" ng-maxlength=\"field.maxLength\" validate-equals=\"{{field.reference}}\" reference=\"{{field.reference === null || object[field.reference]}}\"/>",
    "views/inputFields/typeahead.jade": "<md-autocomplete md-input-name=\"{{field.property}}\" md-no-cache=\"true\" md-floating-label=\"{{field.title | translate}}\" md-selected-item=\"object[field.property]\" md-search-text=\"searchText\" md-items=\"item in getTypeahead(searchText)\" md-item-text=\"object[field.property]\" md-search-text-change=\"onSearchTextChange(searchText)\" md-selected-item-change=\"onSelectedItemChange()\" ng-readonly=\"readOnly() || fieldDisabled\" ng-disabled=\"fieldDisabled\" ng-required=\"field.required\" ng-minlength=\"field.minLength\" ng-maxlength=\"field.maxLength\"><md-item-template><span md-highlight-text=\"searchText\">{{item}}</span></md-item-template><md-not-found>{{configuration.notFoundMessage}}</md-not-found><input-field-error></input-field-error></md-autocomplete>",
    "views/multiFileRead.jade": "<style>.file-choose-list, .file-choose-list li {\n    margin: 0;\n    padding: 0;\n    list-style-type: none;\n}\n\n.file-choose-list li {\n    display: inline-block;\n}\n\n.file-choose-list li:not(:first-child) {\n    margin-left: 0.5em;\n}\n\n.file-choose-list li:first-child {\n    margin-top: 0.5em;\n}\n\n.file-choose-list li:last-child {\n    margin-bottom: 1em;\n}\n\n.file-choose-list li md-icon {\n    margin-left: 5px;\n    cursor: pointer;\n}\n\n</style><ul class=\"file-choose-list\"><li ng-repeat=\"file in files\"><md-icon>attach_file</md-icon><span>{{file.name}}</span><md-icon ng-click=\"removeFile(file)\" class=\"file-remove\">clear</md-icon></li><li><md-button ng-click=\"chooseFile()\"><md-icon ng-if=\"files.length &gt; 0\">add_circle</md-icon><md-icon ng-if=\"files.length === 0\">attach_file</md-icon></md-button></li></ul><input type=\"file\" style=\"display: none\" multiple=\"multiple\"/>",
    "views/webDialog.jade": "<div ng-form=\"form\"><div ng-if=\"!changesApplied\"><md-content layout-padding=\"layout-padding\" layout=\"column\"><style>md-input-container.inputfield-file label,\nmd-input-container.inputfield-image label,\nmd-input-container.inputfield-file_list label {\n    flex: none;\n    -webkit-flex: none;\n    transform: none !important;\n}\n</style><div ng-repeat=\"field in fields | orderBy: 'position'\" class=\"{{'field-' + field.type + ' ' + 'field-list'}}\"><input-field field=\"field\" object=\"object\" form=\"form\" ng-if=\"fieldVisible(field) &amp;&amp; !field.isGroup\" field-disabled=\"isApplying\"></input-field><div ng-if=\"field.isGroup\" layout=\"row\" layout-sm=\"column\"><input-field ng-repeat=\"child in field.children | orderBy: 'position'\" field=\"child\" object=\"object\" form=\"form\" ng-if=\"fieldVisible(child)\" flex=\"\" field-disabled=\"isApplying\"></input-field></div></div><div ng-if=\"submitWithCaptcha\" captcha=\"recaptchaPublicKey\"></div><div ng-if=\"submitError.length &gt; 0\" class=\"bg-danger dialog-notification\"><span class=\"glyphicon glyphicon-exclamation-sign\"></span><span ng-bind=\"submitError\"></span></div><div ng-if=\"submitSuccess.length &gt; 0\" class=\"bg-success dialog-notification\"><span class=\"glyphicon glyphicon-ok-circle\"></span><span ng-bind=\"submitSuccess\"></span></div></md-content><md-content layout-padding=\"layout-padding\"><md-button ng-click=\"submit(form)\" ng-disabled=\"okDisabled(form)\" class=\"md-raised md-primary\"><span ng-bind=\"applyCaption | translate\"></span><md-progress-circular ng-show=\"isApplying\" md-mode=\"indeterminate\" md-diameter=\"10\"></md-progress-circular></md-button></md-content></div><div ng-if=\"changesApplied\"><div ng-bind=\"submitSuccess\" class=\"bg-success dialog-notification\"></div><md-content layout-padding=\"layout-padding\"><md-button ng-click=\"openForm(form)\" ng-bind=\"'Open Form' | translate\" aria-label=\"Open\" class=\"md-raised\"></md-button></md-content></div></div>",
    "views/webForm.jade": "<md-dialog ng-form=\"form\" aria-label=\"{{title}}\" flex=\"80\"><md-toolbar><div class=\"md-toolbar-tools\"><h2>{{title}}</h2><span flex=\"flex\"></span><md-button ng-click=\"cancel()\" ng-disabled=\"isApplying\" class=\"md-icon-button\"><md-icon>clear</md-icon></md-button></div></md-toolbar><md-content layout-padding=\"layout-padding\" layout=\"column\"><style>md-input-container.inputfield-file label,\nmd-input-container.inputfield-image label,\nmd-input-container.inputfield-file_list label {\n    flex: none;\n    -webkit-flex: none;\n    transform: none !important;\n}\n</style><div ng-repeat=\"field in fields | orderBy: 'position'\" class=\"{{'field-' + field.type + ' ' + 'field-list'}}\"><input-field field=\"field\" object=\"object\" form=\"form\" ng-if=\"fieldVisible(field) &amp;&amp; !field.isGroup\" field-disabled=\"isApplying\"></input-field><div ng-if=\"field.isGroup\" layout=\"row\" layout-sm=\"column\"><input-field ng-repeat=\"child in field.children | orderBy: 'position'\" field=\"child\" object=\"object\" form=\"form\" ng-if=\"fieldVisible(child)\" flex=\"\" field-disabled=\"isApplying\"></input-field></div></div><div ng-if=\"submitWithCaptcha\" captcha=\"recaptchaPublicKey\"></div><div ng-if=\"submitError.length &gt; 0\" class=\"bg-danger dialog-notification\"><span class=\"glyphicon glyphicon-exclamation-sign\"></span><span ng-bind=\"submitError\"></span></div><div ng-if=\"submitSuccess.length &gt; 0\" class=\"bg-success dialog-notification\"><span class=\"glyphicon glyphicon-ok-circle\"></span><span ng-bind=\"submitSuccess\"></span></div></md-content><div class=\"md-actions\"><md-progress-circular ng-show=\"isApplying\" md-mode=\"indeterminate\" md-diameter=\"20\" class=\"md-accent\"></md-progress-circular><md-button ng-click=\"submit(form)\" aria-label=\"OK\" ng-disabled=\"isApplying\" class=\"md-raised md-primary\"><span>{{ 'OK' | translate }}</span></md-button><md-button ng-click=\"cancel()\" ng-disabled=\"isApplying\" class=\"md-raised\">{{ 'Cancel' | translate }}</md-button></div></md-dialog>",
    "views/webFormMessage.jade": "<md-dialog aria-label=\"{{title}}\" class=\"input-form\"><md-dialog-content><md-subheader>{{title}}</md-subheader></md-dialog-content><md-content><p>{{message}}</p></md-content><div class=\"md-actions\"><md-button ng-click=\"close()\" class=\"md-primary\">{{ 'Main.ButtonOk' | translate }}</md-button></div></md-dialog>",
    "views/webFormQuestion.jade": "<div class=\"modal-header\"><h3 class=\"modal-title\">{{title}}</h3></div><div class=\"modal-body\"><p>{{message}}</p></div><div class=\"modal-footer\"><div ng-if=\"submitError.length &gt; 0\" class=\"bg-danger dialog-notification\"><span class=\"glyphicon glyphicon-exclamation-sign\"></span><span ng-bind=\"submitError\"></span></div><md-button ng-click=\"submit()\" class=\"md-raised\"><span>{{ 'Main.ButtonYes' | translate }}</span><md-progress-circular ng-show=\"isApplying\" md-mode=\"indeterminate\"></md-progress-circular></md-button><md-button ng-click=\"cancel()\" class=\"md-raised md-warn\">{{ 'Main.ButtonNo' | translate }}</md-button></div>"
};
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file Constants.ts
 * @author Oleg Gordeev
 */
/**
 * Defines various constants for all classes
 * @class Constants
 */
var Constants = (function () {
    function Constants() {
    }
    Constants.FIELD_REPEAT_SUFFIX = "$Repeat";
    Constants.DIALOG_CLOSE_EVENT = "dialog_close";
    Constants.VALIDATION_ERROR_MATCH = "no_match";
    Constants.VALIDATION_ERROR_EMAIL = "email";
    Constants.VALIDATION_ERROR_NUMBER = "number";
    Constants.VALIDATION_ERROR_REQUIRED = "required";
    Constants.VALIDATION_ERROR_MAX_LENGTH = "maxlength";
    Constants.VALIDATION_ERROR_MIN_LENGTH = "minlength";
    Constants.VALIDATION_ERROR_URL = "url";
    Constants.VALIDATION_ERROR_PATTERN = "pattern";
    Constants.VALIDATION_ERROR_DATE = "date";
    Constants.VALIDATION_ERROR_TIME = "time";
    return Constants;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file InputFieldDefinition.ts
 * @author Oleg Gordeev
 */
/**
 * @class InputFieldDefinition
 */
var InputFieldDefinition = (function () {
    function InputFieldDefinition() {
    }
    return InputFieldDefinition;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file InputFieldTypes.ts
 * @author Oleg Gordeev
 */
/**
 * Defines all handled field types constants
 * @class InputFieldTypes
 */
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
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file SelectValueDefinition.ts
 * @author Oleg Gordeev
 */
/**
 * @class SelectValueDefinition
 */
var SelectValueDefinition = (function () {
    function SelectValueDefinition() {
    }
    return SelectValueDefinition;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file Smile.ts
 * @author Oleg Gordeev
 */
/**
 * @class Smile
 */
var Smile = (function () {
    function Smile() {
    }
    return Smile;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
///<reference path="./Smile.ts" />
///<reference path="./IDataSource.ts" />
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file WebFormsConfiguration.ts
 * @author Oleg Gordeev
 */
///<reference path="../interfaces/IWebFormsConfiguration.ts" />
/**
 * @class WebFormsConfiguration
 */
var WebFormsConfiguration = (function () {
    function WebFormsConfiguration() {
        this.codeMirrorModules = [];
        this.smilesBase = null;
        this.smiles = [];
        this.maximumFileSize = 0;
        this.requiredErrorMessage = "This field is mandatory";
        this.notEqualErrorMessage = "The fields should be equal";
        this.maxLengthErrorMessage = "This field has to be less than {0} characters long";
        this.minLengthErrorMessage = "This field has to be greater than {0} characters long";
        this.emailErrorMessage = "Wrong e-mail address";
        this.dateErrorMessage = "Wrong date";
        this.timeErrorMessage = "Wrong time";
        this.numberErrorMessage = "Wrong number";
        this.patternErrorMessage = "The field doesn't match the pattern specified";
        this.urlErrorMessage = "Wrong URL";
        this.dataSources = {};
        this.loadModulesOnDemand = false;
        this.notFoundMessage = "Not found";
    }
    WebFormsConfiguration.prototype.addDataSource = function (key, source) {
        this.dataSources[key] = source;
    };
    WebFormsConfiguration.prototype.getDataSource = function (key) {
        return this.dataSources[key];
    };
    return WebFormsConfiguration;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file FriendlyFormattingService.ts
 * @author Oleg Gordeev
 */
/**
 * @class FriendlyFormattingService
 */
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
webFormsModule.service('friendlyFormatting', [
    'webFormsConfiguration',
    FriendlyFormattingService
]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file WebFormsService.ts
 * @author Oleg Gordeev
 */
/// <reference path="../../typings/requirejs/require.d.ts" />
/**
 * @class WebFormsService
 */
var WebFormsService = (function () {
    function WebFormsService(httpService, qService, cacheFactory, dialogService, configuration) {
        this.httpService = httpService;
        this.qService = qService;
        this.cache = cacheFactory("lm-webforms");
        this.dialogService = dialogService;
        this.configuration = configuration;
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
            template: templates['views/webFormQuestion.jade'],
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
            template: templates['views/webFormMessage.jade'],
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
        this.httpService.get(typeId + '.json', { cache: this.cache }).then(function (data) {
            _this.executeWithDefinitionLoaded(object, data.data, isNew, defer, resolver);
        }, function (message) { return defer.reject(message); });
        return defer.promise;
    };
    WebFormsService.fillRichTextModules = function (requires) {
        requires.push("ckeditor");
    };
    WebFormsService.prototype.fillCodeTextModules = function (requires) {
        if (_.isEmpty(this.configuration.codeMirrorModules)) {
            requires.push("codemirror");
        }
        else {
            _.each(this.configuration.codeMirrorModules, function (module) {
                requires.push(module);
            });
        }
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
        if (this.configuration.loadModulesOnDemand) {
            _.each(definition.fields, function (field) {
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
                            _this.fillCodeTextModules(requires);
                        }
                        break;
                }
            });
        }
        if (hasDynamicFields && object == null) {
            defer.reject("Cannot edit uninitialized object");
            return;
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
            template: templates['views/webForm.jade'],
            locals: {
                object: object,
                definition: typeDefinition,
                defer: defer,
                resolver: resolver,
                isNew: isNew
            },
            controller: 'inputForm'
        }).then(function () {
            console.log('ok');
        }).catch(function () {
            console.log('cancel');
            defer.reject("Cancelled");
        });
    };
    return WebFormsService;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file WebFormsServiceProvider.ts
 * @author Oleg Gordeev
 */
/**
 * @class WebFormsServiceProvider
 */
var WebFormsServiceProvider = (function () {
    function WebFormsServiceProvider() {
        this.$get = ['$http', '$q', '$cacheFactory', '$mdDialog', function (httpService, qService, cacheFactory, dialogService) {
            return new WebFormsService(httpService, qService, cacheFactory, dialogService, WebFormsServiceProvider.configuration);
        }];
    }
    WebFormsServiceProvider.prototype.getConfiguration = function () {
        return WebFormsServiceProvider.configuration;
    };
    WebFormsServiceProvider.initialize = function () {
        WebFormsServiceProvider.configuration = new WebFormsConfiguration();
        webFormsModule.value('webFormsConfiguration', WebFormsServiceProvider.configuration);
    };
    return WebFormsServiceProvider;
})();
WebFormsServiceProvider.initialize();
webFormsModule.provider('webForms', [WebFormsServiceProvider]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file FormValidator.ts
 * @author Oleg Gordeev
 */
/**
 * Validates input form contents
 * @class FormValidator
 */
var FormValidator = (function () {
    function FormValidator() {
    }
    FormValidator.validate = function (object, value, field, isNewObject, configuration, onFieldInvalid) {
        switch (field.type) {
            case InputFieldTypes.FILE:
                if (field.required && isNewObject && (value === null || value.file === null || value.file.length === 0)) {
                    onFieldInvalid(Constants.VALIDATION_ERROR_REQUIRED);
                }
                if (configuration.maximumFileSize > 0 && value !== null && value.file.length > configuration.maximumFileSize) {
                    onFieldInvalid(Constants.VALIDATION_ERROR_MAX_LENGTH);
                }
                return;
            case InputFieldTypes.FILE_LIST:
                if (field.required && isNewObject && (value === null || value.length === 0)) {
                    onFieldInvalid(Constants.VALIDATION_ERROR_REQUIRED);
                }
                if (value !== null) {
                    for (var j = 0; j < value.length; j++) {
                        var file = value[j];
                        if (file.file !== null && file.file.length > configuration.maximumFileSize) {
                            onFieldInvalid(Constants.VALIDATION_ERROR_MAX_LENGTH);
                            break;
                        }
                    }
                }
                return;
        }
        if (field.repeat) {
            var repeat = object[field.reference];
            if (!_.isEqual(repeat, value)) {
                onFieldInvalid(Constants.VALIDATION_ERROR_MATCH);
            }
        }
        if (_.isEmpty(value)) {
            if (field.required) {
                onFieldInvalid(Constants.VALIDATION_ERROR_REQUIRED);
            }
            return;
        }
        switch (field.type) {
            case InputFieldTypes.NUMBER:
                if (isNaN(parseFloat(value))) {
                    onFieldInvalid(Constants.VALIDATION_ERROR_NUMBER);
                }
                break;
            case InputFieldTypes.EMAIL:
                if (!_.isString(value) || !value.search(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/)) {
                    onFieldInvalid(Constants.VALIDATION_ERROR_EMAIL);
                }
                break;
        }
    };
    return FormValidator;
})();
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
var InputFormController = (function () {
    function InputFormController(scope, dialogService, configuration, object, definition, defer, resolver) {
        var _this = this;
        this.scope = scope;
        this.dialogService = dialogService;
        this.object = object;
        this.definition = angular.copy(definition);
        this.defer = defer;
        this.configuration = configuration;
        this.resolver = resolver;
        this.scope.title = definition.title;
        scope.useCodemirror = _.some(definition.fields, function (field) { return field.type === InputFieldTypes.CODE_TEXT; });
        scope.submitError = '';
        scope.isApplying = false;
        scope.submitWithCaptcha = definition.useCaptcha;
        scope.okDisabled = function (form) {
            return _this.okDisabled(form);
        };
        scope.codeMirrorDefaultOptions = InputFormController.getCodeMirrorDefaultOptions();
        scope.isNewObject = object === null;
        scope.object = object != null ? _.copy(object) : {};
        scope.fieldVisible = function (field) {
            if (!field.visibleFunction) {
                return true;
            }
            return field.visibleFunction(scope.object);
        };
        scope.submit = function (form) { return _this.onSubmit(form); };
        scope.cancel = function () { return _this.onCancel(); };
        this.initializeFields();
    }
    InputFormController.prototype.okDisabled = function (form) {
        return this.scope.isApplying || (!_.isUndefined(form) && form.$invalid);
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
        _.each(dynamicFields, function (dynamicField) {
            var dynamicDefinition = _.copy(dynamicField.field);
            dynamicDefinition.property = field.property + "$" + dynamicDefinition.property;
            dynamicDefinition.dynamicSource = dynamicField;
            dynamicDefinition.reference = null;
            _this.addField(dynamicDefinition);
            _this.scope.object[dynamicDefinition.property] = dynamicField.value;
        });
    };
    InputFormController.prototype.addField = function (field) {
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
        }
        else {
            field.reference = null;
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
                groupField.reference = null;
                fields[fields.length - 1] = groupField;
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
                    }
                    else {
                        field.items = {};
                    }
                }
                field.itemsArray = [];
                _.forOwn(field.items, function (value, key) {
                    var definition = new SelectValueDefinition();
                    if (_.isString(value)) {
                        definition.key = key;
                        definition.text = value;
                        definition.isGroup = false;
                    }
                    else {
                        definition.text = key;
                        definition.isGroup = true;
                        definition.items = [];
                        _.forOwn(value, function (value, key) {
                            var subDefinition = new SelectValueDefinition();
                            subDefinition.key = key;
                            subDefinition.text = value;
                            subDefinition.isGroup = false;
                            definition.items.push(subDefinition);
                        });
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
        _.each(this.definition.fields, function (field) {
            _this.processField(field);
        });
    };
    InputFormController.prototype.onCloseDialog = function () {
        this.scope.$broadcast(Constants.DIALOG_CLOSE_EVENT);
    };
    InputFormController.prototype.onOk = function () {
        this.onCloseDialog();
        this.dialogService.hide('ok');
    };
    InputFormController.prototype.onCancel = function () {
        this.onCloseDialog();
        this.dialogService.hide('cancel');
    };
    InputFormController.prototype.validateField = function (field, form) {
        var _this = this;
        if (!this.scope.fieldVisible(field) || field.readOnly || (field.readOnlyFunction && field.readOnlyFunction(this.scope.object))) {
            return;
        }
        if (field.isGroup) {
            _.each(field.children, function (child) {
                _this.validateField(child, form);
            });
            return;
        }
        var formField = form[field.property];
        if (_.isUndefined(formField)) {
            return;
        }
        var value = this.scope.object[field.property];
        FormValidator.validate(this.scope.object, value, field, this.scope.isNewObject, this.configuration, function (message) {
            formField.$setDirty();
            formField.$setValidity(message, false);
        });
    };
    InputFormController.prototype.onSubmit = function (form) {
        var _this = this;
        _.each(this.scope.fields, function (field) {
            _this.validateField(field, form);
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
            var changed = _.copy(this.scope.object);
            _.each(this.scope.fields, function (field) {
                if (field.dynamicSource) {
                    delete changed[field.property];
                }
                else if (field.repeat) {
                    delete changed[field.property + Constants.FIELD_REPEAT_SUFFIX];
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
                this.onOk();
                this.defer.resolve(changed);
                return;
            }
            this.resolver(changed).then(function () {
                _this.scope.isApplying = false;
                _this.onOk();
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
/**
 * @file DialogController.ts
 * @author Oleg Gordeev
 */
/// <reference path="./InputFormController.ts" />
/**
 * Controller class for dialog page
 * @class DialogController
 */
var DialogController = (function (_super) {
    __extends(DialogController, _super);
    function DialogController(scope, dialogService, configuration, qService) {
        var _this = this;
        _super.call(this, scope, dialogService, configuration, scope.configuration.object, scope.definition, null, function (changedObject) { return _this.successFunction(changedObject); });
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
        this.dialogScope.submit(changedObject).then(function (data) {
            _this.dialogScope.hasChanges = false;
            _this.dialogScope.changesApplied = true;
            _this.dialogScope.submitSuccess = data.message;
            deferred.resolve();
        }, function (message) { return deferred.reject(message); });
        return deferred.promise;
    };
    return DialogController;
})(InputFormController);
webFormsModule.controller("dialog", [
    '$scope',
    '$mdDialog',
    'webFormsConfiguration',
    'commandProcessor',
    '$q',
    DialogController
]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @class InputFormMessageController
 */
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
webFormsModule.controller('inputFormMessage', [
    '$scope',
    '$mdDialog',
    'message',
    'title',
    'defer',
    InputFormMessageController
]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @class InputFormQuestionController
 */
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
webFormsModule.controller('inputFormQuestion', [
    '$scope',
    '$mdDialog',
    'message',
    'title',
    'defer',
    'resolver',
    InputFormQuestionController
]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @class CkEditorOptions
 */
var CkEditorOptions = (function () {
    function CkEditorOptions() {
    }
    return CkEditorOptions;
})();
/**
 * @class CkEditorDirectiveLink
 */
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
        _.each(this.configuration.smiles, function (smile) {
            _this.smileCodeToId[smile.code] = smile.id;
            _this.smileIdToCode[smile.id] = smile.code;
            _this.options.smiley_descriptions.push(smile.code);
            _this.options.smiley_images.push(smile.id);
        });
    };
    return CkEditorDirectiveLink;
})();
webFormsModule.directive('ckEditor', ['webFormsConfiguration', 'friendlyFormatting', function (configuration, friendlyFormatting) {
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
// Based on https://github.com/angular-ui/ui-codemirror
// The goal of refactoring is to take advantage of using AMD and TypeScript and integrate it with angular.material
/**
 * @class CodeMirrorDirectivePostLink
 */
var CodeMirrorDirectivePostLink = (function () {
    function CodeMirrorDirectivePostLink(scope, element, model, container, configuration) {
        var _this = this;
        this.scope = scope;
        this.model = model;
        this.inputContainer = container;
        this.element = element;
        this.configuration = configuration;
        if (_.isFunction(scope.options)) {
            this.options = scope.options();
        }
        if (!angular.isObject(this.options)) {
            this.options = {};
        }
        var newValue = this.model.$viewValue || '';
        this.options.lineNumbers = true;
        this.options.mode = this.options.mode || "htmlmixed";
        this.options.inputStyle = "textarea";
        this.options.value = newValue;
        if (configuration.loadModulesOnDemand) {
            var requiredModules = ['codemirror'];
            if (configuration.codeMirrorModules && configuration.codeMirrorModules.length) {
                requiredModules = configuration.codeMirrorModules;
            }
            require(requiredModules, function (codemirror) {
                _this.prepareEditor(codemirror);
            });
        }
        else {
            this.prepareEditor(window["CodeMirror"]);
        }
    }
    CodeMirrorDirectivePostLink.prototype.prepareEditor = function (Codemirror) {
        var _this = this;
        this.editor = this.createEditor(Codemirror);
        this.scope.$applyAsync(function () {
            _this.configOptionsWatcher(Codemirror);
            _this.configNgModelLink();
            _this.editor.setOption('readOnly', _this.scope.fieldReadonly);
        });
    };
    CodeMirrorDirectivePostLink.prototype.createEditor = function (CodeMirror) {
        var _this = this;
        return new CodeMirror(function (editorInstance) {
            _this.element.append(editorInstance);
        }, this.options);
    };
    CodeMirrorDirectivePostLink.prototype.configOptionsWatcher = function (CodeMirror) {
        var _this = this;
        var codemirrorDefaultsKeys = Object.keys(CodeMirror.defaults);
        this.scope.$watch('options', function (newValues, oldValue) {
            if (!angular.isObject(newValues)) {
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
        this.scope.$watch('fieldReadonly', function (newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            _this.editor.setOption('readOnly', newValue);
        });
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
        // CodeMirror expects a string, so make sure it gets one.
        // This does not change the model.
        this.model.$formatters.push(function (value) {
            if (angular.isUndefined(value) || value === null) {
                return '';
            }
            else if (angular.isObject(value) || angular.isArray(value)) {
                throw new Error('ui-codemirror cannot use an object or an array as a model');
            }
            return value;
        });
        // Override the ngModelController $render method, which is what gets called when the model is updated.
        // This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
        this.model.$render = function () {
            //Code mirror expects a string so make sure it gets one
            //Although the formatter have already done this, it can be possible that another formatter returns undefined (for example the required directive)
            var safeViewValue = _this.model.$viewValue || '';
            _this.editor.setValue(safeViewValue);
            _this.updateEditorState(safeViewValue);
        };
        // Keep the ngModel in sync with changes from CodeMirror
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
    return CodeMirrorDirectivePostLink;
})();
webFormsModule.directive('uiCodemirror', ['webFormsConfiguration', function (configuration) {
    return {
        restrict: 'E',
        template: templates['views/codemirror.jade'],
        replace: true,
        require: ['?ngModel', '^?mdInputContainer'],
        scope: {
            options: '&',
            fieldReadonly: '=',
            fieldDisabled: '='
        },
        link: function (scope, element, attrs, controllers) {
            new CodeMirrorDirectivePostLink(scope, element, controllers[0], controllers[1], configuration);
        }
    };
}]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file DialogDirective.ts
 * @author Oleg Gordeev
 */
webFormsModule.directive('lmDialog', [function () {
    return {
        template: templates['views/webDialog.jade'],
        restrict: 'E',
        replace: false,
        scope: {
            configuration: '='
        },
        controller: DialogController
    };
}]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @class FileReadDirectiveLink
 */
var FileReadDirectiveLink = (function () {
    function FileReadDirectiveLink(scope, element, configuration, model, container) {
        var _this = this;
        this.scope = scope;
        this.scope.showImage = this.scope.showImage || false;
        this.element = element;
        this.imageElement = null;
        this.scope.comment = "";
        this.scope.configuration = configuration;
        this.model = model;
        this.container = container;
        this.scope.valueSet = _.isObject(this.model.$modelValue);
        this.scope.imageLoaded = false;
        this.fileElement = element.find('input');
        scope.chooseFile = function () {
            _this.fileElement[0].click();
        };
        scope.clear = function () {
            _this.fileElement.val('');
            _this.fileElement.html('');
            _this.model.$setViewValue(null);
            _this.scope.comment = "";
            _this.container.setHasValue(false);
            _this.scope.valueSet = false;
            if (_this.imageElement) {
                _this.imageElement.html('');
                _this.scope.imageLoaded = false;
            }
        };
        this.fileElement.bind("change", function (changeEvent) { return _this.onFileSelected(changeEvent); });
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
        var _this = this;
        var value = loadEvent.target.result;
        if (this.scope.showImage) {
            var match = value.match(/^data:([a-zA-Z+_]+)\/([^;]+);/);
            var type = match[1];
            if (type !== 'image') {
                this.scope.clear();
                return;
            }
            if (this.imageElement == null) {
                this.imageElement = this.element.find('canvas');
            }
            var image = new Image();
            image.onload = function () {
                var canvas = _this.imageElement[0];
                var context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                _this.scope.imageLoaded = true;
            };
            image.src = value;
        }
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
webFormsModule.directive('fileRead', ['webFormsConfiguration', function (webFormsConfiguration) {
    return {
        template: templates['views/fileRead.jade'],
        restrict: 'E',
        replace: false,
        require: ['?ngModel', '^?mdInputContainer'],
        scope: {
            showImage: '='
        },
        link: function (scope, element, attrs, controllers) {
            new FileReadDirectiveLink(scope, element, webFormsConfiguration, controllers[0], controllers[1]);
        }
    };
}]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file InputFieldDirective
 * @author Oleg Gordeev
 */
/**
 * Gets html template associated with the specified field
 * @param type
 * @returns string
 */
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
        case InputFieldTypes.RICH_TEXT:
            return 'richText';
        case InputFieldTypes.SELECT:
            return 'select';
        case InputFieldTypes.TYPEAHEAD:
            return 'typeahead';
    }
}
/**
 * @class InputFieldDirectiveLink
 */
var InputFieldDirectiveLink = (function () {
    function InputFieldDirectiveLink(scope, element, compileService, sceService, configuration, form) {
        var _this = this;
        this.scope = scope;
        this.scope.configuration = configuration;
        this.element = element;
        this.compileService = compileService;
        this.configuration = configuration;
        this.scope.getCodeMirrorOptions = function () {
            return {};
        };
        scope.getValue = function () {
            if (scope.field.type === InputFieldTypes.RICH_TEXT && scope.readOnly().length > 0) {
                return sceService.trustAsHtml(scope.object[scope.field.property]);
            }
            return scope.object[scope.field.property];
        };
        scope.getTypeahead = function (searchText) {
            var source = configuration.getDataSource(scope.field.source);
            if (source) {
                return source.searchItems(searchText);
            }
            return [];
        };
        scope.onSearchTextChange = function () {
        };
        scope.onSelectedItemChange = function (item) {
            var control = form[scope.field.property];
        };
        scope.getHelpText = function () {
            return _this.onGetHelpText();
        };
        scope.readOnly = function () {
            if (!scope.field.readOnlyFunction) {
                return scope.field.readOnly ? "readonly" : "";
            }
            return scope.field.readOnlyFunction(scope.object) ? "readonly" : "";
        };
        scope.$watch('field', function () { return _this.render(); });
    }
    InputFieldDirectiveLink.prototype.onGetHelpText = function () {
        var ret = this.scope.field.helpText;
        if (ret == null) {
            ret = "";
        }
        return ret;
    };
    InputFieldDirectiveLink.prototype.getTemplateUrl = function () {
        return 'views/inputFields/' + getFieldTemplate(this.scope.field.type.toLowerCase()) + '.jade';
    };
    InputFieldDirectiveLink.prototype.render = function () {
        this.onContentLoaded(templates[this.getTemplateUrl()]);
    };
    InputFieldDirectiveLink.prototype.onContentLoaded = function (content) {
        this.element.contents().remove();
        if (!_.isObject(this.scope.field)) {
            return;
        }
        content = StringFormatter.format(content, this.scope.field.property);
        switch (this.scope.field.type) {
            case InputFieldTypes.TYPEAHEAD:
                break;
            default:
                content = "<md-input-container class='inputfield-" + this.scope.field.type + "'>" + content + "<input-field-error></input-field-error></md-input-container>";
                break;
        }
        var container = angular.element(this.element);
        container.append(content);
        var newElement = container.children('md-input-container:last-child')[0];
        this.compileService(newElement)(this.scope);
    };
    return InputFieldDirectiveLink;
})();
webFormsModule.directive('inputField', ['$compile', 'webFormsConfiguration', '$sce', function (compileService, webFormsConfiguration, sceService) {
    return {
        restrict: 'EA',
        require: ['^form'],
        scope: {
            field: '=',
            object: '=',
            fieldDisabled: '=',
            form: '='
        },
        link: function (scope, element, attrs, controllers) {
            new InputFieldDirectiveLink(scope, element, compileService, sceService, webFormsConfiguration, controllers[0]);
        }
    };
}]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @class InputFieldErrorDirectiveController
 */
var InputFieldErrorDirectiveController = (function () {
    function InputFieldErrorDirectiveController(scope, translateService, configuration) {
        scope.configuration = configuration;
        scope.maxLengthMessage = '';
        scope.requiredMarker = Constants.VALIDATION_ERROR_REQUIRED;
        scope.maxLengthMarker = Constants.VALIDATION_ERROR_MAX_LENGTH;
        scope.minLengthMarker = Constants.VALIDATION_ERROR_MIN_LENGTH;
        scope.emailMarker = Constants.VALIDATION_ERROR_EMAIL;
        scope.urlMarker = Constants.VALIDATION_ERROR_URL;
        scope.patternMarker = Constants.VALIDATION_ERROR_PATTERN;
        scope.dateMarker = Constants.VALIDATION_ERROR_DATE;
        scope.timeMarker = Constants.VALIDATION_ERROR_TIME;
        scope.numberMarker = Constants.VALIDATION_ERROR_NUMBER;
        scope.equalsMarker = Constants.VALIDATION_ERROR_MATCH;
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
webFormsModule.directive('inputFieldError', [function () {
    return {
        template: templates['views/inputFieldError.jade'],
        restrict: 'E',
        replace: true,
        controller: ['$scope', '$translate', 'webFormsConfiguration', InputFieldErrorDirectiveController]
    };
}]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file MultiFileReadDirective.ts
 * @author Oleg Gordeev
 */
/**
 * @class MultiFileReadResponse
 */
var MultiFileReadResponse = (function () {
    function MultiFileReadResponse() {
        this.files = [];
    }
    return MultiFileReadResponse;
})();
/**
 * @class MultiFileReadDirectiveLink
 */
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
        this.fileElement = element.find('input');
        scope.chooseFile = function () {
            _this.fileElement[0].click();
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
webFormsModule.directive('multiFileRead', ['webFormsConfiguration', function (webFormsConfiguration) {
    return {
        template: templates['views/multiFileRead.jade'],
        restrict: 'E',
        replace: false,
        require: ['?ngModel', '^?mdInputContainer'],
        scope: true,
        link: function (scope, element, attrs, controllers) {
            new MultiFileReadDirectiveLink(scope, element, webFormsConfiguration, controllers[0], controllers[1]);
        }
    };
}]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @class ValidateEqualsLink
 */
var ValidateEqualsLink = (function () {
    function ValidateEqualsLink(scope, attrs, model) {
        var _this = this;
        if (_.isEmpty(attrs.validateEquals)) {
            return;
        }
        this.model = model;
        this.attrs = attrs;
        scope.$watch(attrs.ngModel, function () { return _this.validate(); });
        attrs.$observe('reference', function () { return _this.validate(); });
    }
    ValidateEqualsLink.prototype.validate = function () {
        var val1 = this.model.$viewValue;
        var val2 = this.attrs.reference;
        this.model.$setValidity(Constants.VALIDATION_ERROR_MATCH, _.isEqual(val1, val2));
    };
    return ValidateEqualsLink;
})();
webFormsModule.directive('validateEquals', [function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, model) {
            new ValidateEqualsLink(scope, attrs, model);
        }
    };
}]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file StringFormatter.ts
 * @author Oleg Gordeev
 */
/**
 * @class StringFormatter
 */
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
var _ = (function () {
    function _() {
    }
    _.isBoolean = function (arg) {
        return arg === true || arg === false;
    };
    _.copy = function (arg) {
        return angular.copy(arg);
    };
    _.forOwn = function (object, callback) {
        if (object === null || _.isUndefined(object)) {
            return;
        }
        var properties = Object.getOwnPropertyNames(object);
        angular.forEach(properties, function (propertyName) {
            callback(object[propertyName], propertyName);
        });
    };
    _.isString = function (arg) {
        return angular.isString(arg);
    };
    _.each = function (arg, handler) {
        angular.forEach(arg, handler);
    };
    _.isArray = function (arg) {
        return angular.isArray(arg);
    };
    _.isUndefined = function (arg) {
        return angular.isUndefined(arg);
    };
    _.isDefined = function (arg) {
        return angular.isDefined(arg);
    };
    _.isDate = function (arg) {
        return angular.isDate(arg);
    };
    _.isFunction = function (arg) {
        return angular.isFunction(arg);
    };
    _.isObject = function (arg) {
        return angular.isObject(arg);
    };
    _.isEmpty = function (arg) {
        if (arg === null || _.isUndefined(arg)) {
            return true;
        }
        if (_.isArray(arg) || _.isString(arg) || _.isFunction(arg)) {
            return arg.length === 0;
        }
        if (_.isObject(arg)) {
            return Object.getOwnPropertyNames(arg).length === 0;
        }
        if (_.isBoolean(arg) || _.isDate(arg)) {
            return false;
        }
        return true;
    };
    _.union = function (arg1, arg2) {
        var ret = [];
        if (_.isArray(arg1)) {
            _.each(arg1, function (val) {
                ret.push(val);
            });
        }
        if (_.isArray(arg2)) {
            _.each(arg2, function (val) {
                for (var i = 0; i < ret.length; i++) {
                    if (_.isEqual(ret[i], val)) {
                        return;
                    }
                }
                ret.push(val);
            });
        }
        return ret;
    };
    _.some = function (arg, handler) {
        if (_.isArray(arg)) {
            for (var i = 0; i < arg.length; i++) {
                if (handler(arg[i])) {
                    return true;
                }
            }
            return false;
        }
        if (_.isObject(arg)) {
            var keys = Object.getOwnPropertyNames(arg);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (handler(arg[key], key)) {
                    return true;
                }
            }
            return false;
        }
        return false;
    };
    _.isEqual = function (arg1, arg2) {
        if (arg1 === null && arg2 === null) {
            return true;
        }
        if (arg1 === null || arg2 === null) {
            return false;
        }
        if (_.isUndefined(arg1) || _.isUndefined(arg2)) {
            return false;
        }
        if (_.isArray(arg1)) {
            if (!_.isArray(arg2)) {
                return false;
            }
            var len = arg1.length;
            if (len !== arg2.length) {
                return false;
            }
            for (var i = 0; i < len; i++) {
                if (!_.isEqual(arg1[i], arg2[i])) {
                    return false;
                }
            }
            return true;
        }
        if (_.isObject(arg1)) {
            if (!_.isObject(arg2)) {
                return false;
            }
            var keys1 = Object.getOwnPropertyNames(arg1).sort();
            var keys2 = Object.getOwnPropertyNames(arg2).sort();
            if (!_.isEqual(keys1, keys2)) {
                return false;
            }
            for (var i = 0; i < keys1.length; i++) {
                var key = keys1[i];
                if (!_.isEqual(arg1[key], arg2[key])) {
                    return false;
                }
            }
            return true;
        }
        return arg1 === arg2;
    };
    return _;
})();


}));
