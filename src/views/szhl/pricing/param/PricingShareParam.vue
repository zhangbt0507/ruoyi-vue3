<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" class="filter-container">
      <el-form-item label="是否存量" prop="isStock">
        <el-select v-model="queryParams.isStock" placeholder="请选择是否存量" clearable style="width: 140px">
          <el-option label="存量" value="存量" />
          <el-option label="增量" value="增量" />
        </el-select>
      </el-form-item>
      <el-form-item label="奖励类型" prop="rewardType">
        <el-select v-model="queryParams.rewardType" placeholder="请选择奖励类型" clearable style="width: 140px">
          <el-option label="固定BP" value="固定BP" />
          <el-option label="比例" value="比例" />
        </el-select>
      </el-form-item>
      <el-form-item label="担保方式" prop="guaranteeType">
        <el-select v-model="queryParams.guaranteeType" placeholder="请选择担保方式" clearable style="width: 140px">
            <el-option label="抵押" value="抵押" />
            <el-option label="信保" value="信保" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 140px">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <el-card>
      <div style="min-height:50vh">
        <!-- 表格数据 -->
        <el-table v-loading="loading" :data="tableData" style="font-family: '黑体'" max-height="50vh">
          <el-table-column label="是否存量" align="center" prop="isStock" width="80" />
          <el-table-column label="奖励类型" align="center" prop="rewardType" width="100" />
          <el-table-column label="担保方式" align="center" prop="guaranteeType" width="80" />
          <el-table-column label="使用支行权限" align="center" prop="useBranchAuthority" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.useBranchAuthority === '是' ? 'success' : 'info'">
                {{ scope.row.useBranchAuthority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="分档下限" align="center" prop="branchLowerLimit" width="80" />
          <el-table-column label="分档上限" align="center" prop="branchUpperLimit" width="80" />
          <el-table-column label="奖励值" align="center" prop="rewardValue" width="80">
            <template #default="scope">
              <span>{{ scope.row.rewardValue }}</span>
              <span v-if="scope.row.rewardType === '固定BP'">BP</span>
              <span v-else>%</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === '0' ? 'success' : 'info'">
                {{ scope.row.status === '0' ? '正常' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="建立时间" align="center" prop="createTime" width="180" />
          <el-table-column label="建立柜员" align="center" prop="createBy" :show-overflow-tooltip="true" width="150" />
          <el-table-column label="操作" min-width="100" align="center">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)">修改</el-button>
            </template>
          </el-table-column>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px" append-to-body>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否存量" prop="isStock">
              <el-select 
                v-model="form.isStock" 
                placeholder="请选择是否存量" 
                style="width: 100%"
              >
                <el-option label="存量" value="存量" />
                <el-option label="增量" value="增量" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="奖励类型" prop="rewardType">
              <el-select 
                v-model="form.rewardType" 
                placeholder="请选择奖励类型" 
                style="width: 100%"
              >
                <el-option label="固定BP" value="固定BP" />
                <el-option label="比例" value="比例" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="担保方式" prop="guaranteeType">
              <el-select 
                v-model="form.guaranteeType" 
                placeholder="请选择担保方式" 
                style="width: 100%"
              >
                <el-option label="抵押" value="抵押" />
                <el-option label="信保" value="信保" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用支行权限" prop="useBranchAuthority">
              <el-radio-group v-model="form.useBranchAuthority">
                <el-radio-button label="是">是</el-radio-button>
                <el-radio-button label="否">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分档下限" prop="branchLowerLimit">
              <el-input-number
                v-model="form.branchLowerLimit"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="100"
                style="width: 100%"
                placeholder="请输入分档下限"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分档上限" prop="branchUpperLimit">
              <el-input-number
                v-model="form.branchUpperLimit"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="100"
                style="width: 100%"
                placeholder="请输入分档上限"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="form.rewardType === '固定BP' ? '奖励值(BP)' : '奖励值(%)'" prop="rewardValue">
              <el-input-number
                v-model="form.rewardValue"
                :precision="form.rewardType === '固定BP' ? 0 : 2"
                :step="form.rewardType === '固定BP' ? 1 : 0.01"
                :min="0"
                :max="form.rewardType === '固定BP' ? 1000 : 100"
                style="width: 100%"
                placeholder="请输入奖励值"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio-button label="0">正常</el-radio-button>
                <el-radio-button label="1">停用</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            style="width: 100%" 
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 提示信息 -->
    <div class="rate-info-tips">
      说明：该模块用于配置不同业务类型的定价分成奖励参数，支持按存量/增量、奖励类型、担保方式等维度进行配置。
    </div>
  </div>
</template>

<script>
import { listPricingShareParam, getPricingShareParam, addPricingShareParam, updatePricingShareParam, delPricingShareParam } from '@/api/szhl/pricing/param/pricingShareParam'
import useUserStore from '@/store/modules/user'
import Pagination from '@/components/Pagination'

export default {
  name: 'PricingShareParam',
  components: {
    Pagination
  },
  data() {
    return {
      // 加载状态
      loading: false,
      // 提交加载状态
      submitLoading: false,
      // 表格数据
      tableData: [],
      // 弹窗可见性
      dialogVisible: false,
      // 弹窗标题
      dialogTitle: '',
      // 表单对象
      form: {
        id: undefined,
        isStock: '',
        rewardType: '',
        guaranteeType: '',
        useBranchAuthority: '是',
        branchLowerLimit: undefined,
        branchUpperLimit: undefined,
        rewardValue: undefined,
        status: '0',
        remark: ''
      },
      // 表单校验规则
      rules: {
        isStock: [
          { required: true, message: '请选择是否存量', trigger: 'change' }
        ],
        rewardType: [
          { required: true, message: '请选择奖励类型', trigger: 'change' }
        ],
        guaranteeType: [
          { required: true, message: '请选择担保方式', trigger: 'change' }
        ],
        useBranchAuthority: [
          { required: true, message: '请选择是否使用支行权限', trigger: 'change' }
        ],
        branchLowerLimit: [
          { required: true, message: '请输入分档下限', trigger: 'blur' },
          { type: 'number', message: '分档下限必须为数字', trigger: 'blur' }
        ],
        branchUpperLimit: [
          { required: true, message: '请输入分档上限', trigger: 'blur' },
          { type: 'number', message: '分档上限必须为数字', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value && this.form.branchLowerLimit && value <= this.form.branchLowerLimit) {
                callback(new Error('分档上限必须大于分档下限'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        rewardValue: [
          { required: true, message: '请输入奖励值', trigger: 'blur' },
          { type: 'number', message: '奖励值必须为数字', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        isStock: undefined,
        rewardType: undefined,
        guaranteeType: undefined,
        useBranchAuthority: undefined,
        status: undefined
      },
      // 总条数
      total: 0
    }
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      listPricingShareParam(this.queryParams).then(response => {
        if (response.code === 200) {
          this.tableData = response.rows || [];
          this.total = response.total || 0;
        } else {
          this.tableData = [];
          this.total = 0;
          this.$modal.msgError(response.msg || '查询失败');
        }
        this.loading = false;
      }).catch(error => {
        console.error('查询失败:', error);
        this.$modal.msgError('查询失败');
        this.loading = false;
      });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.queryFormRef.resetFields();
      this.handleQuery();
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.dialogTitle = '新增参数';
      this.form = {
        id: undefined,
        isStock: '',
        rewardType: '',
        guaranteeType: '',
        useBranchAuthority: '是',
        branchLowerLimit: undefined,
        branchUpperLimit: undefined,
        rewardValue: undefined,
        status: '0',
        remark: ''
      };
      this.dialogVisible = true;
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },

    /** 修改按钮操作 */
    handleEdit(row) {
      this.dialogTitle = '修改参数';
      // 获取详细信息
      getPricingShareParam(row.id).then(response => {
        if (response.code === 200) {
          this.form = { ...response.data };
          this.dialogVisible = true;
          this.$nextTick(() => {
            if (this.$refs.formRef) {
              this.$refs.formRef.clearValidate();
            }
          });
        } else {
          this.$modal.msgError(response.msg || '获取详细信息失败');
        }
      }).catch(error => {
        console.error('获取详细信息失败:', error);
        this.$modal.msgError('获取详细信息失败');
      });
    },

    /** 提交表单 */
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          const formData = {
            ...this.form,
            createBy: this.form.id ? this.form.createBy : useUserStore().name,
            updateBy: this.form.id ? useUserStore().name : undefined
          };

          const request = this.form.id 
            ? updatePricingShareParam(formData)
            : addPricingShareParam(formData);

          request.then(response => {
            if (response.code === 200) {
              this.$modal.msgSuccess(this.form.id ? '修改成功' : '新增成功');
              this.dialogVisible = false;
              this.getList();
            } else {
              this.$modal.msgError(response.msg || '操作失败');
            }
            this.submitLoading = false;
          }).catch(error => {
            console.error('提交失败:', error);
            this.$modal.msgError('提交失败');
            this.submitLoading = false;
          });
        }
      });
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 15px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.filter-container .el-form-item {
  margin-right: 10px;
  margin-bottom: 0;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
}

:deep(.el-radio-button__inner) {
  padding: 8px 15px;
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #409EFF;
  border-color: #409EFF;
  box-shadow: -1px 0 0 0 #409EFF;
}

.dialog-footer {
  text-align: right;
}

.rate-info-tips {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f8f8;
  border-left: 4px solid #409EFF;
  color: #606266;
  font-size: 14px;
}
</style>