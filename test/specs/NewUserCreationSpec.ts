/// <reference path="../../typings/selenium-webdriver/selenium-webdriver.d.ts" />
/// <reference path="../../typings/angular-protractor/angular-protractor.d.ts" />

describe('Given we open new user dialog', () => {

    var button = element(by.id('button'));
    button.click();

    describe('When we enter new user fields and submit the dialog', () => {

        var userName = 'username';
        var userPassword = 'pwd';
        var userEmail = 'user@email.com';

        var form = element(by.name('md-content'));
        var name = form.element(by.css('[name=name]'));
        name.sendKeys(userName);
        var password = form.element(by.css('[name=password]'));
        password.sendKeys(userPassword);
        var email = form.element(by.css('[name=email]'));
        email.sendKeys(userEmail);
        var okButton = form.element(by.css('md-button.md-primary'));
        okButton.click();

        it('Then we should get our object with all specified fields filled in', (done: () => void) => {
            element(by.id('returned-object')).getText().then((text: string) => {
                var newUser = JSON.parse(text);
                expect(newUser.name).toBe(userName);
                expect(newUser.email).toBe(userEmail);
                expect(newUser.password).toBe(userPassword);
                done();
            });
        });
    });
});
