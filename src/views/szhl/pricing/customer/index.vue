<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户姓名" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户姓名"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户号" prop="customerNo">
        <el-input
          v-model="queryParams.customerNo"
          placeholder="请输入客户号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="default"   @click="handleQuery">查询</el-button>
        <!--<el-button type="primary" icon="el-icon-plus"   @click="handleAdd">新增</el-button>
         <el-button type="primary" icon="el-icon-search"   @click="handleQuery">搜索</el-button> -->
        <el-button icon="Refresh" size="default"   @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus" size="default"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="customerList"
      row-key="customerId"
      :border="false"
    >
      <el-table-column label="客户内码" align="center" prop="customerId" width="150" />
      <el-table-column label="姓名" align="center" prop="customerName" width="200" :show-overflow-tooltip="true"/>
      <el-table-column label="客户号" align="center" prop="customerNo" />
      <el-table-column label="机构号" align="center" prop="deptId" width="80" />
      <el-table-column label="客户经理" align="center" prop="customerManager" width="100" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="400">
        <template v-slot:default="scope">
          <el-button
            link type="primary"
            icon="edit"
            size="small"
            @click="handleUpdate(scope.row)"
            class="operation-btn"
          >客户修改</el-button>
          <el-button
            link type="primary"
            icon="money"
            size="small"
            @click="handleDeposit(scope.row)"
            class="operation-btn"
          >存款维护</el-button>
          <el-button
            link type="primary"
            icon="setting"
            size="small"
            @click="handleBenefit(scope.row)"
            class="operation-btn"
          >利率定价</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/修改客户弹窗 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="客户姓名" prop="customerName">
          <div class="search-input-container">
            <el-input 
              v-model="form.customerName" 
              placeholder="请输入客户姓名" 
              @input="handleCustomerNameInput"
            />
            <!-- 查询结果下拉框 -->
            <div v-if="showQueryResults && queryResults.length > 0" class="query-results">
              <ul class="result-list">
                <li 
                  v-for="(item, index) in queryResults" 
                  :key="index" 
                  class="result-item"
                  @click="selectCustomer(item)"
                >
                  <div class="customer-info">
                    <span class="customer-name">{{ item.cunaflnm }}</span>
                    <span class="customer-no">{{ item.cuidcsid }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="客户号" prop="customerNo">
          <el-input v-model="form.customerNo" placeholder="请输入客户号" maxlength="21" @input="handleCustomerNoInput"/>
        </el-form-item>
        <el-form-item label="客户内码" prop="customerId">
          <el-input v-model="form.customerId" placeholder="请输入客户内码" maxlength="11" :disabled="title === '修改客户'" />
        </el-form-item>
        <el-form-item label="机构号" prop="deptId">
          <el-input v-model="form.deptId" placeholder="请输入机构号" />
        </el-form-item>
        <el-form-item label="客户经理" prop="customerManager">
          <el-input v-model="form.customerManager" placeholder="请输入客户经理"/>
        </el-form-item>
        <el-form-item label="备注" prop="remarks" ref="remarksFormItem">
          <el-input v-model="form.remarks" type="textarea" placeholder="请输入备注" ref="remarksInput" />
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </el-dialog>

    <!-- 存款维护弹窗 -->
    <el-dialog title="存款维护" v-model="depositOpen" width="1100px" append-to-body>
      <!-- 存款人列表 -->
      <el-table v-loading="depositLoading" :data="depositorList">
        <el-table-column label="存款人客户号" prop="depositorNo" align="center" width="200"></el-table-column>
        <el-table-column label="存款人姓名" prop="depositorName" align="center" width="180"></el-table-column>
        <el-table-column label="关系类型" prop="relationType" align="center" width="120">
          <template v-slot:default="scope">
            {{ relationTypeText(scope.row.relationType) }}
          </template>
        </el-table-column>
        <el-table-column label="维护机构" prop="deptId" align="center" width="100"></el-table-column>
        <el-table-column label="维护人" prop="customerManager" align="center" width="100"></el-table-column>
        <el-table-column label="维护时间" prop="createDate" align="center" width="120"></el-table-column>
        <el-table-column label="操作" align="center">
          <template v-slot:default="scope">
            <el-button link type="primary" size="small" class="operation-btn" @click="deleteDepositor(scope.row)" >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 新增存款人表单 -->
      <el-form ref="depositForm" :model="depositForm" :rules="depositRules" label-width="100px" style="margin-top: 20px;">
        <el-row :gutter="24">
          <el-col :span="9">
            <el-form-item label="存款人姓名" prop="depositorName">
              <div class="search-input-container" style="width: 100%;">
                <el-input 
                  v-model="depositForm.depositorName" 
                  placeholder="请输入存款人姓名" 
                  @input="handleDepositorNameInput"
                  style="width: 100%;"
                />
                <!-- 查询结果下拉框 -->
                <div v-if="showDepositorQueryResults && depositorQueryResults.length > 0" class="query-results" style="width: 100%;">
                  <ul class="result-list">
                    <li 
                      v-for="(item, index) in depositorQueryResults" 
                      :key="index" 
                      class="result-item"
                      @click="selectDepositor(item)"
                    >
                      <div class="customer-info">
                        <span class="customer-name">{{ item.cunaflnm }}</span>
                        <span class="customer-no">{{ item.cuidcsid }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户号" prop="depositorNo">
              <el-input v-model="depositForm.depositorNo" placeholder="请输入客户号" style="width: 100%;" :disabled=true />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="关系类型" prop="relationType">
              <el-select v-model="depositForm.relationType" placeholder="请选择" style="width: 100%;">
                <el-option label="借款人" value="borrower" />
                <el-option label="配偶" value="spouse" />
                <el-option label="关联企业" value="relatedCompany" />
                <el-option label="法定代表人" value="legalRepresentative" />
                <el-option label="法定代表人配偶" value="legalRepresentativeSpouse" />
                <el-option label="占比50%（不含）以上股东" value="majorShareholder" />
                <el-option label="占比50%（不含）以上股东配偶" value="majorShareholderSpouse" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <div class="dialog-footer">
        <el-button type="primary" @click="submitDepositForm">新增</el-button>
        <el-button @click="cancelDeposit">取消</el-button>
      </div>
    </el-dialog>

    <!-- 利率定价弹窗 -->
    <el-dialog title="客户利率定价" v-model="benefitOpen" width="90%" append-to-body destroy-on-close>
      <RatePrice 
        :customerId="benefitForm.customerId"
        :customerName="benefitForm.customerName"
        :customerNo="benefitForm.customerNo"
        @close="cancelBenefit"
      />
    </el-dialog>
  </div>
</template>

<script>
import { listCustomer, getCustomer, delCustomer, addCustomer, updateCustomer, queryCustomerByName, listDepositor, addDepositor, delDepositor,queryCustomerByNo } from "@/api/szhl/pricing/customer/index";
import Pagination from "@/components/Pagination";
import useUserStore from "@/store/modules/user";
import RatePrice from "@/views/szhl/pricing/customer/ratePrice.vue";

export default {
  name: "Customer",
  components: { Pagination, RatePrice },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 客户表格数据
      customerList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示存款维护弹窗
      depositOpen: false,
      // 是否显示利率定价弹窗
      benefitOpen: false,
      // 是否使用弹窗方式显示利率定价 (true为弹窗，false为独立页面)
      useDialogForRatePrice: true,
      // 查询结果
      queryResults: [],
      // 是否显示查询结果
      showQueryResults: false,
      // 是否禁止触发查询（用于选择客户后阻止查询）
      preventQuery: false,
      // 查询防抖定时器
      debounceTimer: null,
      // 防抖延迟时间(毫秒)
      debounceDelay: 1000,
      // 表单参数
      form: {
        customerId: undefined,
        customerNo: undefined,
        customerName: undefined,
        deptId: undefined,
        customerManager: undefined,
        remarks: undefined
      },
      // 存款维护加载状态
      depositLoading: false,
      
      // 存款人列表
      depositorList: [],
      
      // 存款维护表单
      depositForm: {
        depositorName: undefined,
        depositorNo: undefined,
        relationType: undefined,
        customerManager: undefined,
        createDate: undefined

      },
      
      // 存款维护表单校验
      depositRules: {
        depositorName: [
          { required: true, message: "存款人姓名不能为空", trigger: "blur" }
        ],
        depositorNo: [
          { required: true, message: "客户号不能为空", trigger: "blur" }
        ],
        relationType: [
          { required: true, message: "关系类型不能为空", trigger: "change" }
        ]
      },
      // 利率定价表单
      benefitForm: {
        customerId: undefined,
        customerName: undefined,
        customerNo: undefined
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerName: undefined,
        customerNo: undefined
      },
      // 表单校验
      rules: {
        customerName: [
          { required: true, message: "客户姓名不能为空", trigger: "blur" }
        ],
        customerNo: [
          { required: true, message: "客户号不能为空", trigger: "blur" }
        ],
        customerId: [
          { required: true, message: "客户内码不能为空", trigger: "blur" }
        ],
        deptId: [
          { required: true, message: "机构号不能为空", trigger: "blur" }
        ],
        customerManager: [
          { required: true, message: "客户经理不能为空", trigger: "blur" }
        ]
      },
      // 利率定价表单校验
      benefitRules: {
        productType: [
          { required: true, message: "产品类型不能为空", trigger: "change" }
        ],
        depositTerm: [
          { required: true, message: "存期不能为空", trigger: "change" }
        ],
        floatRatio: [
          { required: true, message: "上浮比例不能为空", trigger: "blur" },
          { pattern: /^-?\d+(\.\d+)?$/, message: "请输入正确的数字", trigger: "blur" }
        ],
        effectiveDate: [
          { required: true, message: "生效日期不能为空", trigger: "change" }
        ]
      },
      // 当前登录用户的部门ID
      userDeptId: null,
      userStore: useUserStore(),
      // 新增的查询结果
      depositorQueryResults: [],
      // 新增的查询结果显示标志
      showDepositorQueryResults: false
    };
  },
  created() {
    // 获取用户部门信息
    
    this.getList();
    
    // 处理通过路由直接访问存款维护或利率定价的情况
    const route = this.$route;
    const customerId = route.params.customerId;
    
    if (route.name === 'CustomerDeposit' && customerId) {
      // 如果是存款维护页面
      this.resetDepositForm();
      this.depositForm.customerId = customerId;
      this.depositOpen = true;
    } else if (route.name === 'CustomerBenefit' && customerId) {
      // 如果是利率定价页面
      this.getCustomerById(customerId).then(customer => {
        this.resetBenefitForm();
        this.benefitForm.customerId = customerId;
        this.benefitForm.customerName = customer.customerName;
        this.benefitOpen = true;
      });
    }
  },
  watch: {
    // 监听customerName值的变化
    'form.customerName': function(newVal, oldVal) {
      if (newVal && newVal !== oldVal && this.title === '添加客户' && !this.preventQuery) {
        this.handleCustomerNameInput(newVal);
      }
    }
  },
  methods: {
    // 处理客户号输入事件
    handleCustomerNoInput(value) {
      // 当客户号变化时，清空客户内码
      if (this.title === '添加客户') {
        this.form.customerId = '';
      }
    },
    // 处理客户姓名输入事件
    handleCustomerNameInput(value) {
      // 如果设置了阻止查询或者不是添加客户弹窗，直接返回
      if (this.preventQuery || this.title !== '添加客户') {
        return;
      }
      
      // 每次输入都重置查询状态
      if (this.form.customerNo || this.form.customerId) {
        // 如果已经选择了客户，但用户又开始修改姓名，就清空之前选择的信息
        // 这样用户可以搜索并选择新的客户
        this.form.customerNo = '';
        this.form.customerId = '';
      }
      
      // 检查是否输入了至少2个汉字
      const chineseChars = value.match(/[\u4e00-\u9fa5]/g);
      
      if (chineseChars && chineseChars.length >= 2) {
        // 清除之前的定时器
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        
        // 设置新的定时器，延迟执行查询
        this.debounceTimer = setTimeout(() => {
          this.queryCustomerByName(value);
          this.debounceTimer = null;
        }, this.debounceDelay);
      } else {
        // 不满足条件时，清空查询结果
        this.queryResults = [];
        this.showQueryResults = false;
        
        // 清除可能存在的定时器
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = null;
        }
      }
    },
    // 根据客户姓名查询客户信息
    queryCustomerByName(customerName, isDepositor = false) {
      queryCustomerByName(customerName).then(response => {
        // 处理查询结果
        if (response.data && response.data.length > 0) {
          if (isDepositor) {
            this.depositorQueryResults = response.data;
            this.showDepositorQueryResults = true;
          } else {
            this.queryResults = response.data;
            this.showQueryResults = true;
          }
        } else {
          if (isDepositor) {
            this.depositorQueryResults = [];
            this.showDepositorQueryResults = false;
          } else {
            this.queryResults = [];
            this.showQueryResults = false;
          }
        }
      }).catch(error => {
        console.error("查询客户信息失败:", error);
        this.$modal.msgError("查询客户信息失败");
        if (isDepositor) {
          this.depositorQueryResults = [];
          this.showDepositorQueryResults = false;
        } else {
          this.queryResults = [];
          this.showQueryResults = false;
        }
      });
    },
    // 选择客户
    selectCustomer(customer) {
      
      // 设置防止查询的标志
      this.preventQuery = true;
      
      // 只填充指定的字段
      this.form.customerName = customer.cunaflnm;
      this.form.customerNo = customer.cuidcsid;
      this.form.customerId = customer.cinocsno;
      this.showQueryResults = false;
      this.queryResults = [];
      
      // 自动聚焦到备注输入框
      this.$nextTick(() => {
        if (this.$refs.remarksInput) {
          this.$refs.remarksInput.focus();
        }
        
        // 延迟一段时间后恢复查询功能
        setTimeout(() => {
          this.preventQuery = false;
        }, 500);
      });
    },
    /** 查询客户列表 */
    getList() {
      this.loading = true;
      listCustomer(this.queryParams).then(response => {
        // 处理可能的字段名不匹配
        if (response.rows && response.rows.length) {
          response.rows.forEach(item => {
            // 确保字段名一致
            if (item.customerManager === undefined && item.manager !== undefined) {
              item.customerManager = item.manager;
            }
            if (item.remarks === undefined && item.remark !== undefined) {
              item.remarks = item.remark;
            }
          });
        }
        this.customerList = response.rows;
        this.total = response.total;
        this.loading = false;
      }).catch(error => {
        console.error("获取客户列表失败:", error);
        this.loading = false;
        this.$modal.msgError("获取客户列表失败");
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    cancelDeposit() {
      this.depositOpen = false;
    },
    // 表单重置
    reset() {
      this.form = {
        customerId: null,
        customerNo: null,
        customerName: null,
        deptId: null,
        customerManager: null,
        remarks: null
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
      if (this.userStore) {
        // 如果userInfo中直接有部门信息，使用它
        this.form.deptId = this.userStore.deptId;
        this.form.customerManager = this.userStore.name;
      }
      
      this.open = true;
      this.title = "添加客户";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const customerId = row.customerId || this.ids;
      getCustomer(customerId).then(response => {
        this.form = response.data;
        // 确保字段名匹配
        if (this.form) {
          // 处理可能的字段名不匹配问题
          if (this.form.customerManager === undefined && this.form.manager !== undefined) {
            this.form.customerManager = this.form.manager;
          }
          if (this.form.remarks === undefined && this.form.remark !== undefined) {
            this.form.remarks = this.form.remark;
          }
        }
        this.open = true;
        this.title = "修改客户";
      }).catch(error => {
        console.error("获取客户详情失败:", error);
        this.$modal.msgError("获取客户详情失败");
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(async valid => {
        if (valid) {
          // 创建提交的数据对象，确保字段名正确
          const submitData = {
            customerId: this.form.customerId,
            customerNo: this.form.customerNo,
            customerName: this.form.customerName,
            deptId: this.form.deptId,
            customerManager: this.form.customerManager,
            remarks: this.form.remarks
          };

          if (this.title === "修改客户") {
            updateCustomer(submitData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }).catch(error => {
              console.error("修改客户失败:", error);
              this.$modal.msgError("修改客户失败");
            });
          } else {
            try {
              // 等待查询完成
              const response = await queryCustomerByNo(this.form.customerNo);
              // 处理查询结果
              if (response.data && response.data.length > 0) {
                if(response.data[0].cinocsno==this.form.customerId&&response.data[0].cunaflnm==this.form.customerName.trim()){
                  //表单内容与客户号对应内容一致则添加
                  await addCustomer(submitData).then(response => {
                  this.$modal.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                  }).catch(error => {
                    console.error("新增客户失败:", error);
                    this.$modal.msgError("新增客户失败");
                  });
                } else {
                  this.$modal.msgError("该客户号对应户名和内码与表单内容不符，请检查！");
                  return; // 中断执行
                }
              } else {
                // 获取客户号前三位，判断客户类型
              const customerNoPrefix = this.form.customerNo.substring(0, 3);
              
              // 根据前三位判断客户类型并进行相应校验
              if (customerNoPrefix === "101") {
                // 身份证号码校验
                if (!this.validateIdCard(this.form.customerNo.substring(3))) {
                  this.$modal.msgError("身份证号码格式不正确，请检查！");
                  return;
                }
              } else {
                //else if (customerNoPrefix === "202")
                // 营业执照号码校验
                if (!this.validateBusinessLicense(this.form.customerNo.substring(3))) {
                  this.$modal.msgError("营业执照号码格式不正确，请检查！");
                  return;
                }
              } 
              /* 营业执照情况比较多，不为101开头的客户号暂时统一都按营业执照规则进行校验 zyf 2025-07-25
              else {
                // 其他情况，提示客户号异常
                this.$modal.msgError("客户号格式异常!");
                return;
              } */
                this.$modal.confirm('新客户提醒：该客户号未能找到相应客户信息，请再次检查客户号是否正确？').then(() => {
                  addCustomer(submitData).then(response => {
                  this.$modal.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                  }).catch(error => {
                    console.error("新增客户失败:", error);
                    this.$modal.msgError("新增客户失败");
                  });
                });
              }
            } catch (error) {
              this.$modal.msgError("获取新增客户信息失败");
              return; // 中断执行
            }
            
          }
        }
      });
    },
    /**
     * 校验身份证号码是否符合规则
     * @param {string} idCard 待校验的身份证号码
     * @returns {boolean} 校验结果 true:合法 false:不合法
     */
    validateIdCard(idCard) {
      // 如果为空，返回false
      if (!idCard) {
        return false;
      }
      
      // 转大写，并去除空格
      idCard = idCard.toUpperCase().trim();
      
      // 检查长度是否为18位
      if (idCard.length !== 18) {
        return false;
      }
      
      // 基础格式校验：前17位为数字，最后一位可以是数字或X
      const basicPattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9X]$/;
      if (!basicPattern.test(idCard)) {
        return false;
      }
      
      // 省份代码校验
      const provinceCode = parseInt(idCard.substring(0, 2));
      const validProvinceCodes = {
        11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 
        21: "辽宁", 22: "吉林", 23: "黑龙江", 
        31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 
        41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 
        50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 
        61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 
        71: "台湾", 81: "香港", 82: "澳门"
      };
      
      if (!validProvinceCodes[provinceCode]) {
        return false;
      }
      
      // 日期校验
      const year = parseInt(idCard.substring(6, 10));
      const month = parseInt(idCard.substring(10, 12));
      const day = parseInt(idCard.substring(12, 14));
      const birthDate = new Date(`${year}-${month}-${day}`);
      
      // 检查日期是否有效
      if (isNaN(birthDate.getTime())) {
        return false;
      }
      
      // 确保日期解析正确（如月份对应）
      if (birthDate.getFullYear() !== year || 
          birthDate.getMonth() + 1 !== month || 
          birthDate.getDate() !== day) {
        return false;
      }
      
      // 确保不是未来日期
      if (birthDate > new Date()) {
        return false;
      }
      
      // 校验码校验
      // 加权因子
      const weightingFactors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      // 校验码对应值
      const validationCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
      
      let sum = 0;
      for (let i = 0; i < 17; i++) {
        sum += parseInt(idCard.charAt(i)) * weightingFactors[i];
      }
      
      const mod = sum % 11;
      const validationCode = validationCodes[mod];
      
      return validationCode === idCard.charAt(17);
    },
    
    /**
     * 校验营业执照号码是否符合规则
     * @param {string} license 待校验的营业执照号码
     * @returns {boolean} 校验结果 true:合法 false:不合法
     */
    validateBusinessLicense(license) {
      // 如果为空，返回false
      if (!license) {
        return false;
      }
      
      // 去除空格
      license = license.trim();
      
      // 统一社会信用代码（18位）
      if (license.length === 18) {
        // 统一社会信用代码规则：18位，第1位为登记管理部门代码，第2位为机构类别代码，第3-8位为登记管理机关行政区划码，
        // 第9-17位为组织机构代码，第18位为校验码
        const pattern = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
        return pattern.test(license);
      } 
      // 工商注册号（15位）
      else if (license.length === 15) {
        // 15位营业执照号码规则：前6位为行政区划代码，后9位为序列号
        const pattern = /^\d{15}$/;
        return pattern.test(license);
      }
      
      return false;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const customerIds = row.customerId || this.ids;
      this.$modal.confirm('是否确认删除客户编号为"' + customerIds + '"的数据项？').then(function() {
        return delCustomer(customerIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 关系类型文本 */
    relationTypeText(type) {
      const typeMap = {
        'borrower': '借款人',
        'spouse': '配偶',
        'relatedCompany': '关联企业',
        'legalRepresentative': '法定代表人',
        'legalRepresentativeSpouse': '法定代表人配偶',
        'majorShareholder': '占比50%（不含）以上股东',
        'majorShareholderSpouse': '占比50%（不含）以上股东配偶'
      };
      return typeMap[type] || type;
    },
    /** 重置存款维护表单 */
    resetDepositForm() {
      this.depositForm = {
        borrowerId: null,
        depositorId: null,
        depositorName: null,
        depositorNo: null,
        relationType: null
      };
    },
    /** 存款维护按钮操作 */
    handleDeposit(row) {
      this.resetDepositForm();
      this.depositForm.borrowerId = row.customerId;
      this.depositOpen = true;
      
      // 先获取存款人列表，然后根据结果决定如何设置表单
      this.getDepositorList(row.customerId).then(() => {
        // 检查存款人列表中是否已有借款人自身作为存款人
        const selfAsBorrower = this.depositorList.find(item => 
          item.relationType === 'borrower' && item.depositorNo === row.customerNo);
        
        if (selfAsBorrower) {
          // 如果已经有借款人自身的记录，则不自动填充表单
        } else {
          // 如果没有借款人自身的记录，则自动填充为借款人信息
          this.depositForm.depositorName = row.customerName;
          this.depositForm.depositorNo = row.customerNo;
          this.depositForm.relationType = 'borrower';
        }
      });
    },
    /** 获取存款人列表 */
    getDepositorList(customerId) {
      this.depositLoading = true;
      // 调用后端API获取存款人列表，并返回Promise对象
      return new Promise((resolve, reject) => {
        listDepositor(customerId).then(response => {
          this.depositorList = response.rows || [];
          this.depositLoading = false;
          resolve(this.depositorList);
        }).catch(error => {
          console.error("获取存款人列表失败:", error);
          this.depositorList = [];
          this.depositLoading = false;
          this.$modal.msgError("获取存款人列表失败");
          reject(error);
        });
      });
    },
    /** 删除存款人 */
    deleteDepositor(row) {
      this.$modal.confirm('确认删除该存款人吗？(同一存款人一天只允许删除一次)').then(() => {
        // 保存当前客户ID，以便在重置表单后依然能够重新加载列表
        const customerId = this.depositForm.customerId || this.depositForm.borrowerId;
        // 存款人ID应该是row中的depositorId
        delDepositor(row.depositorId,row.borrowerId).then(response => {
          this.$modal.msgSuccess("删除成功");
          
          // 重新加载存款人列表
          this.getDepositorList(customerId).then(() => {
            // 获取当前客户信息用于后续设置表单
            const currentCustomer = this.customerList.find(item => item.customerId === customerId);
            
            if (currentCustomer && this.depositorList.length === 0) {
              // 如果depositorList为空，则可以设置为借款人信息
              this.depositForm.depositorName = currentCustomer.customerName;
              this.depositForm.depositorNo = currentCustomer.customerNo;
              this.depositForm.relationType = 'borrower';
            } else {
              // 如果删除后还有其他存款人记录，则检查是否存在借款人记录
              const hasBorrower = this.depositorList.some(item => item.relationType === 'borrower');
              
              if (!hasBorrower && currentCustomer) {
                // 如果无借款人记录，则设置为借款人信息
                this.depositForm.depositorName = currentCustomer.customerName;
                this.depositForm.depositorNo = currentCustomer.customerNo;
                this.depositForm.relationType = 'borrower';
              }else{
                // 如果已有借款人记录，则清空表单，但保留客户ID
                this.resetDepositForm();
                this.depositForm.borrowerId = customerId;
              }
            }
          });
        }).catch(error => {
          console.error("删除存款人失败:", error);
          this.$modal.msgError("删除存款人失败");
        });
      }).catch(() => {});
    },
    /** 提交存款维护表单 */
    submitDepositForm() {
      this.$refs.depositForm.validate(async valid => {
        if (valid) {
          // 准备提交数据对象
          const submitData = {
            borrowerId: this.depositForm.borrowerId,
            depositorName: this.depositForm.depositorName,
            depositorNo: this.depositForm.depositorNo,
            relationType: this.depositForm.relationType,
            depositorId: null,
            // 添加当前用户和部门信息
            deptId: this.userStore.deptId,
            customerManager: this.userStore.name
          };
          
          if(submitData.relationType=='borrower'){
            // 检查是否已存在借款人记录
            const existingBorrower = this.depositorList.find(item => item.relationType === 'borrower');
            if (existingBorrower) {
              this.$modal.msgWarning("已存在借款人记录，不能重复添加");
              return; // 中断执行
            }
            submitData.depositorId = this.depositForm.borrowerId;
          } else {
            try {
              // 等待查询完成
              const response = await queryCustomerByNo(this.depositForm.depositorNo);
              // 处理查询结果
              if (response.data && response.data.length > 0) {
                submitData.depositorId = response.data[0].cinocsno;
              } else {
                this.$modal.msgError("获取存款人内码失败");
                return; // 中断执行
              }
            } catch (error) {
              this.$modal.msgError("获取存款人内码失败");
              return; // 中断执行
            }
          }
          
          try {
            // 调用后端API添加存款人
            const response = await addDepositor(submitData);
            // 添加成功
            this.$modal.msgSuccess("添加存款人成功");
            
            // 保存当前客户ID，以便在重置表单后依然能够重新加载列表
            const currentCustomerId = this.depositForm.borrowerId;
            
            // 重置表单以便添加下一个存款人
            this.resetDepositForm();
            
            // 保留当前客户ID以便可以继续为同一客户添加其他存款人
            this.depositForm.borrowerId = currentCustomerId;
            
            // 重新加载存款人列表以显示新添加的数据
            this.getDepositorList(currentCustomerId);
          } catch (error) {
            // 添加失败，显示错误信息
            console.error("添加存款人失败:", error);
            //this.$modal.msgError(error.message || "添加存款人失败");因全局已提示异常，这里不再提示
          }
        } else {
          // 表单验证未通过
          console.warn('表单验证未通过');
          return false;
        }
      });
    },
    /** 利率定价按钮操作 */
    handleBenefit(row) {
      // if(!this.isSameDept(row.deptId)){
      //   return;
      // }
      // 直接跳转到独立页面，添加时间戳确保每次都是新页面
      this.$router.push({
        name: 'RatePrice',
        query: {
          customerId: row.customerId,
          customerName: row.customerName,
          customerNo: row.customerNo,
          _t: new Date().getTime() // 添加时间戳参数
        }
      });
    },
    /** 重置利率定价表单 */
    resetBenefitForm() {
      this.benefitForm = {
        customerId: undefined,
        customerName: undefined,
        customerNo: undefined
      };
    },
    /** 取消利率定价 */
    cancelBenefit() {
      this.benefitOpen = false;
      this.resetBenefitForm();
    },
    /** 根据ID获取客户信息 */
    getCustomerById(customerId) {
      return new Promise((resolve, reject) => {
        getCustomer(customerId).then(response => {
          resolve(response.data || {});
        }).catch(error => {
          console.error("获取客户详情失败:", error);
          this.$modal.msgError("获取客户详情失败");
          reject(error);
        });
      });
    },
    /** 判断客户的部门ID与当前登录用户的部门ID是否一致 */
    isSameDept(deptId) {
      this.userDeptId = this.userStore.deptId;
      // 如果未获取到用户部门ID或客户部门ID，默认不可编辑
      if (!this.userDeptId || !this.userStore) {
        return false;
      }
      
      return String(this.userDeptId) === String(deptId);
    },
    /** 取消存款维护 */
    cancelDeposit() {
      this.depositOpen = false;
      // 重置表单
      this.resetDepositForm();
    },
    // 处理存款人姓名输入事件
    handleDepositorNameInput(value) {
      // 如果设置了阻止查询，直接返回
      if (this.preventQuery) {
        return;
      }
      
      // 每次输入都重置查询状态
      if (this.depositForm.depositorNo || this.depositForm.depositorId) {
        // 如果已经选择了客户，但用户又开始修改姓名，就清空之前选择的信息
        // 这样用户可以搜索并选择新的客户
        this.depositForm.depositorNo = '';
        this.depositForm.depositorId = '';
      }
      
      // 检查是否输入了至少2个汉字
      const chineseChars = value.match(/[\u4e00-\u9fa5]/g);
      
      if (chineseChars && chineseChars.length >= 2) {
        // 清除之前的定时器
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        
        // 设置新的定时器，延迟执行查询
        this.debounceTimer = setTimeout(() => {
          this.queryCustomerByName(value, true); // 传递true表示查询存款人
          this.debounceTimer = null;
        }, this.debounceDelay);
      } else {
        // 不满足条件时，清空查询结果
        this.depositorQueryResults = [];
        this.showDepositorQueryResults = false;
        
        // 清除可能存在的定时器
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = null;
        }
      }
    },
    // 新增的查询结果处理函数
    selectDepositor(customer) {
      // 设置防止查询的标志
      this.preventQuery = true;
      
      // 只填充指定的字段
      this.depositForm.depositorName = customer.cunaflnm;
      this.depositForm.depositorNo = customer.cuidcsid;
      this.depositForm.depositorId = customer.cinocsno;
      this.showDepositorQueryResults = false;
      this.depositorQueryResults = [];
      
      // 下一个循环自动聚焦到关系类型下拉框
      this.$nextTick(() => {
        // 查找关系类型下拉框并尝试聚焦
        const relationTypeEl = this.$el.querySelector('.el-select[placeholder="请选择关系类型"]');
        if (relationTypeEl) {
          relationTypeEl.focus();
        }
        
        // 延迟一段时间后恢复查询功能
        setTimeout(() => {
          this.preventQuery = false;
        }, 500);
      });
    },
  },
  beforeDestroy() {
    // 确保组件销毁时清除定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  },
};
</script>

<style scoped>
.el-table .warning-row {
  background: oldlace;
}
.el-table .success-row {
  background: #f0f9eb;
}

/* 设置表格内容字体为黑体 */
:deep(.el-table__cell) {
  font-family: "黑体", "SimHei", "Heiti SC", "Heiti TC", sans-serif;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.query-results {
  position: absolute;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 999;
  top: 100%;
  left: 0;
  margin-top: 2px;
}

.result-title {
  padding: 8px 10px;
  margin: 0;
  font-size: 14px;
  color: #909399;
  border-bottom: 1px solid #ebeef5;
}

.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f2f2f2;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background-color: #f5f7fa;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.customer-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.customer-no {
  color: #909399;
  font-size: 13px;
  white-space: nowrap;
}

.search-input-container {
  position: relative;
  width: 100%;
}

/* 存款维护表单中的特殊样式 */
.el-dialog[title="存款维护"] .search-input-container .query-results {
  width: 100%;
}

.operation-btn {
  font-size: 12px;
  padding: 0px 8px;
  margin-right: 5px;
}

/* 禁用状态的按钮样式 */
.operation-btn.is-disabled {
  color: #c0c4cc !important;
  cursor: not-allowed;
  text-decoration: none !important;
}
</style> 