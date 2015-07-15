interface CaptchaDirectiveLinkScope extends ng.IScope {
}

class CaptchaDirectiveLink {
    constructor(scope: CaptchaDirectiveLinkScope, element: any, configuration: WebFormsConfiguration) {
        Recaptcha.create(configuration.recaptchaKey, element[0], {
            theme: "clean"
        });
    }
}

webFormsModule.directive("captcha", ['webFormsConfiguration', (configuration: WebFormsConfiguration) => {
    return {
        restrict: 'A',
        scope: {},
        link: function(scope: CaptchaDirectiveLinkScope, element: any) {
            new CaptchaDirectiveLink(scope, element, configuration);
        }
    }
}]);
