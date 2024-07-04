import { Router } from './router/router';
import routes from './router/route';
import fileConvertWasm from './wasm/file_converter.wasm';
import { ServiceResponse } from './service';
import { getStaticPath } from './utils/utils';

const router = new Router({ routes });

function beforeCheck(env: Env): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!env.AUTH_TOKEN) {
            reject(new Error('Env Key AUTH_TOKEN is not set'));
        }

        if (!env.KV_KEYS) {
            reject(new Error('Env Key KV_KEYS is not set'));
        }

        resolve('');
    });
}

export default {
    async fetch(request, env): Promise<Response> {
        try {
            await beforeCheck(env);
            const fileConvert = (await WebAssembly.instantiate(fileConvertWasm)).exports;
            const { pathname } = new URL(request.url);
            const staticPath = getStaticPath(env);
            return router.match({
                path: pathname,
                request,
                env,
                fileConvert,
                staticPath
            });
        } catch (error: any) {
            return ServiceResponse.onError(error.message);
        }
    }
} satisfies ExportedHandler<Env>;
