/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file FileReadDirective.ts
 * @author Oleg Gordeev
 */

/**
 * @interface FileReadDirectiveScope
 */
interface FileReadDirectiveScope extends ng.IScope {
    clear: () => void;
    chooseFile: () => void;
    comment: string;
    configuration: WebFormsConfiguration;
    valueSet: boolean;
    showImage: boolean;
    imageLoaded: boolean;
}

/**
 * @class FileReadDirectiveLink
 */
class FileReadDirectiveLink {

    private scope: FileReadDirectiveScope;
    private model: ng.INgModelController;
    private container: IInputContainer;
    private fileElement: JQuery;
    private element: JQuery;
    private imageElement: JQuery;

    constructor(scope: FileReadDirectiveScope, element: JQuery, configuration: WebFormsConfiguration, model: ng.INgModelController, container: IInputContainer) {

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

        scope.chooseFile = () => {
            this.fileElement[0].click();
        };

        scope.clear = () => {
            this.fileElement.val('');
            this.fileElement.html('');
            this.model.$setViewValue(null);
            this.scope.comment = "";
            this.container.setHasValue(false);
            this.scope.valueSet = false;
            if (this.imageElement) {
                this.imageElement.html('');
                this.scope.imageLoaded = false;
            }
        };

        this.fileElement.bind("change", (changeEvent) => this.onFileSelected(changeEvent) );
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
            image.onload = () => {
                var canvas: HTMLCanvasElement = <HTMLCanvasElement> this.imageElement[0];
                var context: CanvasRenderingContext2D = <CanvasRenderingContext2D> canvas.getContext('2d');
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                this.scope.imageLoaded = true;
            };
            image.src = value;
        }

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

webFormsModule.directive('fileRead', ['webFormsConfiguration', (webFormsConfiguration: WebFormsConfiguration) => {
    return <ng.IDirective>{
        template: templates['views/fileRead.jade'],
        restrict: 'E',
        replace: false,
        require: ['?ngModel', '^?mdInputContainer'],
        scope: {
            showImage: '='
        },
        link: (scope: FileReadDirectiveScope, element: JQuery, attrs, controllers) => {
            new FileReadDirectiveLink(scope, element, webFormsConfiguration, controllers[0], controllers[1]);
        }
    };
}]);
