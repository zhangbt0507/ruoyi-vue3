<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" class="filter-container">
      <el-form-item label="上级参数" prop="parentParamId">
        <el-select 
          v-model="queryParams.parentParamId" 
          placeholder="请选择上级参数" 
          clearable 
          filterable
          style="width: 200px"
        >
          <el-option 
            v-for="(paramName, paramId) in parentParamMap" 
            :key="paramId" 
            :label="paramName" 
            :value="paramId" 
          />
        </el-select>
      </el-form-item>
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
      <el-form-item label="状态" prop="paramStatus">
        <el-select v-model="queryParams.paramStatus" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="正常" value="1" />
          <el-option label="停用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search"  @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>
    <el-card>
      <div style="min-height:50vh">
        <!-- 表格数据 -->
        <el-table v-if="parentMapReady" v-loading="loading" :data="tableData"  style="font-family: '黑体'" max-height="50vh">
            <el-table-column label="参数名称" align="center" prop="param_name" width="150" :show-overflow-tooltip="true"/>
            <el-table-column label="上级参数" align="center" prop="parent_param_id" width="100" >
              <template #default="scope">
                  {{ getParentParamName(scope.row.parent_param_id) }}
              </template>
            </el-table-column>
            <el-table-column label="公私类型" align="center" prop="customer_type" width="100" />
            <el-table-column label="LPR加减值(BP)" align="center" prop="lpr_value" width="120" />
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
        <el-form-item label="公私类型" prop="customer_type">
          <el-select 
            v-model="form.customer_type" 
            placeholder="请选择公私类型" 
            style="width: 100%"
            :disabled="dialogTitle === '修改参数'"
            @change="handleCustomerTypeChange"
          >
            <el-option label="对公" value="对公" />
            <el-option label="对私" value="对私" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级参数" prop="parent_param_id">
          <el-select 
            v-model="form.parent_param_id" 
            placeholder="请选择上级参数" 
            style="width: 100%"
            :disabled="!form.customer_type || dialogTitle === '修改参数'"
            @change="handleParentParamChange"
          >
            <el-option 
              v-for="item in parentParamOptions" 
              :key="item.paramId" 
              :label="item.paramName" 
              :value="item.paramId" />
          </el-select>
        </el-form-item>
        <el-form-item label="参数名称" prop="param_name">
          <div class="input-with-button">
            <el-select 
              v-model="form.param_name" 
              placeholder="请选择参数名称" 
              filterable
              style="width: calc(100% - 80px)"
              @focus="loadSecondParams"
              :disabled="dialogTitle === '修改参数'"
            >
              <el-option 
                v-for="item in secondParamOptions" 
                :key="item.paramCode" 
                :label="item.paramName" 
                :value="item.paramName" 
              />
            </el-select>
            <el-button 
              type="primary" 
              icon="Plus"
              @click="handleAddParamName"
              :disabled="!form.parent_param_id || form.parent_param_id === 'intermediate_services'"
            >
              新增
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="LPR加减值" prop="lpr_value">
          <div class="input-with-unit">
            <el-input-number
              v-model="form.lpr_value"
              :precision="0"
              :step="1"
              :min="-1000"
              :max="1000"
              style="width: calc(100% - 30px)"
              placeholder="请输入LPR加减值"
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
        <el-form-item label="排序号" prop="sort">
          <el-input 
            v-model="form.sort" 
            placeholder="请输入排序号"
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

    <!-- 参数名称新增弹窗 -->
    <el-dialog 
      title="新增参数名称" 
      v-model ="paramNameDialogVisible" 
      width="500px" 
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="paramNameForm" :rules="paramNameRules" ref="paramNameFormRef" label-width="100px">
        <el-form-item label="上级参数" prop="parentParamName">
          <el-input 
            v-model="paramNameForm.parentParamName" 
            disabled
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="公私类型" prop="customerType">
          <el-input 
            v-model="paramNameForm.customerType" 
            disabled
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="参数名称" prop="paramName">
          <el-input 
            v-model="paramNameForm.paramName" 
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
import { getParamDict } from '@/api/szhl/pricing/param/rateParamDict'
import { listRateParamDictSecond, getRateParamDictSecond, addRateParamDictSecond, updateRateParamDictSecond } from '@/api/szhl/pricing/param/rateParamDictSecond'
import { listRateSecondParam, addRateSecondParam } from '@/api/szhl/pricing/param/rateSecondParam'
import useUserStore from '@/store/modules/user'
import { useDict } from '@/utils/dict'

export default {
  name: 'SecondParam',
  props: {
    active: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    active: {
      handler(newVal) {
        if (newVal) {
          this.getParentParamMap()
          this.getList()
        }
      },
      immediate: true
    },
    param_first: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.getParentParamMap();
        }
      },
      immediate: true,
      deep: true
    }
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
      // 上级参数映射
      parentParamMap: {},
      param_first: useDict("param_first").param_first,
      parentMapReady: false,
      // 编辑根据公私类型映射上级参数
      parentParamMapEdit: {},
      // 表单对象
      form: {
        param_id: '',
        param_name: '',
        parent_param_id: '',
        customer_type: '',
        lpr_value: undefined,
        effect_date: '',
        original_effect_date: '',
        param_status: '1',
        create_time: '',
        create_user: '',
        sort: ''
      },
      // 表单校验规则
      rules: {
        param_name: [
          { required: true, message: '请选择参数名称', trigger: 'change' }
        ],
        parent_param_id: [
          { required: true, message: '请选择上级参数', trigger: 'change' }
        ],
        customer_type: [
          { required: true, message: '请选择公私类型', trigger: 'change' }
        ],
        lpr_value: [
          { required: true, message: '请输入LPR加减值', trigger: 'blur' },
          { type: 'number', message: 'LPR加减值必须为数字', trigger: 'blur' }
        ],
        effect_date: [
          { required: true, message: '请选择启用时间', trigger: 'change' }
        ],
        param_status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        parentParamId: '',
        paramName: ''
      },
      // 总条数
      total: 0,
      // 二级参数名称选项
      secondParamOptions: [],
      // 参数名称弹窗可见性
      paramNameDialogVisible: false,
      // 参数名称表单对象
      paramNameForm: {
        parentParamId: '',
        parentParamName: '',
        paramName: '',
        customerType: ''
      },
      // 参数名称表单校验规则
      paramNameRules: {
        paramName: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 添加上级参数选项数组
      parentParamOptions: []
    }
  },
  created() {
    this.getParentParamMap()
    this.getList()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.loading = true
      listRateParamDictSecond(this.queryParams).then(response => {
        if (response.code === 200) {
          this.tableData = response.rows.map(item => ({
            param_id: item.paramId,
            param_name: item.paramName,
            parent_param_id: item.parentParamId,
            customer_type: item.customerType,
            lpr_value: item.lprValue,
            effect_date: item.effectDate,
            param_status: item.paramStatus.toString(),
            create_time: item.createTime,
            create_user: item.createUser,
            sort: item.sort
          }))
          this.total = response.total
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    // 获取上级参数映射（用字典，不用后端接口）
    getParentParamMap() {
      this.parentParamMap = {};
      this.param_first.forEach(item => {
        this.parentParamMap[item.value] = item.label;
      });
      this.parentMapReady = true;
    },

    // 处理查询
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    // 重置查询
    resetQuery() {
      this.$refs.queryFormRef.resetFields()
      this.handleQuery()
    },

    // 处理上级参数变化
    handleParentParamChange(paramId) {
      if (paramId) {
        this.form.param_name = ''; // 清空参数名称
        this.loadSecondParams(); // 重新加载参数名称列表
      } else {
        this.form.param_name = '';
        this.secondParamOptions = [];
      }
    },

    // 处理新增
    handleAdd() {
      this.dialogTitle = '新增参数'
      this.form = {
        param_id: '',
        param_name: '',
        parent_param_id: '',
        customer_type: '', // 初始为空，让用户选择
        lpr_value: undefined,
        effect_date: '',
        original_effect_date: '',
        param_status: '1',
        create_time: '',
        create_user: useUserStore().name,
        sort: ''
      }
      this.parentParamOptions = [] // 清空上级参数选项
      this.secondParamOptions = [] // 清空参数名称选项
      this.dialogVisible = true
    },

    // 处理编辑
    handleEdit(row) {
      this.dialogTitle = '修改参数'
      const formattedDate = row.effect_date ? row.effect_date.split('T')[0] : row.effect_date;
      
      // 获取参数详情
      getRateParamDictSecond(row.param_id, formattedDate, row.customer_type).then(response => {
        if (response.code === 200) {
          const data = response.data
          
          // 设置客户类型对应的上级参数选项
          if (this.parentParamMap) {
            // 利用已有的parentParamMap数据生成parentParamOptions
            this.parentParamOptions = Object.entries(this.parentParamMap).map(([paramId, paramName]) => ({
              paramId,
              paramName
            }));
          }
          
          this.form = {
            param_id: data.paramId,
            param_name: data.paramName,
            parent_param_id: data.parentParamId,
            customer_type: data.customerType,
            lpr_value: data.lprValue,
            effect_date: data.effectDate,
            original_effect_date: data.effectDate,
            param_status: data.paramStatus.toString(),
            create_time: data.createTime,
            create_user: data.createUser,
            sort: data.sort
          }
          this.dialogVisible = true
        }
      });
    },

    // 根据类型获取上级参数
    getParentParamsByType(type) {
      this.parentParamOptions = [];
      this.parentParamMapEdit = {};
      // 返回Promise，以便在编辑时可以链式调用
      return new Promise((resolve, reject) => {
        getParamDict(type).then(response => {
          if (response.code === 200) {
            const data = response.data;
            if (data) {
              // 将返回的map转换为数组
              const options = Object.entries(data).map(([paramId, paramName]) => ({
                paramId,
                paramName
              }));
              this.parentParamOptions = options;
              // 存储参数映射关系
              this.parentParamMapEdit = data;
              resolve(data);
            } else {
              this.$message.warning('未找到对应的上级参数');
              resolve(null);
            }
          } else {
            this.$message.error(response.msg || '获取上级参数失败');
            reject(response.msg || '获取上级参数失败');
          }
        }).catch((error) => {
          this.$message.error('获取上级参数异常');
          reject(error);
        });
      });
    },

    // 提交表单
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          // 获取选中的参数名称对应的code
          const selectedParam = this.secondParamOptions.find(item => item.paramName === this.form.param_name)
          if (!selectedParam && this.dialogTitle === '新增参数') {
            this.$modal.msgError('请选择有效的参数名称')
            return
          }

          const formData = {
            paramId: this.dialogTitle === '新增参数' ? selectedParam.paramCode : this.form.param_id,
            paramName: this.form.param_name,
            parentParamId: this.form.parent_param_id,
            customerType: this.form.customer_type,
            lprValue: this.form.lpr_value,
            effectDate: this.form.effect_date,
            originalEffectDate: this.form.original_effect_date,
            paramStatus: this.form.param_status,
            createTime: this.form.create_time,
            createUser: this.form.create_user,
            sort: this.form.sort
          }

          if (this.dialogTitle === '修改参数') {
            updateRateParamDictSecond(formData).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.dialogVisible = false
              this.getList()
            })
          } else {
            addRateParamDictSecond(formData).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.dialogVisible = false
              this.getList()
            })
          }
        }
      })
    },

    // 处理每页显示数量变化
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },

    // 处理页码变化
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.getList()
    },

    // 加载二级参数名称列表
    loadSecondParams() {
      if (this.form.parent_param_id) {
        listRateSecondParam({ 
          parentParamId: this.form.parent_param_id,
          belong: 'class2param',
          customerType: this.form.customer_type
        }).then(response => {
          if (response.code === 200) {
            this.secondParamOptions = response.rows || []
          }
        })
      }
    },

    // 处理新增参数名称
    handleAddParamName() {
      if (!this.form.parent_param_id) {
        this.$modal.msgError('请先选择上级参数')
        return
      }

      if (this.form.parent_param_id === 'intermediate_services') {
        this.$modal.msgError('中间业务不能添加参数名称')
        return
      }

      this.$modal.confirm('是否确认在"' + this.parentParamMap[this.form.parent_param_id] + '"上添加参数名称？').then(() => {
        this.paramNameForm = {
          parentParamId: this.form.parent_param_id,
          parentParamName: this.parentParamMap[this.form.parent_param_id],
          paramName: '',
          customerType: this.form.customer_type
        }
        this.paramNameDialogVisible = true
      }).catch(() => {})
    },

    // 提交参数名称表单
    submitParamNameForm() {
      this.$refs.paramNameFormRef.validate(valid => {
        if (valid) {
          const data = {
            parentParamId: this.paramNameForm.parentParamId,
            paramName: this.paramNameForm.paramName,
            customerType: this.paramNameForm.customerType,
            createUser: useUserStore().name,
            belong: 'class2param'
          }
          addRateSecondParam(data).then(response => {
            this.$modal.msgSuccess('新增成功')
            this.paramNameDialogVisible = false
            // 重新加载参数名称列表
            this.loadSecondParams()
            // 设置当前选中的参数名称
            this.form.param_name = this.paramNameForm.paramName
          })
        }
      })
    },

    // 处理公私类型变化
    handleCustomerTypeChange(type) {
      // 清空上级参数和参数名称
      this.form.parent_param_id = '';
      this.form.param_name = '';
      this.secondParamOptions = [];
      
      if (type) {
        this.getParentParamsByType(type);
      } else {
        this.parentParamOptions = [];
      }
    },

    // 获取上级参数名称
    getParentParamName(paramId) {
      return this.parentParamMap[paramId] || paramId;
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