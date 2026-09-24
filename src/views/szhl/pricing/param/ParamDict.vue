<template>


  <div class="app-container">
        <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" class="filter-container">
      <el-form-item label="参数名称" prop="paramName">
        <el-input v-model="queryParams.paramName" 
          placeholder="请输入参数名称" clearable style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="公私类型" prop="customerType">
        <el-select v-model="queryParams.customerType" placeholder="请选择公私类型" clearable style="width: 200px">
          <el-option label="对公" value="对公" />
          <el-option label="对私" value="对私" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="paramStatus">
        <el-select v-model="queryParams.paramStatus" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="正常" value="1" />
          <el-option label="停用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search"  @click="handleQuery">查询</el-button>
        <el-button icon="Refresh"  @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>
      <el-card>
        <div style="min-height:50vh">
          <!-- 表格数据 -->
          <el-table v-loading="loading" :data="tableData"  style="font-family: '黑体'" max-height="50vh">
              <el-table-column label="参数名称" align="center" prop="param_name" width="150" />
              <el-table-column label="公私类型" align="center" prop="customer_type" width="100" />
              <el-table-column label="最高加点(BP)" align="center" prop="max_point" width="120" />
              <!-- <el-table-column label="民族" prop="nation" width="100" /> -->
              <el-table-column label="最低加点(BP)" align="center" prop="min_point" width="120" />
              <el-table-column label="启用时间" align="center" prop="effect_date" width="160" />
              <el-table-column label="参数状态" align="center" width="100" >
                <template #default="scope">
                  <el-tag :type="scope.row.param_status === '1' ? 'success' : 'info'">
                    {{ scope.row.param_status === '1' ? '正常' : '停用' }}
                  </el-tag>
                </template>
                
              </el-table-column>
              <el-table-column label="建立时间" align="center" prop="create_time" width="180" />
              <el-table-column label="建立柜员" align="center" prop="create_user" :show-overflow-tooltip="true" width="150" />
              <el-table-column label="操作" min-width="100">
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
      <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" append-to-body>
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
          <el-form-item label="参数名称" prop="param_name">
            <el-select 
              v-model="form.param_name" 
              placeholder="请选择" 
              style="width: 100%" 
              @change="handleParamNameChange"
              :disabled="dialogTitle === '修改参数'"
            >
              <el-option 
                v-for="dict in param_first" 
                :key="dict.value" 
                :label="dict.label" 
                :value="dict.label" />
            </el-select>
          </el-form-item>
          <el-form-item label="公私类型" prop="customer_type">
            <el-select 
              v-model="form.customer_type" 
              placeholder="请选择" 
              style="width: 100%" 
              :disabled="dialogTitle === '修改参数'"
            >
              <el-option label="对公" value="对公" />
              <el-option label="对私" value="对私" />
            </el-select>
          </el-form-item>
          <el-form-item label="最高加点" prop="max_point">
            <div class="input-with-unit">
              <el-input-number
                v-model="form.max_point"
                :precision="0"
                :step="1"
                :min="-1000"
                :max="1000"
                style="width: calc(100% - 30px)"
                placeholder="请输入最高加点"
              >
              </el-input-number>
              <span class="unit-text">BP</span>
            </div>
          </el-form-item>
          <el-form-item label="最低加点" prop="min_point">
            <div class="input-with-unit">
              <el-input-number
                v-model="form.min_point"
                :precision="0"
                :step="1"
                :min="-1000"
                :max="1000"
                style="width: calc(100% - 30px)"
                placeholder="请输入最低加点"
              >
              </el-input-number>
              <span class="unit-text">BP</span>
            </div>
          </el-form-item>
          <el-form-item label="启用时间" prop="effect_date">
            <el-date-picker
              v-model="form.effect_date"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="状态" prop="param_status">
            <el-radio-group v-model="form.param_status">
              <el-radio-button label="1">正常</el-radio-button>
              <el-radio-button label="0">停用</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </el-dialog>
    </div>
</template>

<script>
import { listRateParamDict, getRateParamDict, addRateParamDict, updateRateParamDict } from '@/api/szhl/pricing/param/rateParamDict'
import useUserStore from '@/store/modules/user'
import { useDict } from '@/utils/dict'


export default {
  name: 'ParamDict',
  setup(){
        //报表类型数据字典
      const { param_first } = useDict("param_first");
      return { param_first }
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
        param_id: '',
        param_name: '',
        customer_type: '',
        max_point: undefined,
        min_point: undefined,
        effect_date: '',
        original_effect_date: '',
        param_status: '1',
        create_time: '',
        create_user: ''
      },
      // 表单校验规则
      rules: {
        param_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ],
        customer_type: [
          { required: true, message: '请选择公私类型', trigger: 'change' }
        ],
        max_point: [
          { required: true, message: '请输入最高加点', trigger: 'blur' },
          { type: 'number', message: '最高加点必须为数字', trigger: 'blur' }
        ],
        min_point: [
          { required: true, message: '请输入最低加点', trigger: 'blur' },
          { type: 'number', message: '最低加点必须为数字', trigger: 'blur' }
        ],
        effect_date: [
          { required: true, message: '请选择启用时间', trigger: 'change' }
        ],
        param_status: [
          { required: true, message: '请选择参数状态', trigger: 'change' }
        ]
      },
      // 查询参数
      queryParams: {
        paramName: '',
        customerType: '',
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
      const queryParams = {
        ...this.queryParams,
        paramName: this.queryParams.paramName || undefined,
        customerType: this.queryParams.customerType || undefined,
        paramStatus: this.queryParams.paramStatus || undefined
      };
      
      listRateParamDict(queryParams).then(response => {
        if (response.code === 200) {
          this.tableData = response.rows.map(item => ({
            param_id: item.paramId,
            param_name: item.paramName,
            customer_type: item.customerType,
            max_point: item.maxPoint,
            min_point: item.minPoint,
            effect_date: item.effectDate,
            original_effect_date: item.effectDate,
            param_status: item.paramStatus.toString(),
            create_time: item.createTime,
            create_user: item.createUser
          }));
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
    
    // 处理参数名称变化
    handleParamNameChange() {
      this.generateParamId();
    },

    // 生成参数编号
    generateParamId() {
      if (this.form.param_name) {
        const selectedDict = this.param_first.find(
          dict => dict.label === this.form.param_name
        );
        if (selectedDict) {
          this.form.param_id = selectedDict.value;
        }
      }
    },
    
    // 处理查询
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    
    // 重置查询表单
    resetQuery() {
      this.$refs.queryFormRef.resetFields();
      this.handleQuery();
    },
    
    // 处理新增
    handleAdd() {
      this.dialogTitle = '新增参数';
      const now = new Date();
      const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
      this.form = {
        param_id: '',
        param_name: '',
        customer_type: '',
        max_point: undefined,
        min_point: undefined,
        effect_date: '',
        param_status: '1',
        create_time: formattedDate,
        create_user: useUserStore().name
      };
      this.dialogVisible = true;
    },
    
    // 处理编辑
    handleEdit(row) {
      this.dialogTitle = '修改参数';
      const effectDate = row.effect_date ? row.effect_date : '';
      getRateParamDict(row.param_id, effectDate, row.customer_type).then(response => {
        if (response.code === 200) {
          const data = response.data;
          this.form = {
            param_id: data.paramId,
            param_name: data.paramName,
            customer_type: data.customerType,
            max_point: data.maxPoint,
            min_point: data.minPoint,
            effect_date: data.effectDate,
            original_effect_date: data.effectDate,
            param_status: data.paramStatus,
            create_time: data.createTime,
            create_user: data.createUser
          };
          this.dialogVisible = true;
        }
      });
    },
    
    // 处理每页显示数量变化
    handleSizeChange(val) {
      this.queryParams.pageSize = val;
      this.getList();
    },
    
    // 处理页码变化
    handleCurrentChange(val) {
      this.queryParams.pageNum = val;
      this.getList();
    },
    
    // 提交表单
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          const selectedDict = this.param_first.find(
            dict => dict.label === this.form.param_name
          );
          const paramId = selectedDict ? selectedDict.value : '';
          const formData = {
            paramId: paramId,
            paramName: this.form.param_name,
            customerType: this.form.customer_type,
            maxPoint: this.form.max_point,
            minPoint: this.form.min_point,
            effectDate: this.form.effect_date,
            originalEffectDate: this.form.original_effect_date,
            paramStatus: this.form.param_status,
            createTime: this.form.create_time,
            createUser: this.form.create_user
          };
          
          if (this.dialogTitle === '修改参数') {
            updateRateParamDict(formData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.dialogVisible = false;
              this.getList();
            });
          } else {
            addRateParamDict(formData).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.dialogVisible = false;
              this.getList();
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

.top-operation {
  margin-bottom: 16px;
}

.list-container {
  background-color: #fff;
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  box-sizing: content-box;
}

.list-header {
  display: flex;
  align-items: center;
  height: 44px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
}

.header-item {
  padding: 0 8px;
  font-size: 13px;
  color: #909399;
  font-weight: normal;
  text-align: center;
}

.list-body {
  background: #fff;
}

.list-item {
  display: flex;
  align-items: center;
  height: 44px;
  transition: all 0.3s;
  border-bottom: 1px solid #ebeef5;
}

.list-item:hover {
  background-color: #f5f7fa;
}

.item-cell {
  padding: 0 8px;
  font-size: 13px;
  color: #606266;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operation {
  display: flex;
  justify-content: center;
  align-items: center;
}

.operation .el-button {
  padding: 0;
  font-size: 12px;
  color: #409EFF;
  margin: 0 4px;
}

.operation .el-button:hover {
  color: #66b1ff;
  background: transparent;
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

.pagination-container {
  padding: 15px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style> 