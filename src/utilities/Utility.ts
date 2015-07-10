class _ {
    public static isBoolean(arg): boolean {
        return arg === true || arg === false;
    }
    public static copy(arg) {
        return angular.copy(arg);
    }
    public static forOwn(object: any, callback) {

        if (object === null || _.isUndefined(object)) {
            return;
        }

        var properties = Object.getOwnPropertyNames(object);

        angular.forEach(properties, (propertyName: string) => {
            callback(object[propertyName], propertyName);
        });
    }
    public static isString(arg): boolean {
        return angular.isString(arg);
    }
    public static each(arg, handler) {
        angular.forEach(arg, handler);
    }
    public static isArray(arg): boolean {
        return angular.isArray(arg);
    }
    public static isUndefined(arg): boolean {
        return angular.isUndefined(arg);
    }
    public static isDefined(arg): boolean {
        return angular.isDefined(arg);
    }
    public static isDate(arg): boolean {
        return angular.isDate(arg);
    }
    public static isFunction(arg): boolean {
        return angular.isFunction(arg);
    }
    public static isObject(arg): boolean {
        return angular.isObject(arg);
    }
    public static isEmpty(arg) {
        if (arg === null || _.isUndefined(arg)) {
            return true;
        }
        if (_.isArray(arg) || _.isString(arg) || _.isFunction(arg)) {
            return arg.length === 0;
        }
        if (_.isObject(arg)) {
            return Object.getOwnPropertyNames(arg).length === 0;
        }
        if (_.isBoolean(arg) || _.isDate(arg)) {
            return false;
        }
        return true;
    }
    public static union(arg1, arg2) {
        var ret = [];
        if (_.isArray(arg1)) {
            _.each(arg1, (val) => {
                ret.push(val);
            })
        }
        if (_.isArray(arg2)) {
            _.each(arg2, (val) => {
                for (var i = 0; i < ret.length; i++) {
                    if (_.isEqual(ret[i], val)) {
                        return;
                    }
                }
                ret.push(val);
            })
        }
        return ret;
    }
    public static some(arg, handler): boolean {
        if (_.isArray(arg)) {
            for (var i = 0; i < arg.length; i++) {
                if (handler(arg[i])) {
                    return true;
                }
            }
            return false;
        }
        if (_.isObject(arg)) {
            var keys = Object.getOwnPropertyNames(arg);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (handler(arg[key], key)) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }
    public static isEqual(arg1, arg2): boolean {
        if (arg1 === null && arg2 === null) {
            return true;
        }
        if (arg1 === null || arg2 === null) {
            return false;
        }
        if (_.isUndefined(arg1) || _.isUndefined(arg2)) {
            return false;
        }
        if (_.isArray(arg1)) {
            if (!_.isArray(arg2)) {
                return false;
            }
            var len = arg1.length;
            if (len !== arg2.length) {
                return false;
            }
            for (var i = 0; i < len; i++) {
                if (!_.isEqual(arg1[i], arg2[i])) {
                    return false;
                }
            }
            return true;
        }
        if (_.isObject(arg1)) {
            if (!_.isObject(arg2)) {
                return false;
            }
            var keys1 = Object.getOwnPropertyNames(arg1).sort();
            var keys2 = Object.getOwnPropertyNames(arg2).sort();
            if (!_.isEqual(keys1, keys2)) {
                return false;
            }
            for (var i = 0; i < keys1.length; i++) {
                var key = keys1[i];
                if (!_.isEqual(arg1[key], arg2[key])) {
                    return false;
                }
            }
            return true;
        }
        return arg1 === arg2;
    }
}
