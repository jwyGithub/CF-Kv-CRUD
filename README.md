# cloudflare-kv-api

## GET getKvKeys

GET /api/getKvKeys

### 请求参数

| 名称          | 位置   | 类型   | 必选 | 说明 |
| ------------- | ------ | ------ | ---- | ---- |
| key           | query  | string | 否   | none |
| Authorization | header | string | 是   | none |
| kv            | header | string | 是   | none |

> 返回示例

> 成功

```json
{
    "status": 200,
    "message": "success",
    "data": [
        "app.bddb0479.css",
        "app.eb4ccf2a.js",
        "bg.jpg",
        "bg5.jpg",
        "chunk-1ffacd5c.5775ea2e.js",
        "chunk-vendors.43fc3011.css",
        "chunk-vendors.ea5909a1.js",
        "index.html"
    ]
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

## GET getKvList

GET /api/getKvList

### 请求参数

| 名称          | 位置   | 类型   | 必选 | 说明 |
| ------------- | ------ | ------ | ---- | ---- |
| key           | query  | string | 否   | none |
| Authorization | header | string | 是   | none |
| kv            | header | string | 否   | none |

> 返回示例

> 成功

```json
{
    "status": 200,
    "message": "success",
    "data": [
        {
            "label": "kv-static",
            "value": "kv-static"
        },
        {
            "label": "sub-convert",
            "value": "sub-convert"
        }
    ]
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

## GET getList

GET /api/getList

### 请求参数

| 名称          | 位置   | 类型   | 必选 | 说明 |
| ------------- | ------ | ------ | ---- | ---- |
| key           | query  | string | 否   | none |
| Authorization | header | string | 是   | none |
| kv            | header | string | 是   | none |

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

## GET get

GET /api/get

### 请求参数

| 名称          | 位置   | 类型   | 必选 | 说明 |
| ------------- | ------ | ------ | ---- | ---- |
| key           | query  | string | 是   | none |
| Authorization | header | string | 是   | none |
| kv            | header | string | 是   | none |

> 返回示例

> 成功

```json
{
    "status": 200,
    "message": "success",
    "data": {
        "key": "test",
        "value": "111"
    }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

## POST upload

POST /api/upload

> Body 请求参数

```yaml
file: string
```

### 请求参数

| 名称          | 位置   | 类型           | 必选 | 说明 |
| ------------- | ------ | -------------- | ---- | ---- |
| Authorization | header | string         | 是   | none |
| kv            | header | string         | 是   | none |
| body          | body   | object         | 否   | none |
| » file        | body   | string(binary) | 是   | none |

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

## POST add

POST /api/add

> Body 请求参数

```json
{
    "key": "test",
    "value": "111"
}
```

### 请求参数

| 名称          | 位置   | 类型   | 必选 | 说明 |
| ------------- | ------ | ------ | ---- | ---- |
| Authorization | header | string | 是   | none |
| kv            | header | string | 是   | none |
| body          | body   | object | 否   | none |
| » key         | body   | string | 是   | none |
| » value       | body   | string | 是   | none |

> 返回示例

> 成功

```json
{
    "status": 200,
    "message": "success",
    "data": {
        "key": "test",
        "value": "111"
    }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

## POST delete

POST /api/delete

> Body 请求参数

```json
{
    "key": "bg6.jpg"
}
```

### 请求参数

| 名称          | 位置   | 类型   | 必选 | 说明 |
| ------------- | ------ | ------ | ---- | ---- |
| key           | query  | string | 否   | none |
| Authorization | header | string | 是   | none |
| kv            | header | string | 是   | none |
| body          | body   | object | 否   | none |
| » key         | body   | string | 是   | none |

> 返回示例

> 成功

```json
{
    "status": 200,
    "message": "success",
    "data": ""
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

## POST verifyToken

POST /api/verifyToken

> Body 请求参数

```json
{
    "token": "123123"
}
```

### 请求参数

| 名称    | 位置 | 类型   | 必选 | 说明 |
| ------- | ---- | ------ | ---- | ---- |
| body    | body | object | 否   | none |
| » token | body | string | 是   | none |

> 返回示例

> 成功

```json
{
    "status": 200,
    "message": "success",
    "data": "AUTH_TOKEN is correct"
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构

## GET {{base_url}}

GET /

> 返回示例

> 成功

```json
"https://kv-crud.visitor-worker.workers.dev/"
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 成功 | Inline   |

### 返回数据结构
