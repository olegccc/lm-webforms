/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

///<amd-dependency path="angular" />

import Autolinker = require('autolinker');
import WebFormsConfiguration = require('../datatypes/WebFormsConfiguration');

class FriendlyFormattingService {

    smilesBase: string;
    smiles: { [code: string]: string } = {};
    smilesString = "";
    smilesExpression: RegExp;
    autoLinker: Autolinker;

    constructor(configuration: WebFormsConfiguration) {
        this.smilesBase = configuration.smilesBase;
        this.autoLinker = new Autolinker();
        this.autoLinker.newWindow = false;
        this.autoLinker.truncate = 30;

        for (var i = 0; i < configuration.smiles.length; i++) {
            var smile = configuration.smiles[i];
            this.smiles[smile.code] = smile.id;
            if (this.smilesString.length > 0) {
                this.smilesString += "|";
            }
            for (var j = 0; j < smile.code.length; j++) {
                switch (smile.code[j]) {
                    case '(':
                    case ')':
                    case '[':
                    case ']':
                    case '-':
                    case '?':
                    case '|':
                        this.smilesString += '\\';
                        break;
                }
                this.smilesString += smile.code[j];
            }
        }

        if (this.smilesString.length > 0) {
            this.smilesExpression = new RegExp(this.smilesString, "g");
        } else {
            this.smilesExpression = null;
        }

    }

    public getSmilesExpression(): RegExp {
        return this.smilesExpression;
    }

    private getSmileUrl(code: string) {
        if (!code.length || !this.smilesBase) {
            return "";
        }
        return "<img alt=\"" + code + "\" src=\"" + this.smilesBase + this.smiles[code] + "\" title=\"" + code + "\" />";
    }

    public smilesToImg(text: string): string {
        if (this.smilesExpression != null) {
            text = text.replace(/([^<>]*)(<[^<>]*>)/gi, function (match, left, tag) {
                if (!left || left.length == 0) {
                    return match;
                }
                left = left.replace(this.smilesExpression, this.getSmileUrl);
                return tag ? left + tag : left;
            });
        }
        return text;
    }

    public getFriendlyHtml(text: string): string {

        if (text == null || text.length == 0) {
            return text;
        }

        text = this.smilesToImg(text);

        return this.autoLinker.link(text);
    }
}

import module = require('../module');

module.service('friendlyFormatting', [
    'webFormsConfiguration',
    FriendlyFormattingService]);

export = FriendlyFormattingService;
