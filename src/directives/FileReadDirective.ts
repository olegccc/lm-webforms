/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

///<amd-dependency path="angular" />
///<amd-dependency path="text!views/fileRead.html" />

import WebFormsConfiguration = require('datatypes/WebFormsConfiguration');

interface FileReadDirectiveScope extends ng.IScope {
    clear: () => void;
    chooseFile: () => void;
    comment: string;
    configuration: WebFormsConfiguration;
    valueSet: boolean;
}

class FileReadDirectiveLink {

    private scope: FileReadDirectiveScope;
    private model: ng.INgModelController;
    private container: IInputContainer;

    constructor(scope: FileReadDirectiveScope, element: JQuery, configuration: WebFormsConfiguration, model: ng.INgModelController, container: IInputContainer) {

        this.scope = scope;
        this.scope.comment = "";
        this.scope.configuration = configuration;
        this.model = model;
        this.container = container;
        this.scope.valueSet = _.isObject(this.model.$modelValue);

        var fileElement = element.find('input[type=file]');

        scope.chooseFile = () => {
            fileElement.click();
        };

        scope.clear = () => {
            fileElement.val('');
            fileElement.html('');
            this.model.$setViewValue(null);
            this.scope.comment = "";
            this.container.setHasValue(false);
            this.scope.valueSet = false;
        };

        fileElement.bind("change", (changeEvent) => this.onFileSelected(changeEvent) );
    }

    private onFileSelected(changeEvent) {
        if (changeEvent.target.files.length === 0) {
            return;
        }

        var file: File = changeEvent.target.files[0];

        this.scope.comment = file.name;

        var reader = new FileReader();

        reader.onload = (loadEvent) => {
            this.scope.$apply(() => this.onReadFinished(loadEvent, changeEvent));
        };

        reader.readAsDataURL(file);
    }

    private onReadFinished(loadEvent, changeEvent) {
        var value: string = loadEvent.target.result;

        var pos = value.indexOf("base64,");
        if (pos > 0) {
            value = value.substring(pos + 7);
        }

        var file: File = changeEvent.target.files[0];

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
    }
}

import module = require('modules/WebFormsModule');
var template = require('text!views/fileRead.html');

module.directive('fileRead', ['webFormsConfiguration', (webFormsConfiguration: WebFormsConfiguration) => {
    return <ng.IDirective>{
        template: template,
        restrict: 'E',
        replace: false,
        require: ['?ngModel', '^?mdInputContainer'],
        scope: true,
        link: (scope: FileReadDirectiveScope, element: JQuery, attrs, controllers) => {
            new FileReadDirectiveLink(scope, element, webFormsConfiguration, controllers[0], controllers[1]);
        }
    };
}]);
