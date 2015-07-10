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
class MultiFileReadResponse {
    constructor() {
        this.files = [];
    }

    files: FileReadResponse[];
}

/**
 * @interface MultiFileReadDirectiveScope
 */
interface MultiFileReadDirectiveScope extends ng.IScope {
    removeFile: (file: FileReadResponse) => void;
    chooseFile: () => void;
    configuration: WebFormsConfiguration;
    valueSet: boolean;
    comment: string;
    files: FileReadResponse[];
}

/**
 * @class MultiFileReadDirectiveLink
 */
class MultiFileReadDirectiveLink {

    private scope: MultiFileReadDirectiveScope;
    private fileId: number = 1;
    private fileReadBefore: number;
    private fileElement: JQuery;
    private model: ng.INgModelController;
    private container: IInputContainer;
    private value: MultiFileReadResponse;

    constructor(scope: MultiFileReadDirectiveScope, element: JQuery, configuration: WebFormsConfiguration, model: ng.INgModelController, container: IInputContainer) {

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
        } else {
            this.fileReadBefore = this.value.files.length;
        }

        this.scope.files = this.value.files;

        this.fileElement = element.find('input');

        scope.chooseFile = () => {
            this.fileElement[0].click();
        };

        scope.removeFile = (file: FileReadResponse) => {
            this.removeFile(file);
        };

        this.fileElement.bind('change', (changeEvent) => this.onFilesSelected(changeEvent));
    }

    private removeFile(file: FileReadResponse) {
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
    }

    private onFilesSelected(changeEvent) {
        var sourceFiles = changeEvent.target.files;
        _.each(sourceFiles, (file: File) => {
            this.readFile(file, sourceFiles);
        });
    }

    private onReadFinished(loadEvent, sourceFile, sourceFiles) {
        var value: string = loadEvent.target.result;
        var pos = value.indexOf("base64,");
        if (pos > 0) {
            value = value.substring(pos + 7);
        }

        var file: FileReadResponse = <FileReadResponse> {
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
    }

    private readFile(sourceFile, sourceFiles) {
        var reader = new FileReader();
        reader.onload = (loadEvent) => {
            this.scope.$apply(() => this.onReadFinished(loadEvent, sourceFile, sourceFiles));
        };
        reader.readAsDataURL(sourceFile);
    }
}

webFormsModule.directive('multiFileRead', ['webFormsConfiguration', (webFormsConfiguration: WebFormsConfiguration) => {
    return <ng.IDirective>{
        template: templates['views/multiFileRead.jade'],
        restrict: 'E',
        replace: false,
        require: ['?ngModel', '^?mdInputContainer'],
        scope: true,
        link: (scope: MultiFileReadDirectiveScope, element: JQuery, attrs, controllers) => {
            new MultiFileReadDirectiveLink(scope, element, webFormsConfiguration, controllers[0], controllers[1]);
        }
    };
}]);
