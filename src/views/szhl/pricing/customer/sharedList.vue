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
      <el-form-item label="客户经理" prop="userName">
        <el-select
          v-model="queryParams.userName"
          placeholder="请选择客户经理"
          clearable
          filterable
          style="width: 200px"
        >
          <el-option
            v-for="option in managerOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="default" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" size="default" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="pricingList"
      row-key="id"
      :border="false"
      style="font-family: '黑体', 'SimHei', 'Heiti SC', 'Heiti TC', sans-serif;"
    >
      <el-table-column label="客户名称" align="center" prop="customerName" :show-overflow-tooltip="true"/>
      <el-table-column label="客户号" align="center" prop="customerNo" />
      <el-table-column label="定价日期" align="center" prop="priceDate" />
      <el-table-column label="申贷金额(万元)" align="center" prop="applyAmount" />
      <el-table-column label="定价利率(%)" align="center" prop="finalRate" />
      <el-table-column label="分成加点(BP)" align="center" prop="protocolBp" />
      <el-table-column label="绑定状态" align="center" width="100">
        <template v-slot:default="scope">
          <el-tag :type="scope.row.bindStatus === '1' ? 'success' : 'info'" size="small">
            {{ scope.row.bindStatus === '1' ? '已绑定' : '未绑定' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户经理" align="center" prop="userName" />
      <el-table-column label="操作" align="center" width="200">
        <template v-slot:default="scope">
          <el-button
            v-if="scope.row.bindStatus !== '1'"
            link
            :type="isCurrentUser(scope.row) ? 'primary' : 'info'"
            icon="Link"
            size="small"
            @click="handleBindContract(scope.row)"
            class="operation-btn"
            :disabled="!isCurrentUser(scope.row)"
            :title="!isCurrentUser(scope.row) ? '只有本人可以操作' : ''"
          >绑定合同</el-button>
          <el-button
            v-if="scope.row.bindStatus === '1'"
            link type="success"
            icon="View"
            size="small"
            @click="handleViewBindContract(scope.row)"
            class="operation-btn"
          >查看绑定</el-button>
          <el-button
            v-if="scope.row.bindStatus === '1' && checkPermi(['szhl:contractRelation:unbind'])"
            link type="danger"
            icon="Unlink"
            size="small"
            @click="handleUnbindContract(scope.row)"
            class="operation-btn"
            style="margin-left: 10px;"
          >解除绑定</el-button>
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

    <!-- 合同绑定弹窗 -->
    <contract-bind-dialog
      ref="contractBindDialog"
      v-model:visible="bindDialogVisible"
      :pricing-info="currentPricingInfo"
      @bind-request="handleBindRequest"
    />
    
    <!-- 绑定详情查看弹窗 -->
    <el-dialog
      title="查看绑定详情"
      v-model="bindDetailVisible"
      width="1000px"
      :before-close="() => bindDetailVisible = false"
      append-to-body
    >
      <div class="bind-detail-content">
        <!-- 定价信息卡片 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="header-title">📈 定价信息</span>
            </div>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="定价编号">
              <el-tag type="primary">{{ currentBindInfo.pricingNo }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="客户名称">{{ currentBindInfo.pricingInfo?.customerName }}</el-descriptions-item>
            <el-descriptions-item label="客户号">{{ currentBindInfo.pricingInfo?.customerNo }}</el-descriptions-item>
            <el-descriptions-item label="定价利率">{{ currentBindInfo.pricingInfo?.finalRate }}%</el-descriptions-item>
            <el-descriptions-item label="分成加点">{{ currentBindInfo.pricingInfo?.protocolBp }}BP</el-descriptions-item>
            <el-descriptions-item label="定价日期">{{ currentBindInfo.pricingInfo?.priceDate }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 绑定合同信息 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="header-title">📄 绑定合同 ({{ currentBindInfo.contracts?.length || 0 }}份)</span>
            </div>
          </template>
          <el-table 
            :data="currentBindInfo.contracts" 
            border 
            style="width: 100%"
            :max-height="300"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="contractNo" label="合同编号" min-width="120" align="center">
              <template #default="scope">
                <el-tag type="success">{{ scope.row.contractNo }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="bindTime" label="绑定时间" min-width="120" align="center">
              <template #default="scope">
                {{ formatDateTime(scope.row.bindTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人" min-width="100" align="center" />
            <el-table-column prop="guaranteeType" label="担保方式" min-width="100" align="center">
              <template #default="scope">
                <el-tag :type="getGuaranteeTypeTag(scope.row.guaranteeType)">{{ scope.row.guaranteeType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="isNew" label="存量/增量" width="100" align="center">
              <template #default="scope">
                <el-badge 
                  :value="scope.row.isNew === 1 ? '增量' : '存量'" 
                  :type="scope.row.isNew === 1 ? 'primary' : 'info'"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        
        <!-- 责任用户分成信息 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="header-title">👥 责任用户分成</span>
            </div>
          </template>
          <div v-if="getResponsibilityUsers().length > 0">
            <el-row :gutter="20">
              <el-col 
                v-for="(user, index) in getResponsibilityUsers()" 
                :key="index" 
                :span="6"
              >
                <el-card class="responsibility-card" :class="{ 'primary-user': index === 0 }">
                  <div class="user-avatar">
                    <el-avatar :size="40">
                      {{ user.userName?.charAt(0) || 'U' }}
                    </el-avatar>
                  </div>
                  <div class="user-info">
                    <div class="user-name">
                      {{ user.userName }}
                      <el-tag v-if="index === 0" type="warning" size="small">主责</el-tag>
                    </div>
                    <div class="user-ratio">
                      <el-progress 
                        :percentage="user.ratio" 
                        :color="index === 0 ? '#409eff' : '#67c23a'"
                        :show-text="false"
                      />
                      <span class="ratio-text">{{ user.ratio }}%</span>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            
            <!-- 分成统计 -->
            <div class="responsibility-summary">
              <el-divider>分成统计</el-divider>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-statistic title="总责任人数" :value="getResponsibilityUsers().length" suffix="人" />
                </el-col>
                <!-- <el-col :span="8">
                  <el-statistic title="分成比例总和" :value="getTotalRatio()" suffix="%" />
                </el-col> -->
                <el-col :span="8">
                  <el-statistic 
                    title="主责人比例" 
                    :value="getResponsibilityUsers()[0]?.ratio || 0" 
                    suffix="%" 
                  />
                </el-col>
              </el-row>
            </div>
          </div>
          <el-empty v-else description="暂无责任用户信息" :image-size="80" />
        </el-card>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="bindDetailVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { listSharedPricing } from "@/api/szhl/pricing/customer/ratePrice";
import { bindContracts, unbindContracts, getContractsByPricingNo } from "@/api/szhl/pricing/contract/contract";
import Pagination from "@/components/Pagination";
import ContractBindDialog from "./components/ContractBindDialog.vue";
import { checkPermi } from "@/utils/permission";
import useUserStore from '@/store/modules/user'
import { listUser } from '@/api/system/user'

const userStore = useUserStore()


export default {
  name: "SharedList",
  components: { 
    Pagination,
    ContractBindDialog 
  },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 定价表格数据
      pricingList: [],
      // 客户经理选项
      managerOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerName: undefined,
        customerNo: undefined,
        userName: undefined,
      },
      // 绑定弹窗控制
      bindDialogVisible: false,
      // 当前选中的定价信息
      currentPricingInfo: {},
      // 绑定详情弹窗控制
      bindDetailVisible: false,
      // 当前查看的绑定信息
      currentBindInfo: {}
    };
  },
  created() {
    this.getList();
    this.getManagerList();
  },
  methods: {
    /** 权限检查 */
    checkPermi,
    
    /** 判断是否是当前用户 */
    isCurrentUser(row) {
      if(userStore.name === 'admin'){
        return true
      }
      return row.createBy === userStore.name;
    },
    
    /** 获取客户经理列表 */
    getManagerList() {
      listUser({ pageSize: 400 }).then(response => {
        this.managerOptions = response.rows.map(user => ({
          label: `${user.nickName}（${user.userName}）`, // 显示姓名和工号
          value: user.userName
        }));
      }).catch(error => {
        console.error('获取客户经理列表失败:', error);
        this.$modal.msgError('获取客户经理列表失败');
      });
    },
    
    /** 查询列表 */
    getList() {
      this.loading = true;
      listSharedPricing(this.queryParams).then(response => {
        this.pricingList = response.rows;
        this.total = response.total;
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
      this.resetForm("queryForm");
      this.queryParams.userName = undefined; // 确保客户经理也被重置
      this.handleQuery();
    },
     /** 重置表单 */
    resetForm(formName) {
      if (this.$refs[formName]) {
        this.$refs[formName].resetFields();
      }
    },
    /** 绑定合同 */
    handleBindContract(row) {
      if(row.createBy !== userStore.name && userStore.name !== 'admin'){
        return;
      }
      // 设置当前定价信息
      this.currentPricingInfo = {
        ...row,
        pricingNo: row.id, // 如果没有定价编号，使用ID生成
      };
      // 显示绑定弹窗
      this.bindDialogVisible = true;
    },
    
    /** 处理绑定请求 */
    async handleBindRequest(bindData, contractNo) {
      try {
        // 调用后端接口保存绑定关系
        const response = await bindContracts(bindData);
        
        if (response.code === 200) {
          // 调用子组件的成功回调
          this.$refs.contractBindDialog.onBindSuccess(contractNo);
          // 刷新当前页面数据
          this.getList();
        } else {
          // 调用子组件的失败回调
          this.$refs.contractBindDialog.onBindError(response.msg || "合同绑定失败");
        }
      } catch (error) {
          console.error("保存绑定关系失败:", error);
          // 调用子组件的失败回调
          // this.$refs.contractBindDialog.onBindError("保存绑定关系失败");
      }
    },
    
    /** 解除绑定合同 */
    handleUnbindContract(row) {
      const pricingNo = row.id;
      
      this.$modal.confirm(`确认要解除定价编号 "${pricingNo}" 的所有合同绑定关系吗？`).then(async () => {
        try {
          const response = await unbindContracts(pricingNo);
          
          if (response.code === 200) {
            this.$modal.msgSuccess(response.msg || "解除绑定成功");
            // 刷新当前页面数据
            this.getList();
          } else {
            this.$modal.msgError(response.msg || "解除绑定失败");
          }
        } catch (error) {
          console.error("解除绑定失败:", error);
          this.$modal.msgError("解除绑定失败");
        }
             }).catch(() => {
         this.$modal.msgInfo("已取消解除绑定操作");
       });
     },
     
     /** 查看绑定的合同 */
     async handleViewBindContract(row) {
       const pricingNo = row.id;
       
       try {
         const response = await getContractsByPricingNo(pricingNo);
         
         if (response.code === 200) {
           const contracts = response.data || [];
           
           if (contracts.length === 0) {
             this.$modal.msgInfo("该定价编号暂无绑定的合同");
             return;
           }
           
           // 设置当前查看的绑定信息
           this.currentBindInfo = {
             pricingInfo: row,
             contracts: contracts,
             pricingNo: pricingNo
           };
           
           // 显示绑定信息详情弹窗
           this.bindDetailVisible = true;
         } else {
           this.$modal.msgError(response.msg || "查询绑定合同失败");
         }
       } catch (error) {
         console.error("查询绑定合同失败:", error);
         this.$modal.msgError("查询绑定合同失败");
       }
     },
     
     /** 获取责任用户列表 */
     getResponsibilityUsers() {
       if (!this.currentBindInfo.contracts || this.currentBindInfo.contracts.length === 0) {
         return [];
       }
       
       const contract = this.currentBindInfo.contracts[0]; // 取第一个合同的责任用户信息
       const users = [];
       
       // 遍历所有可能的责任用户字段
       for (let i = 1; i <= 5; i++) {
         const userField = `shareUser${i}`;
         const rateField = `shareUser${i}Rate`;
         
         if (contract[userField] && contract[rateField]) {
           users.push({
             userName: contract[userField],
             ratio: contract[rateField]
           });
         }
       }
       
       return users;
     },
     
     /** 计算总责任比例 */
     getTotalRatio() {
       return this.getResponsibilityUsers().reduce((sum, user) => sum + (user.ratio || 0), 0);
     },
     
     /** 获取担保方式标签类型 */
     getGuaranteeTypeTag(guaranteeType) {
       const typeMap = {
         '抵押': 'success',
         '质押': 'warning', 
         '保证': 'info',
         '信用': 'danger'
       };
       return typeMap[guaranteeType] || 'info';
     },
     
     /** 格式化日期时间 */
     formatDateTime(dateTime) {
       if (!dateTime) {
         return '-';
       }
       
       try {
         // 处理不同格式的日期输入
         const date = new Date(dateTime);
         
         // 检查日期是否有效
         if (isNaN(date.getTime())) {
           return dateTime; // 如果无法解析，返回原值
         }
         
         // 格式化为 YYYY-MM-DD HH:mm:ss
         const year = date.getFullYear();
         const month = String(date.getMonth() + 1).padStart(2, '0');
         const day = String(date.getDate()).padStart(2, '0');
         const hours = String(date.getHours()).padStart(2, '0');
         const minutes = String(date.getMinutes()).padStart(2, '0');
         const seconds = String(date.getSeconds()).padStart(2, '0');
         
         return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
       } catch (error) {
         console.warn('日期格式化失败:', error);
         return dateTime; // 发生错误时返回原值
       }
     },
     
     /** 格式化日期（只显示日期） */
     formatDate(date) {
       if (!date) {
         return '-';
       }
       
       try {
         const dateObj = new Date(date);
         
         if (isNaN(dateObj.getTime())) {
           return date; // 如果无法解析，返回原值
         }
         
         // 格式化为 YYYY-MM-DD
         const year = dateObj.getFullYear();
         const month = String(dateObj.getMonth() + 1).padStart(2, '0');
         const day = String(dateObj.getDate()).padStart(2, '0');
         
         return `${year}-${month}-${day}`;
       } catch (error) {
         console.warn('日期格式化失败:', error);
         return date;
       }
     },
  }
};
</script>

<style scoped>
.operation-btn {
  margin-left: 5px;
}

/* 绑定详情弹窗样式 */
.bind-detail-content {
  .info-card {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .card-header {
      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
  
  /* 责任用户卡片样式 */
  .responsibility-card {
    text-align: center;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.primary-user {
      border: 2px solid #409eff;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    }
    
    .user-avatar {
      margin-bottom: 10px;
    }
    
    .user-info {
      .user-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
        color: #303133;
        
        .el-tag {
          margin-left: 5px;
        }
      }
      
      .user-ratio {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .ratio-text {
          font-size: 12px;
          font-weight: 600;
          color: #409eff;
          margin-left: 8px;
        }
      }
    }
  }
  
  /* 分成统计样式 */
  .responsibility-summary {
    margin-top: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    
    .el-divider {
      margin: 10px 0 20px 0;
    }
  }
}

/* 对话框底部样式 */
.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .bind-detail-content {
    .responsibility-card {
      margin-bottom: 10px;
    }
  }
}
</style>