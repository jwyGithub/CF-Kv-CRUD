import { makeHeader } from '../utils/utils';
import type { ICONTENT_TYPE, ISERVICE_CODE, ISERVICE_MESSAGE } from './service';
import { CONTENT_TYPE, SERVICE_CONFIG } from './serviceConfig';

export class ServiceResponse {
    public static onSuccessJson<T>(
        data?: T,
        message: ISERVICE_MESSAGE = SERVICE_CONFIG.SUCCESS.MESSAGE,
        contentType: ICONTENT_TYPE = CONTENT_TYPE.JSON
    ): Response {
        return new Response(JSON.stringify({ status: SERVICE_CONFIG.SUCCESS.CODE, message, data: data || '' }), {
            headers: makeHeader(contentType),
            status: SERVICE_CONFIG.SUCCESS.CODE,
            statusText: message
        });
    }

    public static onSuccessStream(
        stream: ArrayBuffer,
        message: ISERVICE_MESSAGE = SERVICE_CONFIG.SUCCESS.MESSAGE,
        contentType: ICONTENT_TYPE = CONTENT_TYPE.STREAM
    ): Response {
        return new Response(stream, {
            headers: makeHeader(contentType),
            status: SERVICE_CONFIG.SUCCESS.CODE,
            statusText: message
        });
    }

    public static onError(reason: ISERVICE_MESSAGE = SERVICE_CONFIG.SERVER_ERROR.MESSAGE): Response {
        return new Response(JSON.stringify({ status: SERVICE_CONFIG.SERVER_ERROR.CODE, message: reason }), {
            headers: makeHeader(),
            status: SERVICE_CONFIG.SERVER_ERROR.CODE,
            statusText: reason
        });
    }

    public static onNotFound(reason: ISERVICE_MESSAGE = SERVICE_CONFIG.NOT_FOUND.MESSAGE): Response {
        return new Response(JSON.stringify({ status: SERVICE_CONFIG.NOT_FOUND.CODE, message: reason }), {
            headers: makeHeader(),
            status: SERVICE_CONFIG.NOT_FOUND.CODE,
            statusText: reason
        });
    }

    public static onUnauthorized(reason: ISERVICE_MESSAGE = SERVICE_CONFIG.UNAUTHORIZED.MESSAGE): Response {
        return new Response(JSON.stringify({ status: SERVICE_CONFIG.UNAUTHORIZED.CODE, message: reason }), {
            headers: makeHeader(),
            status: SERVICE_CONFIG.UNAUTHORIZED.CODE,
            statusText: reason
        });
    }

    public static onBadRequest(
        reason: ISERVICE_MESSAGE = SERVICE_CONFIG.BAD_REQUEST.MESSAGE,
        status: ISERVICE_CODE = SERVICE_CONFIG.BAD_REQUEST.CODE
    ): Response {
        return new Response(JSON.stringify({ status, message: reason }), {
            headers: makeHeader(),
            status,
            statusText: reason
        });
    }

    public static onNotAllowed(reason: ISERVICE_MESSAGE = SERVICE_CONFIG.NOT_ALLOWED.MESSAGE): Response {
        return new Response(JSON.stringify({ status: SERVICE_CONFIG.NOT_ALLOWED.CODE, message: reason }), {
            headers: makeHeader(),
            status: SERVICE_CONFIG.NOT_ALLOWED.CODE,
            statusText: reason
        });
    }
}
