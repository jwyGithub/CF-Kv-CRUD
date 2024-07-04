// src/service/serviceConfig.ts
var SERVICE_CONFIG = {
    /**
     * Represents a successful response.
     */
    SUCCESS: {
        CODE: 200,
        MESSAGE: 'success'
    },
    /**
     * Represents a server error response.
     */
    SERVER_ERROR: {
        CODE: 500,
        MESSAGE: 'server error'
    },
    /**
     * Represents a not found response.
     */
    NOT_FOUND: {
        CODE: 404,
        MESSAGE: 'not found'
    },
    /**
     * Represents an unauthorized response.
     */
    UNAUTHORIZED: {
        CODE: 401,
        MESSAGE: 'unauthorized'
    },
    /**
     * Represents a bad request response.
     */
    BAD_REQUEST: {
        CODE: 400,
        MESSAGE: 'bad request'
    },
    /**
     * Represents a method not allowed response.
     */
    NOT_ALLOWED: {
        CODE: 405,
        MESSAGE: 'method not allowed'
    }
};
var CONTENT_TYPE = {
    /**
     * Represents the JSON content type.
     */
    JSON: 'application/json',
    /**
     * Represents the stream content type.
     */
    STREAM: 'application/octet-stream',
    /**
     * Represents the HTML content type.
     */
    HTML: 'text/html',
    /**
     * Represents the plain text content type.
     */
    TEXT: 'text/plain'
};

// src/plugins/Check.ts
var Check = class {
    request;
    env;
    constructor(request, env) {
        this.request = request;
        this.env = env;
    }
    method(method) {
        return this.request.method.toLocaleUpperCase() === method;
    }
    token() {
        const authorization = this.request.headers.get('Authorization');
        if (authorization) {
            return authorization === this.env.AUTH_TOKEN;
        }
        return false;
    }
    static rejectMethodEnter() {
        return { isCanEnter: false, message: SERVICE_CONFIG.NOT_ALLOWED.MESSAGE, status: SERVICE_CONFIG.NOT_ALLOWED.CODE };
    }
    static rejectTokenEnter() {
        return { isCanEnter: false, message: SERVICE_CONFIG.UNAUTHORIZED.MESSAGE, status: SERVICE_CONFIG.UNAUTHORIZED.CODE };
    }
    static rejectEnter(message = '', status) {
        return { isCanEnter: false, message, status };
    }
    static rejectNotKVEnter() {
        return { isCanEnter: false, message: 'KV Namespace not found', status: SERVICE_CONFIG.BAD_REQUEST.CODE };
    }
    static acceptEnter(message = '') {
        return { isCanEnter: true, message, status: SERVICE_CONFIG.SUCCESS.CODE };
    }
};

// src/utils/utils.ts
var MAX_FILE_SIZE = 25 * 1024 * 1024;
var STATIC_PATH = 'static';
function makeHeader(contentType = CONTENT_TYPE.JSON, allowOrigin = '*') {
    const header = new Headers();
    header.set('Content-Type', contentType);
    header.set('Access-Control-Allow-Origin', allowOrigin);
    header.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    header.set('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, kv');
    return header;
}
async function transformReadableStream(stream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        result += decoder.decode(value, { stream: true });
    }
    return result;
}
async function getBody(request) {
    const bodyString = await transformReadableStream(request.body);
    try {
        return JSON.parse(bodyString);
    } catch (error) {
        return {};
    }
}
function getMimeType(mime) {
    const mimeTypes = {
        css: { mimeType: 'text/css', type: 'text' },
        html: { mimeType: 'text/html', type: 'text' },
        ico: { mimeType: 'image/x-icon', type: 'arrayBuffer' },
        jpeg: { mimeType: 'image/jpeg', type: 'arrayBuffer' },
        jpg: { mimeType: 'image/jpeg', type: 'arrayBuffer' },
        js: { mimeType: 'text/javascript', type: 'text' },
        json: { mimeType: 'application/json', type: 'json' },
        png: { mimeType: 'image/png', type: 'arrayBuffer' },
        svg: { mimeType: 'image/svg+xml', type: 'text' },
        txt: { mimeType: 'text/plain', type: 'text' },
        xml: { mimeType: 'application/xml', type: 'text' }
    };
    return mimeTypes[mime] || 'text/plain';
}
function checkFileSize(file, maxSize = MAX_FILE_SIZE) {
    return file.size <= maxSize;
}
function getStaticPath(env) {
    return env.STATIC_PATH || STATIC_PATH;
}
function matchStatic(path, staticPath) {
    const matchReg = new RegExp(`^/.*/${staticPath}.*`);
    return matchReg.test(path);
}
function getMatchPath(path, staticPath) {
    const matchReg = new RegExp(`^\\/([^/]+)\\/${staticPath}\\/([^/]+)$`);
    const match = path.match(matchReg);
    return {
        kvKey: match[1],
        fileName: match[2]
    };
}

// src/service/index.ts
var ServiceResponse = class {
    static onSuccessJson(data, message = SERVICE_CONFIG.SUCCESS.MESSAGE, contentType = CONTENT_TYPE.JSON) {
        return new Response(JSON.stringify({ status: SERVICE_CONFIG.SUCCESS.CODE, message, data: data || '' }), {
            headers: makeHeader(contentType),
            status: SERVICE_CONFIG.SUCCESS.CODE,
            statusText: message
        });
    }
    static onSuccessStream(stream, message = SERVICE_CONFIG.SUCCESS.MESSAGE, contentType = CONTENT_TYPE.STREAM) {
        return new Response(stream, {
            headers: makeHeader(contentType),
            status: SERVICE_CONFIG.SUCCESS.CODE,
            statusText: message
        });
    }
    static onError(reason = SERVICE_CONFIG.SERVER_ERROR.MESSAGE) {
        return new Response(JSON.stringify({ status: SERVICE_CONFIG.SERVER_ERROR.CODE, message: reason }), {
            headers: makeHeader(),
            status: SERVICE_CONFIG.SERVER_ERROR.CODE,
            statusText: reason
        });
    }
    static onNotFound(reason = SERVICE_CONFIG.NOT_FOUND.MESSAGE) {
        return new Response(JSON.stringify({ status: SERVICE_CONFIG.NOT_FOUND.CODE, message: reason }), {
            headers: makeHeader(),
            status: SERVICE_CONFIG.NOT_FOUND.CODE,
            statusText: reason
        });
    }
    static onUnauthorized(reason = SERVICE_CONFIG.UNAUTHORIZED.MESSAGE) {
        return new Response(JSON.stringify({ status: SERVICE_CONFIG.UNAUTHORIZED.CODE, message: reason }), {
            headers: makeHeader(),
            status: SERVICE_CONFIG.UNAUTHORIZED.CODE,
            statusText: reason
        });
    }
    static onBadRequest(reason = SERVICE_CONFIG.BAD_REQUEST.MESSAGE, status = SERVICE_CONFIG.BAD_REQUEST.CODE) {
        return new Response(JSON.stringify({ status, message: reason }), {
            headers: makeHeader(),
            status,
            statusText: reason
        });
    }
    static onNotAllowed(reason = SERVICE_CONFIG.NOT_ALLOWED.MESSAGE) {
        return new Response(JSON.stringify({ status: SERVICE_CONFIG.NOT_ALLOWED.CODE, message: reason }), {
            headers: makeHeader(),
            status: SERVICE_CONFIG.NOT_ALLOWED.CODE,
            statusText: reason
        });
    }
};

// src/router/router.ts
var Router = class {
    routes;
    constructor(config) {
        this.routes = config.routes;
    }
    async match(options) {
        try {
            const { path, request, env, staticPath } = options;
            const route = this.routes.find(route2 => route2.path === path);
            if (route) {
                const check = new Check(request, env);
                const beforeEnter = route.beforeEnter || ((_, CheckEnter) => CheckEnter.acceptEnter());
                const onError = route.onError || ((reason, _request, _env) => ServiceResponse.onBadRequest(reason.message, reason.status));
                const enter = beforeEnter(check, Check);
                if (enter.isCanEnter) {
                    return route.excute(request, env);
                } else {
                    return onError(enter, request, env);
                }
            } else if (matchStatic(path, staticPath)) {
                const { kvKey, fileName } = getMatchPath(path, staticPath);
                if (fileName && kvKey) {
                    const suffix = fileName.split('.').pop();
                    const { mimeType, type } = getMimeType(suffix);
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
        } catch (error) {
            return ServiceResponse.onBadRequest(error.message);
        }
    }
};

// src/plugins/KV.ts
var KVController = class {
    kv;
    constructor(kv) {
        this.kv = kv;
    }
    async hasKey(key) {
        const keys = await this.getKeys();
        return keys.includes(key);
    }
    /**
     * Adds an item to the key-value store.
     *
     * @param key - The key of the item.
     * @param value - The value of the item.
     * @param options - Optional parameters for the operation.
     * @returns A Promise that resolves when the item is successfully added.
     * @throws If an error occurs while adding the item.
     */
    async addItem(key, value, options) {
        try {
            if (await this.hasKey(key)) {
                throw new Error(`Key ${key} already exists`);
            }
            await this.kv.put(key, value, options);
        } catch (error) {
            throw new Error(error);
        }
    }
    /**
     * Adds multiple items to the KV store.
     * @param items - An array of items to be added, each item containing a key, value, and optional options.
     * @returns A Promise that resolves when all items have been added successfully.
     * @throws If an error occurs while adding the items.
     */
    async addItems(items) {
        try {
            if (items.length === 0) {
                throw new Error('No items to add');
            }
            for await (const item of items) {
                await this.addItem(item.key, item.value, item.options);
            }
        } catch (error) {
            throw new Error(error);
        }
    }
    /**
     * Updates an item in the KV namespace.
     *
     * @param key - The key of the item to update.
     * @param value - The new value for the item.
     * @param options - Optional parameters for the update operation.
     * @returns A Promise that resolves when the update operation is complete.
     * @throws If an error occurs during the update operation.
     */
    async updateItem(key, value, options) {
        try {
            await this.kv.put(key, value, options);
        } catch (error) {
            throw new Error(error);
        }
    }
    /**
     * Retrieves the value associated with the specified key from the key-value store.
     *
     * @param key - The key to retrieve the value for.
     * @param options - Additional options for retrieving the value.
     * @returns A Promise that resolves to the value associated with the key, or `null` if the key does not exist.
     * @throws If an error occurs while retrieving the value.
     */
    async getItem(key, ...options) {
        try {
            const value = await this.kv.get(key, ...options);
            return value;
        } catch (error) {
            throw new Error(error);
        }
    }
    /**
     * Deletes an item from the key-value store.
     *
     * @param key - The key of the item to delete.
     * @returns A Promise that resolves when the item is successfully deleted.
     * @throws If an error occurs while deleting the item.
     */
    async deleteItem(key) {
        try {
            await this.kv.delete(key);
        } catch (error) {
            throw new Error(error);
        }
    }
    /**
     * Deletes multiple items from the KV store.
     * @param keys - An array of keys to be deleted.
     * @returns A Promise that resolves when all items have been deleted successfully.
     * @throws If an error occurs while deleting the items.
     */
    async deleteItems(keys) {
        try {
            if (keys.length === 0) {
                throw new Error('No keys to delete');
            }
            for await (const key of keys) {
                await this.deleteItem(key);
            }
        } catch (error) {
            throw new Error(error);
        }
    }
    /**
     * Deletes all items from the KV store.
     * @returns A Promise that resolves when all items have been deleted successfully.
     * @throws If an error occurs while deleting the items.
     */
    async clear() {
        try {
            const keys = await this.kv.list();
            await Promise.all(keys.keys.map(key => this.kv.delete(key.name)));
        } catch (error) {
            throw new Error(error);
        }
    }
    async getAll() {
        const keys = await this.kv.list();
        const values = await Promise.all(keys.keys.map(key => this.kv.get(key.name, 'text')));
        const result = {};
        keys.keys.forEach((key, index) => {
            result[key.name] = values[index];
        });
        return result;
    }
    /**
     * Retrieves all the keys from the KV store.
     * @returns A promise that resolves to an array of strings representing the keys.
     */
    async getKeys() {
        const keys = await this.kv.list();
        return keys.keys.map(key => key.name);
    }
};
var KV_default = KVController;

// src/router/route.ts
var route_default = [
    {
        path: '/',
        async excute(request, _env) {
            return new Response(request.url, {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                    'Cache-Control': 'public, max-age=86400',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    },
    {
        path: '/api/verifyToken',
        async excute(request, env) {
            try {
                const data = await getBody(request);
                if (!data.token) {
                    return ServiceResponse.onBadRequest(`Token Not Found, It is likely { "token": "Your_AUTH_TOKEN" }`);
                }
                if (data.token !== env.AUTH_TOKEN) {
                    return ServiceResponse.onUnauthorized('Unauthorized');
                }
                return ServiceResponse.onSuccessJson('AUTH_TOKEN is correct');
            } catch (error) {
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
                const keys = env.KV_KEYS.split('\n');
                return ServiceResponse.onSuccessJson(keys.map(item => ({ label: item.trim(), value: item.trim() })));
            } catch (error) {
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
                const kvController = new KV_default(env[request.headers.get('kv')]);
                const value = await kvController.getItem(key);
                if (value === null) {
                    return ServiceResponse.onNotFound('Not Found');
                }
                return ServiceResponse.onSuccessJson({ key, value });
            } catch (error) {
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
            if (!check.request.headers.get('kv')) {
                return CheckEnter.rejectNotKVEnter();
            }
            return CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/update',
        async excute(request, env) {
            try {
                const body = await getBody(request);
                if (!body.key || !body.value) {
                    return ServiceResponse.onBadRequest('KEY or VALUE Not Found');
                }
                const kvController = new KV_default(env[request.headers.get('kv')]);
                await kvController.updateItem(body.key, body.value);
                const updatedValue = await kvController.getItem(body.key);
                return ServiceResponse.onSuccessJson({ key: body.key, value: updatedValue });
            } catch (error) {
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
            if (!check.request.headers.get('kv')) {
                return CheckEnter.rejectNotKVEnter();
            }
            return CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/add',
        async excute(request, env) {
            try {
                const body = await getBody(request);
                if (!body.key || !body.value) {
                    return ServiceResponse.onBadRequest('KEY or VALUE Not Found');
                }
                const kvController = new KV_default(env[request.headers.get('kv')]);
                await kvController.addItem(body.key, body.value);
                const updatedValue = await kvController.getItem(body.key);
                return ServiceResponse.onSuccessJson({ key: body.key, value: updatedValue });
            } catch (error) {
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
            if (!check.request.headers.get('kv')) {
                return CheckEnter.rejectNotKVEnter();
            }
            return CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/delete',
        async excute(request, env) {
            try {
                const body = await getBody(request);
                if (!body.key) {
                    return ServiceResponse.onBadRequest('KEY Not Found');
                }
                const kvController = new KV_default(env[request.headers.get('kv')]);
                await kvController.deleteItem(body.key);
                return ServiceResponse.onSuccessJson();
            } catch (error) {
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
            if (!check.request.headers.get('kv')) {
                return CheckEnter.rejectNotKVEnter();
            }
            return CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/getList',
        async excute(request, env) {
            try {
                const kvController = new KV_default(env[request.headers.get('kv')]);
                const list = await kvController.getAll();
                return ServiceResponse.onSuccessJson(list);
            } catch (error) {
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
            if (!check.request.headers.get('kv')) {
                return CheckEnter.rejectNotKVEnter();
            }
            return CheckEnter.acceptEnter();
        }
    },
    {
        path: '/api/getKvKeys',
        async excute(request, env) {
            try {
                const kvController = new KV_default(env[request.headers.get('kv')]);
                const list = await kvController.getKeys();
                return ServiceResponse.onSuccessJson(list);
            } catch (error) {
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
            if (!check.request.headers.get('kv')) {
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
                const file = formData.get('file');
                if (!checkFileSize(file)) {
                    return ServiceResponse.onBadRequest(`File size is too large (max ${MAX_FILE_SIZE}), Your upload size is ${file.size}`);
                }
                const fileName = file.name;
                const arrayBuffer = await file.arrayBuffer();
                const fileContent = new Uint8Array(arrayBuffer);
                const kvController = new KV_default(env[request.headers.get('kv')]);
                await kvController.updateItem(fileName, fileContent);
                const { origin } = new URL(request.url);
                return ServiceResponse.onSuccessJson({
                    fileName,
                    download: `${origin}/api/download?file=${fileName}`,
                    preview: `${origin}/${request.headers.get('kv')}/static/${fileName}`
                });
            } catch (error) {
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
            if (!check.request.headers.get('kv')) {
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
                const kvController = new KV_default(_env[request.headers.get('kv')]);
                const fileContent = await kvController.getItem(fileName, 'arrayBuffer');
                if (!fileContent) {
                    return ServiceResponse.onNotFound('File not found');
                }
                return ServiceResponse.onSuccessStream(fileContent, 'Download Success', CONTENT_TYPE.STREAM);
            } catch (error) {
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
            if (!check.request.headers.get('kv')) {
                return CheckEnter.rejectNotKVEnter();
            }
            return CheckEnter.acceptEnter();
        }
    }
];

// src/index.ts
var router = new Router({ routes: route_default });
function beforeCheck(env) {
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
var src_default = {
    async fetch(request, env) {
        try {
            await beforeCheck(env);
            const { pathname } = new URL(request.url);
            const staticPath = getStaticPath(env);
            return router.match({
                path: pathname,
                request,
                env,
                staticPath
            });
        } catch (error) {
            return ServiceResponse.onError(error.message);
        }
    }
};
export { src_default as default };
//# sourceMappingURL=index.js.map
