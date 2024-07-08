export type ISERVICE_CODE = 200 | 400 | 401 | 404 | 405 | 500 | number;

export type ISERVICE_MESSAGE = 'success' | 'bad request' | 'unauthorized' | 'not found' | 'method not allowed' | 'server error' | string;

export type ISERVICE_RESPONSE = 'SUCCESS' | 'SERVER_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'BAD_REQUEST' | 'NOT_ALLOWED' | 'OPTIONS';

export type ICONTENT_TYPE = 'application/json' | 'application/octet-stream' | 'text/html' | 'text/plain' | 'text/css' | 'text/javascript';

export type ICONTENT_TYPE_KEY = 'JSON' | 'STREAM' | 'HTML' | 'TEXT' | 'CSS' | 'JAVA_SCRIPT';

export type IMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
