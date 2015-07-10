/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file WebFormsServiceProvider.ts
 * @author Oleg Gordeev
 */

var configuration = new WebFormsConfiguration();

webFormsModule.value('webFormsConfiguration', configuration);

/**
 * @class WebFormsServiceProvider
 */
class WebFormsServiceProvider implements ng.IServiceProvider, IWebFormsServiceProvider {

    public getConfiguration(): IWebFormsConfiguration {
        return configuration;
    }

    public $get = ['$http', '$q', '$cacheFactory', '$mdDialog',
        (httpService: ng.IHttpService, qService: ng.IQService, cacheFactory: ng.ICacheFactoryService, dialogService: angular.material.MDDialogService) => {
            return new WebFormsService(httpService, qService, cacheFactory, dialogService);
        }];
}

webFormsModule.provider('webForms', [WebFormsServiceProvider]);
