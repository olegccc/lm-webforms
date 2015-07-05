/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

class WebFormsConfiguration {
    constructor() {
        this.codeMirrorModules = [];
        this.smilesBase = null;
        this.smiles = [];
        this.maximumFileSize = 0;
        this.requiredErrorMessage = "This field is mandatory";
        this.notEqualErrorMessage = "Fields are not equal";
        this.maxLengthErrorMessage = "This field has to be less than {0} characters long";
        this.minLengthErrorMessage = "This field has to be greater than {0} characters long";
        this.emailErrorMessage = "Wrong e-mail address";
        this.dateErrorMessage = "Wrong date";
        this.timeErrorMessage = "Wrong time";
        this.numberErrorMessage = "Wrong number";
        this.patternErrorMessage = "The field doesn't match the pattern specified";
        this.urlErrorMessage = "Wrong URL";
        this.passwordErrorMessage = "Wrong password";
        this.chooseFileMessage = "Choose File";
        this.clearFileMessage = "Clear";
    }

    public codeMirrorModules: string[];
    public smiles: Smile[];
    public smilesBase: string;
    public maximumFileSize: number;
    public requiredErrorMessage: string;
    public notEqualErrorMessage: string;
    public maxLengthErrorMessage: string;
    public minLengthErrorMessage: string;
    public emailErrorMessage: string;
    public dateErrorMessage: string;
    public timeErrorMessage: string;
    public numberErrorMessage: string;
    public passwordErrorMessage: string;
    public patternErrorMessage: string;
    public urlErrorMessage: string;
    public chooseFileMessage: string;
    public clearFileMessage: string;
}

export = WebFormsConfiguration;