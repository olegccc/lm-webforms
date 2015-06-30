declare module "codemirror" {
    var _: string;
    export = _;
}

declare module CodeMirror {
    class CodeMirror {
        constructor(host: HTMLElement, options?: any);
        constructor(callback: (host: HTMLElement) => void , options?: any);

        public static fromTextArea(host: HTMLElement, options?: any): CodeMirror;

        public static defaults: any;

        getOption(option: string) : any;
        setOption(option: string, value: any): void;
        setValue(content: string): void;
        getValue(separator?: string): string;
        on(eventName: string, handler: (instance: CodeMirror) => void ): void;
        refresh(): void;
    }
}