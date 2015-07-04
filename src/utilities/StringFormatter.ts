import _ = require('lodash');

class StringFormatter {
    public static format(format: string, ...args: any[]): string {
        return format.replace(/{(\d+)}/g, function(match, number) {
            return _.isUndefined(args[number]) ? match: args[number];
        });
    }
}

export = StringFormatter;
