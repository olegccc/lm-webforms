/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file IWebFormsService.ts
 * @author Oleg Gordeev
 */

/**
 * @interface IWebFormsService
 */
interface IWebFormsService {
    newObject<T>(typeId: string, initialObject: T, resolver: (object: T) => ng.IPromise<void>): ng.IPromise<T>;
    editObject<T>(typeId: string, object: T, resolver: (object: T) => ng.IPromise<void>): ng.IPromise<T>;
    question(message: string, title: string, resolver: () => ng.IPromise<void>): ng.IPromise<void>;
    message(message: string, title: string): ng.IPromise<void>;
}
