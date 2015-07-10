/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file StringFormatter.ts
 * @author Oleg Gordeev
 */

/**
 * @class StringFormatter
 */
class StringFormatter {
    public static format(format: string, ...args: any[]): string {
        return format.replace(/{(\d+)}/g, function(match, number) {
            return _.isUndefined(args[number]) ? match: args[number];
        });
    }
}
