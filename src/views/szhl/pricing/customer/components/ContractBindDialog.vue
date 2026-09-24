<template>
  <div class="contract-bind-dialog">
    <el-dialog
      title="绑定合同"
      v-model="open"
      width="900px"
      :before-close="cancel"
      append-to-body
    >
      <div class="dialog-content">
        <!-- 定价信息展示 -->
        <el-card class="pricing-info-card" shadow="never">
          <template #header>
            <span class="card-header">定价信息</span>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="客户名称">{{ pricingInfo.customerName }}</el-descriptions-item>
            <el-descriptions-item label="客户号">{{ pricingInfo.customerNo }}</el-descriptions-item>
            <el-descriptions-item label="客户内码">{{ pricingInfo.customerId }}</el-descriptions-item>
            <el-descriptions-item label="定价日期">{{ pricingInfo.priceDate }}</el-descriptions-item>
            <el-descriptions-item label="申贷金额(万元)">{{ pricingInfo.applyAmount }}</el-descriptions-item>
            <el-descriptions-item label="定价利率">{{ pricingInfo.finalRate }}%</el-descriptions-item>
            <el-descriptions-item label="分成加点(BP)">{{ pricingInfo.protocolBp }}</el-descriptions-item>
            
          </el-descriptions>
        </el-card>

        <!-- 可选合同列表 -->
        <div class="contract-list-container">
          <div class="list-header">
            <span class="list-title">可绑定合同列表</span>
            <el-button 
              size="small" 
              type="primary" 
              icon="Refresh" 
              @click="loadContracts"
              :loading="contractLoading"
            >
              刷新
            </el-button>
          </div>
          
          <el-table
            v-loading="contractLoading"
            :data="contractList"
            row-key="nfaacono"
            :height="180"
            @current-change="handleCurrentChange"
            highlight-current-row
            empty-text="暂无可绑定的合同"
            :row-class-name="getRowClassName"
          >
            <el-table-column label="选择" width="85" align="center">
              <template v-slot:default="scope">
                <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                  <el-radio 
                    v-model="selectedContractNo" 
                    :label="scope.row.nfaacono"
                    :disabled="isContractDisabled(scope.row)"
                    @change="selectContract(scope.row)"
                  >
                    &nbsp;
                  </el-radio>
                  <el-tooltip
                    v-if="isContractDisabled(scope.row)"
                    content="此条数据合同利率小于定价利率，不允许绑定"
                    placement="top"
                  >
                    <el-icon style="color: #f56c6c; cursor: help;">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="合同编号" align="center" prop="nfaacono" min-width="120" />
            <el-table-column label="合同日期" align="center" prop="nfabdate" min-width="100" />
            <el-table-column label="客户内码" align="center" prop="nfaacsno" min-width="100" />
            <el-table-column label="合同金额" align="center" prop="nfaacmny" min-width="120">
              <template v-slot:default="scope">
                {{ formatAmount(scope.row.nfaaamt) }}
              </template>
            </el-table-column>
            <el-table-column label="合同利率" align="center" prop="nfaarate" min-width="60" />
            <el-table-column label="合同状态" align="center" prop="nfaacost" min-width="80">
              <template v-slot:default="scope">
                <el-tag :type="getContractStatusType(scope.row.nfaacost)">
                  {{ getContractStatusText(scope.row.nfaacost) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 选中合同信息 -->
        <div v-if="selectedContract" class="selected-contracts">
          <el-alert
            title="已选择合同"
            type="success"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="selected-contract-info">
                <el-descriptions :column="2" size="small">
                  <el-descriptions-item label="合同编号">{{ selectedContract.nfaacono }}</el-descriptions-item>
                  <el-descriptions-item label="合同日期">{{ selectedContract.nfabdate }}</el-descriptions-item>
                  <el-descriptions-item label="客户内码">{{ selectedContract.nfaacsno }}</el-descriptions-item>
                  <el-descriptions-item label="合同金额">{{ formatAmount(selectedContract.nfaaamt) }}</el-descriptions-item>
                </el-descriptions>
                <el-button 
                  link 
                  size="small" 
                  icon="Close" 
                  @click="clearSelection"
                  style="margin-top: 8px;"
                >
                  取消选择
                </el-button>
              </div>
            </template>
          </el-alert>
        </div>

        <!-- 责任用户设置 -->
        <div v-if="selectedContract" class="responsibility-section">
          <el-card shadow="never">
            <template #header>
              <div class="responsibility-header">
                <span class="card-header">责任用户设置</span>
                <div class="add-user-section">
                  <span v-if="responsibilityUsers.length >= 5" class="max-users-tip">
                    最多只能添加5个责任用户
                  </span>
                  <el-button 
                    size="small" 
                    type="primary" 
                    icon="Plus" 
                    @click="addResponsibilityUser"
                    :disabled="responsibilityUsers.length >= 5"
                  >
                    添加责任用户 ({{ responsibilityUsers.length }}/5)
                  </el-button>
                </div>
              </div>
            </template>
            
            <div v-if="responsibilityUsers.length === 0" class="empty-responsibility">
              <el-empty description="暂无责任用户，请点击上方按钮添加" :image-size="80" />
            </div>
            
            <el-form v-else ref="responsibilityForm" :model="{ responsibilityUsers }" class="responsibility-list">
              <div 
                v-for="(user, index) in responsibilityUsers" 
                :key="index" 
                class="responsibility-item"
              >
                <el-row :gutter="18" align="middle">
                  <el-col :span="9">
                    <el-form-item 
                      :prop="`responsibilityUsers.${index}.userId`"
                      :rules="[{ required: true, message: '请选择责任用户', trigger: 'change' }]"
                    >
                      <template #label>
                        <span>{{ index === 0 ? '责任用户1（主责）' : `责任用户${index + 1}` }}</span>
                      </template>
                      <el-select 
                        v-model="user.userId" 
                        placeholder="请选择责任用户"
                        filterable
                        :clearable="index !== 0"
                        remote
                        :disabled="index === 0"
                        :loading="userLoading"
                        loading-text="加载中..."
                        no-data-text="暂无可选用户"
                        style="width: 100%"
                        @change="handleUserChange(index)"
                      >
                        <el-option
                          v-for="option in availableUsers"
                          :key="option.userId"
                          :label="option.displayName"
                          :value="option.userId"
                          :disabled="isUserSelected(option.userId, index)"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="7">
                    <el-form-item 
                      label="责任比例(%)" 
                      :prop="`responsibilityUsers.${index}.ratio`"
                      :rules="getRatioRules(index)"
                    >
                      <el-input
                        v-model.number="user.ratio"
                        type="number"
                        :min="1"
                        :max="100"
                        placeholder="请输入责任比例"
                        style="width: 100%"
                        @input="handleRatioInput(index, $event)"
                        @blur="handleRatioBlur(index)"
                        oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                      >
                        <template #append>%</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <!-- <el-col :span="4">
                    <div class="user-info">
                      <span v-if="user.displayName" class="user-name">{{ user.displayName }}</span>
                      <span v-else class="user-placeholder">请选择用户</span>
                    </div>
                  </el-col> -->
                  <el-col :span="4">
                    <el-form-item label=" ">
                      <el-tooltip 
                        v-if="index === 0"
                        content="主责任用户不允许删除"
                        placement="top"
                      >
                        <el-button 
                          type="danger" 
                          icon="Delete" 
                          size="small" 
                          disabled
                        >
                          删除
                        </el-button>
                      </el-tooltip>
                      <el-button 
                        v-else
                        type="danger" 
                        icon="Delete" 
                        size="small" 
                        @click="removeResponsibilityUser(index)"
                        :disabled="responsibilityUsers.length === 1"
                      >
                        删除
                      </el-button>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
              
              <!-- 责任比例汇总 -->
              <div class="ratio-summary">
                <el-row :gutter="16" align="middle">
                  <el-col :span="6">
                    <strong>责任比例汇总：</strong>
                  </el-col>
                  <el-col :span="6">
                    <el-tag 
                      :type="totalRatio === 100 ? 'success' : 'warning'"
                      size="large"
                    >
                      {{ Math.round(totalRatio) }}%
                    </el-tag>
                  </el-col>
                  <el-col :span="12">
                    <span 
                      :class="['ratio-status', totalRatio === 100 ? 'success' : 'warning']"
                    >
                      {{ totalRatio === 100 ? '✓ 责任比例正确' : '⚠ 责任比例需要等于100%' }}
                    </span>
                  </el-col>
                </el-row>
              </div>
            </el-form>
          </el-card>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button 
            type="primary" 
            @click="confirmBind"
            :disabled="!selectedContract || !isRatioValid"
            :loading="bindLoading"
          >
            确认绑定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { queryContractByCustomerAndDate } from "@/api/szhl/pricing/contract/contract";
import { selectUserBydept } from "@/api/system/user";
import useUserStore from '@/store/modules/user';
import { QuestionFilled } from '@element-plus/icons-vue';

export default {
  name: "ContractBindDialog",
  components: {
    QuestionFilled
  },
  props: {
    // 弹窗显示状态
    visible: {
      type: Boolean,
      default: false
    },
    // 定价信息
    pricingInfo: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:visible', 'bind-success', 'bind-request'],
  data() {
    return {
      // 弹窗显示控制
      open: false,
      // 合同加载状态
      contractLoading: false,
      // 绑定操作加载状态
      bindLoading: false,
      // 可选合同列表
      contractList: [],
      // 选中的合同（单选）
      selectedContract: null,
      // 选中的合同编号（用于单选框绑定）
      selectedContractNo: '',
      // 责任用户列表
      responsibilityUsers: [],
      // 可选用户列表
      availableUsers: [],
      // 用户加载状态
      userLoading: false,
      // 责任比例验证规则
      ratioRules: [
        { required: true, message: '请输入责任比例', trigger: 'blur' },
        { 
          type: 'integer', 
          min: 1, 
          max: 100, 
          message: '责任比例必须是1-100的整数', 
          trigger: 'blur',
          transform: (value) => {
            const num = Number(value);
            return Number.isInteger(num) ? num : NaN;
          }
        }
      ]
    };
  },
  computed: {
    // 计算总责任比例
    totalRatio() {
      return this.responsibilityUsers.reduce((sum, user) => {
        // 只计算有效的数字值，空值或null不参与计算
        const ratio = user.ratio;
        if (ratio !== null && ratio !== undefined && ratio !== '' && !isNaN(ratio)) {
          return sum + Number(ratio);
        }
        return sum;
      }, 0);
    },
    
    // 检查责任比例是否有效
    isRatioValid() {
      return this.totalRatio === 100 && this.responsibilityUsers.length > 0;
    }
  },
  watch: {
    visible: {
      handler(newVal) {
        this.open = newVal;
        if (newVal) {
          this.initDialog();
        }
      },
      immediate: true
    },
    open(newVal) {
      this.$emit('update:visible', newVal);
    }
  },
  methods: {
    /** 初始化弹窗 */
    initDialog() {
      // 重置所有状态
      this.selectedContract = null;
      this.selectedContractNo = '';
      this.bindLoading = false;
      this.contractLoading = false;
      this.contractList = [];
      this.responsibilityUsers = [];
      
      // 重新加载合同列表和用户列表
      this.loadContracts();
      this.loadAvailableUsers();
    },
    
    /** 加载可选用户列表 */
    async loadAvailableUsers() {
      this.userLoading = true;
      try {
        const response = await selectUserBydept({ pageSize: 400 });
        
        if (response.code === 200) {
          // listUser API 返回的数据在 response.rows 中
          const userData = response.rows || response.data || [];
          this.availableUsers = userData.map(user => ({
            userId: user.userId,
            userName: user.userName,
            nickName: user.nickName,
            // 显示格式：nickName(userName)
            displayName: `${user.nickName || user.userName}（${user.userName}）` // 显示姓名和工号
            // displayName: `${user.nickName || user.userName}（${user.userName}）`
          }));
          
          // 如果已经有第一个责任用户但未设置，则设置为当前登录用户
          if (this.responsibilityUsers.length > 0 && !this.responsibilityUsers[0].userId) {
            this.setCurrentUserAsFirstResponsible();
          }
        } else {
          this.$modal.msgError(response.msg || "查询用户列表失败");
          this.availableUsers = [];
        }
      } catch (error) {
        console.error("查询用户列表失败:", error);
        this.$modal.msgError("查询用户列表失败");
        this.availableUsers = [];
      } finally {
        this.userLoading = false;
      }
    },
    
    /** 加载可绑定合同列表 */
    async loadContracts() {
      if (!this.pricingInfo.customerId || !this.pricingInfo.priceDate) {
        this.$modal.msgError("缺少客户号或定价日期信息");
        return;
      }
      
      this.contractLoading = true;
      try {
        const response = await queryContractByCustomerAndDate({
          customerCode: this.pricingInfo.customerId,
          pricingDate: this.pricingInfo.priceDate
        });
        
        if (response.code === 200) {
          this.contractList = response.data || [];
          if (this.contractList.length === 0) {
            this.$modal.msgWarning("未找到可绑定的合同");
          }
        } else {
          this.$modal.msgError(response.msg || "查询合同失败");
          this.contractList = [];
        }
      } catch (error) {
        console.error("查询合同失败:", error);
        this.$modal.msgError("查询合同失败");
        this.contractList = [];
      } finally {
        this.contractLoading = false;
      }
    },
    
    /** 判断合同是否被禁用 */
    isContractDisabled(contract) {
      // 如果合同利率小于定价利率，则禁用
      const contractRate = parseFloat(contract.nfaarate) || 0;
      const pricingRate = parseFloat(this.pricingInfo.finalRate) || 0;
      return contractRate < pricingRate;
    },
    
    /** 获取表格行的样式类名 */
    getRowClassName({ row }) {
      return this.isContractDisabled(row) ? 'disabled-contract-row' : '';
    },
    
    /** 处理表格行选中变化 */
    handleCurrentChange(currentRow) {
      if (currentRow && !this.isContractDisabled(currentRow)) {
        this.selectedContract = currentRow;
        this.selectedContractNo = currentRow.nfaacono;
      }
    },
    
    /** 选择合同（单选框） */
    selectContract(contract) {
      if (!this.isContractDisabled(contract)) {
        this.selectedContract = contract;
        this.selectedContractNo = contract.nfaacono;
      }
    },
    
    /** 清除选择 */
    clearSelection() {
      this.selectedContract = null;
      this.selectedContractNo = '';
      this.responsibilityUsers = [];
    },
    
    /** 添加责任用户 */
    addResponsibilityUser() {
      // 最多只能添加5个责任用户
      if (this.responsibilityUsers.length >= 5) {
        this.$modal.msgWarning("最多只能添加5个责任用户");
        return;
      }
      
      this.responsibilityUsers.push({
        userId: '',
        userName: '',
        nickName: '',
        displayName: '',
        ratio: null
      });
      
      // 如果是第一个用户，默认设置为当前登录用户，责任比例设为51%
      if (this.responsibilityUsers.length === 1) {
        this.setCurrentUserAsFirstResponsible();
      }
    },
    
    /** 设置当前登录用户为第一个责任用户 */
    setCurrentUserAsFirstResponsible() {
      try {
        // 使用Pinia store获取当前用户信息
        const userStore = useUserStore();
        const currentUser = userStore.name;
        const currentUserId = userStore.userId;
        const currentNickName = userStore.nickName || userStore.name;
        
        console.log('获取到的用户信息:', { currentUser, currentUserId, currentNickName });
        
        if (currentUser && this.responsibilityUsers.length > 0) {
          // 从可选用户列表中找到当前用户
          const currentUserInfo = this.availableUsers.find(user => user.userName === currentUser);
          
          if (currentUserInfo) {
            this.responsibilityUsers[0].userId = currentUserInfo.userId;
            this.responsibilityUsers[0].userName = currentUserInfo.userName;
            this.responsibilityUsers[0].nickName = currentUserInfo.nickName;
            this.responsibilityUsers[0].displayName = currentUserInfo.displayName;
          } else {
            // 如果在可选用户列表中找不到，直接使用store中的信息
            this.responsibilityUsers[0].userId = currentUserId;
            this.responsibilityUsers[0].userName = currentUser;
            this.responsibilityUsers[0].nickName = currentNickName;
            this.responsibilityUsers[0].displayName = `${currentNickName || currentUser}（${currentUser}）`;
          }
          
          // 设置默认责任比例100%
          this.responsibilityUsers[0].ratio = 100;
          
          console.log('已设置第一个责任用户为当前登录用户:', this.responsibilityUsers[0]);
        } else {
          console.warn('无法获取当前登录用户信息或责任用户列表为空');
          // 如果无法获取用户信息，至少设置默认比例
          if (this.responsibilityUsers.length > 0) {
            this.responsibilityUsers[0].ratio = 100;
          }
        }
      } catch (error) {
        console.error('设置当前用户为第一个责任用户时出错:', error);
        // 如果出错，至少设置默认比例
        if (this.responsibilityUsers.length > 0) {
          this.responsibilityUsers[0].ratio = 100;
        }
      }
    },
    
    /** 删除责任用户 */
    removeResponsibilityUser(index) {
      // 第一个责任用户（主责）不允许删除
      if (index === 0) {
        this.$modal.msgWarning("第一个责任用户（主责）不允许删除");
        return;
      }
      
      if (this.responsibilityUsers.length > 1) {
        this.responsibilityUsers.splice(index, 1);
      }
    },
    
    /** 处理用户选择变化 */
    handleUserChange(index) {
      const selectedUser = this.availableUsers.find(user => user.userId === this.responsibilityUsers[index].userId);
      if (selectedUser) {
        this.responsibilityUsers[index].userName = selectedUser.userName;
        this.responsibilityUsers[index].nickName = selectedUser.nickName;
        this.responsibilityUsers[index].displayName = selectedUser.displayName;
      }
    },
    
    /** 处理责任比例变化 */
    handleRatioChange() {
      // 可以在这里添加实时验证逻辑
      this.$forceUpdate();
    },
    
    /** 处理责任比例输入 */
    handleRatioInput(index, value) {
      // 只允许数字输入
      const numericValue = value.toString().replace(/[^0-9]/g, '');
      
      // 在输入过程中允许设置数值，不进行范围限制
      if (numericValue === '') {
        this.responsibilityUsers[index].ratio = null;
      } else {
        const intValue = parseInt(numericValue);
        // 直接设置输入的值，不在输入时进行范围限制
        this.responsibilityUsers[index].ratio = intValue;
      }
      
      this.$forceUpdate();
    },
    
    /** 处理责任比例失去焦点 */
    handleRatioBlur(index) {
      // 失去焦点时确保值是有效的整数
      const currentValue = this.responsibilityUsers[index].ratio;
      if (currentValue === null || currentValue === '' || isNaN(currentValue)) {
        this.responsibilityUsers[index].ratio = null;
      } else {
        // 确保是整数并在范围内
        const intValue = Math.round(Number(currentValue));
        if (index === 0) {
          // 第一个用户：51-100
          this.responsibilityUsers[index].ratio = Math.max(51, Math.min(100, intValue));
        } else {
          // 其他用户：1-100
          this.responsibilityUsers[index].ratio = Math.max(1, Math.min(100, intValue));
        }
      }
      this.handleRatioChange();
    },
    
    /** 获取责任比例验证规则 */
    getRatioRules(index) {
      if (index === 0) {
        // 第一个用户（责任用户1）的特殊验证规则
        return [
          { required: true, message: '请输入责任比例', trigger: 'blur' },
          { 
            type: 'integer', 
            min: 51, 
            max: 100, 
            message: '责任用户1的责任比例必须大于等于51%且小于等于100%', 
            trigger: 'blur',
            transform: (value) => {
              const num = Number(value);
              return Number.isInteger(num) ? num : NaN;
            }
          }
        ];
      } else {
        // 其他用户的正常验证规则
        return [
          { required: true, message: '请输入责任比例', trigger: 'blur' },
          { 
            type: 'integer', 
            min: 1, 
            max: 100, 
            message: '责任比例必须是1-100的整数', 
            trigger: 'blur',
            transform: (value) => {
              const num = Number(value);
              return Number.isInteger(num) ? num : NaN;
            }
          }
        ];
      }
    },
    isUserSelected(userId, currentIndex) {
      return this.responsibilityUsers.some((user, index) => 
        user.userId === userId && index !== currentIndex
      );
    },
    
    /** 验证责任用户设置 */
    async validateResponsibilityUsers() {
      if (this.responsibilityUsers.length === 0) {
        this.$modal.msgWarning("请至少添加一个责任用户");
        return false;
      }
      
      // 使用表单验证
      try {
        await this.$refs.responsibilityForm.validate();
      } catch (error) {
        this.$modal.msgWarning("请完善责任用户信息");
        return false;
      }
      
      // 检查责任比例总和是否为100
      if (this.totalRatio !== 100) {
        this.$modal.msgWarning(`责任比例总和必须为100%，当前为${this.totalRatio}%`);
        return false;
      }
      
      return true;
    },
    
    /** 确认绑定 */
    async confirmBind() {
      if (!this.selectedContract) {
        this.$modal.msgWarning("请选择要绑定的合同");
        return;
      }
      
      // 验证责任用户设置
      const isValid = await this.validateResponsibilityUsers();
      if (!isValid) {
        return;
      }
      
      this.bindLoading = true;
      try {
        let guaranteeType = this.pricingInfo.guaranteeType;
        if(this.pricingInfo.landType === "国有出让房产双证抵押" || this.pricingInfo.landType === "国有划拨房产双证抵押"){
          guaranteeType = '抵押';
        }else{
          guaranteeType = '信保';
        }
        
        // 构造绑定数据
        const bindData = {
          guaranteeType: guaranteeType,
          customerNo: this.pricingInfo.customerNo,
          pricingNo: this.pricingInfo.pricingNo,
          pricingUser: this.pricingInfo.createBy,
          pricingDeptId: this.pricingInfo.pricingDeptId,
          finalRate: this.pricingInfo.finalRate,
          protocolBp: this.pricingInfo.protocolBp,
          contractNos: [this.selectedContract.nfaacono],
          contracts: [this.selectedContract]
        };
        
        // 将责任用户映射到对应的字段
        // shareUser1, shareUser1Rate, shareUser2, shareUser2Rate, ..., shareUser5, shareUser5Rate
        this.responsibilityUsers.forEach((user, index) => {
          if (index < 5) { // 最多支持5个责任人
            const userField = `shareUser${index + 1}`;
            const rateField = `shareUser${index + 1}Rate`;
            bindData[userField] = user.userName; // 保存用户名而不是userId
            bindData[rateField] = user.ratio;
          }
        });
        
        console.log('绑定数据：', bindData);
        
        // 触发绑定事件，由父组件处理具体的保存逻辑
        this.$emit('bind-request', bindData, this.selectedContract.nfaacono);
        
      } catch (error) {
        console.error("绑定合同失败:", error);
        this.$modal.msgError("绑定合同失败");
        this.bindLoading = false;
      }
    },
    
    /** 绑定成功回调 */
    onBindSuccess(contractNo) {
      this.$modal.msgSuccess(`成功绑定合同：${contractNo}`);
      this.cancel();
      this.bindLoading = false;
    },
    
    /** 绑定失败回调 */
    onBindError(errorMsg) {
      this.$modal.msgError(errorMsg || "绑定合同失败");
      this.bindLoading = false;
    },
    
    /** 取消操作 */
    cancel() {
      this.open = false;
      this.selectedContract = null;
      this.selectedContractNo = '';
      this.bindLoading = false;
      this.responsibilityUsers = [];
    },
    
    /** 格式化金额 */
    formatAmount(amount) {
      if (!amount) return '-';
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 2
      }).format(amount);
    },
    
    /** 获取合同状态类型 */
    getContractStatusType(status) {
      const statusMap = {
        '3': 'success',
        '5': 'success', 
        '7': 'success'
      };
      return statusMap[status] || 'info';
    },
    
    /** 获取合同状态文本 */
    getContractStatusText(status) {
      const statusMap = {
        '3': '正常',
        '5': '正常',
        '7': '正常'
      };
      return statusMap[status] || '未知';
    }
  }
};
</script>

<style scoped>
.contract-bind-dialog {
  .dialog-content {
    .pricing-info-card {
      margin-bottom: 10px; /* 从20px减小到10px */
      
      .card-header {
        font-weight: 600;
        color: #409eff;
      }
    }
    
    .contract-list-container {
      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px; /* 从15px减小到8px */
        
        .list-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
    
    .selected-contracts {
      margin-top: 8px; /* 从15px减小到8px */
      
      .selected-contract-info {
        margin-top: 5px; /* 从8px减小到5px */
      }
    }
    
    .responsibility-section {
      margin-top: 10px; /* 从20px减小到10px */
      
      .responsibility-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .card-header {
          font-weight: 600;
          color: #409eff;
        }
        
        .add-user-section {
          display: flex;
          align-items: center;
          gap: 10px;
          
          .max-users-tip {
            font-size: 12px;
            color: #e6a23c;
            font-style: italic;
          }
        }
      }
      
      .empty-responsibility {
        text-align: center;
        padding: 40px 0;
      }
      
      .responsibility-list {
        .responsibility-item {
          padding: 15px;
          border: 1px solid #e4e7ed;
          border-radius: 6px;
          margin-bottom: 15px;
          background-color: #fafafa;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .user-info {
            display: flex;
            align-items: center;
            height: 32px;
            padding-top: 30px;
            
            .user-name {
              color: #606266;
              font-size: 14px;
              font-weight: 500;
            }
            
            .user-placeholder {
              color: #c0c4cc;
              font-size: 14px;
              font-style: italic;
            }
          }
        }
        
        .ratio-summary {
          margin-top: 20px;
          padding: 15px;
          background-color: #f5f7fa;
          border-radius: 6px;
          border: 1px solid #dcdfe6;
          
          .ratio-status {
            font-size: 14px;
            font-weight: 500;
            
            &.success {
              color: #67c23a;
            }
            
            &.warning {
              color: #e6a23c;
            }
          }
        }
      }
    }
  }
  
  .dialog-footer {
    text-align: right;
  }
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}

:deep(.el-table) {
  border-radius: 4px;
}

:deep(.disabled-contract-row) {
  background-color: #f5f5f5 !important;
  color: #c0c4cc !important;
  
  .cell {
    color: #c0c4cc !important;
  }
  
  &:hover {
    background-color: #f5f5f5 !important;
  }
}
</style> 