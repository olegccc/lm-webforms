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
    }

    public codeMirrorModules: string[];
    public smiles: Smile[];
    public smilesBase: string;
    public maximumFileSize: number;
}

export = WebFormsConfiguration;