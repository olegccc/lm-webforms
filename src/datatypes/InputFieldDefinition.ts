/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file InputFieldDefinition.ts
 * @author Oleg Gordeev
 */

/**
 * @class InputFieldDefinition
 */
class InputFieldDefinition {
    type: string;
    property: string;
    isOpen: boolean;
    readOnly: string;
    readOnlyFunction: (obj: any) => boolean;
    helpText: string;
    required: boolean;
    repeat: boolean;
    dynamicSource: DynamicInputFieldDefinition;
    defaultValue: string;
    inlineWithPrevious: boolean;
    reference: string;
    isGroup: boolean;
    children: InputFieldDefinition[];
    position: number;
    visible: string;
    visibleFunction: (obj: any) => boolean;
    maxLength: number;
    minLength: number;
    source: string;
    getItems: () => any;
    items: { [key:string]: string };
    itemsArray: Array<SelectValueDefinition>;
    placeholder: string;
}
