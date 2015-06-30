///<amd-dependency path="../datatypes/FileReadResponse" />
///<amd-dependency path="angular" />

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

class MultiFileReadResponse {
    files: FileReadResponse[];
}

interface MultiFileReadDirectiveScope extends ng.IScope {
    value: MultiFileReadResponse;
    removeFile: (file: FileReadResponse) => void;
    chooseFile: () => void;
}

class MultiFileReadDirectiveLink {

    private scope: MultiFileReadDirectiveScope;
    private fileId: number = 1;
    private fileReadBefore: number;
    private fileElement: JQuery;

    constructor(scope: MultiFileReadDirectiveScope, element: JQuery) {

        this.scope = scope;
        if (scope.value == null) {
            scope.value = new MultiFileReadResponse();
            this.fileReadBefore = 0;
        } else {
            this.fileReadBefore = scope.value.files.length;
        }
        scope.value.files = [];

        this.fileElement = element.find('file');

        scope.chooseFile = () => this.fileElement.click();

        this.fileElement.bind('change', (changeEvent) => this.onFilesSelected(changeEvent));

        scope.removeFile = (file: FileReadResponse) => {
            for (var i = 0; i < scope.value.files.length; i++) {
                if (scope.value.files[i].id == file.id) {
                    scope.value.files.splice(i, 1);
                    break;
                }
            }
        }
    }

    private onFilesSelected(changeEvent) {
        var sourceFiles = changeEvent.target.files;
        for (var i = 0; i < sourceFiles.length; i++) {
            var sourceFile = sourceFiles[i];
            this.readFile(sourceFile, changeEvent, sourceFiles);
        }
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

        this.scope.value.files.push(file);

        if (this.scope.value.files.length - this.fileReadBefore == sourceFiles.length) {
            this.fileElement.val('');
        }
    }

    private readFile(sourceFile, changeEvent, sourceFiles) {
        var reader = new FileReader();
        reader.onload = () => {
            this.scope.$apply(() => this.onReadFinished(changeEvent, sourceFile, sourceFiles));
        };
        reader.readAsDataURL(sourceFile);
    }
}

import module = require('../module');
import template = require('../views/multiFileRead');

module.directive('multiFileRead', [() => {
    return <ng.IDirective>{
        template: template,
        restrict: 'E',
        replace: false,
        scope: {
            value: '='
        },
        link: MultiFileReadDirectiveLink
    };
}]);
