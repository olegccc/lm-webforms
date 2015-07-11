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
class WebFormsService implements IWebFormsService {

    private httpService: ng.IHttpService;
    private qService: ng.IQService;
    private cache: ng.ICacheObject;
    private dialogService: angular.material.MDDialogService;
    private configuration: WebFormsConfiguration;

    constructor(
            httpService: ng.IHttpService,
            qService: ng.IQService,
            cacheFactory: ng.ICacheFactoryService,
            dialogService: angular.material.MDDialogService,
            configuration: WebFormsConfiguration) {
        this.httpService = httpService;
        this.qService = qService;
        this.cache = cacheFactory("lm-webforms");
        this.dialogService = dialogService;
        this.configuration = configuration;
    }

    public newObject<T>(typeId: string, initialObject: T = null, resolver: (object: T) => ng.IPromise<void> = null): ng.IPromise<T> {
        return this.getTemplateAndExecute<T>(typeId, initialObject, true, resolver);
    }

    public editObject<T>(typeId: string, object: T, resolver: (object: T) => ng.IPromise<void> = null): ng.IPromise<T> {
        return this.getTemplateAndExecute<T>(typeId, object, false, resolver);
    }

    public question(message: string, title: string, resolver: () => ng.IPromise<void> = null): ng.IPromise<void> {
        var defer = this.qService.defer<void>();

        this.dialogService.show({
            template: templates['views/webFormQuestion.jade'],
            locals: {
                message: message,
                title: title,
                defer: defer,
                resolver: resolver
            },
            controller: 'inputFormQuestion'
        }).catch(() => {
            defer.reject();
        });

        return defer.promise;
    }

    public message(message: string, title: string = null): ng.IPromise<void> {

        var defer = this.qService.defer<void>();

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
    }

    private getTemplateAndExecute<T>(typeId: string, object: any, isNew: boolean, resolver: (object: T) => ng.IPromise<void> = null): ng.IPromise<T> {
        var defer = this.qService.defer<T>();
        this.httpService.get<WebFormDefinition>(typeId + '.json', { cache: this.cache })
            .then(data => {
                this.executeWithDefinitionLoaded<T>(object, data.data, isNew, defer, resolver);
            }, (message) => defer.reject(message));
        return defer.promise;
    }

    private static fillRichTextModules(requires: string[]) {
        requires.push("ckeditor");
    }

    private fillCodeTextModules(requires: string[]) {
        if (_.isEmpty(this.configuration.codeMirrorModules)) {
            requires.push("codemirror");
        } else {
            _.each(this.configuration.codeMirrorModules, (module: string) => {
                requires.push(module);
            });
        }
    }

    private executeWithDefinitionLoaded<T>(object: T, definition: WebFormDefinition, isNew: boolean, defer: ng.IDeferred<T>, resolver: (object: T) => ng.IPromise<void>) {
        var hasTinyMce = false;
        var hasCodeMirror = false;
        var hasDynamicFields = false;

        _.forOwn(definition.fields, (field: InputFieldDefinition, property: string) => {
            field.property = property;
        });

        var requires: string[] = [];

        if (this.configuration.loadModulesOnDemand) {
            _.each(definition.fields, (field: InputFieldDefinition) => {
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
                            this.fillCodeTextModules(requires);
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
            require(requires, () => {
                this.executeWithDefinitionAndModulesLoaded(object, definition, isNew, defer, resolver);
            });
        } else {
            this.executeWithDefinitionAndModulesLoaded(object, definition, isNew, defer, resolver);
        }
    }

    private executeWithDefinitionAndModulesLoaded<T>(object: any, typeDefinition: WebFormDefinition, isNew: boolean, defer: ng.IDeferred<T>, resolver: (object: T) => ng.IPromise<void> = null) {

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
        }).then(() => {
            console.log('ok');
        }).catch(() => {
            console.log('cancel');
            defer.reject("Cancelled");
        });
    }
}
