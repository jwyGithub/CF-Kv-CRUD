import { Check } from '../plugins/Check';
import { ServiceResponse } from '../service/index';
import type { ISERVICE_CODE } from '../service/service';
import { getMatchPath, getMimeType, matchStatic } from '../utils/utils';
import type { IMatchOptions } from './route.d';

export interface IEnterError {
    isCanEnter: boolean;
    message: string;

    status?: ISERVICE_CODE | number;
}

export interface RouteConfig {
    path: string;
    name?: string;

    excute: (request: globalThis.Request, env: Env, ...arg: any[]) => Promise<Response>;

    beforeEnter?: (check: Check, CheckEnter: typeof Check) => IEnterError;

    onError?: (reason: IEnterError, request: globalThis.Request, env: Env, ...arg: any[]) => Promise<Response>;
}

export interface IRouter {
    routes: RouteConfig[];
}

export class Router {
    private routes: RouteConfig[];
    constructor(config: IRouter) {
        this.routes = config.routes;
    }

    async match(options: IMatchOptions<Env>): Promise<Response> {
        try {
            const { path, request, env, fileConvert, staticPath } = options;
            const route = this.routes.find(route => route.path === path);
            if (route) {
                const check = new Check(request, env);
                const beforeEnter = route.beforeEnter || ((_: Check, CheckEnter: typeof Check) => CheckEnter.acceptEnter());
                const onError = route.onError || ((reason, _request, _env) => ServiceResponse.onBadRequest(reason.message, reason.status));
                const enter = beforeEnter(check, Check);
                if (enter.isCanEnter) {
                    return route.excute(request, env, fileConvert);
                } else {
                    return onError(enter, request, env, fileConvert);
                }
            } else if (matchStatic(path, staticPath)) {
                const { kvKey, fileName } = getMatchPath(path, staticPath);
                if (fileName && kvKey) {
                    const suffix = fileName.split('.').pop();
                    const { mimeType, type } = getMimeType(suffix!);
                    const content = await env[kvKey].get(fileName, type);
                    return new Response(content, {
                        headers: {
                            'Content-Type': mimeType,
                            'Cache-Control': 'public, max-age=86400',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                }
            }
            return ServiceResponse.onNotFound();
        } catch (error: any) {
            return ServiceResponse.onBadRequest(error.message);
        }
    }
}
