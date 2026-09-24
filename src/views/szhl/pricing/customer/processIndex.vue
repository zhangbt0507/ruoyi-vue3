<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="发起人" prop="createUserName">
        <el-input
          v-model="queryParams.createUserName"
          placeholder="请输入发起人"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="流程状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择流程状态"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="发起时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="Search" size="default" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" size="default" @click="resetQuery">重置</el-button>
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
            >导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="processList"
      row-key="pricingNo"
      :border="false"
    >
      <el-table-column label="客户号" align="center" prop="customerNo" width="200" />
      <el-table-column label="客户名称" align="center" prop="customerName" width="140" :show-overflow-tooltip="true"/>
      <el-table-column label="申贷金额(万元)" align="center" prop="applyAmount" width="120" />
      <el-table-column label="最终利率" align="center" prop="finalRate" width="80" />
      <el-table-column label="发起时间" align="center" prop="createTime" width="170">
        <template v-slot:default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发起人" align="center" prop="createUserName" width="120" />
      <el-table-column label="总行权限" align="center" prop="isUseHeadPower" width="100">
        <template v-slot:default="scope">
          <span>{{ scope.row.isUseHeadPower === '1' ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前状态" align="center" prop="status" width="120">
        <template v-slot:default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审查人" align="center" prop="reviewerName" width="120" />
      <el-table-column label="支行审批人" align="center" prop="branchApproverName" width="120" />
      <el-table-column label="总行审批人" align="center" prop="headApproverName" width="120" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="300">
        <template v-slot:default="scope">
          <!-- 待审查状态下显示审查按钮 -->
          <el-button
            v-if="scope.row.status === '01' && isSameUser(scope.row.userName) === false && hasManagerRole()"
            link type="success"
            icon="Check"
            size="small"
            @click="handleReview(scope.row)"
            class="operation-btn"
          >审查</el-button>
          
          <!-- 待支行审批状态下显示审批按钮 -->
          <el-button
            v-if="scope.row.status === '02' && isSameUser(scope.row.userName) === false &&
               isBranchReviewer() === true"
            link type="success"
            icon="Check"
            size="small"
            @click="handleBranchApprove(scope.row)"
            class="operation-btn"
          >支行审批</el-button>
          
          <!-- 待总行审批状态下显示审批按钮 -->
          <el-button
            v-if="scope.row.status === '03' && isSameUser(scope.row.userName) === false &&
              isHeadReviewer() === true"
            link type="success"
            icon="Check"
            size="small"
            @click="handleHeadApprove(scope.row)"
            class="operation-btn"
          >总行审批</el-button>
          
          <!-- 其他状态或已完成状态下显示查看按钮 -->
          <el-button
            v-if="scope.row.status === '04' || scope.row.status === '09' || isSameUser(scope.row.userName)"
            link type="primary"
            icon="View"
            size="small"
            @click="handleDetail(scope.row)"
            class="operation-btn"
          >查看</el-button>
          
          <!-- 未完成状态下显示作废按钮 -->
          <el-button
            v-if="scope.row.status !== '04' && scope.row.status !== '09'"
            link type="danger"
            icon="Delete"
            size="small"
            @click="handleCancel(scope.row)"
            :disabled="isSameUser(scope.row.userName) === false"
            class="operation-btn"
          >作废</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog :title="'定价流程详情 - ' + detailData.pricingNo" v-model="detailOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="定价编号">{{ detailData.pricingNo }}</el-descriptions-item>
        <el-descriptions-item label="发起时间">{{ parseTime(detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="发起人">{{ detailData.createUserName }} ({{ detailData.userName }})</el-descriptions-item>
        <el-descriptions-item label="总行权限">{{ detailData.isUseHeadPower === '1' ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(detailData.status)">{{ getStatusText(detailData.status) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <div class="process-timeline" v-if="detailData.createTime">
        <h3>流程进度</h3>
        <el-timeline>
          <el-timeline-item 
            type="primary" 
            timestamp="发起阶段"
            placement="top"
          >
            <div class="timeline-content">
              <h4>由 {{ detailData.createUserName }} 发起</h4>
              <p>时间: {{ parseTime(detailData.createTime) }}</p>
            </div>
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="detailData.reviewTime || detailData.status === '01'"
            :type="detailData.reviewTime ? 'success' : 'warning'"
            timestamp="审查阶段" 
            placement="top"
          >
            <div class="timeline-content">
              <h4 v-if="detailData.reviewTime">
                由 {{ detailData.reviewerName }} 审查{{ detailData.status === '06' ? '退回' : '通过' }}
              </h4>
              <h4 v-else>待审查</h4>
              <p v-if="detailData.reviewTime">时间: {{ parseTime(detailData.reviewTime) }}</p>
              <p v-if="detailData.reviewRemark">意见: {{ detailData.reviewRemark }}</p>
            </div>
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="detailData.branchApproveTime || detailData.status === '02'"
            :type="detailData.branchApproveTime ? 'success' : 'warning'"
            timestamp="支行审批阶段" 
            placement="top"
          >
            <div class="timeline-content">
              <h4 v-if="detailData.branchApproveTime">
                由 {{ detailData.branchApproverName }} 审批{{ detailData.status === '06' ? '退回' : '通过' }}
              </h4>
              <h4 v-else>待支行审批</h4>
              <p v-if="detailData.branchApproveTime">时间: {{ parseTime(detailData.branchApproveTime) }}</p>
              <p v-if="detailData.branchApproveRemark">意见: {{ detailData.branchApproveRemark }}</p>
            </div>
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="detailData.headApproveTime || detailData.status === '03'"
            :type="detailData.headApproveTime ? 'success' : 'warning'"
            timestamp="总行审批阶段" 
            placement="top"
          >
            <div class="timeline-content">
              <h4 v-if="detailData.headApproveTime">
                由 {{ detailData.headApproverName }} 审批{{ detailData.status === '06' ? '退回' : '通过' }}
              </h4>
              <h4 v-else>待总行审批</h4>
              <p v-if="detailData.headApproveTime">时间: {{ parseTime(detailData.headApproveTime) }}</p>
              <p v-if="detailData.headApproveRemark">意见: {{ detailData.headApproveRemark }}</p>
            </div>
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="detailData.status === '04'"
            type="success"
            timestamp="已完成" 
            placement="top"
          >
            <div class="timeline-content">
              <h4>流程已完成</h4>
            </div>
          </el-timeline-item>
          
          <el-timeline-item 
            v-if="detailData.status === '09'"
            type="danger"
            timestamp="已作废" 
            placement="top"
          >
            <div class="timeline-content">
              <h4>流程已作废</h4>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <!-- 审查弹窗 -->
    <el-dialog :title="'审查 - ' + approveForm.pricingNo" v-model="reviewOpen" width="500px" append-to-body>
      <el-form ref="reviewForm" :model="approveForm" :rules="approveRules" label-width="100px">
        <el-form-item label="意见类型" prop="approveType">
          <el-radio-group v-model="approveForm.approveType">
            <el-radio label="pass">通过</el-radio>
            <el-radio label="reject">退回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审查意见" prop="remark">
          <el-input 
            v-model="approveForm.remark" 
            type="textarea" 
            :rows="4"
            placeholder="请输入审查意见"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitReview">确定</el-button>
        <el-button @click="reviewOpen = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 支行审批弹窗 -->
    <el-dialog :title="'支行审批 - ' + approveForm.pricingNo" v-model="branchApproveOpen" width="500px" append-to-body>
      <el-form ref="branchApproveForm" :model="approveForm" :rules="approveRules" label-width="100px">
        <el-form-item label="意见类型" prop="approveType">
          <el-radio-group v-model="approveForm.approveType">
            <el-radio label="pass">通过</el-radio>
            <el-radio label="reject">退回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark">
          <el-input 
            v-model="approveForm.remark" 
            type="textarea" 
            :rows="4"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitBranchApprove">确定</el-button>
        <el-button @click="branchApproveOpen = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 总行审批弹窗 -->
    <el-dialog :title="'总行审批 - ' + approveForm.pricingNo" v-model="headApproveOpen" width="500px" append-to-body>
      <el-form ref="headApproveForm" :model="approveForm" :rules="approveRules" label-width="100px">
        <el-form-item label="意见类型" prop="approveType">
          <el-radio-group v-model="approveForm.approveType">
            <el-radio label="pass">通过</el-radio>
            <el-radio label="reject">退回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark">
          <el-input 
            v-model="approveForm.remark" 
            type="textarea" 
            :rows="4"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitHeadApprove">确定</el-button>
        <el-button @click="headApproveOpen = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  listRateProcess,
  delRateProcess
} from "@/api/szhl/pricing/customer/rateProcessApi";
import { parseTime } from '@/utils/ruoyi';
import useUserStore from '@/store/modules/user';

export default {
  name: "RatePricingProcess",
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 定价流程列表
      processList: [],
      // 查询参数
      queryParams: {
        pageNum: parseInt(sessionStorage.getItem('processListPageNum')) || 1,
        pageSize: parseInt(sessionStorage.getItem('processListPageSize')) || 10,
        pricingNo: sessionStorage.getItem('processListPricingNo') || undefined,
        createUserName: sessionStorage.getItem('processListCreateUserName') || undefined,
        status: sessionStorage.getItem('processListStatus') || undefined
      },
      // 日期范围
      dateRange: [],
      // 状态选项
      statusOptions: [
        { value: "01", label: "待审查" },
        { value: "02", label: "待支行审批" },
        { value: "03", label: "待总行审批" },
        { value: "04", label: "已完成" }
      ],
      // 详情弹窗
      detailOpen: false,
      detailData: {},
      // 审查弹窗
      reviewOpen: false,
      // 支行审批弹窗
      branchApproveOpen: false,
      // 总行审批弹窗
      headApproveOpen: false,
      // 审批表单
      approveForm: {
        id: null,
        pricingNo: "",
        approveType: "pass",
        remark: ""
      },
      // 审批表单校验规则
      approveRules: {
        approveType: [
          { required: true, message: "请选择意见类型", trigger: "change" }
        ],
        remark: [
          { required: true, message: "请输入审批意见", trigger: "blur" },
          { min: 2, max: 500, message: "长度在 2 到 500 个字符", trigger: "blur" }
        ]
      },
      // 当前用户ID
      currentUserId: useUserStore().name
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    // 监听页面刷新事件
    window.addEventListener('beforeunload', this.clearStateOnRefresh);
  },
  beforeUnmount() {
    // 移除事件监听
    window.removeEventListener('beforeunload', this.clearStateOnRefresh);
  },
  // 页面激活时处理
  activated() {
    // 检查是否需要刷新数据
    const needRefresh = sessionStorage.getItem('processListNeedRefresh');
    if (needRefresh === 'true') {
      this.getList();
      sessionStorage.removeItem('processListNeedRefresh');
    }
  },
  watch: {
    // 监听路由变化，用于从详情页返回时刷新数据
    '$route': {
      handler(to) {
        // 如果有时间戳参数t，说明是从详情页返回，需要刷新数据
        if (to.path === '/customerRate/process' && to.query.t) {
          this.getList();
          // 清除URL中的时间戳参数
          this.$router.replace({ path: to.path, query: {} });
        }
      },
      immediate: true
    }
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      listRateProcess(this.queryParams).then(response => {
        this.processList = response.rows;
        this.total = response.total;
        this.loading = false;
        
        // 保存当前查询状态到sessionStorage
        this.saveCurrentState();
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download("pricing/process/export", {
        ...this.queryParams
      }, `定价流程_${new Date().getTime()}.xlsx`, {appCode: 'rate-pricing'});
    },
    /** 查看详情按钮操作 */
    handleDetail(row) {
      // 保存当前状态
      this.saveCurrentState();
      this.$router.push({
        path: `/pricing/process/detail/${row.pricingNo}`
      });
    },
    /** 审查按钮操作 */
    handleReview(row) {
      // 保存当前状态
      this.saveCurrentState();
      this.$router.push({
        path: `/pricing/process/detail/${row.pricingNo}`
      });
    },
    /** 支行审批按钮操作 */
    handleBranchApprove(row) {
      // 保存当前状态
      this.saveCurrentState();
      this.$router.push({
        path: `/pricing/process/detail/${row.pricingNo}`
      });
    },
    /** 总行审批按钮操作 */
    handleHeadApprove(row) {
      // 保存当前状态
      this.saveCurrentState();
      this.$router.push({
        path: `/pricing/process/detail/${row.pricingNo}`
      });
    },
    /** 作废按钮操作 */
    handleCancel(row) {
      this.$modal.confirm('确认要作废该定价流程吗？').then(() => {
        delRateProcess(row.pricingNo).then(response => {
          this.$modal.msgSuccess("作废成功");
          this.getList();
        });
      }).catch(() => {});
    },
    /** 获取状态文字 */
    getStatusText(status) {
      const statusMap = {
        "01": "待审查",
        "02": "待支行审批",
        "03": "待总行审批",
        "04": "已完成",
        "09": "已作废"
      };
      return statusMap[status] || status;
    },
    /** 获取状态类型 */
    getStatusType(status) {
      const statusMap = {
        "01": "warning",
        "02": "warning",
        "03": "warning",
        "04": "success",
        "09": "danger"
      };
      return statusMap[status] || "info";
    },
    // 工具方法
    parseTime,
    // 新增方法
    isSameUser(currentUser) {
      return currentUser === useUserStore().name;
    },

      
    // 检查是否有客户经理角色
    hasManagerRole() {
      const userStore = useUserStore();
      const branchRoles = ['manager', 'commander', 'assistant', 'president', 'admin'];
      return userStore.roles.some(role => branchRoles.includes(role));
    },

    // 是否支行审批人员
    isBranchReviewer(){
      const userStore = useUserStore();
      const branchRoles = ['commander', 'assistant', 'president', 'admin'];
      return userStore.roles.some(role => branchRoles.includes(role));
    },
    // 是否总行审批人员
    isHeadReviewer(){
      const userStore = useUserStore();
      const headRoles = ['pricing_process_approve', 'admin'];
      return userStore.roles.some(role => headRoles.includes(role));
    },
    
    // 保存当前状态到sessionStorage
    saveCurrentState() {
      sessionStorage.setItem('processListPageNum', this.queryParams.pageNum);
      sessionStorage.setItem('processListPageSize', this.queryParams.pageSize);
      sessionStorage.setItem('processListPricingNo', this.queryParams.pricingNo || '');
      sessionStorage.setItem('processListCreateUserName', this.queryParams.createUserName || '');
      sessionStorage.setItem('processListStatus', this.queryParams.status || '');
    },
    
    // 页面刷新时清除状态
    clearStateOnRefresh() {
      sessionStorage.removeItem('processListPageNum');
      sessionStorage.removeItem('processListPageSize');
      sessionStorage.removeItem('processListPricingNo');
      sessionStorage.removeItem('processListCreateUserName');
      sessionStorage.removeItem('processListStatus');
      sessionStorage.removeItem('processListNeedRefresh');
    }
  }
};
</script>

<style lang="scss" scoped>
.process-timeline {
  margin-top: 20px;
  padding: 10px;
  
  h3 {
    font-size: 16px;
    margin-bottom: 15px;
    color: #409EFF;
  }
  
  .timeline-content {
    h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
    }
    p {
      margin: 0;
      font-size: 13px;
      color: #606266;
    }
  }
}

.operation-btn {
  margin-right: 10px;
}

.el-tag {
  min-width: 80px;
  text-align: center;
}

.disabled-tip {
  color: #909399;
  font-size: 12px;
}

/* 设置表格内容字体为黑体 */
:deep(.el-table__cell) {
  font-family: "黑体", "SimHei", "Heiti SC", "Heiti TC", sans-serif;
}
</style> 