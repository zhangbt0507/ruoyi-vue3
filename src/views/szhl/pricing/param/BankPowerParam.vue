<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" class="filter-container">
      <el-form-item label="参数名称" prop="paramName">
        <el-input v-model="queryParams.paramName" 
          placeholder="请输入参数名称" clearable style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="担保方式" prop="pledgeType">
        <el-select v-model="queryParams.pledgeType" placeholder="请选择担保方式" clearable style="width: 200px">
          <el-option label="信用" value="信用" />
          <el-option label="保证" value="保证" />
          <el-option label="抵押" value="抵押" />
          <el-option label="质押" value="质押" />
          <el-option label="余值" value="余值" />
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
          <el-table-column label="参数名称" align="center" prop="paramName" width="200" />
          <el-table-column label="担保方式" align="center" prop="pledgeType" width="100" />
          <el-table-column label="启用时间" align="center" prop="effectDate" width="120" />
          <el-table-column label="减点值(BP)" align="center" prop="bpPoint" width="120" />
          <el-table-column label="最低利率(%)" align="center" prop="minRate" width="120" />
          <el-table-column label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.paramStatus === 1 ? 'success' : 'info'">
                {{ scope.row.paramStatus === 1 ? '正常' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="建立时间" align="center" prop="createTime" width="180" />
          <el-table-column label="建立柜员" align="center" prop="createUser" :show-overflow-tooltip="true" width="150" />
          <el-table-column label="操作" min-width="100">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)" :disabled="scope.row.paramName === '总行权限'">修改</el-button>
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
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" append-to-body>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="参数名称" prop="paramName">
          <el-input 
            v-model="form.paramName" 
            placeholder="请输入参数名称" 
            clearable 
            style="width: 100%" 
            :disabled="dialogTitle === '修改参数'"
          />
        </el-form-item>
        <el-form-item label="担保方式" prop="pledgeType">
          <el-select 
            v-model="form.pledgeType" 
            placeholder="请选择" 
            style="width: 100%" 
            :disabled="dialogTitle === '修改参数'"
          >
            <el-option label="信用" value="信用" />
            <el-option label="保证" value="保证" />
            <el-option label="抵押" value="抵押" />
            <el-option label="质押" value="质押" />
            <el-option label="余值" value="余值" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用时间" prop="effectDate">
          <el-date-picker
            v-model="form.effectDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <!-- <el-form-item label="最小利率(%)" prop="minRate">
          <div class="input-with-unit">
            <el-input-number 
              v-model="form.minRate" 
              :precision="2" 
              :step="0.01" 
              :min="0" 
              :max="100" 
              style="width: calc(100% - 30px)"
              placeholder="请输入最小利率(%)" >
            </el-input-number>
            <span class="unit-text">%</span>
          </div>
        </el-form-item> -->
        <el-form-item label="减点值(BP)" prop="bpPoint">
          <div class="input-with-unit">
            <el-input-number
              v-model="form.bpPoint"
              :precision="0"
              :step="1"
              :max="0"
              :min="-1000"
              style="width: calc(100% - 30px)"
              placeholder="请输入加点值(负数)"
            >
            </el-input-number>
            <span class="unit-text">BP</span>
          </div>
        </el-form-item>
        <el-form-item label="最低利率" prop="minRate">
          <div class="input-with-unit">
            <el-input-number
              v-model="form.minRate"
              :precision="2"
              :step="0.01"
              :min="0"
              :max="100"
              style="width: calc(100% - 30px)"
              placeholder="请输入最低利率"
            >
            </el-input-number>
            <span class="unit-text">%</span>
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="paramStatus">
          <el-radio-group v-model="form.paramStatus">
            <el-radio-button label="1">正常</el-radio-button>
            <el-radio-button label="0">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :disabled="form.paramName === '总行权限'">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 提示信息 -->
    <div class="rate-info-tips">
      说明：该模块用于设置各分行在不同担保方式下的权限，加点值仅支持负数。
    </div>
  </div>
</template>

<script>
import { listRateBankPowerParam, getInfo, add, edit } from '@/api/szhl/pricing/param/rateBankPower'
import useUserStore from '@/store/modules/user'
import Pagination from '@/components/Pagination'

export default {
  name: 'BankPowerParam',
  components: {
    Pagination
  },
  data() {
    return {
      // 加载状态
      loading: false,
      // 表格数据
      tableData: [],
      // 弹窗可见性
      dialogVisible: false,
      // 弹窗标题
      dialogTitle: '',
      // 表单对象
      form: {
        paramId: '',
        paramName: '',
        pledgeType: '',
        effectDate: '',
        originalEffectDate: '', // 用于保存原始的启用时间
        minRate: undefined,
        bpPoint: undefined,
        paramStatus: 1,
        createTime: '',
        createUser: ''
      },
      // 表单校验规则
      rules: {
        paramName: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ],
        pledgeType: [
          { required: true, message: '请选择担保方式', trigger: 'change' }
        ],
        effectDate: [
          { required: true, message: '请选择启用时间', trigger: 'change' }
        ],
        // minRate: [
        //   { required: true, message: '请输入最低利率', trigger: 'blur' },
        //   { type: 'number', message: '最低利率必须为数字', trigger: 'blur' }
        // ],
        bpPoint: [
          { required: true, message: '请输入加点值', trigger: 'blur' },
          { type: 'number', message: '加点值必须为数字', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (value > 0) {
                callback(new Error('加点值必须为负数或0'));
              } else {
                callback();
              }
            }, 
            trigger: 'blur' 
          }
        ],
        minRate: [
          { required: true, message: '请输入最低利率', trigger: 'blur' },
          { type: 'number', message: '最低利率必须为数字', trigger: 'blur' }
        ],
        paramStatus: [
          { required: true, message: '请选择参数状态', trigger: 'change' }
        ]
      },
      // 查询参数
      queryParams: {
        paramName: undefined,
        pledgeType: undefined,
        pageNum: 1,
        pageSize: 10
      },
      // 总条数
      total: 0
    }
  },
  created() {
    this.getList();
  },
  methods: {
    // 获取列表数据
    getList() {
      this.loading = true;
      listRateBankPowerParam(this.queryParams).then(response => {
        if (response.code === 200) {
          this.tableData = response.rows;
          this.total = response.total;
        } else {
          this.tableData = [];
          this.total = 0;
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    
    // 处理查询
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    
    // 重置查询表单
    resetQuery() {
      this.$refs.queryFormRef.resetFields();
      this.queryParams.pageNum = 1;
      this.handleQuery();
    },
    
    // 处理新增
    handleAdd() {
      this.dialogTitle = '新增参数';
      this.form = {
        paramId: '',
        paramName: '',
        pledgeType: '',
        effectDate: '',
        originalEffectDate: '',
        // minRate: 0,
        bpPoint: undefined,
        paramStatus: 1,
        createTime: '',
        createUser: useUserStore().name
      };
      this.dialogVisible = true;
    },
    
    // 处理编辑
    handleEdit(row) {
      this.dialogTitle = '修改参数';
      // 传递paramId和effectDate
      getInfo(row.paramId, row.effectDate).then(response => {
        if (response.code === 200) {
          this.form = response.data;
          // 保存原始的启用时间
          this.form.originalEffectDate = this.form.effectDate;
          // 确保状态值为数字类型
          this.form.paramStatus = parseInt(this.form.paramStatus);
          this.dialogVisible = true;
        }
      });
    },
    
    // 提交表单
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          const formData = { ...this.form };
          
          if (this.dialogTitle === '修改参数') {
            // 修改时，需要传递原始的启用时间
            edit(formData).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.dialogVisible = false;
                this.getList();
              }
            });
          } else {
            add(formData).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("新增成功");
                this.dialogVisible = false;
                this.getList();
              }
            });
          }
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

.mb8 {
  margin-bottom: 8px;
}

.input-with-unit {
  display: flex;
  align-items: center;
  width: 100%;
}

.unit-text {
  margin-left: 8px;
  color: #606266;
  font-size: 14px;
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