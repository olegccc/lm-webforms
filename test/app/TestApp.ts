///<reference path="../../release/interfaces/IDataSource.ts" />
///<reference path="../../release/interfaces/IWebFormsServiceProvider.ts" />
///<reference path="../../release/interfaces/IWebFormsConfiguration.ts" />
///<amd-dependency path="domready" />

import TestController = require('./TestController');

var searchSet: string[] =
    "Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
              Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
              Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
              Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
              North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
              South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
              Wisconsin, Wyoming".split(/, +/g);

class TestSelectSource implements IDataSource {

    public searchItems(searchText: string): string[] {
        return searchSet.filter((state: string) => {
            return state.indexOf(searchText) >= 0;
        });
    }

    public getSelectItems(key:string, value:any): any {
        return {
            item1: "Dynamic Item 1",
            item2: "Dynamic Item 2"
        }
    }
}

function initializeApp() {
    var appModule = angular.module('testApp', [
        'lm-webforms'
    ]);

    appModule.config(['webFormsProvider', (webFormsServiceProvider: IWebFormsServiceProvider) => {
        var configuration: IWebFormsConfiguration = webFormsServiceProvider.getConfiguration();
        configuration.addDataSource("items", new TestSelectSource());
        configuration.loadModulesOnDemand = true;
        configuration.codeMirrorModules = [
            'codemirror/lib/codemirror',
            'codemirror/mode/htmlmixed/htmlmixed',
            'codemirror/mode/htmlembedded/htmlembedded',
            'codemirror/addon/hint/html-hint',
            'codemirror/mode/xml/xml',
            'codemirror/mode/javascript/javascript',
            'codemirror/mode/css/css',
            'codemirror/addon/mode/multiplex',
            'codemirror/addon/hint/xml-hint'
        ];
    }]);

    appModule.controller('test', ['$scope', 'webForms', TestController]);

    angular.bootstrap(document, ['testApp']);
}

export = initializeApp;
