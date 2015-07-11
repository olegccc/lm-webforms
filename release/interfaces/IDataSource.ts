/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file IDataSource.ts
 * @author Oleg Gordeev
 */

/**
 * @interface IDataSource
 */
interface IDataSource {
    getSelectItems: (id: string, object: any) => any;
    searchItems: (searchText: string) => string[];
    getDynamicFields: (id: string, object: any) => any;
}
