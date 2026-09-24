<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="客户姓名" prop="cunaflnm">
        <el-input
          v-model="queryParams.cunaflnm"
          placeholder="请输入客户姓名"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="记录状态" prop="jlzt">
        <el-select v-model="queryParams.jlzt" placeholder="请选择记录状态" style="width: 160px">
          <el-option label="未处理" value="1" />
          <el-option label="已处理" value="8" />
        </el-select>
      </el-form-item>
      <el-form-item label="提醒日期" prop="remindDate">
        <el-date-picker
          v-model="queryParams.remindDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择提醒日期"
          style="width: 200px"
          clearable
        />
      </el-form-item>
      <el-form-item label="责任分解" prop="isSameOrg" v-if="userNameChange">
        <el-select v-model="queryParams.isSameOrg" placeholder="请选择是否已分解" v-if="userNameChange">
                <el-option
                    v-for="item in is_same_org"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></el-option>
              </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="Download" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-card>
      <div style="min-height: 55vh">
        <el-table
          v-loading="loading"
          :data="list"
          max-height="55vh"
          highlight-current-row
        >
          <el-table-column
            label="操作"
            fixed="left"
            align="center"
            class-name="small-padding fixed-width"
            width="80"
            v-if="showDeal"
          >
            <template #default="scope">
              <el-button
                link
                type="primary"
                icon="Edit"
                size="small"
                @click="handleEdit(scope.row)"
                :disabled="scope.row.jlzt === '8'"
              >处理</el-button>
            </template>
          </el-table-column>

          <!-- <el-table-column label="客户内码" prop="cinocsno" width="160" align="center" /> -->
          <el-table-column fixed="left" label="客户号" prop="cuidcsid" width="200" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-link type="primary" :underline="false" @click="handleClickCustId(scope.row)">{{ scope.row.cuidcsid }}</el-link>
            </template>
          </el-table-column>
          <el-table-column fixed="left" label="客户名称" prop="cunaflnm" width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-link type="primary" :underline="false" @click="handleClickCustName(scope.row.cuidcsid)">{{ scope.row.cunaflnm }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="客户电话" prop="phone" width="130" align="center" />
          <el-table-column label="提醒日期" prop="remindDate" width="120" align="center" />
          <el-table-column label="最近归还日" prop="rnaudate" width="120" align="center" />
          <el-table-column label="归还金额" prop="rnauamt" width="110" align="center" />
          <el-table-column label="贷款机构" prop="deptId" width="120" align="center" >
            <template #default="scope">
                <dict-tag :options="sys_org_name" :value="scope.row.deptId"></dict-tag>
            </template>
          </el-table-column>
          <el-table-column label="责任人" prop="userName" width="120" align="center">
            <template #default="scope">
              <el-link
                v-if="userNameChange"
                type="primary"
                :underline="false"
                link
                @click="handleUserName(scope.row)"
              >
                <dict-tag
                  :options="sys_user_name"
                  :value="scope.row.userName == null ? '' : scope.row.userName"
                />
              </el-link>
              <dict-tag
                v-else
                :options="sys_user_name"
                :value="scope.row.userName == null ? '' : scope.row.userName"
              />
            </template>
          </el-table-column>
          <el-table-column label="逾期期数" prop="yqcs" width="100" align="center" />
          <el-table-column label="他行贷款余额" prop="thye" width="120" align="center">
            <template #default="scope">
              <el-link
                type="primary"
                :underline="false"
                @click="handleClickOtherBank(scope.row)"
              >
                {{ scope.row.thye }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="最后征信日期" prop="reportDate" width="120" align="center" />
          <el-table-column label="征信报告数" prop="reportCount" width="110" align="center">
            <template #default="scope">
              <el-link
                type="primary"
                :underline="false"
                @click="handleClickCredit(scope.row)"
              >
                {{ scope.row.reportCount }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="地址" prop="address" min-width="200" align="left" show-overflow-tooltip />
          <!-- <el-table-column label="记录状态" prop="jlzt" width="100" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.jlzt === '1'" type="warning">未处理</el-tag>
              <el-tag v-else-if="scope.row.jlzt === '8'" type="success">已处理</el-tag>
              <span v-else>{{ scope.row.jlzt }}</span>
            </template>
          </el-table-column>
          <el-table-column label="处理时间" prop="handleDate" width="160" align="center" />
          <el-table-column label="处理人" prop="handleManager" width="120" align="center">
            <template #default="scope">
              <dict-tag :options="sys_user_name" :value="scope.row.handleManager"></dict-tag>
            </template>
          </el-table-column> -->
        </el-table>
      </div>
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 处理弹窗组件 -->
    <SwallowRecord ref="recordRef" @submit="handleRecordSubmit" />
    <!-- 修改责任人弹窗组件 -->
    <SwallowStaff ref="staffRef" @updated="getList" />
    <!-- 触达历史弹窗 -->
    <RecordHistory ref="recordHistoryRef" />
    <!-- 他行贷款明细弹窗（复用合同/流失模块） -->
    <OtherBankLoan ref="otherBankLoanRef" />
    <!-- 征信弹窗 -->
    <credit-dialog ref="creditRef"></credit-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, unref } from 'vue'
import useUserStore from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import SwallowRecord from './SwallowRecord.vue'
import SwallowStaff from './Staff.vue'
import RecordHistory from './RecordHistory.vue'
import OtherBankLoan from '../contract/other/OtherBankLoan.vue'
import CreditDialog from '../contract/credit/CreditDialog.vue';
import { listSwallow, prevRecordByCustId } from '@/api/szhl/market/swallow'

const queryRef = ref(null)
const recordRef = ref(null)
const recordHistoryRef = ref(null)
const staffRef = ref(null)
const otherBankLoanRef = ref(null)
const creditRef = ref(null)
const { proxy } = getCurrentInstance()
const { sys_org_name, sys_user_name, is_same_org } = proxy.useDict('sys_org_name', 'sys_user_name', 'is_same_org')

const loading = ref(false)
const list = ref([])
const total = ref(0)

const showDeal = ref(true)
const userNameChange = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  cunaflnm: '',
  jlzt: '1',
  remindDate: '',
  isSameOrg: '1'
})

function getList() {
  if(queryParams.jlzt !== '1') {
    showDeal.value = false
  } else {
    showDeal.value = true
  }
  loading.value = true
  listSwallow(queryParams).then(res => {
    list.value = res.rows || []
    total.value = res.total || 0
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  Object.assign(queryParams, {
    pageNum: 1,
    pageSize: 10,
    cunaflnm: '',
    jlzt: '1',
    remindDate: '',
    isSameOrg: '1'
  })
  queryRef.value?.resetFields?.()
  getList()
}

function handleEdit(row) {
  if (!recordRef.value) return
  // 优先根据主键从后端获取最新明细，再打开弹窗
  prevRecordByCustId(row.cuidcsid).then(res => {
    const detail = res.data || row
    recordRef.value.openDialog(detail,row)
  })
}

function handleRecordSubmit() {
  ElMessage.success('处理成功')
  getList()
}

function handleUserName(row) {
  if (!staffRef.value) return
  staffRef.value.openStaffDialog(row)
}

function handleClickCustId(row) {
  const custNo = (row.cinocsno || '').trim()
  if (!custNo) {
    proxy.$modal.msgWarning('未获取到客户号')
    return
  }
  if (custNo.startsWith('81')) {
    proxy.$router.push(`/customer/detail/${custNo}`)
  } else {
    proxy.$modal.alert('企业客户360视图暂未上线')
  }
}

function handleClickCustName(custId) {
  console.log(custId)
  const custNo = (custId || '').trim()
  console.log(custNo)
  if (!custNo) {
    proxy.$modal.msgWarning('未获取到客户号')
    return
  }
  // 点击客户名称查看触达历史，逻辑与流失客户模块保持一致
  recordHistoryRef.value?.openHistoryDialog?.(custNo)
}

// 他行贷款余额点击：复用 OtherBankLoan 弹窗，参考贷款/流失模块实现
function handleClickOtherBank(row) {
  const reportNo = row.reportNo
  const lastDate = row.lastCreditInvestigationDate || row.reportDate
  if (!reportNo) {
    proxy.$modal.msgWarning('未获取到征信报告编号')
    return
  }
  unref(otherBankLoanRef).openOtherBankLoanDialog(reportNo, lastDate);
}

// 征信报告数点击：复用 Credit 弹窗，参考贷款/流失模块实现
function handleClickCredit(row) {
  
  const custNo = (row.cuidcsid || '').trim()
  if (!custNo) {
    proxy.$modal.msgWarning('未获取到客户号')
    return
  }
  unref(creditRef).openFn(custNo);
  // creditRef.value?.openCreditDialog?.(custNo)
}

// 权限：参考贷款流失等模块，使用相同的编辑权限控制是否允许修改责任人
const permissions = useUserStore().permissions
userNameChange.value = permissions.includes('market:contract:edit')

function handleExport() {
  proxy.download('market/swallow/export', { ...queryParams }, `营销客群归燕清单_${new Date().getTime()}.xlsx`)
}

getList()
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
