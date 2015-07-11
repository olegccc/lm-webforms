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
class WebFormsServiceProvider implements ng.IServiceProvider, IWebFormsServiceProvider {

    private static configuration: WebFormsConfiguration;

    public constructor() {
    }

    public getConfiguration(): IWebFormsConfiguration {
        return WebFormsServiceProvider.configuration;
    }

    public $get = ['$http', '$q', '$cacheFactory', '$mdDialog',
        (httpService: ng.IHttpService, qService: ng.IQService, cacheFactory: ng.ICacheFactoryService, dialogService: angular.material.MDDialogService) => {
            return new WebFormsService(httpService, qService, cacheFactory, dialogService, WebFormsServiceProvider.configuration);
        }];

    public static initialize() {
        WebFormsServiceProvider.configuration = new WebFormsConfiguration();
        webFormsModule.value('webFormsConfiguration', WebFormsServiceProvider.configuration);
    }
}

WebFormsServiceProvider.initialize();

webFormsModule.provider('webForms', [WebFormsServiceProvider]);
