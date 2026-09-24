<template>
  <div class="app-container crm-page">
    <SearchForm
      v-model="queryParams"
      :fields="searchFields"
      :show-search="showSearch"
      show-actions-when-collapsed
      @search="handleQuery"
      @reset="resetQuery"
    >
      <template #attributionOrg>
        <CrmOrgSelect v-model="queryParams.attributionOrg" placeholder="可输入汉字或数字" />
      </template>
      <template #portraitTag>
        <PortraitTagQuerySelect
          v-model="queryParams.portraitTagIds"
          v-model:matchMode="queryParams.portraitTagMatchMode"
          :tags="featureTags"
        />
      </template>
      <template #actions-left>
        <el-button type="primary" plain icon="Search" @click="handleExactSearch">客户号精准搜索</el-button>
        <el-divider direction="vertical" />
        <el-button type="primary" plain icon="User" :disabled="multiple" @click="openAssign" v-hasPermi="['crm:attribution:assign']">分配管户</el-button>
        <el-button type="primary" plain icon="CollectionTag" :disabled="multiple" @click="openPortraitTagDialog" v-hasPermi="['crm:attribution:tag']">特征画像</el-button>
        <el-button type="primary" plain icon="Upload" class="batch-modify-entry" @click="batchModifyDialogRef?.open()" v-hasPermi="['crm:attribution:batchModify']">批量修改归属</el-button>
        <el-button plain icon="CollectionTag" @click="columnDialogOpen = true">列显示设定</el-button>
        <el-button plain icon="Download" @click="handleExport" v-hasRole="['president', 'assistant', 'commander']">导出</el-button>
      </template>
      <template #actions-right>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </template>
    </SearchForm>

    <common-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :loading="loading"
      :data="tableList"
      :columns="attributionTableColumns"
      :total="total"
      class="attribution-table"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @pagination="getList"
    >
      <template #mainCustomerFlag="{ row }">
        <el-tag
          v-if="String(row.mainCustomerFlag) === '1'"
          type="primary"
          effect="plain"
          class="main-customer-tag"
          @click="handleMainTagClick(row)"
        >主客</el-tag>
        <span v-else></span>
      </template>
      <template #customerName="{ row }">
        <CustomerLink :row="row" mode="name" />
      </template>
      <template #customerNo="{ row }">
        <CustomerLink :row="row" mode="no" />
      </template>
      <template #marketingStatus="{ row }">
        <span v-if="isEffectiveDefer(row)" class="defer-end-date">{{ formatDate(row.deferEndDate) }}</span>
        <span v-else></span>
      </template>
      <template #attributionOrg="{ row }">
        <dict-tag :options="orgOptions" :value="row.attributionOrg" />
      </template>
      <template #portraitTags="{ row }">
        <div class="portrait-tags-cell">
          <span
            v-for="tag in portraitTagList(row.portraitTagList)"
            :key="tag.tagId"
            class="portrait-tag"
            :class="'portrait-tag--' + tag.nature"
          >{{ tag.tagName }}</span>
        </div>
      </template>
      <template #updateBy="{ row }">{{ formatUser(row.updateBy) }}</template>
      <template #actions="{ row }">
        <div class="row-actions">
          <el-button link type="primary" icon="EditPen" @click="openContact(row)" v-hasPermi="['crm:contact:record']">触达登记</el-button>
          <el-dropdown class="row-actions-more" trigger="click">
            <el-button link type="primary" icon="ArrowDown" title="更多操作" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item icon="View" @click="openCustomer360(row)">360 视图</el-dropdown-item>
                <el-dropdown-item icon="Tickets" @click="openLoanDetail(row)">贷款明细</el-dropdown-item>
                <el-dropdown-item icon="Switch" @click="openDispute(row)" v-hasPermi="['crm:dispute:create']">机构调整</el-dropdown-item>
                <el-dropdown-item icon="Connection" @click="openRelation(row)" v-hasPermi="['crm:attribution:relation']">关联维护</el-dropdown-item>
                <el-dropdown-item icon="Timer" @click="openDefer(row)" v-hasPermi="['crm:defer:create']">暂缓触达</el-dropdown-item>
                <el-dropdown-item icon="Grid" @click="openGrid(row)" v-hasPermi="['crm:attribution:grid']">网格维护</el-dropdown-item>
                <el-dropdown-item icon="Picture" @click="openImageManage(row)">影像管理</el-dropdown-item>
                <el-dropdown-item icon="Clock" @click="openChangeLog(row)">变更历史</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </common-table>

    <el-dialog
      v-model="loanDetailOpen"
      :title="loanDetailTitle"
      width="1440px"
      top="5vh"
      append-to-body
      class="loan-detail-dialog"
    >
      <el-form :inline="true" class="loan-detail-filter" @submit.prevent="loadLoanDetail">
        <el-form-item label="数据日期">
          <el-date-picker
            v-model="loanDetailQuery.reportDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择"
            :disabled-date="loanDateDisabled"
            :clearable="false"
            @change="handleLoanDateChange"
          />
        </el-form-item>
        <el-form-item label="合同号">
          <el-input v-model="loanDetailQuery.contractNo" clearable placeholder="请输入合同号" @keyup.enter="loadLoanDetail" />
        </el-form-item>
        <el-form-item label="担保方式">
          <el-select v-model="loanDetailQuery.guaranteeType" clearable placeholder="全部">
            <el-option label="信用" value="信用" />
            <el-option label="保证" value="保证" />
            <el-option label="抵押" value="抵押" />
            <el-option label="质押" value="质押" />
            <el-option label="组合" value="组合" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联并表">
          <el-switch v-model="loanDetailQuery.consolidated" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="loadLoanDetail">查询</el-button>
          <el-button icon="Refresh" @click="resetLoanDetailQuery">重置</el-button>
          <el-button icon="Download" :loading="loanDetailExporting" @click="exportLoanDetailRows">导出</el-button>
          <el-popover placement="bottom-start" :width="360" trigger="click">
            <template #reference><el-button icon="Operation">显示列</el-button></template>
            <div class="loan-column-popover">
              <div class="loan-column-toolbar">
                <el-button link type="primary" @click="setLoanColumns(true)">全选</el-button>
                <el-button link @click="setLoanColumns(false)">不选</el-button>
              </div>
              <el-checkbox-group v-model="loanDetailVisibleColumns" :max="30">
                <el-checkbox v-for="column in loanDetailColumns" :key="column.key" :label="column.key">{{ column.label }}</el-checkbox>
              </el-checkbox-group>
            </div>
          </el-popover>
        </el-form-item>
      </el-form>
      <div class="loan-detail-meta">
        <span>共 {{ loanDetailSummary.total || 0 }} 条</span>
        <span>合同总额：{{ formatLoanWan(loanDetailSummary.contractTotal) }} 万元</span>
        <span>发放总额：{{ formatLoanWan(loanDetailSummary.issueTotal) }} 万元</span>
        <span>贷款总额：{{ formatLoanWan(loanDetailSummary.balanceTotal) }} 万元</span>
        <span>加权利率：{{ formatLoanRate(loanDetailSummary.weightedRate) }}%</span>
      </div>
      <el-table v-loading="loanDetailLoading" :data="loanDetailRows" border stripe height="560" empty-text="暂无贷款明细">
        <el-table-column
          v-for="column in visibleLoanDetailColumns"
          :key="column.key"
          :label="column.label"
          :prop="column.key"
          :min-width="column.width || 120"
          show-overflow-tooltip
        >
          <template #default="scope">
            <el-link v-if="column.drill" type="primary" :underline="false" @click="showLoanDrillPending">
              {{ formatLoanCell(scope.row, column) }}
            </el-link>
            <span v-else>{{ formatLoanCell(scope.row, column) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="loan-detail-pagination">
        <el-pagination
          v-model:current-page="loanDetailQuery.pageNum"
          v-model:page-size="loanDetailQuery.pageSize"
          :total="Number(loanDetailSummary.total) || 0"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 30, 50]"
          @current-change="loadLoanDetail"
          @size-change="handleLoanSizeChange"
        />
      </div>
    </el-dialog>

    <el-dialog :title="touchHistoryTitle" v-model="touchHistoryOpen" width="1040px" append-to-body>
      <el-table
        v-loading="touchHistoryLoading"
        :data="touchHistoryRows"
        :row-class-name="touchHistoryRowClassName"
        row-key="id"
        class="touch-history-table"
        max-height="420"
        empty-text="暂无触达记录"
      >
        <el-table-column type="expand" width="44">
          <template #default="scope">
            <div v-if="hasFollowupRecords(scope.row)" class="touch-followup-wrap">
              <div class="touch-followup-title">跟踪记录（{{ scope.row.followupCount || scope.row.followupRecords.length }}）</div>
              <el-table :data="scope.row.followupRecords" size="small" border class="touch-followup-table" empty-text="暂无跟踪记录">
                <el-table-column label="跟踪日期" width="110" align="center">
                  <template #default="followupScope">{{ parseTime(followupScope.row.followupDate, '{y}-{m}-{d}') || '-' }}</template>
                </el-table-column>
                <el-table-column label="跟踪方式" width="100" align="center">
                  <template #default="followupScope">{{ selectDictLabel(contactWayOptions, followupScope.row.followupWay) || '-' }}</template>
                </el-table-column>
                <el-table-column label="跟踪状态" width="90" align="center">
                  <template #default="followupScope">
                    <el-tag :type="followupScope.row.followupStatus === '1' ? 'success' : 'warning'">
                      {{ followupScope.row.followupStatus === '1' ? '完成' : '未完' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="跟踪结果" min-width="220" show-overflow-tooltip>
                  <template #default="followupScope">{{ followupScope.row.followupResult || '-' }}</template>
                </el-table-column>
                <el-table-column label="备注" min-width="220" show-overflow-tooltip>
                  <template #default="followupScope">{{ followupScope.row.followupNote || '-' }}</template>
                </el-table-column>
                <el-table-column label="跟踪人" width="110" align="center" show-overflow-tooltip>
                  <template #default="followupScope">{{ followupScope.row.followupBy || '-' }}</template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="触达日期" prop="contactDate" width="110" align="center">
          <template #default="scope">{{ parseTime(scope.row.contactDate, '{y}-{m}-{d}') || '-' }}</template>
        </el-table-column>
        <el-table-column label="触达方式" prop="contactWay" width="100" align="center">
          <template #default="scope">
            <dict-tag v-if="scope.row.contactWay" :options="contactWayOptions" :value="scope.row.contactWay" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="触达结果" prop="contactResult" width="110" align="center">
          <template #default="scope">
            <dict-tag v-if="scope.row.contactResult" :options="contactResultOptions" :value="scope.row.contactResult" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="客户态度" prop="customerAttitude" width="100" align="center">
          <template #default="scope">{{ selectDictLabel(attitudeOptions, scope.row.customerAttitude) || '-' }}</template>
        </el-table-column>
        <el-table-column label="补充说明" prop="supplement" min-width="180" show-overflow-tooltip />
        <el-table-column label="是否跟踪" prop="needFollowup" width="90" align="center">
          <template #default="scope">{{ scope.row.needFollowup === '1' ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column label="跟踪事项" prop="followupItem" min-width="180" show-overflow-tooltip />
        <el-table-column label="触达人" prop="contactBy" width="100" align="center">
          <template #default="scope">{{ formatUser(scope.row.contactBy) }}</template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="touchHistoryOpen = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-drawer :title="changeLogTitle" v-model="changeLogOpen" size="520px" append-to-body>
      <div v-loading="changeLogLoading" class="change-log-drawer">
        <el-empty v-if="!changeLogLoading && changeLogRows.length === 0" description="暂无变更历史" />
        <el-timeline v-else class="change-log-timeline">
          <el-timeline-item
            v-for="(item, index) in changeLogRows"
            :key="item.id || index"
            :timestamp="parseTime(item.changeDate, '{y}-{m}-{d}') || '-'"
            placement="top"
            type="primary"
          >
            <div class="change-log-item">
              <div class="change-log-title">
                <span>{{ item.changeSource || '管户变更' }}</span>
                <span class="change-log-operator">
                  操作人：
                  <span>{{ formatUser(item.operator) }}</span>
                </span>
              </div>
              <div class="change-log-compare">
                <div class="change-log-side change-log-before">
                  <div class="change-log-side-title">变更前</div>
                  <div class="change-log-field">
                    <span class="change-log-label">机构</span>
                    <span class="change-log-value">
                      <dict-tag v-if="item.oldOrg" :options="orgOptions" :value="item.oldOrg" />
                      <span v-else>-</span>
                    </span>
                  </div>
                  <div class="change-log-field">
                    <span class="change-log-label">管户经理</span>
                    <span class="change-log-value">{{ formatUser(item.oldManager) }}</span>
                  </div>
                </div>
                <div class="change-log-arrow">
                  <el-icon><right /></el-icon>
                </div>
                <div class="change-log-side change-log-after">
                  <div class="change-log-side-title">变更后</div>
                  <div class="change-log-field">
                    <span class="change-log-label">机构</span>
                    <span class="change-log-value">
                      <dict-tag v-if="item.newOrg" :options="orgOptions" :value="item.newOrg" />
                      <span v-else>-</span>
                    </span>
                  </div>
                  <div class="change-log-field">
                    <span class="change-log-label">管户经理</span>
                    <span class="change-log-value">{{ formatUser(item.newManager) }}</span>
                  </div>
                </div>
              </div>
              <div class="change-log-reason">
                <span class="change-log-label">变更原因</span>
                <span class="change-log-value">{{ item.changeReason || '-' }}</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-drawer>

    <el-dialog title="关联维护" v-model="relationOpen" width="760px" append-to-body>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" @click="openCustomerSelect">新增关联</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="success" plain icon="Star" :disabled="relationSingle" @click="handleSetMain">变为主客</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="danger" plain icon="Delete" :disabled="relationSingle" @click="handleDelRelation">删除关联</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="warning" plain icon="UserFilled" :disabled="claimDisabled" @click="handleClaimRelation">批量认领</el-button>
        </el-col>
      </el-row>
      <el-table v-loading="relationLoading" :data="relationRows" @selection-change="relationSelection = $event">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="主客" prop="mainCustomerFlag" width="100" align="center">
          <template #default="scope">{{ scope.row.mainCustomerFlag === '1' ? '主客' : '关联' }}</template>
        </el-table-column>
        <el-table-column label="客户名称" prop="customerName" width="160" show-overflow-tooltip />
        <el-table-column label="客户号" prop="customerNo" width="180" show-overflow-tooltip />
        <el-table-column label="客户内码" prop="customerId" width="150" show-overflow-tooltip />
        <el-table-column label="归属机构" prop="attributionOrg" width="120" align="center">
          <template #default="scope">
            <dict-tag :options="orgOptions" :value="scope.row.attributionOrg" />
          </template>
        </el-table-column>
        <el-table-column label="客户经理" prop="managerName" width="120" align="center">
          <template #default="scope">{{ formatManagerName(scope.row) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog title="客户分配到管户经理" v-model="assignOpen" width="520px" append-to-body>
      <el-form :model="assignForm" label-width="110px">
        <el-form-item label="选择记录">
          <el-input :model-value="selection.length + ' 条'" disabled />
        </el-form-item>
        <el-form-item label="新管户经理">
          <UserSelect v-model="assignForm.managerId" scope="crmAssignable" placeholder="请选择可分配管户经理" />
        </el-form-item>
        <el-form-item label="分解原因">
          <el-input v-model="assignForm.reason" type="textarea" :rows="3" placeholder="请输入分解原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="confirmAssign">保存</el-button>
        <el-button @click="assignOpen = false">关闭</el-button>
      </template>
    </el-dialog>

    <ContactRecordDialog ref="contactDialogRef" @success="getList" />
    <PortraitTagDialog ref="portraitTagDialogRef" @success="getList" @batch-import="openBatchTagDialog" />
    <AttributionBatchModifyDialog ref="batchModifyDialogRef" @success="getList" />

    <el-dialog title="暂缓触达标识" v-model="deferOpen" width="560px" append-to-body>
      <el-form :model="deferForm" label-width="100px">
        <el-form-item label="客户名称">
          <el-input v-model="deferForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="客户号">
          <el-input v-model="deferForm.customerNo" disabled />
        </el-form-item>
        <el-form-item label="管户机构">
          <dict-tag :options="orgOptions" :value="deferForm.attributionOrg" />
        </el-form-item>
        <el-form-item label="暂缓期限">
          <el-date-picker v-model="deferForm.deferRange" type="daterange" value-format="YYYY-MM-DD" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="暂缓理由">
          <el-input v-model="deferForm.reason" type="textarea" :rows="4" placeholder="请输入暂缓理由" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitDefer">上报</el-button>
        <el-button @click="deferOpen = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog title="机构调整" v-model="disputeOpen" width="620px" append-to-body>
      <el-form :model="disputeForm" label-width="110px">
        <el-form-item label="调整类型">
          <el-radio-group v-model="disputeForm.disputeType" @change="disputeForm.newOrg = undefined">
            <el-radio-button label="调入">调入</el-radio-button>
            <el-radio-button label="调出">调出</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="disputeForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="客户号">
          <el-input v-model="disputeForm.customerNo" disabled />
        </el-form-item>
        <el-form-item label="原管户机构">
          <dict-tag :options="orgOptions" :value="disputeForm.originalOrg" />
        </el-form-item>
        <el-form-item label="新管户机构">
          <el-select v-model="disputeForm.newOrg" placeholder="请选择新管户机构" filterable style="width: 100%">
            <el-option v-for="item in disputeOrgOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="调整理由">
          <el-input v-model="disputeForm.reason" type="textarea" :rows="4" placeholder="请输入调整理由" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitDispute">上报</el-button>
        <el-button @click="disputeOpen = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      title="批量打退标客户导入"
      v-model="batchTagOpen"
      width="620px"
      append-to-body
      :close-on-click-modal="false"
      @closed="resetBatchTagDialog"
    >
      <el-form label-position="top" class="batch-tag-form">
        <el-form-item label="客户文件" required>
          <el-upload
            ref="batchUploadRef"
            class="batch-tag-upload"
            drag
            :limit="1"
            accept=".xls,.xlsx"
            :disabled="batchImporting"
            :auto-upload="false"
            :on-change="handleBatchFileChange"
            :on-remove="handleBatchFileRemove"
            :on-exceed="handleBatchFileExceed"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或 <em>点击选择</em></div>
            <template #tip>
              <div class="el-upload__tip batch-tag-file-tip">
                请先 <el-link type="primary" :underline="false" @click.stop="handleDownloadBatchTagTemplate">下载模板</el-link>
                并填写客户号，仅支持 xls、xlsx。
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="目标标签" required>
          <el-cascader
            v-model="batchTagId"
            :options="batchTagOptions"
            :props="batchTagCascaderProps"
            :disabled="batchImporting"
            placeholder="请选择要批量打标或退标的标签"
            filterable
            clearable
            style="width: 100%"
            @change="batchImportResult = null"
          />
          <div v-if="batchSelectedTag && !batchSelectedTagMarkable" class="batch-tag-warning">
            该标签已禁用或过期，仅可执行批量退标。
          </div>
        </el-form-item>
      </el-form>

      <div v-if="batchImportResult" class="batch-tag-result">
        <el-alert
          :title="`处理完成：成功 ${batchImportResult.successCount || 0} 条，失败 ${batchImportResult.failureCount || 0} 条`"
          :type="batchImportFailures.length ? 'warning' : 'success'"
          :closable="false"
          show-icon
        />
        <el-table v-if="batchImportFailures.length" :data="batchImportFailures" max-height="220" size="small">
          <el-table-column label="行号" prop="rowNum" width="72" align="center" />
          <el-table-column label="客户号" prop="customerNo" width="180" show-overflow-tooltip />
          <el-table-column label="失败原因" prop="reason" min-width="220" show-overflow-tooltip />
        </el-table>
      </div>
      <template #footer>
        <el-button
          type="primary"
          icon="Plus"
          :loading="batchImporting && batchImportAction === 'MARK'"
          :disabled="batchSubmitDisabled || !batchSelectedTagMarkable"
          @click="submitBatchImport('MARK')"
        >批量打标</el-button>
        <el-button
          type="danger"
          icon="Minus"
          :loading="batchImporting && batchImportAction === 'UNMARK'"
          :disabled="batchSubmitDisabled"
          @click="submitBatchImport('UNMARK')"
        >批量退标</el-button>
        <el-button @click="batchTagOpen = false">返回</el-button>
      </template>
    </el-dialog>

    <el-dialog title="网格维护" v-model="gridOpen" width="560px" append-to-body>
      <el-form :model="gridForm" label-width="100px">
        <el-form-item label="客户名称">
          <el-input v-model="gridForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="街道/乡镇">
          <el-select v-model="gridForm.streetCode" placeholder="请选择" style="width: 100%" @change="gridForm.communityCode = undefined; gridForm.gridCode = undefined">
            <el-option v-for="item in streetNodes" :key="item.gridCode" :label="item.gridName" :value="item.gridCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="社区/村庄">
          <el-select v-model="gridForm.communityCode" :placeholder="gridForm.streetCode ? '请选择' : '请先选择街道/乡镇'" :disabled="!gridForm.streetCode" style="width: 100%" @change="gridForm.gridCode = undefined">
            <el-option v-for="item in gridCommunityNodes" :key="item.gridCode" :label="item.gridName" :value="item.gridCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="网格区域">
          <el-select v-model="gridForm.gridCode" :placeholder="gridForm.communityCode ? '请选择' : '请先选择社区/村庄'" :disabled="!gridForm.communityCode" style="width: 100%">
            <el-option v-for="item in gridAreaNodes" :key="item.gridCode" :label="item.gridName" :value="item.gridCode" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitGrid">保存</el-button>
        <el-button @click="gridOpen = false">关闭</el-button>
      </template>
    </el-dialog>

    <ColumnSettingsDialog
      v-model="columnDialogOpen"
      :columns="columns"
      :categories="dataTagCategories"
      :common-keys="COMMON_COLUMN_KEYS"
      tip="应用或保存后将按所选可见列重新查询列表"
      @apply="handleColumnsApply"
      @save="handleColumnsSave"
    />

    <el-dialog
      title="客户信息选择引用"
      v-model="customerSelectOpen"
      width="900px"
      append-to-body
      class="customer-select-dialog"
    >
      <SearchForm
        v-model="customerSelectQuery"
        :fields="customerSelectFields"
        label-width="74px"
        :reset-fields-on-reset="false"
        class="customer-select-search"
        @keydown.enter.prevent
        @search="handleCustomerSearch"
        @reset="resetCustomerSelect"
      />
      <common-table
        :data="customerSelectRows"
        :columns="customerSelectColumns"
        :loading="customerSearchLoading"
        :pagination="false"
        height="360"
        class="customer-select-table"
      >
        <template #customerSelectOrg="{ row }">
          <dict-tag :options="orgOptions" :value="row.attributionOrg" />
        </template>
        <template #customerSelectManager="{ row }">
          {{ formatManagerName(row) }}
        </template>
        <template #customerSelectActions="{ row }">
          <el-button link type="primary" icon="Link" class="customer-select-action" @click="quoteCustomer(row)">引用</el-button>
        </template>
      </common-table>
    </el-dialog>
  </div>
</template>

<script setup name="Attribution">
import { computed, getCurrentInstance, reactive, ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { saveAs } from 'file-saver'
import SearchForm from '@/components/SearchForm'
import {
  listAttribution,
  preciseSearch,
  assignManager,
  saveGrid,
  getGridTree,
  listRelation,
  addRelation,
  setMainCustomer,
  delRelation,
  claimRelation,
  listFeatureTagTree,
  downloadBatchTagImportTemplate,
  importTagCustomers,
  queryAttributionLoanDetail
  , exportAttributionLoanDetail
} from '@/api/szhl/crm/attribution'
import { getColumnConfig, saveColumnConfig } from '@/api/szhl/crm/column'
import { listDataTag } from '@/api/szhl/crm/dataTag'
import { searchCustomer } from '@/api/szhl/crm/customer'
import { listContactRecord } from '@/api/szhl/crm/contactRecord'
import ContactRecordDialog from '@/views/szhl/crm/components/ContactRecordDialog'
import PortraitTagDialog from '@/views/szhl/crm/components/PortraitTagDialog'
import AttributionBatchModifyDialog from '@/views/szhl/crm/components/AttributionBatchModifyDialog'
import PortraitTagQuerySelect from '@/views/szhl/crm/components/PortraitTagQuerySelect'
import ColumnSettingsDialog from '@/views/szhl/crm/components/ColumnSettingsDialog'
import CustomerLink from '@/views/szhl/crm/components/CustomerLink'
import { createDefer } from '@/api/szhl/crm/defer'
import { createDispute, listTransferInOrgs } from '@/api/szhl/crm/dispute'
import { getChangeLogs } from '@/api/szhl/crm/view'
import { listAdvancedQueryConditions } from '@/api/szhl/crm/advancedQuery'
import { formatMoney } from '@/utils/ruoyi'
import {
  formatDataTagLabel,
  formatDataTagBoolean,
  formatYuanToWan,
  isYuanAmountField
} from '@/utils/crmDataTag'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import { checkPermi } from '@/utils/permission'
import UserSelect from '@/components/UserSelect'
import CrmOrgSelect from '@/views/szhl/crm/components/CrmOrgSelect'
import { useCustomer360Nav } from '@/views/szhl/crm/composables/useCustomer360Nav'

const { proxy } = getCurrentInstance()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const managerOptions = useUserOptions()
const {
  crm_public_private: publicPrivateOptions,
  crm_customer_type: customerTypeOptions,
  crm_contact_way: contactWayOptions,
  crm_contact_result: contactResultOptions,
  crm_customer_attitude: attitudeOptions
} = proxy.useDict(
  'crm_public_private',
  'crm_customer_type',
  'crm_contact_way',
  'crm_contact_result',
  'crm_customer_attitude'
)
const router = useRouter()
const { openViewByNo } = useCustomer360Nav()
const IMAGE_QUERY_PATH = '/crm/attributionMgr/image'
const marketingStatusOptions = ref([
  { label: '正常', value: '正常' },
  { label: '暂缓', value: '暂缓' }
])

const PAGE_KEY = 'attribution-list'
// 数据字段列默认勾选项（字段集本身由 /crm/dataTag/list 动态下发）
const DEFAULT_VISIBLE_DATA_KEYS = ['mobileBank', 'validContract', 'loanCustomerFlag', 'wealthFlag', 'depositAvg', 'loanBalance']

const loading = ref(false)
const showSearch = ref(true)
const tableList = ref([])
const total = ref(0)
const selection = ref([])
const relationOpen = ref(false)
const relationLoading = ref(false)
const relationRows = ref([])
const relationSelection = ref([])
const relationCurrent = ref({})
const assignOpen = ref(false)
const contactDialogRef = ref()
const portraitTagDialogRef = ref()
const batchModifyDialogRef = ref()
const deferOpen = ref(false)
const disputeOpen = ref(false)
// 当前及辖属机构号（调入时新管户机构仅限该范围），null 表示未加载
const transferInOrgs = ref(null)
const disputeOrgOptions = computed(() => {
  const options = orgOptions.value || []
  if (disputeForm.value.disputeType !== '调入') return options
  const allowed = transferInOrgs.value || []
  return options.filter(item => allowed.includes(item.value))
})
const gridOpen = ref(false)
const columnDialogOpen = ref(false)
const customerSelectOpen = ref(false)
const customerSelectQuery = ref({ keyword: '' })
const customerSelectRows = ref([])
const customerSearchLoading = ref(false)
const customerSelectColumns = [
  { key: 'customerName', label: '客户名称', prop: 'customerName', width: 160, showOverflowTooltip: true },
  { key: 'customerNo', label: '客户号', prop: 'customerNo', width: 180, showOverflowTooltip: true },
  { key: 'customerId', label: '客户内码', prop: 'customerId', width: 150, showOverflowTooltip: true },
  { key: 'attributionOrg', label: '归属机构', prop: 'attributionOrg', width: 120, align: 'center', slot: 'customerSelectOrg' },
  { key: 'managerName', label: '管户经理', prop: 'managerName', width: 110, align: 'center', slot: 'customerSelectManager' },
  { key: 'actions', label: '操作', width: 100, align: 'center', fixed: 'right', slot: 'customerSelectActions' }
]
const touchHistoryOpen = ref(false)
const touchHistoryLoading = ref(false)
const touchHistoryRows = ref([])
const touchHistoryCustomer = ref({})
const loanDetailOpen = ref(false)
const loanDetailLoading = ref(false)
const loanDetailExporting = ref(false)
const loanDetailCustomer = ref({})
const loanDetailRows = ref([])
const loanDetailSummary = ref({ total: 0, contractTotal: 0, issueTotal: 0, balanceTotal: 0, weightedRate: 0 })
const loanDetailQuery = reactive({ customerId: '', reportDate: '', contractNo: '', guaranteeType: '', consolidated: false, pageNum: 1, pageSize: 10 })
const loanDetailColumns = [
  { key: 'reportDate', label: '数据日期', width: 110 },
  { key: 'orgNo', label: '机构号', width: 100 },
  { key: 'custNo', label: '客户号', width: 150 },
  { key: 'custName', label: '客户名称', width: 150 },
  { key: 'contractNo', label: '借款合同', width: 160, drill: true },
  { key: 'iouNum', label: '借据序号', width: 90 },
  { key: 'loanAcct', label: '贷款账号', width: 160 },
  { key: 'staidate', label: '发放日期', width: 110 },
  { key: 'stacdate', label: '到期日期', width: 110 },
  { key: 'loanUse', label: '贷款用途', width: 140 },
  { key: 'guaType', label: '担保方式', width: 110, drill: true },
  { key: 'staerate', label: '贷款利率', width: 100, drill: true },
  { key: 'repayment', label: '还款方式', width: 120 },
  { key: 'interestCycle', label: '结息周期', width: 100 },
  { key: 'rateAdjust', label: '利率调整方式', width: 130 },
  { key: 'repayAcct', label: '还款账号', width: 160 },
  { key: 'dyzrxdy', label: '第一责任人', width: 110 },
  { key: 'custType', label: '贷款对象', width: 110 },
  { key: 'loanAmt', label: '合同金额(元)', width: 120 },
  { key: 'grantAmt', label: '发放金额(元)', width: 120, drill: true },
  { key: 'loanBalance', label: '贷款余额(元)', width: 120 },
  { key: 'bnqxye', label: '表内欠息(元)', width: 120 },
  { key: 'bwqxye', label: '表外欠息(元)', width: 120 },
  { key: 'yjjx', label: '预结利息(元)', width: 120 },
  { key: 'stadcls4', label: '四级形态', width: 100 },
  { key: 'stafcls5', label: '五级形态', width: 100, drill: true },
  { key: 'staecls10', label: '十级形态', width: 100 },
  { key: 'loanCapname', label: '贷款科目名称', width: 150 },
  { key: 'loanCapno', label: '贷款科目号', width: 110 },
  { key: 'firstCla', label: '分类一级名称', width: 130 },
  { key: 'firstInv', label: '行业投向一级名称', width: 150 },
  { key: 'invest', label: '行业投向二级名称', width: 150 },
  { key: 'loanCha', label: '放款渠道', width: 100 },
  { key: 'useName', label: '贷款用途名称', width: 140 },
  { key: 'productCode', label: '贷款产品代码', width: 120 },
  { key: 'productName', label: '贷款产品名称', width: 140 }
]
const loanDetailVisibleColumns = ref(loanDetailColumns.slice(0, 25).map(column => column.key))
const visibleLoanDetailColumns = computed(() => loanDetailColumns.filter(column => loanDetailVisibleColumns.value.includes(column.key)))
const loanDetailTitle = computed(() => loanDetailCustomer.value.customerName ? `${loanDetailCustomer.value.customerName} - 贷款明细查询` : '贷款明细查询')

const changeLogOpen = ref(false)
const changeLogLoading = ref(false)
const changeLogRows = ref([])
const changeLogCustomer = ref({})
const featureTags = ref([])
const batchTagOpen = ref(false)
const batchImporting = ref(false)
const batchImportAction = ref('')
const batchUploadRef = ref()
const batchFile = ref(null)
const batchTagId = ref()
const batchImportResult = ref(null)
const gridNodes = ref([])
const advancedQueryOptions = ref([])

const batchTagCascaderProps = { value: 'id', label: 'tagName', children: 'children', emitPath: false }
const batchTagOptions = computed(() => buildBatchTagOptions(featureTags.value))
const batchSelectedTag = computed(() => featureTags.value.find(item => String(item.id) === String(batchTagId.value)))
const batchSelectedTagMarkable = computed(() => {
  const tag = batchSelectedTag.value
  return !!tag && tag.status !== 'inactive' && !isBatchTagExpired(tag.expireDate)
})
const batchSubmitDisabled = computed(() => batchImporting.value || !batchFile.value || !batchTagId.value)
const batchImportFailures = computed(() => batchImportResult.value?.failures || [])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    publicPrivateType: undefined,
    customerType: undefined,
    customerName: undefined,
    customerNo: undefined,
    attributionOrg: undefined,
    managerId: undefined,
    gridStreet: undefined,
    gridCommunity: undefined,
    gridArea: undefined,
    portraitTagIds: [],
    portraitTagMatchMode: 'ANY',
    marketingStatus: undefined,
    advancedQuery: undefined,
    orderByColumn: undefined,
    isAsc: undefined
  },
  assignForm: {},
  deferForm: {},
  disputeForm: {},
  gridForm: {}
})

const { queryParams, assignForm, deferForm, disputeForm, gridForm } = toRefs(data)

const columns = ref([
  { key: 'customerId', label: '客户内码', visible: false },
  { key: 'spouseName', label: '法代/配偶', visible: true },
  { key: 'spouseCustomerNo', label: '法代/配偶客户号', visible: true },
  { key: 'marketingStatus', label: '暂缓触达状态', visible: true },
  { key: 'last3mContactDate', label: '近三月触达日期', visible: true },
  { key: 'contactPhone', label: '联系电话', visible: true },
  { key: 'contactAddress', label: '联系地址', visible: true },
  { key: 'attributionOrg', label: '归属机构', visible: true },
  { key: 'grid', label: '常驻网格', visible: true },
  { key: 'portraitTags', label: '客户画像标签', visible: true },
  { key: 'managerName', label: '管户经理', visible: true },
  { key: 'updateTime', label: '最后更新日期', visible: true },
  { key: 'updateBy', label: '最后更新人', visible: true }
])
// 数据标签自定义分类（/crm/dataTag/list 的 categories），供列显示设定弹窗分组
const dataTagCategories = ref([])
const COMMON_COLUMN_KEYS = [
  'spouseName', 'spouseCustomerNo', 'marketingStatus', 'last3mContactDate', 'contactPhone',
  'attributionOrg', 'grid', 'portraitTags', 'managerName', 'updateTime', 'updateBy'
]

const multiple = computed(() => selection.value.length === 0)
const currentRow = computed(() => selection.value[0] || {})
const relationSingle = computed(() => relationSelection.value.length !== 1)
// 勾选行中管户机构为空的部分才是可认领对象
const claimableRelations = computed(() => relationSelection.value.filter(row => !row.attributionOrg))
const claimDisabled = computed(() => claimableRelations.value.length === 0)
const colVisible = computed(() => {
  const map = {}
  columns.value.forEach(item => { map[item.key] = item.visible })
  return map
})
const visibleDataColumns = computed(() => columns.value.filter(item => item.dataField && item.visible))
const sortOrders = ['descending', 'ascending']
const attributionTableColumns = computed(() => {
  const baseColumns = [
    { type: 'selection', width: 50, align: 'center', fixed: 'left' },
    {
      key: 'actions',
      label: '操作',
      width: 140,
      align: 'center',
      fixed: 'left',
      className: 'small-padding fixed-width',
      slot: 'actions'
    },
    {
      key: 'customerName',
      label: '客户名称',
      prop: 'customerName',
      width: 160,
      align: 'left',
      fixed: 'left',
      sortable: 'custom',
      sortOrders,
      showOverflowTooltip: true,
      slot: 'customerName'
    },
    {
      key: 'mainCustomerFlag',
      label: '主客',
      columnKey: 'mainCustomerFlag',
      width: 90,
      align: 'center',
      sortable: 'custom',
      sortOrders,
      showOverflowTooltip: true,
      slot: 'mainCustomerFlag'
    },
    {
      key: 'customerNo',
      label: '客户号',
      prop: 'customerNo',
      width: 180,
      sortable: 'custom',
      sortOrders,
      showOverflowTooltip: true,
      slot: 'customerNo'
    },
    { key: 'customerId', label: '客户内码', prop: 'customerId', width: 150, showOverflowTooltip: true, visible: colVisible.value.customerId },
    { key: 'spouseName', label: '法代/配偶', prop: 'spouseName', width: 150, showOverflowTooltip: true, visible: colVisible.value.spouseName },
    { key: 'spouseCustomerNo', label: '法代/配偶客户号', prop: 'spouseCustomerNo', width: 180, showOverflowTooltip: true, visible: colVisible.value.spouseCustomerNo },
    {
      key: 'marketingStatus',
      label: '暂缓触达状态',
      prop: 'marketingStatus',
      width: 140,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.marketingStatus,
      slot: 'marketingStatus'
    },
    {
      key: 'last3mContactDate',
      label: '近三月触达日期',
      prop: 'last3mContactDate',
      width: 160,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.last3mContactDate,
      formatter: row => proxy.parseTime(row.last3mContactDate, '{y}-{m}-{d}') || ''
    },
    { key: 'contactPhone', label: '联系电话', prop: 'contactPhone', width: 150, showOverflowTooltip: true, visible: colVisible.value.contactPhone },
    { key: 'contactAddress', label: '联系地址', prop: 'contactAddress', width: 280, showOverflowTooltip: true, visible: colVisible.value.contactAddress },
    {
      key: 'attributionOrg',
      label: '归属机构',
      prop: 'attributionOrg',
      width: 150,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.attributionOrg,
      slot: 'attributionOrg'
    },
    {
      key: 'grid',
      label: '常驻网格',
      width: 240,
      showOverflowTooltip: true,
      visible: colVisible.value.grid,
      formatter: row => formatGrid(row)
    },
    {
      key: 'portraitTags',
      label: '客户画像标签',
      prop: 'portraitTagNames',
      width: 240,
      visible: colVisible.value.portraitTags,
      slot: 'portraitTags'
    },
    {
      key: 'managerName',
      label: '管户经理',
      prop: 'managerName',
      width: 130,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.managerName,
      formatter: row => formatManagerName(row)
    }
  ]
  // 审计列（最后更新日期、最后更新人等）始终排在最后，新增业务数据列插入其前
  const auditColumns = [
    {
      key: 'updateTime',
      label: '最后更新日期',
      prop: 'updateTime',
      width: 140,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.updateTime,
      formatter: row => proxy.parseTime(row.updateTime, '{y}-{m}-{d}')
    },
    {
      key: 'updateBy',
      label: '最后更新人',
      prop: 'updateBy',
      width: 130,
      align: 'center',
      showOverflowTooltip: true,
      visible: colVisible.value.updateBy,
      slot: 'updateBy'
    }
  ]
  const dataColumns = visibleDataColumns.value.map(col => {
    // 金额/计数列千分位：dataType 兼容物理类型（decimal/bigint）与标签定义值类型（DECIMAL/INTEGER）
    const dataType = String(col.dataType || '').toLowerCase()
    const isAmount = !col.tagColumn && ['decimal', 'numeric', 'double', 'float'].includes(dataType)
    const isCount = !col.tagColumn && dataType.includes('int')
    const isYuanAmount = isYuanAmountField(col)
    return {
      key: col.key,
      label: col.label,
      prop: col.key,
      width: col.tagColumn ? 140 : 160,
      align: col.tagColumn ? 'center' : 'right',
      showOverflowTooltip: true,
      ...(col.tagColumn
        ? {
            formatter: row => formatDataTagBoolean(row[col.key])
          }
        : {}),
      ...(isAmount || isCount
        ? {
            className: 'amount-cell',
            formatter: row => isYuanAmount
              ? formatYuanToWan(row[col.key])
              : formatMoney(row[col.key], isAmount ? 2 : 0)
          }
        : {})
    }
  })
  return baseColumns.concat(dataColumns, auditColumns)
})
const touchHistoryTitle = computed(() => touchHistoryCustomer.value.customerName ? `${touchHistoryCustomer.value.customerName} - 触达记录` : '触达记录')
const changeLogTitle = computed(() => changeLogCustomer.value.customerName ? `${changeLogCustomer.value.customerName} - 管户变更记录` : '管户变更记录')
// 街道/乡镇 = 网格规划树一级节点
const streetNodes = computed(() => {
  return gridNodes.value.filter(item => item.level === 1)
})
const queryCommunityNodes = computed(() => {
  const street = streetNodes.value.find(item => item.gridName === queryParams.value.gridStreet)
  return street ? gridNodes.value.filter(item => item.parentCode === street.gridCode) : []
})
const queryGridAreaNodes = computed(() => {
  const community = queryCommunityNodes.value.find(item => item.gridName === queryParams.value.gridCommunity)
  return community ? gridNodes.value.filter(item => item.parentCode === community.gridCode) : []
})
const gridCommunityNodes = computed(() => {
  return gridForm.value.streetCode ? gridNodes.value.filter(item => item.parentCode === gridForm.value.streetCode) : []
})
const gridAreaNodes = computed(() => {
  return gridForm.value.communityCode ? gridNodes.value.filter(item => item.parentCode === gridForm.value.communityCode) : []
})
const searchFields = computed(() => [
  {
    label: '公私类别',
    prop: 'publicPrivateType',
    type: 'select',
    placeholder: '请选择',
    options: publicPrivateOptions.value || []
  },
  {
    label: '客户类别',
    prop: 'customerType',
    type: 'select',
    placeholder: '请选择',
    options: customerTypeOptions.value || []
  },
  {
    label: '客户名称',
    prop: 'customerName',
    type: 'input',
    placeholder: '请输入客户名称'
  },
  {
    label: '客户号',
    prop: 'customerNo',
    type: 'input',
    placeholder: '请输入客户号'
  },
  {
    label: '归属机构',
    prop: 'attributionOrg',
    type: 'slot',
    slotName: 'attributionOrg'
  },
  {
    label: '管户经理',
    prop: 'managerId',
    type: 'userSelect',
    placeholder: '可输入姓名或工号'
  },
  {
    label: '街道/乡镇',
    prop: 'gridStreet',
    type: 'select',
    placeholder: '请选择',
    options: streetNodes.value.map(item => ({ label: item.gridName, value: item.gridName })),
    change: () => {
      queryParams.value.gridCommunity = undefined
      queryParams.value.gridArea = undefined
    }
  },
  {
    label: '社区/村庄',
    prop: 'gridCommunity',
    type: 'select',
    placeholder: '请选择',
    options: queryCommunityNodes.value.map(item => ({ label: item.gridName, value: item.gridName })),
    change: () => {
      queryParams.value.gridArea = undefined
    }
  },
  {
    label: '网格区域',
    prop: 'gridArea',
    type: 'select',
    placeholder: '请选择',
    options: queryGridAreaNodes.value.map(item => ({ label: item.gridName, value: item.gridCode }))
  },
  {
    label: '画像标签',
    prop: 'portraitTagIds',
    type: 'slot',
    slotName: 'portraitTag'
  },
  {
    label: '暂缓触达',
    prop: 'marketingStatus',
    type: 'select',
    placeholder: '请选择',
    options: marketingStatusOptions.value || []
  },
  {
    label: '高级查询',
    prop: 'advancedQuery',
    type: 'select',
    placeholder: '请选择',
    options: advancedQueryOptions.value || []
  }
])
const customerSelectFields = [
  {
    label: '关键字',
    prop: 'keyword',
    type: 'input',
    placeholder: '请输入客户名称或客户号'
  }
]

// 普通列表只查询当前可见动态列（后端按启用定义与 Registry 白名单取交集）。
// 全部隐藏时传哨兵值 NONE：空串会被 tansParams 丢参，导致后端误判为旧客户端而回落默认列。
function visibleDataFields () {
  return columns.value.filter(item => item.dataField && item.visible).map(item => item.key).join(',') || 'NONE'
}

// 精准搜索结果展示期间，列设置变更不触发普通列表重查，避免覆盖精准结果
const exactSearchActive = ref(false)

function getList () {
  exactSearchActive.value = false
  loading.value = true
  listAttribution({ ...queryParams.value, dataFields: visibleDataFields() }).then(res => {
    tableList.value = res.rows
    total.value = res.total
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery () {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery () {
  Object.assign(queryParams.value, {
    pageNum: 1,
    publicPrivateType: undefined,
    customerType: undefined,
    customerName: undefined,
    customerNo: undefined,
    attributionOrg: undefined,
    managerId: undefined,
    gridStreet: undefined,
    gridCommunity: undefined,
    gridArea: undefined,
    portraitTagIds: [],
    portraitTagMatchMode: 'ANY',
    marketingStatus: undefined,
    advancedQuery: undefined,
    orderByColumn: undefined,
    isAsc: undefined
  })
  getList()
}

function handleSelectionChange (rows) {
  selection.value = rows
}

function handleSortChange (column) {
  queryParams.value.orderByColumn = column.order ? column.prop : undefined
  queryParams.value.isAsc = column.order || undefined
  getList()
}

function formatGrid (row) {
  return [row.gridStreet, row.gridCommunity].filter(Boolean).join('/')
}

function parseDateEndValue (value) {
  if (!value) return NaN
  if (typeof value === 'number') return String(value).length === 10 ? value * 1000 : value
  if (value instanceof Date) {
    const date = new Date(value.getTime())
    if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0) {
      date.setHours(23, 59, 59, 999)
    }
    return date.getTime()
  }
  const text = String(value).trim()
  const match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4] || 0), Number(match[5] || 0), Number(match[6] || 0))
    : new Date(text)
  if (Number.isNaN(date.getTime())) return NaN
  if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0) {
    date.setHours(23, 59, 59, 999)
  }
  return date.getTime()
}

function isEffectiveDefer (row) {
  return parseDateEndValue(row?.deferEndDate) > Date.now()
}

function formatDate (value) {
  return proxy.parseTime(value, '{y}-{m}-{d}') || ''
}

function formatUser (value) {
  return formatUserDisplayName(managerOptions.value, value)
}

function formatManagerName (row) {
  const manager = row.managerName || row.managerId
  return formatUserDisplayName(managerOptions.value, manager, '')
}

function portraitTagList (value) {
  if (!Array.isArray(value)) return []
  return value
    .filter(tag => tag && tag.tagId !== undefined && tag.tagName)
    .map(tag => ({
      tagId: String(tag.tagId),
      tagName: tag.tagName,
      nature: tag.nature || 'neutral'
    }))
}

function loadFeatureTags () {
  listFeatureTagTree({}).then(res => {
    featureTags.value = res.data || []
  })
}

function loadGridTree () {
  getGridTree().then(res => {
    gridNodes.value = res.data || []
  })
}

// 数据字段列从后端读取（crm_customer_data_tag 表结构元数据）
function loadDataTagMeta () {
  return listDataTag().then(res => {
    const fields = (res.data && res.data.fields) || []
    dataTagCategories.value = (res.data && res.data.categories) || []
    const dataColumns = []
    const sortedFields = [...fields].sort((a, b) => a.ordinalPosition - b.ordinalPosition)
    sortedFields.forEach(item => {
      const existing = columns.value.find(column => !column.dataField && column.key === item.fieldName)
      if (existing) {
        existing.subjectScope = item.subjectScope
        existing.categoryId = item.categoryId
        return
      }
      dataColumns.push({
        key: item.fieldName,
        label: formatDataTagLabel(item.labelName, item.unit),
        visible: item.defaultVisible == null
          ? DEFAULT_VISIBLE_DATA_KEYS.includes(item.fieldName)
          : item.defaultVisible === true,
        dataField: true,
        tagColumn: item.tagColumn,
        dataType: item.dataType,
        unit: item.unit,
        subjectScope: item.subjectScope,
        categoryId: item.categoryId
      })
    })
    columns.value = columns.value.filter(item => !item.dataField).concat(dataColumns)
  })
}

function loadColumnConfig () {
  return getColumnConfig(PAGE_KEY).then(res => {
    if (res.data && res.data.columns) {
      try {
        applyColumnKeys(JSON.parse(res.data.columns))
      } catch {
        // 配置格式异常时保持默认列
      }
    }
  })
}

function openRelation (row = currentRow.value) {
  relationCurrent.value = row
  relationOpen.value = true
  loadRelationList()
}

// 点击「主客」标签直接打开关联维护
function handleMainTagClick (row) {
  if (!checkPermi(['crm:attribution:relation'])) return
  openRelation(row)
}

function loadRelationList () {
  relationLoading.value = true
  listRelation(relationCurrent.value.customerId).then(res => {
    relationRows.value = res.data || []
  }).finally(() => {
    relationLoading.value = false
  })
}

function openCustomerSelect () {
  resetCustomerSelect()
  customerSelectOpen.value = true
}

function resetCustomerSelect () {
  customerSelectQuery.value.keyword = ''
  customerSelectRows.value = []
}

function handleCustomerSearch () {
  if (!customerSelectQuery.value.keyword) {
    proxy.$modal.msgWarning('请输入客户名称或客户号')
    return
  }
  customerSearchLoading.value = true
  searchCustomer(customerSelectQuery.value.keyword).then(res => {
    customerSelectRows.value = res.data || []
  }).finally(() => {
    customerSearchLoading.value = false
  })
}

function quoteCustomer (row) {
  addRelation({ customerId: relationCurrent.value.customerId, relationCustomerId: row.customerId }).then(() => {
    customerSelectOpen.value = false
    proxy.$modal.msgSuccess('新增关联成功')
    loadRelationList()
  })
}

function handleSetMain () {
  const row = relationSelection.value[0]
  setMainCustomer(row.customerId).then(() => {
    proxy.$modal.msgSuccess('已设置为主客')
    loadRelationList()
  })
}

function handleDelRelation () {
  const row = relationSelection.value[0]
  proxy.$modal.confirm(`是否确认将客户"${row.customerName}"移出关联组？`).then(() => {
    return delRelation(row.customerId)
  }).then(() => {
    proxy.$modal.msgSuccess('已删除关联')
    loadRelationList()
  }).catch(() => {})
}

function handleClaimRelation () {
  const rows = claimableRelations.value
  const skipped = relationSelection.value.length - rows.length
  const tip = skipped > 0
    ? `将认领 ${rows.length} 个管户机构为空的客户到本人所在机构，另有 ${skipped} 个已有管户机构的客户将跳过，是否继续？`
    : `是否确认将选中的 ${rows.length} 个客户认领到本人所在机构？`
  proxy.$modal.confirm(tip).then(() => {
    return claimRelation({
      customerId: relationCurrent.value.customerId,
      customerIds: rows.map(row => row.customerId)
    })
  }).then(() => {
    proxy.$modal.msgSuccess('认领成功')
    loadRelationList()
    getList()
  }).catch(() => {})
}

function openAssign () {
  assignForm.value = {
    managerId: undefined,
    reason: ''
  }
  assignOpen.value = true
}

function confirmAssign () {
  if (!assignForm.value.managerId) {
    proxy.$modal.msgWarning('请选择新管户经理')
    return
  }
  proxy.$modal.confirm('继续操作原管户经理将被替换为新管户经理，是否继续？').then(() => {
    return assignManager({
      customerIds: selection.value.map(row => row.customerId),
      managerId: assignForm.value.managerId,
      reason: assignForm.value.reason
    })
  }).then(() => {
    assignOpen.value = false
    proxy.$modal.msgSuccess('管户分配已保存')
    getList()
  }).catch(() => {})
}

function openContact (row = currentRow.value) {
  if (!row) return
  contactDialogRef.value.open({
    customerId: row.customerId,
    customerName: row.customerName,
    contactPhone: row.contactPhone
  })
}

function openDefer (row = currentRow.value) {
  deferForm.value = {
    customerId: row.customerId,
    customerName: row.customerName,
    customerNo: row.customerNo,
    attributionOrg: row.attributionOrg,
    deferRange: [],
    reason: ''
  }
  deferOpen.value = true
}

function submitDefer () {
  const range = deferForm.value.deferRange || []
  if (range.length !== 2) {
    proxy.$modal.msgWarning('请选择暂缓期限')
    return
  }
  createDefer({
    customerId: deferForm.value.customerId,
    deferStart: range[0],
    deferEnd: range[1],
    reason: deferForm.value.reason
  }).then(() => {
    deferOpen.value = false
    proxy.$modal.msgSuccess('暂缓触达申请已上报')
  })
}

function openDispute (row = currentRow.value) {
  disputeForm.value = {
    customerId: row.customerId,
    disputeType: '调入',
    customerName: row.customerName,
    customerNo: row.customerNo,
    originalOrg: row.attributionOrg,
    newOrg: undefined,
    reason: ''
  }
  disputeOpen.value = true
  if (transferInOrgs.value === null) {
    listTransferInOrgs().then(res => {
      transferInOrgs.value = res.data || []
    })
  }
}

function submitDispute () {
  if (!disputeForm.value.disputeType) {
    proxy.$modal.msgWarning('请选择调整类型')
    return
  }
  if (!disputeForm.value.newOrg) {
    proxy.$modal.msgWarning('请选择新管户机构')
    return
  }
  createDispute({
    customerId: disputeForm.value.customerId,
    disputeType: disputeForm.value.disputeType,
    newOrg: disputeForm.value.newOrg,
    reason: disputeForm.value.reason
  }).then(() => {
    disputeOpen.value = false
    if (!disputeForm.value.originalOrg) {
      proxy.$modal.msgSuccess('无原归属机构，已直接调整归属机构')
      getList()
    } else {
      proxy.$modal.msgSuccess('机构调整申请已发起')
    }
  })
}

function openPortraitTagDialog () {
  if (selection.value.length === 0) {
    proxy.$modal.msgWarning('请选择客户记录')
    return
  }
  portraitTagDialogRef.value?.open(selection.value)
}

function openBatchTagDialog () {
  resetBatchTagDialog()
  batchTagOpen.value = true
}

function resetBatchTagDialog () {
  batchImporting.value = false
  batchImportAction.value = ''
  batchFile.value = null
  batchTagId.value = undefined
  batchImportResult.value = null
  batchUploadRef.value?.clearFiles()
}

function handleBatchFileChange (file) {
  const name = file?.name || file?.raw?.name || ''
  if (!/\.(xls|xlsx)$/i.test(name)) {
    proxy.$modal.msgWarning('仅支持 xls、xlsx 文件')
    batchUploadRef.value?.clearFiles()
    batchFile.value = null
    return
  }
  batchFile.value = file.raw || file
  batchImportResult.value = null
}

function handleBatchFileRemove () {
  batchFile.value = null
  batchImportResult.value = null
}

function handleBatchFileExceed (files) {
  batchUploadRef.value?.clearFiles()
  const file = files && files[0]
  if (file) batchUploadRef.value?.handleStart(file)
}

async function handleDownloadBatchTagTemplate () {
  const blob = await downloadBatchTagImportTemplate()
  saveAs(new Blob([blob]), '批量打退标客户导入模板.xlsx')
}

async function submitBatchImport (action) {
  if (!batchFile.value) {
    proxy.$modal.msgWarning('请选择客户文件')
    return
  }
  if (!batchTagId.value) {
    proxy.$modal.msgWarning('请选择目标标签')
    return
  }
  if (action === 'MARK' && !batchSelectedTagMarkable.value) {
    proxy.$modal.msgWarning('该标签已禁用或过期，不可批量打标')
    return
  }

  const data = new FormData()
  data.append('file', batchFile.value)
  data.append('tagId', String(batchTagId.value))
  data.append('action', action)
  batchImporting.value = true
  batchImportAction.value = action
  try {
    const response = await importTagCustomers(data)
    batchImportResult.value = response.data || { successCount: 0, failureCount: 0, failures: [] }
    const actionText = action === 'MARK' ? '批量打标' : '批量退标'
    const successCount = batchImportResult.value.successCount || 0
    const failureCount = batchImportResult.value.failureCount || 0
    if (failureCount > 0) {
      proxy.$modal.msgWarning(`${actionText}完成：成功 ${successCount} 条，失败 ${failureCount} 条`)
    } else {
      proxy.$modal.msgSuccess(`${actionText}完成：成功 ${successCount} 条`)
      batchTagOpen.value = false
    }
    getList()
  } finally {
    batchImporting.value = false
    batchImportAction.value = ''
  }
}

function buildBatchTagOptions (rows) {
  const sourceRows = rows || []
  const nodeMap = {}
  sourceRows.forEach(item => {
    nodeMap[String(item.id)] = {
      id: item.id,
      tagName: batchTagOptionLabel(item),
      level: Number(item.level),
      children: []
    }
  })
  const roots = []
  sourceRows.forEach(item => {
    const node = nodeMap[String(item.id)]
    const parent = nodeMap[String(item.parentId)]
    if (parent) parent.children.push(node)
    else roots.push(node)
  })
  return roots.map(pruneBatchTagOption).filter(Boolean)
}

function pruneBatchTagOption (node) {
  if (node.level === 3) {
    return { id: node.id, tagName: node.tagName }
  }
  const children = node.children.map(pruneBatchTagOption).filter(Boolean)
  return children.length ? { ...node, children } : null
}

function batchTagOptionLabel (tag) {
  if (Number(tag.level) !== 3) return tag.tagName
  if (tag.status === 'inactive') return `${tag.tagName}（已禁用）`
  if (isBatchTagExpired(tag.expireDate)) return `${tag.tagName}（已过期）`
  return tag.tagName
}

function isBatchTagExpired (expireDate) {
  if (!expireDate) return false
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return String(expireDate).slice(0, 10) < `${now.getFullYear()}-${month}-${day}`
}

function openGrid (row = currentRow.value) {
  const current = gridNodes.value.find(item => item.gridCode === row.gridCode)
  const community = current ? gridNodes.value.find(item => item.gridCode === current.parentCode) : undefined
  gridForm.value = {
    customerId: row.customerId,
    customerName: row.customerName,
    streetCode: community ? community.parentCode : undefined,
    communityCode: community ? community.gridCode : undefined,
    gridCode: current ? current.gridCode : undefined
  }
  gridOpen.value = true
}

function submitGrid () {
  if (!gridForm.value.gridCode) {
    proxy.$modal.msgWarning('请选择网格区域')
    return
  }
  saveGrid({
    customerIds: [gridForm.value.customerId],
    gridCode: gridForm.value.gridCode
  }).then(() => {
    gridOpen.value = false
    proxy.$modal.msgSuccess('网格信息已保存')
    getList()
  })
}

function openImageManage (row) {
  const target = row && row.customerNo ? row : currentRow.value
  if (!target.customerNo) {
    proxy.$modal.msgWarning('请选择一条客户记录')
    return
  }
  router.push({
    path: IMAGE_QUERY_PATH,
    query: {
      customerName: target.userName || target.customerName,
      customerNo: target.customerNo
    }
  })
}

function openCustomer360 (row) {
  openViewByNo(row.customerNo, row.publicPrivateType, row.customerName)
}

function yesterdayDateText () {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - 1)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function openLoanDetail (row) {
  if (!row || !row.customerId) {
    proxy.$modal.msgWarning('缺少客户内码，无法查询贷款明细')
    return
  }
  loanDetailCustomer.value = row
  loanDetailQuery.customerId = row.customerId
  loanDetailQuery.reportDate = yesterdayDateText()
  loanDetailQuery.contractNo = ''
  loanDetailQuery.guaranteeType = ''
  loanDetailQuery.consolidated = false
  loanDetailQuery.pageNum = 1
  loanDetailQuery.pageSize = 10
  loanDetailOpen.value = true
  loadLoanDetail()
}

function loanDateDisabled (date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() >= today.getTime()
}

function handleLoanDateChange (value) {
  if (!value) {
    loanDetailQuery.reportDate = yesterdayDateText()
    return
  }
  loanDetailQuery.pageNum = 1
  loadLoanDetail()
}

function resetLoanDetailQuery () {
  loanDetailQuery.reportDate = yesterdayDateText()
  loanDetailQuery.contractNo = ''
  loanDetailQuery.guaranteeType = ''
  loanDetailQuery.consolidated = false
  loanDetailQuery.pageNum = 1
  loadLoanDetail()
}

function handleLoanSizeChange () {
  loanDetailQuery.pageNum = 1
  loadLoanDetail()
}

function setLoanColumns (selectAll) {
  loanDetailVisibleColumns.value = selectAll ? loanDetailColumns.slice(0, 30).map(column => column.key) : []
}

function formatLoanWan (value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? formatMoney(amount / 10000, 2) : '0.00'
}

function formatLoanRate (value) {
  const rate = Number(value)
  return Number.isFinite(rate) ? rate.toFixed(4) : '0.0000'
}

function formatLoanCell (row, column) {
  const value = row && row[column.key]
  if (value === null || value === undefined || value === '') return '-'
  if (['loanAmt', 'grantAmt', 'loanBalance', 'bnqxye', 'bwqxye', 'yjjx'].includes(column.key)) {
    return formatMoney(Number(value), 2)
  }
  if (column.key === 'staerate') return formatLoanRate(value) + '%'
  if (['reportDate', 'staidate', 'stacdate', 'staldate', 'lastClatime', 'lsredate', 'nxredate'].includes(column.key)) {
    return formatDate(value) || '-'
  }
  return value
}

async function loadLoanDetail () {
  if (!loanDetailQuery.customerId || !loanDetailQuery.reportDate) return
  loanDetailLoading.value = true
  try {
    const response = await queryAttributionLoanDetail({ ...loanDetailQuery })
    const page = response.data || {}
    loanDetailRows.value = page.rows || []
    loanDetailSummary.value = page.summary || { total: 0, contractTotal: 0, issueTotal: 0, balanceTotal: 0, weightedRate: 0 }
    if (!loanDetailRows.value.length) {
      proxy.$modal.msgWarning('该数据日期暂无贷款明细')
    }
  } catch (error) {
    loanDetailRows.value = []
    loanDetailSummary.value = { total: 0, contractTotal: 0, issueTotal: 0, balanceTotal: 0, weightedRate: 0 }
  } finally {
    loanDetailLoading.value = false
  }
}

function showLoanDrillPending () {
  proxy.$modal.msgWarning('该下钻明细待开发')
}

async function exportLoanDetailRows () {
  if (!loanDetailQuery.customerId || !loanDetailQuery.reportDate) return
  loanDetailExporting.value = true
  try {
    const response = await exportAttributionLoanDetail({ ...loanDetailQuery })
    const rows = response.data || []
    if (!rows.length) {
      proxy.$modal.msgWarning('当前筛选条件暂无可导出的贷款明细')
      return
    }
    const headers = visibleLoanDetailColumns.value.map(column => column.label)
    const values = rows.map(row => visibleLoanDetailColumns.value.map(column => formatLoanCell(row, column)))
    const XLSX = await import('xlsx')
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...values])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, '贷款明细')
    XLSX.writeFile(workbook, `贷款明细_${loanDetailCustomer.value.customerName || '客户'}_${loanDetailQuery.reportDate}.xlsx`)
  } finally {
    loanDetailExporting.value = false
  }
}

function hasFollowupRecords (row) {
  return Array.isArray(row.followupRecords) && row.followupRecords.length > 0
}

function touchHistoryRowClassName ({ row }) {
  return hasFollowupRecords(row) ? '' : 'touch-history-row-no-followup'
}

function openCustomerTouchHistory (row) {
  if (!row.customerId) {
    proxy.$modal.msgWarning('未获取到客户信息')
    return
  }
  touchHistoryCustomer.value = row
  touchHistoryOpen.value = true
  touchHistoryLoading.value = true
  listContactRecord(row.customerId).then(res => {
    touchHistoryRows.value = res.data || []
  }).finally(() => {
    touchHistoryLoading.value = false
  })
}

function openChangeLog (row) {
  if (!row.customerNo) {
    proxy.$modal.msgWarning('未获取到客户信息')
    return
  }
  changeLogCustomer.value = row
  changeLogOpen.value = true
  changeLogLoading.value = true
  getChangeLogs(row.customerNo).then(res => {
    changeLogRows.value = res.data || []
  }).finally(() => {
    changeLogLoading.value = false
  })
}

function handleExactSearch () {
  if (!queryParams.value.customerNo) {
    proxy.$modal.msgWarning('请输入客户号')
    return
  }
  exactSearchActive.value = true
  loading.value = true
  preciseSearch(queryParams.value.customerNo).then(res => {
    tableList.value = res.data || []
    total.value = tableList.value.length
  }).finally(() => {
    loading.value = false
  })
}

function handleExport () {
  const params = { ...queryParams.value }
  delete params.pageNum
  delete params.pageSize
  params.exportFields = columns.value.filter(item => item.visible).map(item => item.key).join(',')
  if (Array.isArray(params.portraitTagIds)) {
    params.portraitTagIds = params.portraitTagIds.join(',')
  }
  proxy.download('/crm/attribution/export', params, '客户归属数据.xlsx')
}

function applyColumnKeys (keys) {
  columns.value.forEach(item => {
    item.visible = keys.includes(item.key)
  })
}

// 新勾选列后端此前未查询，应用列设置后立即重查；精准结果视图下不重查（精准接口返回固定结构）
function refreshAfterColumnsChange () {
  if (!exactSearchActive.value) {
    getList()
  }
}

function handleColumnsApply (keys) {
  applyColumnKeys(keys)
  columnDialogOpen.value = false
  refreshAfterColumnsChange()
}

function handleColumnsSave (keys) {
  applyColumnKeys(keys)
  refreshAfterColumnsChange()
  saveColumnConfig({
    pageKey: PAGE_KEY,
    columns: JSON.stringify(keys)
  }).then(() => {
    columnDialogOpen.value = false
    proxy.$modal.msgSuccess('个性化列配置已保存')
  })
}

function loadAdvancedQueryOptions () {
  listAdvancedQueryConditions('ATTRIBUTION').then(res => {
    advancedQueryOptions.value = (res.data || []).map(item => ({
      label: item.label,
      value: item.code
    }))
  })
}

loadAdvancedQueryOptions()
loadFeatureTags()
loadGridTree()
// 先加载字段元数据与用户列配置，再发首个列表请求；加载失败时按默认列查询
loadDataTagMeta().then(() => loadColumnConfig()).catch(() => {}).finally(() => getList())
</script>

<style scoped>
.loan-detail-dialog {
  max-width: calc(100vw - 32px);
}

.loan-detail-dialog :deep(.el-dialog__body) {
  padding-top: 12px;
}

.loan-detail-filter {
  padding: 12px 14px 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
}

.loan-detail-filter :deep(.el-form-item) {
  margin-right: 14px;
  margin-bottom: 12px;
}

.loan-detail-filter :deep(.el-date-editor),
.loan-detail-filter :deep(.el-input),
.loan-detail-filter :deep(.el-select) {
  width: 170px;
}

.loan-detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 24px;
  min-height: 42px;
  padding: 8px 2px;
  color: var(--el-text-color-regular);
  font-variant-numeric: tabular-nums;
}

.loan-detail-meta span:first-child {
  color: var(--el-text-color-secondary);
}

.loan-detail-dialog :deep(.el-table .cell) {
  white-space: nowrap;
}

.loan-detail-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 14px;
}

.loan-column-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.loan-column-popover :deep(.el-checkbox-group) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-height: 360px;
  overflow-y: auto;
}

.loan-column-popover :deep(.el-checkbox) {
  min-width: 0;
  margin-right: 8px;
}

.attribution-table :deep(.cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attribution-table :deep(.el-link),
.attribution-table :deep(.el-tag) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.attribution-table :deep(.el-link__inner) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 金额/计数列：等宽数字，千分位后各行数位纵向对齐 */
.attribution-table :deep(.amount-cell) {
  font-variant-numeric: tabular-nums;
}

.batch-modify-entry {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
  font-weight: 600;
}

.batch-modify-entry:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-8);
}

.batch-tag-upload,
.batch-tag-upload :deep(.el-upload),
.batch-tag-upload :deep(.el-upload-dragger) {
  width: 100%;
}

.batch-tag-file-tip {
  line-height: 20px;
}

.batch-tag-warning {
  margin-top: 6px;
  color: #e6a23c;
  font-size: 12px;
  line-height: 18px;
}

.batch-tag-result {
  margin-top: 8px;
}

.batch-tag-result :deep(.el-table) {
  margin-top: 12px;
}

.main-customer-tag {
  cursor: pointer;
}

.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}

.row-actions .el-button {
  margin-left: 0;
}

.row-actions-more {
  line-height: 1;
}

.touch-history-table :deep(.touch-history-row-no-followup .el-table__expand-column .cell) {
  visibility: hidden;
  pointer-events: none;
}

.touch-followup-wrap {
  padding: 8px 12px 12px 44px;
  background: #fafafa;
}

.touch-followup-title {
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
}

.touch-followup-table :deep(.cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.change-log-drawer {
  min-height: 240px;
  padding: 4px 4px 16px;
}

.change-log-timeline {
  padding: 4px 6px 0;
}

.change-log-item {
  padding: 10px 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}

.change-log-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: #303133;
  font-weight: 500;
}

.change-log-operator {
  flex: 0 0 auto;
  color: #606266;
  font-weight: 400;
}

.change-log-label {
  color: #909399;
}

.change-log-value {
  min-width: 0;
  color: #303133;
}

.change-log-compare {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px minmax(0, 1fr);
  align-items: stretch;
  gap: 8px;
}

.change-log-side {
  min-width: 0;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}

.change-log-before {
  border-color: #e4e7ed;
}

.change-log-after {
  border-color: #c6e2ff;
  background: #f5f9ff;
}

.change-log-side-title {
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
}

.change-log-field {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  column-gap: 8px;
  line-height: 24px;
}

.change-log-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 18px;
}

.change-log-reason {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  column-gap: 10px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.defer-end-date {
  color: #f56c6c;
  font-weight: 500;
}

.dialog-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 12px;
}

.dialog-form-grid :deep(.el-form-item) {
  margin-bottom: 12px;
}

.dialog-form-full {
  grid-column: 1 / 3;
}

.customer-select-dialog {
  max-width: calc(100vw - 32px);
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  box-shadow: 0 12px 32px rgb(0 0 0 / 14%);
}

.customer-select-dialog :deep(.el-dialog__header) {
  box-sizing: border-box;
  height: 58px;
  margin-right: 0;
  padding: 18px 52px 16px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.customer-select-dialog :deep(.el-dialog__title) {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.customer-select-dialog :deep(.el-dialog__headerbtn) {
  top: 13px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.customer-select-dialog :deep(.el-dialog__headerbtn:hover) {
  background: var(--el-fill-color-light);
}

.customer-select-dialog :deep(.el-dialog__close) {
  color: var(--el-text-color-secondary);
  font-size: 18px;
}

.customer-select-dialog :deep(.el-dialog__body) {
  padding: 18px 20px 20px;
  color: var(--el-text-color-regular);
}

.customer-select-search {
  box-sizing: border-box;
  margin-bottom: 16px;
  padding: 14px 16px 2px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
}

.customer-select-search :deep(.el-row) {
  flex-wrap: nowrap;
  align-items: flex-start;
  margin-right: 0 !important;
  margin-left: 0 !important;
}

.customer-select-search :deep(.el-row > .el-col) {
  padding-right: 0 !important;
  padding-left: 0 !important;
}

.customer-select-search :deep(.el-row > .el-col:first-child) {
  flex: 1 1 520px;
  width: auto;
  max-width: 520px;
}

.customer-select-search :deep(.el-row > .el-col:last-child) {
  flex: 0 0 auto;
  width: auto;
  max-width: none;
  margin-left: 12px;
}

.customer-select-search :deep(.el-form-item),
.customer-select-search :deep(.search-form-actions) {
  margin-bottom: 12px;
}

.customer-select-search :deep(.el-form-item__label) {
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.customer-select-search :deep(.el-input__wrapper) {
  background: var(--el-bg-color);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}

.customer-select-search :deep(.el-button) {
  min-width: 76px;
  margin-left: 0;
}

.customer-select-table {
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.customer-select-table :deep(.el-table__header-wrapper th.el-table__cell),
.customer-select-table :deep(.el-table__fixed-header-wrapper th.el-table__cell) {
  height: 44px !important;
  padding: 0;
  border-bottom-color: var(--el-border-color-light);
  background: var(--el-fill-color-light) !important;
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
}

.customer-select-table :deep(.el-table__body td.el-table__cell) {
  height: 46px;
  padding: 0;
  border-bottom-color: var(--el-border-color-lighter);
}

.customer-select-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: var(--el-color-primary-light-9);
}

.customer-select-table :deep(.el-table__empty-block) {
  background: var(--el-bg-color);
}

.customer-select-table :deep(.el-table__empty-text) {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.customer-select-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.customer-select-action {
  padding: 4px 8px;
  font-weight: 500;
}

@media (max-width: 767px) {
  .customer-select-dialog :deep(.el-dialog__header) {
    padding-left: 18px;
  }

  .customer-select-dialog :deep(.el-dialog__body) {
    padding: 14px;
  }

  .customer-select-search {
    padding: 12px 12px 0;
  }

  .customer-select-search :deep(.el-row) {
    flex-wrap: wrap;
  }

  .customer-select-search :deep(.el-row > .el-col:first-child) {
    flex-basis: 100%;
    width: 100%;
    max-width: 100%;
  }

  .customer-select-search :deep(.el-row > .el-col:last-child) {
    width: calc(100% - 74px);
    margin-left: 74px;
  }
}

/* 客户画像标签：按性质着色（正向红 / 中性蓝 / 负向绿，与画像标签弹窗一致） */
.portrait-tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.portrait-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
  color: #fff;
}

.portrait-tag--positive {
  background: #ec5b56;
}

.portrait-tag--neutral {
  background: #4f7cf7;
}

.portrait-tag--negative {
  background: #34b277;
}
</style>
