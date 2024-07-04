import type { IEnterError } from '../router/router';
import { SERVICE_CONFIG } from '../service/serviceConfig';
import type { IMethod } from '../service/service';

export class Check {
    request: Request<unknown, CfProperties<unknown>>;
    env: Env;
    constructor(request: Request, env: Env) {
        this.request = request;
        this.env = env;
    }

    public method(method: IMethod): boolean {
        return this.request.method.toLocaleUpperCase() === method;
    }

    public token() {
        const authorization = this.request.headers.get('Authorization');
        if (authorization) {
            return authorization === this.env.AUTH_TOKEN;
        }
        return false;
    }

    public static rejectMethodEnter(): IEnterError {
        return { isCanEnter: false, message: SERVICE_CONFIG.NOT_ALLOWED.MESSAGE, status: SERVICE_CONFIG.NOT_ALLOWED.CODE };
    }

    public static rejectTokenEnter(): IEnterError {
        return { isCanEnter: false, message: SERVICE_CONFIG.UNAUTHORIZED.MESSAGE, status: SERVICE_CONFIG.UNAUTHORIZED.CODE };
    }

    public static rejectEnter(message: string = '', status?: number): IEnterError {
        return { isCanEnter: false, message, status };
    }

    public static rejectNotKVEnter(): IEnterError {
        return { isCanEnter: false, message: 'KV Namespace not found', status: SERVICE_CONFIG.BAD_REQUEST.CODE };
    }

    public static acceptEnter(message: string = ''): IEnterError {
        return { isCanEnter: true, message, status: SERVICE_CONFIG.SUCCESS.CODE };
    }
}
