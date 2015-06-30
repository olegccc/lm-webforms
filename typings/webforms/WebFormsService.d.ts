declare class WebFormsService {
    public newObject<T>(typeId: string, initialObject: T, resolver: (object: T) => ng.IPromise<void>): ng.IPromise<T>;
    public editObject<T>(typeId: string, object: T, resolver: (object: T) => ng.IPromise<void>): ng.IPromise<T>;
    public question(message: string, title: string, resolver: () => ng.IPromise<void>): ng.IPromise<void>;
    public message(message: string, title: string): ng.IPromise<void>;
}