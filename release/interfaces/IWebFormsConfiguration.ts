/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file IWebFormsConfiguration.ts
 * @author Oleg Gordeev
 */

///<reference path="./Smile.ts" />
///<reference path="./IDataSource.ts" />

/**
 * @interface IWebFormsConfiguration
 */
interface IWebFormsConfiguration {
    addDataSource(key: string, source: IDataSource);
    getDataSource(key: string): IDataSource;
    codeMirrorModules: string[];
    smiles: Smile[];
    smilesBase: string;
    maximumFileSize: number;
    requiredErrorMessage: string;
    notEqualErrorMessage: string;
    maxLengthErrorMessage: string;
    minLengthErrorMessage: string;
    emailErrorMessage: string;
    dateErrorMessage: string;
    timeErrorMessage: string;
    numberErrorMessage: string;
    patternErrorMessage: string;
    urlErrorMessage: string;
    loadModulesOnDemand: boolean;
    notFoundMessage: string;
    recaptchaKey: string;
}
