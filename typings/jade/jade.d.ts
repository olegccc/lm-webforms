declare module Jade {

    interface JadeOptions {
        filename: string;
        doctype: string;
        pretty: any;
        self: boolean;
        debug: boolean;
        compileDebug: boolean;
        cache: boolean;
        compiler?: any;
        parser?: any;
        globals?: string[];
    }

    interface JadeDependencies {
        body: string;
        dependencies: string[];
    }

    interface Jade {
        compile(source: string, options?: JadeOptions): (locals: any) => string;
        compileFile(path: string, options?: JadeOptions): (locals: any) => string;
        compileClient(source: string, options?: JadeOptions): string;
        compileClientWithDependenciesTracked(source: string, options?: JadeOptions): JadeDependencies;
        compileFileClient(path: string, options?: JadeOptions): string;
        render(source: string, options?: JadeOptions): string;
        renderFile(filename: string, options?: JadeOptions): string;
    }
}

declare var JadeModule: Jade.Jade;

declare module "jade" {
    export = JadeModule;
}
