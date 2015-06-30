declare class Autolinker {
    urls: boolean;
    email: boolean;
    twitter: boolean;
    phone: boolean;
    hashtag: boolean;
    newWindow: boolean;
    stripPrefix: boolean;
    truncate: number;
    className: string;
    constructor();
    link(textOrHtml: string): string;
}

declare module "autolinker" {
    export = Autolinker;
}
