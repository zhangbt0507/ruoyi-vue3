<template>

  <div class="app-container">
        <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" class="filter-container">
      <!-- <el-form-item label="参数名称" prop="paramName">
        <el-input v-model="queryParams.paramName" 
          placeholder="请输入参数名称" clearable style="width: 200px"
        />
      </el-form-item> -->
      <el-form-item label="公私类型" prop="customerType">
        <el-select v-model="queryParams.customerType" placeholder="请选择公私类型" clearable style="width: 200px">
          <el-option label="对公" value="对公" />
          <el-option label="对私" value="对私" />
        </el-select>
      </el-form-item>
      <el-form-item label="担保方式" prop="pledgeType">
        <el-select v-model="queryParams.pledgeType" placeholder="请选择担保方式" clearable style="width: 200px">
            <el-option label="抵押" value="抵押" />
            <el-option label="保证" value="保证" />
            <el-option label="信用" value="信用" />
            <el-option label="质押" value="质押" />
            <el-option label="余值" value="余值" />
        </el-select>
      </el-form-item>
      <el-form-item label="生效日期" prop="effectDate">
          <el-date-picker
            v-model="queryParams.effectDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>
      <el-card>
        <div style="min-height:50vh">
          <!-- 表格数据 -->
          <el-table v-loading="loading" :data="tableData"  style="font-family: '黑体'" max-height="50vh">
              <el-table-column label="生效日期" align="center" prop="effect_date" width="100" />
              <el-table-column label="利率类型" align="center" prop="param_name" width="100" />
              <el-table-column label="公私类型" align="center" prop="customer_type" width="120" />
              <el-table-column label="担保方式" align="center" prop="pledge_type" width="100" />
              <el-table-column label="LPR值(%)" align="center" prop="lpr_value" width="100" />
              <el-table-column label="最低限值(%)" align="center" prop="min_rate" width="120" />
              <el-table-column label="基础加点(BP)" align="center" prop="base_point" width="120" />
              <el-table-column label="状态" align="center" prop="cancelDate" width="100" >
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
                    <el-button 
                      link 
                      :type="isEditableByDate(scope.row.create_time) ? 'primary' : 'info'" 
                      icon="Edit" 
                      @click="handleEdit(scope.row)"
                      :disabled="!isEditableByDate(scope.row.create_time)"
                      :style="!isEditableByDate(scope.row.create_time) ? 'color: #909399; cursor: not-allowed;' : ''"
                    >修改</el-button>
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
        <el-form-item label="调整日期" prop="effect_date">
          <el-date-picker
            v-model="form.effect_date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="参数名称" prop="param_name">
          <el-select 
            v-model="form.param_name" 
            placeholder="请选择" 
            style="width: 100%" 
            @change="handleParamNameChange"
            :disabled="dialogTitle === '修改利率'"
          >
            <el-option value="一年" label="一年" />
            <el-option value="五年以上" label="五年以上" />
          </el-select>
        </el-form-item>
        <el-form-item label="公私类型" prop="customer_type">
          <el-select 
            v-model="form.customer_type" 
            placeholder="请选择" 
            style="width: 100%" 
            @change="handleCustomerTypeChange"
            :disabled="dialogTitle === '修改利率'"
          >
            <el-option label="对公" value="对公" />
            <el-option label="对私" value="对私" />
          </el-select>
        </el-form-item>
        <el-form-item label="担保方式" prop="pledge_type">
          <el-select 
            v-model="form.pledge_type" 
            placeholder="请选择担保方式" 
            style="width: 100%"
            :disabled="dialogTitle === '修改利率'"
          >
            <el-option label="抵押" value="抵押" />
            <el-option label="保证" value="保证" />
            <el-option label="信用" value="信用" />
            <el-option label="质押" value="质押" />
            <el-option label="余值" value="余值" />
          </el-select>
        </el-form-item>
        <el-form-item label="LPR值" prop="lpr_value">
          <div class="input-with-unit">
            <el-input-number
              v-model="form.lpr_value"
              :precision="2"
              :step="0.01"
              :min="0"
              :max="100"
              style="width: calc(100% - 30px)"
              placeholder="请输入LPR值"
            >
            </el-input-number>
            <span class="unit-text">%</span>
          </div>
        </el-form-item>
        <el-form-item label="基础利率" prop="min_rate">
          <div class="input-with-unit">
            <el-input-number
              v-model="form.min_rate"
              :precision="2"
              :step="0.01"
              :min="0"
              :max="100"
              style="width: calc(100% - 30px)"
              placeholder="请输入基础利率"
            >
            </el-input-number>
            <span class="unit-text">%</span>
          </div>
        </el-form-item>
        <el-form-item label="基础加点" prop="base_point">
          <div class="input-with-unit">
            <el-input-number
              v-model="form.base_point"
              :precision="0"
              :step="1"
              :min="0"
              :max="1000"
              style="width: calc(100% - 30px)"
              placeholder="请输入基础加点"
            >  
            </el-input-number>
            <span class="unit-text">BP</span>
          </div>
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

    <!-- 提示信息 -->
    <div class="rate-info-tips">
      说明：该模块用于每月LPR利率的调整，如每月LPR利率未变化，则不需要调整。
    </div>

  </div>
</template>

<script>
import { listRate, getRate, addRate, updateRate } from '@/api/szhl/pricing/param/rateConfig'
import useUserStore from '@/store/modules/user'

export default {
  name: 'RateTable',
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
        pledge_type: '',
        lpr_value: undefined,
        min_rate: undefined,
        base_point: undefined,
        effect_date: '',
        original_effect_date: '',
        param_status: '1',
        create_date: '',
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
        pledge_type: [
          { required: true, message: '请选择担保方式', trigger: 'change' }
        ],
        lpr_value: [
          { required: true, message: '请输入LPR值', trigger: 'blur' },
          { type: 'number', message: 'LPR值必须为数字', trigger: 'blur' }
        ],
        min_rate: [
          { required: true, message: '请输入最低利率', trigger: 'blur' },
          { type: 'number', message: '最低利率必须为数字', trigger: 'blur' }
        ],
        base_point: [
          { required: true, message: '请输入基础加点', trigger: 'blur' },
          { type: 'number', message: '基础加点必须为数字', trigger: 'blur' }
        ],
        effect_date: [
          { required: true, message: '请选择调整日期', trigger: 'change' }
        ],
        param_status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      // 公私类型对应的编号前缀映射
      customerTypeMap: {
        '对公': 'DG',
        '对私': 'DS'
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerType: '',
        pledgeType: '',
        effectDate: ''
      },
      // 总条数
      total: 0
    }
  },
  created() {
    this.getList();
  },
  methods: {
    /** 判断记录是否可以编辑（创建时间在20天内） */
    isEditableByDate(createTime) {
      // if (!createTime) return false;
      
      // // 解析创建时间
      // const createDate = new Date(createTime);
      // // 获取当前时间
      // const currentDate = new Date();
      
      // // 计算时间差（毫秒）
      // const timeDiff = currentDate - createDate;
      // // 转换为天数
      // const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      // // 如果天数差小于20天，则允许编辑
      // return daysDiff < 20;
      return true;
    },
    
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 获取列表数据
    getList() {
      this.loading = true;
      listRate(this.queryParams).then(response => {
        if (response.code === 200) {
          this.tableData = response.rows.map(item => ({
            effect_date: item.effectDate ? item.effectDate.split('T')[0] : '',
            param_id: item.paramId,
            param_name: item.paramName,
            customer_type: item.customerType,
            pledge_type: item.pledgeType,
            lpr_value: item.lprValue,
            min_rate: item.minRate,
            base_point: item.basePoint,
            param_status: item.paramStatus.toString(),
            create_date: item.createDate,
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

    // 处理公私类型变化
    handleCustomerTypeChange() {
      this.generateParamId();
    },

    // 生成参数编号
    generateParamId() {
      if (this.form.customer_type && this.form.param_name) {
        const prefix = this.customerTypeMap[this.form.customer_type];
        const suffix = this.form.param_name === '一年' ? '1Y' : '5Y';
        this.form.param_id = `${prefix}/${suffix}`;
      }
    },
    
    // 处理新增
    handleAdd() {
      this.dialogTitle = '新增利率';
      this.form = {
        param_id: '',
        param_name: '',
        customer_type: '',
        pledge_type: '',
        lpr_value: undefined,
        min_rate: undefined,
        base_point: undefined,
        effect_date: '',
        original_effect_date: '',
        param_status: '1',
        create_date: new Date().toISOString().split('T')[0],
        create_user: useUserStore().name
      };
      this.dialogVisible = true;
    },
    
    // 处理编辑
    handleEdit(row) {
      this.dialogTitle = '修改利率';
      const formattedDate = row.effect_date ? row.effect_date.split('T')[0] : row.effect_date;
      getRate(row.param_id, formattedDate, row.customer_type, row.pledge_type).then(response => {
        if (response.code === 200 && response.data) {
          this.form = {
            param_id: response.data.paramId,
            param_name: response.data.paramName,
            customer_type: response.data.customerType,
            pledge_type: response.data.pledgeType,
            lpr_value: response.data.lprValue,
            min_rate: response.data.minRate,
            base_point: response.data.basePoint,
            effect_date: response.data.effectDate ? response.data.effectDate.split('T')[0] : '',
            original_effect_date: response.data.effectDate ? response.data.effectDate.split('T')[0] : '',
            param_status: response.data.paramStatus.toString(),
            create_date: response.data.createDate,
            create_user: response.data.createUser
          };
          this.dialogVisible = true;
        }
      });
    },
    
    // 提交表单
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          //这行代码可以解决时区少8小时问题
          const rateParam = {
            paramId: this.form.param_id,
            paramName: this.form.param_name,
            customerType: this.form.customer_type,
            pledgeType: this.form.pledge_type,
            lprValue: Number(this.form.lpr_value),
            minRate: Number(this.form.min_rate),
            basePoint: Number(this.form.base_point),
            effectDate: this.form.effect_date,
            originalEffectDate: this.form.original_effect_date,
            paramStatus: this.form.param_status,
            createDate: this.form.create_date || new Date().toISOString().split('T')[0],
            createUser: this.form.create_user || useUserStore().name
          };
          
          if (this.dialogTitle === '修改利率') {
            updateRate(rateParam).then(response => {
              this.$modal.msgSuccess('修改成功');
              this.dialogVisible = false;
              this.getList();
            });
          } else {
            addRate(rateParam).then(response => {
              this.$modal.msgSuccess('新增成功');
              this.dialogVisible = false;
              this.getList();
            });
          }
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
    }
  }
}
</script>

<style scoped>
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

.rate-info-tips {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #e6f7ff;
  border-radius: 4px;
  color: #1890ff;
  font-size: 13px;
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