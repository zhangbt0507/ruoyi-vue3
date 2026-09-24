<template>


<div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="filter-container">
      <el-form-item label="参数名称" prop="paramName">
        <el-input 
          v-model="queryParams.paramName" 
          placeholder="请输入参数名称" 
          clearable 
          style="width: 200px"
        />
      </el-form-item>
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
      <el-form-item label="状态" prop="paramStatus">
        <el-select v-model="queryParams.paramStatus" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="正常" value="1" />
          <el-option label="停用" value="0" />
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
        <el-table v-loading="loading" :data="dataList"  style="font-family: '黑体'" max-height="50vh">
            <el-table-column label="参数名称" align="center" prop="param_name" width="150" :show-overflow-tooltip="true" />
            <el-table-column label="公私类型" align="center" prop="customer_type" width="100" />
            <el-table-column label="计算方式" align="center" prop="calculate_type" width="100" />
            <el-table-column label="BP点/利率值" align="center" prop="point_value" width="100" />
            <!-- <el-table-column label="最低利率" align="center" prop="min_rate" width="100" />
            <el-table-column label="最高利率" align="center" prop="max_rate" width="100" /> -->
            <el-table-column label="担保方式" align="center" prop="pledge_type" width="100" />
            <el-table-column label="启用时间" align="center" prop="effect_date" width="160" />
            <el-table-column label="参数状态" align="center" width="100" >
              <template #default="scope">
                <el-tag :type="scope.row.param_status === '1' ? 'success' : 'info'">
                  {{ scope.row.param_status === '1' ? '正常' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="是否分成" align="center" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.is_share === '1' ? 'success' : 'info'">
                  {{ scope.row.is_share === '1' ? '是' : '否' }}
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
      
    <!-- 添加或修改产品利率参数对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="公私类型" prop="customer_type">
          <el-select v-model="form.customer_type" placeholder="请选择公私类型" 
          style="width: 100%" @change="handleCustomerTypeChange" :disabled="dialogTitle === '修改产品利率参数'">
            <el-option label="对公" value="对公" />
            <el-option label="对私" value="对私" />
          </el-select>
        </el-form-item>
        <el-form-item label="参数名称" prop="param_name">
          <div class="input-with-button">
            <el-select 
              v-model="form.param_name" 
              placeholder="请选择参数名称" 
              filterable
              style="width: calc(100% - 80px)"
              @focus="loadParamNames"
              :disabled="dialogTitle === '修改产品利率参数'"
            >
              <el-option 
                v-for="item in paramNameOptions" 
                :key="item.paramCode" 
                :label="item.paramName" 
                :value="item.paramName" 
              />
            </el-select>
            <el-button 
              type="primary" 
              icon="Plus"
              @click="handleAddParamName"
              :disabled="!form.customer_type"
            >新增</el-button>
          </div>
        </el-form-item>
        <el-form-item label="担保方式" prop="pledge_type">
          <el-select v-model="form.pledge_type" placeholder="请选择担保方式" style="width: 100%" :disabled="dialogTitle === '修改产品利率参数'">
            <el-option label="抵押" value="抵押"/>
            <el-option label="信用" value="信用"/>
            <el-option label="保证" value="保证"/>
            <el-option label="质押" value="质押"/>
            <el-option label="余值" value="余值"/>
          </el-select>
        </el-form-item>
        <el-form-item label="计算方式" prop="calculate_type">
          <el-select v-model="form.calculate_type" placeholder="请选择计算方式" style="width: 100%" :disabled="dialogTitle === '修改产品利率参数'">
            <el-option label="固定利率" value="固定利率"/>
            <el-option label="固定加点" value="固定加点"/>
            <el-option label="最高利率" value="最高利率"/>
            <el-option label="最低利率" value="最低利率"/>
            <el-option label="最高加点" value="最高加点"/>
            <el-option label="最低加点" value="最低加点"/>
            <el-option label="加减点值" value="加减点值"/>
            <el-option label="人工定价" value="人工定价"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="form.calculate_type && form.calculate_type.indexOf('利率') !== -1 ? '利率值' : 'BP值'" prop="point_value">
          <el-input-number 
            v-model="form.point_value" 
            placeholder="请输入"
            :min="-1000"
            style="width: 100%" 
          />
        </el-form-item>
        <!-- <el-form-item label="最低利率" prop="min_rate">
          <el-input-number 
            v-model="form.min_rate" 
            placeholder="请输入最低利率"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="最高利率" prop="max_rate">
          <el-input-number 
            v-model="form.max_rate" 
            placeholder="请输入最高利率"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 100%" 
          />
        </el-form-item> -->
        <el-form-item label="启用时间" prop="effect_date">
          <el-date-picker
            v-model="form.effect_date"
            type="date"
            placeholder="选择启用时间"
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
        <el-form-item label="是否分成" prop="is_share">
          <el-radio-group v-model="form.is_share">
            <el-radio-button label="1">是</el-radio-button>
            <el-radio-button label="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 参数名称新增弹窗 -->
    <el-dialog 
      title="新增参数名称" 
      v-model="paramNameDialogVisible" 
      width="500px" 
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="paramNameForm" :rules="paramNameRules" ref="paramNameFormRef" label-width="100px">
        <el-form-item label="公私类型" prop="customer_type">
          <el-input 
            v-model="paramNameForm.customer_type" 
            disabled
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="参数名称" prop="param_name">
          <el-input 
            v-model="paramNameForm.param_name" 
            placeholder="请输入参数名称"
            style="width: 100%" 
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitParamNameForm">确 定</el-button>
        <el-button @click="paramNameDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
</div>

</template>

<script>
import { listRateProductDict, getRateProductDict, addRateProductDict, updateRateProductDict } from "@/api/szhl/pricing/param/rateProductDict";
import { listRateSecondParam, addRateSecondParam } from "@/api/szhl/pricing/param/rateSecondParam";
import useUserStore from '@/store/modules/user'

export default {
  name: "ProductParam",
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 产品利率参数表格数据
      dataList: [],
      // 弹出层标题
      dialogTitle: "",
      // 是否显示弹出层
      dialogVisible: false,
      // 参数名称选项
      paramNameOptions: [],
      // 参数名称弹窗可见性
      paramNameDialogVisible: false,
      // 参数名称表单对象
      paramNameForm: {
        param_name: '',
        customer_type: ''
      },
      // 参数名称表单校验规则
      paramNameRules: {
        param_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ],
        customer_type: [
          { required: true, message: '请选择公私类型', trigger: 'change' }
        ]
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        paramName: null,
        customerType: null
      },
      // 表单参数
      form: {
        param_id: '',
        param_name: '',
        customer_type: '',
        pledge_type: '',
        calculate_type: '', 
        point_value: null,
        min_rate: null,
        max_rate: null,
        effect_date: '',
        original_effect_date: '',
        param_status: "1",
        is_share: "0"
      },
      // 表单校验
      rules: {
        param_name: [
          { required: true, message: "参数名称不能为空", trigger: "blur" }
        ],
        customer_type: [
          { required: true, message: "公私类型不能为空", trigger: "change" }
        ],
        pledge_type: [
          { required: true, message: "担保方式不能为空", trigger: "change" }
        ],
        calculate_type: [
          { required: true, message: "计算方式不能为空", trigger: "blur" }
        ],
        point_value: [
          { required: true, message: "BP点值不能为空", trigger: "blur" }
        ],
        effect_date: [
          { required: true, message: "启用时间不能为空", trigger: "blur" }
        ],
        param_status: [
          { required: true, message: "状态不能为空", trigger: "change" }
        ],
        is_share: [
          { required: true, message: "是否参与分成不能为空", trigger: "change" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.loadParamNames();
  },
  methods: {
    /** 查询产品利率参数列表 */
    getList() {
      this.loading = true;
      const params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        paramName: this.queryParams.paramName,
        customerType: this.queryParams.customerType,
        pledgeType: this.queryParams.pledgeType,
        paramStatus: this.queryParams.paramStatus
      };
      listRateProductDict(params).then(response => {
        this.dataList = response.rows.map(item => {
          return {
            param_id: item.paramId,
            param_name: item.paramName,
            customer_type: item.customerType,
            pledge_type: item.pledgeType,
            calculate_type: item.calculateType,
            point_value: item.pointValue,
            min_rate: item.minRate,
            max_rate: item.maxRate,
            effect_date: item.effectDate,
            param_status: item.paramStatus.toString(),
            is_share: item.isShare ? item.isShare.toString() : "0",
            create_time: item.createTime,
            create_user: item.createUser
          };
        });
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.dialogVisible = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        param_id: '',
        param_name: '',
        customer_type: '',
        pledge_type: '',
        calculate_type: '',
        point_value: null,
        min_rate: null,
        max_rate: null,
        effect_date: '',
        original_effect_date: '',
        param_status: "1",
        is_share: "0"
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.dialogTitle = "新增产品利率参数";
      this.dialogVisible = true;
    },
    /** 修改按钮操作 */
    handleEdit(row) {
      this.reset();
      const formattedDate = row.effect_date ? row.effect_date : row.effect_date;
      getRateProductDict(row.param_id, formattedDate, row.customer_type, row.pledge_type, row.calculate_type).then(response => {
        if (response.code === 200) {
          const data = response.data;
          // 确保所有率值字段为null，而不是undefined或空字符串
          this.form = {
            param_id: data.paramId,
            param_name: data.paramName,
            customer_type: data.customerType,
            pledge_type: data.pledgeType,
            calculate_type: data.calculateType,
            point_value: data.pointValue,
            min_rate: data.minRate,
            max_rate: data.maxRate,
            effect_date: data.effectDate ? data.effectDate : '',
            original_effect_date: data.effectDate ? data.effectDate : '',
            param_status: data.paramStatus.toString(),
            is_share: data.isShare ? data.isShare.toString() : "0"
          };
          
          // 更新参数名称列表
          this.loadParamNames();
          this.dialogTitle = "修改产品利率参数";
          this.dialogVisible = true;
        }
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          const selectedParam = this.paramNameOptions.find(item => item.paramName === this.form.param_name);
          if (!selectedParam && this.dialogTitle === '新增产品利率参数') {
            this.$modal.msgError('请选择有效的参数名称');
            return;
          }

          const formData = {
            paramId: this.dialogTitle === '新增产品利率参数' ? selectedParam.paramCode : this.form.param_id,
            paramName: this.form.param_name,
            customerType: this.form.customer_type,
            pledgeType: this.form.pledge_type,
            calculateType: this.form.calculate_type,
            pointValue: this.form.point_value,
            minRate: this.form.min_rate,
            maxRate: this.form.max_rate,
            originalEffectDate: this.form.original_effect_date,
            effectDate: this.form.effect_date,
            paramStatus: this.form.param_status,
            isShare: this.form.is_share,
            createUser: useUserStore().name
          };

          if (this.dialogTitle === '新增产品利率参数') {
            addRateProductDict(formData).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.dialogVisible = false;
              this.getList();
            }).catch(error => {
              console.error('新增失败:', error);
            });
          } else {
            updateRateProductDict(formData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.dialogVisible = false;
              this.getList();
            }).catch(error => {
              console.error('修改失败:', error);
            });
          }
        }
      });
    },
    // 处理公私类型变化
    handleCustomerTypeChange(val) {
      // 清空参数名称
      this.form.param_name = '';
      // 加载对应公私类型的参数名称列表
      this.loadParamNames();
    },
    // 加载参数名称列表
    loadParamNames() {
      if (!this.form.customer_type) {
        this.paramNameOptions = [];
        return;
      }
      
      listRateSecondParam({ 
        belong: 'productparam',
        customerType: this.form.customer_type 
      }).then(response => {
        if (response.code === 200) {
          this.paramNameOptions = response.rows || [];
        }
      });
    },
    // 处理新增参数名称
    handleAddParamName() {
      if (!this.form.customer_type) {
        this.$modal.msgError('请先选择公私类型');
        return;
      }
      
      this.paramNameForm = {
        param_name: '',
        customer_type: this.form.customer_type
      };
      this.paramNameDialogVisible = true;
    },
    // 提交参数名称表单
    submitParamNameForm() {
      this.$refs.paramNameFormRef.validate(valid => {
        if (valid) {
          const data = {
            paramName: this.paramNameForm.param_name,
            customerType: this.paramNameForm.customer_type,
            belong: 'productparam',
            createUser: useUserStore().name
          };
          addRateSecondParam(data).then(response => {
            this.$modal.msgSuccess('新增成功');
            this.paramNameDialogVisible = false;
            this.loadParamNames();
            this.form.param_name = this.paramNameForm.param_name;
          });
        }
      });
    },
    // 分页大小变化处理
    handleSizeChange(val) {
      this.queryParams.pageSize = val;
      this.getList();
    },
    // 当前页变化处理
    handleCurrentChange(val) {
      this.queryParams.pageNum = val;
      this.getList();
    },
    // 修改字段失焦事件处理
    handleFieldBlur(field) {
      // 如果值为空字符串，转换为null
      if (this.form[field] === '' || this.form[field] === undefined) {
        this.form[field] = null;
      }
    }
  }
};
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

.input-with-button {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.dialog-footer {
  text-align: right;
}
</style> 