/// <reference path="../../typings/selenium-webdriver/selenium-webdriver.d.ts" />
/// <reference path="../../typings/angular-protractor/angular-protractor.d.ts" />

beforeAll(function(done) {
    browser.get('http://localhost:9090/test').then(function() {
        done();
    });
});

describe('When we enter new user fields and submit the dialog', () => {

    it('Then we should get our object with all specified fields filled in', (done: () => void) => {

        var button = element(by.id('button_main'));
        button.click();

        var userName:string = 'username';
        var userPassword = 'pwd';
        var userEmail:string = 'user@email.com';

        var name = element(by.css('md-content [name=name]'));
        browser.wait(protractor.until.elementIsVisible(name), 10000);
        name.sendKeys(userName);
        var password = element(by.css('md-content [name=password]'));
        var passwordRepeat = element(by.css('md-content [name="password$Repeat"]'));
        password.sendKeys(userPassword);
        passwordRepeat.sendKeys(userPassword);
        var email = element(by.css('md-content [name=email]'));
        email.sendKeys(userEmail);
        var okButton = element(by.css('.md-actions button.md-primary'));
        okButton.click();

        var returnedObject = element(by.id('returned-object'));
        browser.wait(protractor.until.elementTextMatches(returnedObject, /.+/), 50000);

        returnedObject.getText().then((text: string) => {
            var newUser = JSON.parse(text);
            expect(newUser.name).toBe(userName);
            expect(newUser.email).toBe(userEmail);
            expect(newUser.password).toBe(userPassword);
            done();
        });
    });
});
