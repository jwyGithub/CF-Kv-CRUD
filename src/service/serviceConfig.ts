import type { ICONTENT_TYPE, ICONTENT_TYPE_KEY, ISERVICE_CODE, ISERVICE_MESSAGE, ISERVICE_RESPONSE } from './service.d';

/**
 * Represents the service configuration object.
 */
export const SERVICE_CONFIG: Record<ISERVICE_RESPONSE, { CODE: ISERVICE_CODE; MESSAGE: ISERVICE_MESSAGE }> = {
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
    },

    /**
     * Represents a conflict response.
     */
    OPTIONS: {
        CODE: 200,
        MESSAGE: 'options'
    }
};

/**
 * Defines the content types for the service.
 */
export const CONTENT_TYPE: Record<ICONTENT_TYPE_KEY, ICONTENT_TYPE> = {
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
