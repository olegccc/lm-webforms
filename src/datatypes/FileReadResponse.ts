/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file FileReadResponse.ts
 * @author Oleg Gordeev
 */

/**
 * Describes data received by file inputs
 * @interface FileReadResponse
 */
interface FileReadResponse {
    file: any;
    type: string;
    name: string;
    id: number;
}
