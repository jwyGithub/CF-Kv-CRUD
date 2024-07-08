import type { ICONTENT_TYPE } from '../service/service.d';
import { CONTENT_TYPE } from '../service/serviceConfig';

export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const STATIC_PATH = 'static';

export function makeHeader(contentType: ICONTENT_TYPE = CONTENT_TYPE.JSON, allowOrigin: string = '*'): Headers {
    const header = new Headers();
    header.set('Content-Type', contentType);
    header.set('Access-Control-Allow-Origin', allowOrigin);
    header.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    header.set('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, kv');

    return header;
}

export async function transformReadableStream(stream: ReadableStream<Uint8Array>): Promise<string> {
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
export async function transformWritableStream(stream: WritableStream<Uint8Array>, data: string): Promise<void> {
    const writer = stream.getWriter();
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(data));
    await writer.close();
}

export async function getBody<T extends object>(request: Request): Promise<T> {
    const bodyString = await transformReadableStream(request.body!);
    try {
        return JSON.parse(bodyString);
    } catch (error) {
        return {} as T;
    }
}

export function getKvNameSpace(env: Env, kvKey: string): KVNamespace {
    return env[env[kvKey as keyof Env] as keyof Env] as KVNamespace;
}

export function getMimeType(mime: string) {
    const mimeTypes: Record<string, { mimeType: string; type: string }> = {
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
        xml: { mimeType: 'application/xml', type: 'text' },
        exe: { mimeType: 'application/octet-stream', type: 'arrayBuffer' },
        pdf: { mimeType: 'application/pdf', type: 'arrayBuffer' },
        zip: { mimeType: 'application/zip', type: 'arrayBuffer' },
        tar: { mimeType: 'application/x-tar', type: 'arrayBuffer' },
        gz: { mimeType: 'application/gzip', type: 'arrayBuffer' },
        tgz: { mimeType: 'application/gzip', type: 'arrayBuffer' },
        mp4: { mimeType: 'video/mp4', type: 'arrayBuffer' },
        mp3: { mimeType: 'audio/mp3', type: 'arrayBuffer' },
        wav: { mimeType: 'audio/wav', type: 'arrayBuffer' },
        ogg: { mimeType: 'audio/ogg', type: 'arrayBuffer' },
        webm: { mimeType: 'video/webm', type: 'arrayBuffer' },
        webp: { mimeType: 'image/webp', type: 'arrayBuffer' },
        woff: { mimeType: 'font/woff', type: 'arrayBuffer' },
        woff2: { mimeType: 'font/woff2', type: 'arrayBuffer' },
        eot: { mimeType: 'application/vnd.ms-fontobject', type: 'arrayBuffer' },
        ttf: { mimeType: 'font/ttf', type: 'arrayBuffer' },
        otf: { mimeType: 'font/otf', type: 'arrayBuffer' },
        bmp: { mimeType: 'image/bmp', type: 'arrayBuffer' },
        gif: { mimeType: 'image/gif', type: 'arrayBuffer' },
        msi: { mimeType: 'application/octet-stream', type: 'arrayBuffer' },
        dmg: { mimeType: 'application/octet-stream', type: 'arrayBuffer' },
        pkg: { mimeType: 'application/octet-stream', type: 'arrayBuffer' },
        deb: { mimeType: 'application/octet-stream', type: 'arrayBuffer' }
    };

    return mimeTypes[mime] || 'text/plain';
}

export function checkFileSize(file: File, maxSize: number = MAX_FILE_SIZE): boolean {
    return file.size <= maxSize;
}

export function getStaticPath(env: Env) {
    return env.STATIC_PATH || STATIC_PATH;
}

export function matchStatic(path: string, staticPath: string): boolean {
    const matchReg = new RegExp(`^/.*/${staticPath}.*`);
    return matchReg.test(path);
}

export function getMatchPath(path: string, staticPath: string): { kvKey: string; fileName: string } {
    const matchReg = new RegExp(`^\\/([^/]+)\\/${staticPath}\\/([^/]+)$`);
    const match = path.match(matchReg);

    return {
        kvKey: match![1],
        fileName: match![2]
    };
}
