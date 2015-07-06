/// <reference path="../../typings/selenium-webdriver/selenium-webdriver.d.ts" />
/// <reference path="../../typings/angular-protractor/angular-protractor.d.ts" />

beforeAll(function(done) {
    browser.get('http://localhost:9090/test').then(function() {
        console.log('4');
        done();
    });
});

var path = require('path');
var filePath = path.resolve('./test/resources/file.txt');
console.log(filePath);

describe('User selects a file', function() {

    it('then the file should be received by the server', function() {
        var button = element(by.id('button_file'));
        button.click();

        browser.wait(() => {
            return browser.isElementPresent(by.css('md-content [name=required]'));
        }, 10000).then(() => {
            var file = element(by.css('md-content [name=required] input[type=file]'));
            file.sendKeys(filePath);
            var okButton = element(by.css('.md-actions button.md-primary'));
            okButton.click();
            element(by.id('returned-object')).getText().then((text: string) => {
                var result = JSON.parse(text);
                expect(result.required).toBeDefined();
                expect(result.required.file.substring(0, 4) === 'TG9y').toBeTruthy();
            });
        });
    });
});