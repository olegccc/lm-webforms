/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

///<amd-dependency path="angular" />

import module = require('../module');
import WebFormsService = require('./WebFormsService');
import WebFormsConfiguration = require('../datatypes/WebFormsConfiguration');

var configuration = new WebFormsConfiguration();

module.value('webFormsConfiguration', configuration);

class WebFormsServiceProvider implements ng.IServiceProvider {
    public $get = ['$http', '$q', '$cacheFactory', '$mdDialog',
        (httpService: ng.IHttpService, qService: ng.IQService, cacheFactory: ng.ICacheFactoryService, dialogService: angular.material.MDDialogService) => {
            return new WebFormsService(httpService, qService, cacheFactory, dialogService);
        }];
}

module.provider('webForms', [WebFormsServiceProvider]);
