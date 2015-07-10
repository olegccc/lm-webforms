/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file CkEditorDirective.ts
 * @author Oleg Gordeev
 */

/**
 * @interface CkEditorEditor
 */
interface CkEditorEditor {
    getData(noEvents?: Object): string;
    setData(data: string, options?: { internal?: boolean; callback?: Function; noSnapshot?: boolean; }): void;
    on(eventName: string, listenerFunction: (eventInfo: CkEditorEventInfo) => void, scopeObj?: Object, listenerData?: Object, priority?: number): Object;
}

/**
 * @interface CkEditorEventInfo
 */
interface CkEditorEventInfo {
    data: any;
    editor: CkEditorEditor;
    listenerData: any;
    name: string;
    sender: any;
    cancel(): void;
    removeListener(): void;
    stop(): void;
}

/**
 * @interface CkEditor
 */
interface CkEditor {
    replace(element: string, config?: any): CkEditorEditor;
    replace(element: HTMLTextAreaElement, config?: any): CkEditorEditor;
    appendTo(element: string, config?: any): CkEditorEditor;
    appendTo(element: HTMLTextAreaElement, config?: any): CkEditorEditor;
}

/**
 * @interface CkEditorDirectiveScope
 */
interface CkEditorDirectiveScope extends ng.IScope {
    options: any;
    readonly: boolean;
}

/**
 * @class CkEditorOptions
 */
class CkEditorOptions {
    smiley_descriptions: string[];
    smiley_images: string[];
    smiley_path: string;
}

/**
 * @class CkEditorDirectiveLink
 */
class CkEditorDirectiveLink {

    private smileIdToCode: {[id: string]: string} = {};
    private smileCodeToId: {[code: string]: string} = {};

    private configuration: WebFormsConfiguration;
    private options: CkEditorOptions;
    private scope: CkEditorDirectiveScope;
    private friendlyFormatting: FriendlyFormattingService;
    private editor: CkEditorEditor;
    private model: ng.INgModelController;
    private inputContainer: IInputContainer;

    constructor(scope: CkEditorDirectiveScope,
                element: JQuery,
                model: ng.INgModelController,
                inputContainer: IInputContainer,
                configuration: WebFormsConfiguration,
                friendlyFormatting: FriendlyFormattingService,
                ckeditor: CkEditor) {
        this.configuration = configuration;
        this.options = new CkEditorOptions();
        this.scope = scope;
        this.friendlyFormatting = friendlyFormatting;
        this.model = model;
        this.inputContainer = inputContainer;
        this.initializeSmiles();

        inputContainer.setHasValue(true);

        this.editor = ckeditor.appendTo(<any>element[0], this.options);

        this.editor.on('change', () => this.applyChanges());
        this.editor.on('key', () => this.applyChanges());
        this.editor.on('focus', () => this.inputContainer.setFocused(true) );
        this.editor.on('blur', () => this.inputContainer.setFocused(false) );

        model.$render = () => this.render();
    }

    private updateEditorState(newValue: any) {
        this.inputContainer.setHasValue(true);
        this.inputContainer.setInvalid(this.model.$invalid && this.model.$touched);
    }

    private render() {
        var text = this.model.$viewValue || '';

        if (text && this.friendlyFormatting.getSmilesExpression()) {
            text = this.friendlyFormatting.smilesToImg(text);
        }

        this.editor.setData(text);
        this.updateEditorState(text);
    }

    private applyChanges() {
        this.scope.$apply(() => this.setViewValue() );
    }

    private setViewValue() {
        var text = this.editor.getData();

        if (this.friendlyFormatting.getSmilesExpression() != null) {
            text = text.replace(/<img\s+alt="([^"]*)"\s+src="[^"]*"\s+(?:style="[^"]*"\s+)?title="([^"]*)"\s+\/?>/gi, (match, alt, title) => {

                if (!alt || !title || alt != title) {
                    return match;
                }

                if (!this.smileCodeToId.hasOwnProperty(alt)) {
                    return match;
                }
                return alt;
            });
        }

        this.model.$setViewValue(text);
        this.model.$setTouched();
        this.updateEditorState(text);
    }

    private initializeSmiles() {
        if (!this.configuration.smilesBase || this.configuration.smilesBase.length === 0 || !this.configuration.smiles || this.configuration.smiles.length === 0) {
            return;
        }

        this.options.smiley_path = this.configuration.smilesBase;
        this.options.smiley_descriptions = [];
        this.options.smiley_images = [];

        _.each(this.configuration.smiles, (smile: Smile) => {
            this.smileCodeToId[smile.code] = smile.id;
            this.smileIdToCode[smile.id] = smile.code;
            this.options.smiley_descriptions.push(smile.code);
            this.options.smiley_images.push(smile.id);
        });
    }
}

webFormsModule.directive('ckEditor', ['webFormsConfiguration', 'friendlyFormatting', (configuration: WebFormsConfiguration, friendlyFormatting: FriendlyFormattingService) => {
    return <ng.IDirective>{
        require: ['?ngModel', '^?mdInputContainer'],
        restrict: 'AE',
        replace: false,
        scope: {
            options: '=',
            readonly: '='
        },
        link: (scope: CkEditorDirectiveScope, element: JQuery, attrs, controllers: any[]) => {
            require(['ckeditor'], (ckeditor) => {
                return new CkEditorDirectiveLink(scope, element, controllers[0], controllers[1], configuration, friendlyFormatting, ckeditor);
            });
        }
    };
}]);
