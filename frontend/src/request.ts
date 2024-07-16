import { formatPath } from './utils';

const isDev = import.meta.env.MODE === 'development';
export const BASE_URL = isDev ? 'https://kv-crud.visitor-worker.workers.dev/' : '/';

export async function httpGet(url: string, params: Record<string, any> = {}) {
    const urlParams = new URLSearchParams(params);
    const token = sessionStorage.getItem('Authorization') || '';
    const kv = sessionStorage.getItem('kv') || '';
    const res = await fetch(`${formatPath(`${BASE_URL}${url}`)}?${urlParams.toString()}`, {
        method: 'GET',
        headers: {
            Authorization: token,
            kv: kv,
            'Content-Type': 'application/json'
        }
    });
    return await res.json();
}

export async function httpPost(url: string, data: Record<string, any>) {
    const token = sessionStorage.getItem('Authorization') || '';
    const kv = sessionStorage.getItem('kv') || '';
    const res = await fetch(formatPath(`${BASE_URL}${url}`), {
        method: 'POST',
        headers: {
            Authorization: token,
            kv: kv,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return await res.json();
}

export async function httpPostForm(url: string, data: FormData) {
    const token = sessionStorage.getItem('Authorization') || '';
    const kv = sessionStorage.getItem('kv') || '';

    const res = await fetch(formatPath(`${BASE_URL}${url}`), {
        method: 'POST',
        headers: {
            Authorization: token,
            kv: kv
        },
        body: data
    });
    return await res.json();
}
