export interface IMatchOptions<Env> {
    path: string;
    request: globalThis.Request;
    env: Env;
    fileConvert: any;
    staticPath: string;
}
