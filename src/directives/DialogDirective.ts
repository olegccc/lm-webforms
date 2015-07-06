/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

///<amd-dependency path="angular" />
///<amd-dependency path="text!views/webDialog.html" />

var template = require('text!views/webDialog.html');
import module = require('modules/WebFormsModule');
import DialogController = require('controllers/DialogController');

module.directive('lmDialog', [() => {
    return <ng.IDirective>{
        template: template,
        restrict: 'E',
        replace: false,
        scope: {
            configuration: '='
        },
        controller: DialogController
    };
}]);
