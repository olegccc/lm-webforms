/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file IFriendlyFormattingService.ts
 * @author Oleg Gordeev
 */

/**
 * @interface IFriendlyFormattingService
 */

interface IFriendlyFormattingService {

    /**
     * Gets user-friendly html code to display on any page. It shows pre-configured smiles as images
     * and shortens links
     *
     * @param text - raw HTML code to format
     */
    getFriendlyHtml(text: string): string;
}
