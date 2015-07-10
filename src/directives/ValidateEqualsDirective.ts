/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file ValidateEqualsDirective.ts
 * @author Oleg Gordeev
 */

/**
 * @interface ValidateEqualsAttributes
 */
interface ValidateEqualsAttributes extends ng.IAttributes {
    ngModel: any;
    reference: any;
    validateEquals: boolean;
}

/**
 * @class ValidateEqualsLink
 */
class ValidateEqualsLink {

    private model: ng.INgModelController;
    private attrs: ValidateEqualsAttributes;

    constructor(scope: ng.IScope, attrs:ValidateEqualsAttributes, model: ng.INgModelController) {

        if (_.isEmpty(attrs.validateEquals)) {
            return;
        }

        this.model = model;
        this.attrs = attrs;

        scope.$watch(attrs.ngModel, () => this.validate());
        attrs.$observe('reference', () => this.validate());
    }

    private validate() {
        var val1 = this.model.$viewValue;
        var val2 = this.attrs.reference;
        this.model.$setValidity(Constants.VALIDATION_ERROR_MATCH, _.isEqual(val1, val2));
    }
}

webFormsModule.directive('validateEquals', [() => {
    return <ng.IDirective>{
        restrict: 'A',
        require: '?ngModel',
        link: (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs:ValidateEqualsAttributes, model: ng.INgModelController) => {
            new ValidateEqualsLink(scope, attrs, model);
        }
    };
}]);
