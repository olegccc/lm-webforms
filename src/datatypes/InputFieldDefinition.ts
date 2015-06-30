/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

class InputFieldDefinition {
    type: string;
    property: string;
    isOpen: boolean;
    readOnlyCondition: string;
    readOnlyFunction: (obj: any) => boolean;
    readOnly: boolean;
    helpText: string;
    required: boolean;
    dynamicSource: DynamicInputFieldDefinition;
    defaultValue: string;
    inlineWithPrevious: boolean;
    reference: string;
    isGroup: boolean;
    children: InputFieldDefinition[];
    position: number;
    visibleCondition: string;
    visibleFunction: (obj: any) => boolean;
    selectValues: SelectValueDefinition[];
}
