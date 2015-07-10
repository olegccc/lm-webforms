/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file SelectValueDefinition.ts
 * @author Oleg Gordeev
 */

/**
 * @class SelectValueDefinition
 */
class SelectValueDefinition {
    text: string;
    key: string;
    isGroup: boolean;
    items: Array<SelectValueDefinition>;
}
