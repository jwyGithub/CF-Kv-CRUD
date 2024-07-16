import KVController, { VALUE_TYPE } from '../plugins/KV';
import { ServiceResponse } from '../service';
import { CONTENT_TYPE } from '../service/serviceConfig';
import { MAX_FILE_SIZE, checkFileSize, getBody } from '../utils/utils';
import type { RouteConfig } from './router';

export default [
    {
        path: '/',
        async excute(request, _env) {
            try {
                const HOME_PAGE = _env.HOME_PAGE || 'https://raw.githubusercontent.com/jwyGithub/cf-kv-crud/main/frontend/dist/index.html';
                const indexHtml = await fetch(HOME_PAGE).then(res => res.text());
                return new Response(indexHtml, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/html',
                        'Cache-Control': 'public, max-age=86400',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        }
    },
    {
        path: '/api/verifyToken',
        async excute(request, env) {
            try {
                const data = await getBody<{ token?: string }>(request);

                if (!data.token) {
                    return ServiceResponse.onBadRequest(`Token Not Found, It is likely { "token": "Your_AUTH_TOKEN" }`);
                }

                if (data.token !== env.AUTH_TOKEN) {
                    return ServiceResponse.onUnauthorized('Unauthorized');
                }

                return ServiceResponse.onSuccessJson('AUTH_TOKEN is correct');
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        },

        beforeEnter(check, CheckEnter) {
            return !check.method('POST') ? CheckEnter.rejectMethodEnter() : CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/getKvList',
        async excute(_request, env) {
            try {
                const keys = env.KV_KEYS.split('\n') as string[];
                return ServiceResponse.onSuccessJson(keys.map(item => ({ label: item.trim(), value: item.trim() })));
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        },
        beforeEnter(check, CheckEnter) {
            if (!check.method('GET')) {
                return CheckEnter.rejectMethodEnter();
            }

            if (!check.token()) {
                return CheckEnter.rejectTokenEnter();
            }

            if (!check.env.KV_KEYS) {
                return CheckEnter.rejectNotKVEnter();
            }

            return CheckEnter.acceptEnter();
        }
    },

    {
        path: '/api/get',

        async excute(request, env) {
            try {
                const key = new URL(request.url).searchParams.get('key');
                if (!key) {
                    return ServiceResponse.onBadRequest('KEY Not Found');
                }
                const kvController = new KVController(env[request.headers.get('kv')!]);
                const { value, valueType } = await kvController.getItem<string>(key);
                if (value === null) {
                    return ServiceResponse.onNotFound('Not Found');
                }
                return ServiceResponse.onSuccessJson({ key, value, valueType });
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        },

        beforeEnter(check, CheckEnter) {
            if (!check.method('GET')) {
                return CheckEnter.rejectMethodEnter();
            }

            if (!check.token()) {
                return CheckEnter.rejectTokenEnter();
            }

            if (!check.kv()) {
                return CheckEnter.rejectNotKVEnter();
            }

            return CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/update',
        async excute(request, env) {
            try {
                const body = await getBody<{ key: string; value: string }>(request);
                if (!body.key || !body.value) {
                    return ServiceResponse.onBadRequest('KEY or VALUE Not Found');
                }

                const kvController = new KVController(env[request.headers.get('kv')!]);
                await kvController.updateItem(body.key, body.value);
                const updatedValue = await kvController.getItem(body.key);
                return ServiceResponse.onSuccessJson({ key: body.key, value: updatedValue });
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        },
        beforeEnter(check, CheckEnter) {
            if (!check.method('POST')) {
                return CheckEnter.rejectMethodEnter();
            }

            if (!check.token()) {
                return CheckEnter.rejectTokenEnter();
            }

            if (!check.kv()) {
                return CheckEnter.rejectNotKVEnter();
            }

            return CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/add',
        async excute(request, env) {
            try {
                const body = await getBody<{ key: string; value: string }>(request);
                if (!body.key || !body.value) {
                    return ServiceResponse.onBadRequest('KEY or VALUE Not Found');
                }

                const kvController = new KVController(env[request.headers.get('kv')!]);
                await kvController.addItem(body.key, body.value, { metadata: { timestamp: Date.now(), valueType: VALUE_TYPE.TEXT } });
                const { value, valueType } = await kvController.getItem(body.key);
                return ServiceResponse.onSuccessJson({ key: body.key, value, valueType });
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        },

        beforeEnter(check, CheckEnter) {
            if (!check.method('POST')) {
                return CheckEnter.rejectMethodEnter();
            }

            if (!check.token()) {
                return CheckEnter.rejectTokenEnter();
            }

            if (!check.kv()) {
                return CheckEnter.rejectNotKVEnter();
            }

            return CheckEnter.acceptEnter();
        }
    },

    {
        path: '/api/delete',
        async excute(request, env) {
            try {
                const body = await getBody<{ key: string }>(request);
                if (!body.key) {
                    return ServiceResponse.onBadRequest('KEY Not Found');
                }

                const kvController = new KVController(env[request.headers.get('kv')!]);
                await kvController.deleteItem(body.key);
                return ServiceResponse.onSuccessJson();
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        },

        beforeEnter(check, CheckEnter) {
            if (!check.method('POST')) {
                return CheckEnter.rejectMethodEnter();
            }

            if (!check.token()) {
                return CheckEnter.rejectTokenEnter();
            }

            if (!check.kv()) {
                return CheckEnter.rejectNotKVEnter();
            }

            return CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/getList',
        async excute(request, env) {
            try {
                const { origin } = new URL(request.url);
                const kvController = new KVController(env[request.headers.get('kv')!]);
                const list = await kvController.getAll();
                const response = list.map(item => {
                    return {
                        ...item,
                        download: `${origin}/api/download?file=${item.key}`,
                        preview: `${origin}/${request.headers.get('kv')}/static/${item.key}`
                    };
                });
                return ServiceResponse.onSuccessJson(response);
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        },
        beforeEnter(check, CheckEnter) {
            if (!check.method('GET')) {
                return CheckEnter.rejectMethodEnter();
            }

            if (!check.token()) {
                return CheckEnter.rejectTokenEnter();
            }

            if (!check.kv()) {
                return CheckEnter.rejectNotKVEnter();
            }

            return CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/getKvKeys',
        async excute(request, env) {
            try {
                const kvController = new KVController(env[request.headers.get('kv')!]);
                const list = await kvController.getKeys();
                return ServiceResponse.onSuccessJson(list);
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        },
        beforeEnter(check, CheckEnter) {
            if (!check.method('GET')) {
                return CheckEnter.rejectMethodEnter();
            }

            if (!check.token()) {
                return CheckEnter.rejectTokenEnter();
            }

            if (!check.kv()) {
                return CheckEnter.rejectNotKVEnter();
            }

            return CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/upload',
        async excute(request, env) {
            try {
                const formData = await request.formData();
                const file = formData.get('file') as File;

                if (!checkFileSize(file)) {
                    return ServiceResponse.onBadRequest(`File size is too large (max ${MAX_FILE_SIZE}), Your upload size is ${file.size}`);
                }

                const fileName = file!.name!;
                const arrayBuffer = await file!.arrayBuffer();
                const fileContent = new Uint8Array(arrayBuffer);

                const kvController = new KVController(env[request.headers.get('kv')!]);
                await kvController.addItem(fileName, fileContent, { metadata: { timestamp: Date.now(), valueType: VALUE_TYPE.STREAM } });
                const { origin } = new URL(request.url);
                return ServiceResponse.onSuccessJson({
                    fileName,
                    download: `${origin}/api/download?file=${fileName}`,
                    preview: `${origin}/${request.headers.get('kv')}/static/${fileName}`
                });
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        },

        beforeEnter(check, CheckEnter) {
            if (!check.method('POST')) {
                return CheckEnter.rejectMethodEnter();
            }

            if (!check.token()) {
                return CheckEnter.rejectTokenEnter();
            }

            if (!check.kv()) {
                return CheckEnter.rejectNotKVEnter();
            }

            return CheckEnter.acceptEnter();
        }
    },

    {
        path: '/api/download',

        async excute(request, _env) {
            try {
                const url = new URL(request.url);
                const fileName = url.searchParams.get('file');

                if (!fileName) {
                    return ServiceResponse.onBadRequest('File name is required');
                }

                const kvController = new KVController(_env[request.headers.get('kv')!]);

                const { value } = await kvController.getItem<ArrayBuffer>(fileName, 'arrayBuffer');
                if (!value) {
                    return ServiceResponse.onNotFound('File not found');
                }

                return ServiceResponse.onSuccessStream(value, 'Download Success', CONTENT_TYPE.STREAM);
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        },

        beforeEnter(check, CheckEnter) {
            if (!check.method('GET')) {
                return CheckEnter.rejectMethodEnter();
            }

            if (!check.token()) {
                return CheckEnter.rejectTokenEnter();
            }

            if (!check.kv()) {
                return CheckEnter.rejectNotKVEnter();
            }

            return CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/clear',
        async excute(request, env) {
            try {
                const kvController = new KVController(env[request.headers.get('kv')!]);
                await kvController.clear();
                return ServiceResponse.onSuccessJson();
            } catch (error: any) {
                return ServiceResponse.onError(error.message);
            }
        },
        beforeEnter(check, CheckEnter) {
            if (!check.method('POST')) {
                return CheckEnter.rejectMethodEnter();
            }

            if (!check.token()) {
                return CheckEnter.rejectTokenEnter();
            }

            if (!check.kv()) {
                return CheckEnter.rejectNotKVEnter();
            }

            return CheckEnter.acceptEnter();
        }
    }
] as RouteConfig[];
