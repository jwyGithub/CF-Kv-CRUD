<template>
    <div class="kv-crud">
        <main v-if="validateData.status">
            <div class="search">
                <el-form :model="validateData" :label-width="120" :inline="true">
                    <el-form-item label="kv命名空间：">
                        <el-select v-model="validateData.form.kv" placeholder="请选择kv命名空间" style="width: 200px">
                            <el-option
                                :label="item.label"
                                :value="item.value"
                                v-for="item in kvnamespaceList"
                                :key="item.value"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSearch">查询</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <div class="table-main">
                <div class="action">
                    <el-button type="primary" @click="onAddRow('text')">新增文本</el-button>
                    <el-button type="primary" @click="onAddRow('file')">上传文件</el-button>
                </div>
                <div class="table">
                    <el-table :data="tableConfig.data" style="width: 100%" v-loading="tableConfig.loading" size="mini" height="100%" stripe>
                        <el-table-column prop="key" label="文件名" width="200" show-overflow-tooltip> </el-table-column>
                        <el-table-column prop="value" label="内容" show-overflow-tooltip>
                            <template #default="{ row }">
                                <el-input type="textarea" v-model="row.value" size="mini" :autosize="{ minRows: 2, maxRows: 5 }"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column prop="download" label="下载地址" width="300" show-overflow-tooltip>
                            <template #default="{ row }">
                                <el-link :href="row.download" type="primary" target="_blank">{{ row.download }}</el-link>
                            </template>
                        </el-table-column>
                        <el-table-column prop="preview" label="预览地址" width="300" show-overflow-tooltip>
                            <template #default="{ row }">
                                <el-link :href="row.preview" type="success" target="_blank">{{ row.preview }}</el-link>
                            </template>
                        </el-table-column>
                        <el-table-column fixed="right" label="操作" width="200">
                            <template #default="{ row }">
                                <el-button type="text" size="small" @click="onViewRow(row)">查看</el-button>
                                <el-button type="text" size="small" @click="onDeleteRow(row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </main>
        <el-dialog title="查看" :visible.sync="viewOptions.status" width="80%" class="view-dialog">
            <div style="height: 60vh">
                <el-input type="textarea" v-model="viewOptions.data" size="mini" :autosize="{ minRows: 5, maxRows: 10 }"></el-input>
            </div>
        </el-dialog>

        <el-dialog v-model="validateData.dialogFormVisible" title="验证" width="500">
            <el-form :model="validateData.form" inline :rules="validateData.rules" :label-width="140">
                <el-form-item label="TOKEN" prop="token">
                    <el-input v-model="validateData.form.token" autocomplete="off" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getToken">验证</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-dialog v-model="addOptions.status" :title="`新增${addOptions.addType === 'text' ? '文本' : '文件'}`" width="50%">
            <el-form :model="addOptions.formData" :rules="addOptions.rules" :label-width="120" style="width: 60%">
                <el-form-item label="键" prop="key">
                    <el-input v-model="addOptions.formData.key" />
                </el-form-item>
                <el-form-item label="内容" prop="key" v-if="addOptions.addType === 'text'">
                    <el-input type="textarea" v-model="addOptions.formData.value" />
                </el-form-item>
                <el-form-item label="文件" prop="file" v-if="addOptions.addType === 'file'">
                    <el-upload
                        v-model:file-list="addOptions.formData.fileList"
                        action="/"
                        :auto-upload="false"
                        :show-file-list="false"
                        :on-change="onChange"
                    >
                        <el-button type="primary">点击上传</el-button>
                        <template #tip>
                            <div class="el-upload__tip"> {{ addOptions.formData.file?.name ?? '' }} </div>
                        </template>
                    </el-upload>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="addOptions.status = false">取 消</el-button>
                <el-button type="primary" @click="onSubmit">确 定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { httpGet, httpPost, httpPostForm } from './request';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/loading/style/css';
import 'element-plus/es/components/message-box/style/css';
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus';

const validateData = reactive({
    form: {
        token: '',
        kv: ''
    },
    status: false,
    rules: {
        token: [{ required: true, message: '请输入TOKEN', trigger: 'change' }]
    },
    formLabelWidth: '120px',
    dialogFormVisible: false
});

const addOptions = reactive<{
    status: boolean;
    addType: string;
    formData: {
        key: string;
        value: string;
        file: File | null;
        fileList: any[];
    };
    rules: {
        key: { required: boolean; message: string; trigger: string }[];
        value: { required: boolean; message: string; trigger: string }[];
    };
}>({
    status: false,
    addType: '',
    formData: {
        key: '',
        value: '',
        file: null,
        fileList: []
    },
    rules: {
        key: [{ required: true, message: '请输入文件名', trigger: 'change' }],
        value: [{ required: true, message: '请输入内容', trigger: 'change' }]
    }
});

const kvnamespaceList = ref<Array<{ label: string; value: string }>>([]);

const getToken = async () => {
    const res = await httpPost('/api/verifyToken', { token: validateData.form.token });
    if (res.status === 200) {
        sessionStorage.setItem('Authorization', validateData.form.token);
        validateData.dialogFormVisible = false;
        validateData.status = true;
        getKvnames();
    } else {
        ElMessage({
            type: 'error',
            message: res.message
        });
    }
};

const getKvnames = async () => {
    const res = await httpGet('/api/getKvList');
    kvnamespaceList.value = res.data;
    validateData.form.kv = res.data[0].value;
    sessionStorage.setItem('kv', validateData.form.kv);
    getTableData();
};

const onAddRow = (type: string) => {
    addOptions.addType = type;
    addOptions.status = true;
};

const onDeleteRow = (row: any) => {
    ElMessageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    })
        .then(() => {
            httpPost('/api/delete', { key: row.key }).then(res => {
                if (res.status === 200) {
                    ElMessage({
                        type: 'success',
                        message: '删除成功!'
                    });
                    getTableData();
                } else {
                    ElMessage({
                        type: 'error',
                        message: res.message
                    });
                }
            });
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '已取消删除'
            });
        });
};

const onChange = (file: any) => {
    if (addOptions.formData.key === '') {
        addOptions.formData.key = file.raw.name;
    }
    addOptions.formData.file = file.raw;
};

const resetAddOption = () => {
    addOptions.formData.value = '';
    addOptions.formData.file = null;
    addOptions.formData.key = '';
    addOptions.formData.fileList = [];
};

const onSubmit = async () => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        sessionStorage.setItem('kv', validateData.form.kv);
        if (addOptions.addType === 'text') {
            const res = await httpPost('/api/add', {
                key: addOptions.formData.key,
                value: encodeURIComponent(addOptions.formData.value)
            });
            if (res.status === 200) {
                ElMessage({
                    type: 'success',
                    message: '新增成功!'
                });
                getTableData();
                addOptions.status = false;
                resetAddOption();
            } else {
                ElMessage({
                    type: 'error',
                    message: res.message
                });
            }
        } else {
            const form = new FormData();
            form.append('file', addOptions.formData.file!);
            const res = await httpPostForm('/api/upload', form);
            if (res.status === 200) {
                ElMessage({
                    type: 'success',
                    message: '新增成功!'
                });
                getTableData();
                addOptions.status = false;
                resetAddOption();
            } else {
                ElMessage({
                    type: 'error',
                    message: res.message
                });
            }
        }
    } finally {
        loading.close();
    }
};

function init() {
    const token = sessionStorage.getItem('Authorization');
    if (!token) {
        validateData.dialogFormVisible = true;
        validateData.status = false;
    } else {
        validateData.status = true;
        getKvnames();
    }
}

init();

const tableConfig = reactive({
    data: [],
    loading: false
});

const viewOptions = reactive({
    status: false,
    data: ''
});

function onSearch() {
    sessionStorage.setItem('kv', validateData.form.kv);
    getTableData();
}

async function getTableData() {
    tableConfig.data = [];
    tableConfig.loading = true;
    const res = await httpGet('/api/getList');
    tableConfig.data = res.data;
    tableConfig.loading = false;
}

function onViewRow(row: any) {
    viewOptions.data = row.value;
    viewOptions.status = true;
}
</script>

<style scoped lang="scss">
.kv-crud {
    background-color: #f0f2f5;
    padding: 10px;
    width: 100vw;
    height: 100vh;
    main {
        height: 100%;
        .search {
            padding: 15px 10px 5px;
            background-color: #fff;
            margin-bottom: 10px;
            border-radius: 10px;
            height: 60px;
        }

        .table-main {
            border-radius: 10px;
            overflow: hidden;
            height: calc(100% - 70px);
            .action {
                padding: 0 10px;
                background-color: #fff;
                border-bottom: 1px solid #ebeef5;
                height: 60px;
                display: flex;
                align-items: center;
            }
            .table {
                background-color: #fff;
                height: calc(100% - 100px);
            }
        }
    }
}
</style>
