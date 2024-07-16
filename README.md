# 一个用来快捷操作cloudflare kv的工具

## worker方式部署

1. 在cloudflare上创建一个worker
2. 将`worker.js`的内容复制到worker的代码编辑器中
3. 设置环境变量`AUTH_TOKEN`为你的自定义的token
4. 设置环境变量`KV_KEYS`为你的kv的namespace
5. 部署

## pages方式部署

1. fork本项目
2. 在pages页面选择本仓库
3. 设置环境变量`AUTH_TOKEN`为你的自定义的token
4. 设置环境变量`KV_KEYS`为你的kv的namespace

## 绑定kv

1. 在kv中创建一个namespace
2. 在worker中绑定kv

## 使用

访问域名即可查看页面

## 说明

1. 由于kv操作存在cache时间，最低为60s，所有在新增内容后，无法实时获取最新内容，请等待60s后再次获取
2. 支持新增内容，上传文件
3. 支持下载，以及预览
4. 上传文件最大限制为25M
5. kv存储空间限制是1G
