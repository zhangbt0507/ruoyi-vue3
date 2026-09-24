<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="事件日期">
         <el-date-picker label="会议日期" prop="hyrq"
               v-model="queryParams.hyrq"
               type="date" 
               value-format="YYYY-MM-DD"
               placeholder="请选择会议日期"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
          />
        </el-form-item>

         <el-form-item label="客户姓名" prop="khxm">
            <el-input
               v-model="queryParams.khxm"
               placeholder="请输入客户姓名"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="证件号" prop="zjh">
            <el-input
               v-model="queryParams.zjh"
               placeholder="请输入证件号"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
         </el-form-item>
      </el-form>
      <el-card>
        <div style="min-height:50vh">
          <!-- 表格数据 -->
          <el-table v-loading="loading" :data="custmerList"  style="font-family: '黑体'" max-height="50vh" highlight-current-row>
              <el-table-column label="会议日期" prop="hyrq" :show-overflow-tooltip="true" width="120" />
              <el-table-column label="网点" align="center" min-width="140" show-overflow-tooltip>
                <template #default="scope">
                  <span>{{ formatOrgDisplay(scope.row.jgh) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="客户姓名" align="center" prop="khxm" width="150" />
              <!-- <el-table-column label="民族" prop="nation" width="100" /> -->
              <el-table-column label="证件号" align="center" prop="zjh" width="150" />
              <el-table-column label="议题" align="center" prop="yt" width="200" />
              <el-table-column label="参会人员" align="center" min-width="300" show-overflow-tooltip>
                <template #default="scope">
                  <span>{{ formatChryDisplay(scope.row.chry) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="附件" align="center" prop="wjm" width="150" show-overflow-tooltip>
                <template #default="scope">
                  <el-link
                    v-if="scope.row.wjm"
                    type="primary"
                    :underline="false"
                    @click="handleDownload(scope.row)"
                  >{{ scope.row.wjm }}</el-link>
                  <span v-else>—</span>
                </template>
              </el-table-column>
              <el-table-column label="录入时间"  align="center" prop="lrsj"  min-width="160" />
          </el-table>
        </div>
        <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList()"
        />
      </el-card>

      <!-- 添加或修改议题对话框 -->
      <el-dialog :title="title" v-model="open" width="780px" append-to-body>
         <el-form ref="noticeRef" :model="form" :rules="rules" label-width="80px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="会议日期" prop="hyrq">  
                    <el-date-picker label="会议日期" prop="hyrq"
                        v-model="form.hyrq"
                        type="date" 
                        value-format="YYYY-MM-DD"
                        placeholder="请选择会议日期"
                        clearable
                        style="width: 100%"
                    />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="议题" prop="yt">
                     <el-input v-model="form.yt" placeholder="请输入议题">
                     </el-input>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="客户姓名" prop="khxm">
                     <el-input v-model="form.khxm" placeholder="请输入客户姓名">
                     </el-input>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="证件号" prop="zjh">
                     <el-input v-model="form.zjh" placeholder="请输入证件号">
                     </el-input>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="参会人员" prop="chryUsers">
                     <el-select
                        v-model="form.chryUsers"
                        class="chry-select"
                        placeholder="请选择参会人员，可输入姓名或柜员号搜索"
                        multiple
                        filterable
                        :filter-method="filterParticipant"
                        clearable
                        style="width: 100%"
                     >
                        <el-option
                           v-for="user in filteredParticipantUserList"
                           :key="user.userName"
                           :label="participantOptionLabel(user)"
                           :value="user.userName"
                        />
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="8">
                <el-form-item label="附件" prop="hyFile">
                  <el-upload
                  :before-upload="handleBeforeUpload"
                  :on-change="handleUploadChange"
                  :on-remove="handleRemove"
                  
                  class="upload-file-uploader"
                  ref="fileUpload"

                  :headers="headers"
                  :limit="1"
                  :auto-upload="false"
                  :file-list="fileList"
                  >
                  <!-- <el-icon class="el-icon--upload" style="width: 300px;"><upload-filled /></el-icon> -->
                  <!-- 上传按钮 -->
                  <el-button type="primary" style="width: 200px;">选取文件</el-button>
                  </el-upload>
              </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
       
    </div>
</template>

<script  setup name="loanReviewCommitIndex">
    const { proxy } = getCurrentInstance();
    
    const props = defineProps({
        /* 上传文件大小限制(MB) */
        fileSize: {
            type: Number,
            default: 10,
        }
    });

    import { getLoanReviewList, addLoanReviewCommit, download } from "@/api/szhl/loanReviewCommit";
    import { selectUserBydept } from "@/api/system/user";
    import { getToken } from "@/utils/auth";
    import { blobValidate, parseTime } from "@/utils/ruoyi";
    import { saveAs } from "file-saver";
    import useUserStore from "@/store/modules/user";

    const userStore = useUserStore();
    const { sys_user_name, sys_org_name } = proxy.useDict('sys_user_name', 'sys_org_name');
    const participantUserList = ref([]);
    const participantFilterQuery = ref('');

    const custmerList = ref([]);
    const total = ref(0);
    const loading = ref(false);
    const open = ref(false);
    const title = ref("");
    const data = reactive({
        form: {},
        queryParams: {
            pageNum: 1,
            pageSize: 10,
        },
        rules: {
          hyrq: [{ required: true, message: "请选择会议日期", trigger: "change" }],
          yt: [{ required: true, message: "请输入议题", trigger: "blur" }],
          khxm: [{ required: true, message: "请输入客户姓名", trigger: "blur" }],
          zjh: [{ required: true, message: "请输入证件号", trigger: "blur" }],
          chryUsers: [
            { required: true, type: "array", min: 1, message: "请选择参会人员", trigger: "change" }
          ],
        },
        uploadFile: undefined,
    });

    const { form, queryParams, rules, uploadFile } = toRefs(data);
    const fileUpload = ref(null)
    const fileList = ref([])
    const headers = ref({
      Authorization: "Bearer " + getToken()
    });

      /**重置筛选框 */
    function resetQuery(){
        proxy.resetForm("queryRef");
    }

    /** 查询征信报告列表 */
    function getList() {
        loading.value = true;
        getLoanReviewList(proxy.addDateRange(queryParams.value))
          .then(response => {
              custmerList.value = response.rows;
              total.value = response.total;
          })
          .finally(() => {
              loading.value = false;
          });
    }

    /** 搜索按钮操作 */
    function handleQuery() {
        getList();
    }

    /** 库表 chry：工号，多个顿号分隔 */
    function parseChryStored(raw) {
        if (raw == null || raw === '') {
            return [];
        }
        return String(raw)
            .split(/[、,，]/)
            .map((s) => s.trim())
            .filter(Boolean);
    }

    function participantDictLabel(userName) {
        const label = proxy.selectDictLabel(sys_user_name.value, userName);
        return label || userName || '';
    }

    /** 列表：机构号 jgh 转网点名称（sys_org_name 字典） */
    function formatOrgDisplay(jgh) {
        if (jgh == null || jgh === '') {
            return '—';
        }
        const name = proxy.selectDictLabel(sys_org_name.value, jgh);
        return name || String(jgh);
    }

    /** 中文名（工号）；字典无中文名时仅显示工号 */
    function formatUserCodeDisplay(code) {
        const codeStr = String(code);
        const name = participantDictLabel(codeStr);
        return name && name !== codeStr ? `${name}（${codeStr}）` : (name || codeStr);
    }

    /** 列表：工号转中文名（字典 nickName，不展示工号） */
    function formatChryDisplay(raw) {
        const codes = parseChryStored(raw);
        if (!codes.length) {
            return raw ? String(raw) : '—';
        }
        return codes.map((code) => participantDictLabel(code)).join('、');
    }

    function participantOptionLabel(user) {
        return formatUserCodeDisplay(user.userName);
    }

    const filteredParticipantUserList = computed(() => {
        const q = (participantFilterQuery.value || '').trim().toLowerCase();
        if (!q) {
            return participantUserList.value;
        }
        return participantUserList.value.filter((user) => {
            const label = participantOptionLabel(user).toLowerCase();
            const userName = String(user.userName || '').toLowerCase();
            const nickName = String(user.nickName || '').toLowerCase();
            return label.includes(q) || userName.includes(q) || nickName.includes(q);
        });
    });

    function filterParticipant(query) {
        participantFilterQuery.value = query;
    }

    /** 按当前登录人部门加载可选参会人员 */
    function loadParticipantUsers() {
        const deptId = userStore.deptId;
        if (!deptId) {
            participantUserList.value = [];
            return Promise.resolve();
        }
        return selectUserBydept({ deptId }).then((res) => {
            if (res.code === 200) {
                participantUserList.value = res.data || [];
            }
        }).catch(() => {
            participantUserList.value = [];
            proxy.$modal.msgError("获取参会人员列表失败");
        });
    }

    /** 提交前：工号顿号拼接 */
    function buildChryText(userNames) {
        if (!userNames?.length) {
            return "";
        }
        return userNames.join("、");
    }

    /** 新增按钮操作 */
    function handleAdd() {
        reset();
        loadParticipantUsers();
        open.value = true;
        title.value = "新增议题";
    }

    /** 表单重置 */
    function reset() {
        form.value = {
            hyrq: undefined,
            yt: undefined,
            khxm: undefined,
            zjh: undefined,
            chryUsers: []
        };
        participantFilterQuery.value = '';
        uploadFile.value = undefined;
        fileList.value = [];
        proxy.resetForm("noticeRef");
    }

    // 上传前校检格式和大小
    function handleBeforeUpload(file) {
        // 校检文件大小
        if (props.fileSize) {
            const isLt = file.size / 1024 / 1024 < props.fileSize;
            if (!isLt) {
                proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`);
                return false;
            }
        }
        return true;
    }

    function handleUploadChange(file, fileListNow){
        uploadFile.value = file.raw
        fileList.value = fileListNow
    }

    function handleRemove(file,fileList) {
        uploadFile.value = undefined;
        fileList.value = fileList
    }

    function cancel() {
        open.value = false;
        reset();
    }

    /** 下载附件 */
    function handleDownload(row) {
        const hyrq = parseTime(row.hyrq, "{y}-{m}-{d}") || row.hyrq;
        const zjh = row.zjh != null ? String(row.zjh).trim() : "";
        if (!hyrq || !zjh) {
            proxy.$modal.msgError("缺少会议日期或证件号，无法下载");
            return;
        }
        download( hyrq, zjh ).then(async (data) => {
            if (blobValidate(data)) {
                saveAs(new Blob([data]), row.wjm || "download");
            } else {
                const resText = await data.text();
                const rspObj = JSON.parse(resText);
                proxy.$modal.msgError(rspObj.msg || "下载失败");
            }
        }).catch(() => {
            proxy.$modal.msgError("下载失败");
        });
    }

    /** 提交按钮 */
    function submitForm() {
        proxy.$refs["noticeRef"].validate(valid => {
            if (valid) {
                let formData = new FormData();
                if(uploadFile.value){
                    formData.append("hyFile", uploadFile.value);
                }
                formData.append("hyrq", form.value.hyrq ?? "")
                formData.append("yt", form.value.yt ?? "")
                formData.append("khxm", form.value.khxm ?? "")
                formData.append("zjh", form.value.zjh ?? "")
                formData.append("chry", buildChryText(form.value.chryUsers))

                addLoanReviewCommit(formData).then(() => {
                    proxy.$modal.msgSuccess("新增成功");
                    open.value = false;
                    getList();
                });
            }
            
        });
    }

    loadParticipantUsers();
    getList();
</script>

<style scoped>
    .el-scrollbar__bar.is-horizontal {
        height: 12px;
    }
    /* 不升级 Element Plus 时：取消 collapse-tags，允许多个中文标签换行展示 */
    .chry-select :deep(.el-select__tags) {
        flex-wrap: wrap;
        max-width: 100%;
    }
    .chry-select :deep(.el-select__input) {
        flex-grow: 1;
        min-width: 80px;
    }
</style>