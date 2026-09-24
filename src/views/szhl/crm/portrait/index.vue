<template>
  <div class="app-container crm-page">
    <SearchForm
        v-model="queryParams"
        :fields="searchFields"
        :show-search="showSearch"
        label-width="86px"
        show-actions-when-collapsed
        @search="getList"
        @reset="resetQuery"
    >
      <template #actions-left>
        <el-button type="primary" plain icon="Plus" @click="openAdd(1)" v-hasPermi="['crm:attribution:tagManage']">新增类别</el-button>
        <el-button plain icon="Setting" @click="openScopeDialog" v-hasPermi="['crm:attribution:tagManage']">展示范围配置</el-button>
        <el-button plain icon="Switch" @click="openConvertDialog" v-hasPermi="['crm:attribution:tagManage']">标签批量转换</el-button>
        <el-button plain icon="Upload" @click="openImportDialog('feature')" v-hasPermi="['crm:attribution:tagManage']">导入标签体系</el-button>
        <el-button type="primary" plain icon="Download" @click="exportData">导出数据</el-button>
        <el-button plain @click="setExpand(true)">展开全部</el-button>
        <el-button plain @click="setExpand(false)">收起全部</el-button>
      </template>
      <template #actions-right>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </template>
    </SearchForm>

    <div class="stats-bar">
      <span class="stats-bar__item">共 {{ stats.total }} 个节点</span>
      <span class="stats-bar__item">类别 {{ stats.level1 }}</span>
      <span class="stats-bar__item">子类 {{ stats.level2 }}</span>
      <span class="stats-bar__item">标签 {{ stats.level3 }}</span>
      <span class="stats-bar__item">启用 {{ stats.active }}</span>
      <span class="stats-bar__item">停用 {{ stats.inactive }}</span>
    </div>

    <div v-if="selectedRows.length > 0" class="batch-bar">
      <span class="batch-bar__summary">已选择 {{ selectedRows.length }} 项</span>
      <div class="batch-bar__actions">
        <el-button size="small" plain type="success" icon="CircleCheck" @click="batchToggleStatus('active')" v-hasPermi="['crm:attribution:tagManage']">批量启用</el-button>
        <el-button size="small" plain type="warning" icon="CircleClose" @click="batchToggleStatus('inactive')" v-hasPermi="['crm:attribution:tagManage']">批量停用</el-button>
        <el-button size="small" plain type="danger" icon="Delete" @click="batchDelete" v-hasPermi="['crm:attribution:tagManage']">批量删除</el-button>
        <el-button size="small" link @click="clearSelection">清空</el-button>
      </div>
    </div>

    <el-table
        :key="tableKey"
        ref="treeTableRef"
        v-loading="loading"
        :data="treeRows"
        row-key="id"
        :default-expand-all="expandAll"
        :expand-row-keys="expandedRowKeys"
        :tree-props="{ children: 'children' }"
        height="560"
        scrollbar-always-on
        v-horizontal-scroll="'always'"
        class="tag-tree-table"
        empty-text="暂无标签数据"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column label="层级/名称" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="name-cell">
            <el-tooltip :content="levelText(row.level)" placement="top">
              <el-icon class="level-icon" :class="'level-icon-' + row.level">
                <component :is="levelIcon(row.level)" />
              </el-icon>
            </el-tooltip>
            <span class="node-name" :class="'level-name-' + row.level">{{ row.tagName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="公私" align="center" width="90">
        <template #default="{ row }">
          <span>{{ publicPrivateLabel(row.publicPrivateType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性质" align="center" width="90">
        <template #default="{ row }">
          <span v-if="Number(row.level) === 3" class="nature-text" :class="'nature-text--' + row.nature">
            {{ natureLabel(row.nature) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="可选类型" align="center" width="100">
        <template #default="{ row }">
          <span v-if="Number(row.level) === 3">{{ selectTypeText(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="90">
        <template #default="{ row }">
          <span v-if="hasStatusOption(row)" class="status-inline">
            <span class="status-dot" :class="row.status === 'inactive' ? 'status-dot--inactive' : 'status-dot--active'" />
            <span>{{ statusText(row) }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="关联客户" align="right" width="100">
        <template #default="{ row }">
          <el-link
              v-if="showTagCustomerLink(row)"
              type="primary"
              :underline="false"
              @click="openTagCustomerDialog(row)"
          >{{ row.markCount || 0 }}</el-link>
          <span v-else-if="isLeafTag(row)">0</span>
        </template>
      </el-table-column>
      <el-table-column label="展示范围" width="100" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <el-button
              v-if="isLeafTag(row)"
              link
              type="primary"
              class="scope-summary-link"
              @click="openScopeDialog(row)"
          >{{ scopeSummaryLabel(row) }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="有效期" min-width="120">
        <template #default="{ row }">
          <span :class="{ 'expire-date--danger': isExpireDanger(row) }">{{ expireStatusText(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="顺序" prop="sortOrder" align="right" width="80" />
      <el-table-column label="操作" align="center" width="210" fixed="right">
        <template #default="{ row }">
          <div class="row-actions">
            <el-button v-if="Number(row.level) < 3" link type="primary" @click="openAdd(Number(row.level) + 1, row)" v-hasPermi="['crm:attribution:tagManage']">增加</el-button>
            <el-button link type="primary" @click="openEdit(row)" v-hasPermi="['crm:attribution:tagManage']">修改</el-button>
            <el-button v-if="hasStatusOption(row)" link :type="row.status === 'inactive' ? 'success' : 'warning'" @click="toggleStatus(row)" v-hasPermi="['crm:attribution:tagManage']">
              {{ row.status === 'inactive' ? '启用' : '停用' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['crm:attribution:tagManage']">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="customerDialogOpen" :title="customerDialogTitle" width="860px" append-to-body>
      <el-form :model="customerQuery" inline label-width="72px" class="tag-customer-search" @submit.prevent>
        <el-form-item label="客户名称">
          <el-input
              v-model="customerQuery.customerName"
              placeholder="请输入客户名称"
              clearable
              @keyup.enter="handleCustomerSearch"
          />
        </el-form-item>
        <el-form-item label="客户号">
          <el-input
              v-model="customerQuery.customerNo"
              placeholder="请输入客户号"
              clearable
              @keyup.enter="handleCustomerSearch"
          />
        </el-form-item>
        <el-form-item label="客户类型">
          <el-select v-model="customerQuery.customerType" placeholder="全部" clearable>
            <el-option v-for="item in customerTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="归属机构">
          <el-select
              v-model="customerQuery.attributionOrg"
              placeholder="请选择归属机构"
              clearable
              filterable
          >
            <el-option v-for="item in orgOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="管户经理">
          <el-select
              v-model="customerQuery.managerId"
              placeholder="请选择管户经理"
              clearable
              filterable
          >
            <el-option v-for="item in managerOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="tag-customer-search__actions">
          <el-button type="primary" icon="Search" @click="handleCustomerSearch">搜索</el-button>
          <el-button icon="Refresh" @click="resetCustomerSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <common-table
          v-model:page="customerQuery.pageNum"
          v-model:limit="customerQuery.pageSize"
          :loading="customerLoading"
          :data="customerRows"
          :columns="customerTableColumns"
          :total="customerTotal"
          height="420"
          class="tag-customer-table"
          empty-string="暂无关联客户"
          @pagination="getTagCustomerList"
      >
        <template #customerType="{ row }">{{ customerTypeLabel(row.customerType) }}</template>
        <template #customerManager="{ row }">{{ row.managerName || row.managerId || '-' }}</template>
      </common-table>
    </el-dialog>

    <el-drawer v-model="formOpen" :title="formTitle" size="520px" append-to-body>
      <el-form ref="tagFormRef" :model="form" label-width="112px" class="tag-form">
        <el-form-item v-if="form.level >= 2" label="所属类别" required>
          <el-select v-model="form.categoryId" placeholder="请选择所属类别" filterable style="width: 100%" @change="handleCategoryChange">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.tagName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.level === 3" label="所属子类" required>
          <el-select v-model="form.parentId" placeholder="请选择所属子类" filterable style="width: 100%" @change="handleSubCategoryChange">
            <el-option v-for="item in subCategoryOptions" :key="item.id" :label="item.tagName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.tagName" maxlength="50" show-word-limit placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="公私分类" required>
          <el-select v-model="form.publicPrivateType" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in publicPrivateOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <div v-if="parentPublicPrivateTip" class="form-tip" :class="{ 'form-tip--warning': parentPublicPrivateDifferent }">
            父级公私分类：{{ parentPublicPrivateTip }}<span v-if="parentPublicPrivateDifferent">，保存时需确认不一致</span>
          </div>
        </el-form-item>
        <el-form-item v-if="form.level === 3" label="标签性质">
          <el-select v-model="form.nature" placeholder="请选择" style="width: 100%">
            <el-option label="正向" value="positive" />
            <el-option label="中性" value="neutral" />
            <el-option label="负向" value="negative" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.level === 2" label="可选类型" required>
          <el-radio-group v-model="form.selectType">
            <el-radio-button label="multiple">多选</el-radio-button>
            <el-radio-button label="single">单选</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="hasStatusOption(form)" label="状态">
          <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示顺序">
          <el-input-number v-model="form.sortOrder" :min="0" :step="1" controls-position="right" style="width: 160px" />
        </el-form-item>
        <el-form-item v-if="form.level === 3" label="时效截止日期">
          <el-date-picker v-model="form.expireDate" type="date" value-format="YYYY-MM-DD" placeholder="为空表示长期有效" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="form.level === 3 && form.id" label="展示范围">
          <div class="scope-summary">
            <span>{{ scopeSummaryText }}</span>
            <el-button link type="primary" @click="openScopeDialog">去配置</el-button>
          </div>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="form.remark" type="textarea" :rows="4" maxlength="200" show-word-limit placeholder="请输入备注说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="formOpen = false">取消</el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="convertOpen" title="标签批量转换" width="1080px" append-to-body>
      <el-form :model="convertForm" label-width="88px" class="convert-form">
        <el-row :gutter="12">
          <el-col :span="10">
            <el-form-item label="源标签" required>
              <el-select v-model="convertForm.sourceTagId" placeholder="请选择源标签" filterable clearable style="width: 100%" @change="clearConvertPreview">
                <el-option
                    v-for="item in tagOptions"
                    :key="item.id"
                    :label="formatTagSelectLabel(item)"
                    :value="item.id"
                    :disabled="String(item.id) === String(convertForm.targetTagId)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="目标标签" required>
              <el-select v-model="convertForm.targetTagId" placeholder="请选择目标标签" filterable clearable style="width: 100%" @change="clearConvertPreview">
                <el-option
                    v-for="item in tagOptions"
                    :key="item.id"
                    :label="formatTagSelectLabel(item)"
                    :value="item.id"
                    :disabled="isConvertTargetDisabled(item)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" plain :loading="convertPreviewLoading" class="convert-preview-btn" @click="loadConvertPreview">匹配客户</el-button>
          </el-col>
        </el-row>
      </el-form>

      <div v-if="convertPreview" class="convert-summary">
        <span>匹配客户 {{ convertPreview.total || 0 }} 户</span>
        <span>追加目标标签 {{ convertPreview.addTargetCount || 0 }} 户</span>
        <span>仅移除源标签 {{ convertPreview.removeOnlyCount || 0 }} 户</span>
      </div>

      <el-table
          v-loading="convertPreviewLoading"
          :data="convertCustomers"
          height="360"
          class="convert-table"
          empty-text="请选择源标签和目标标签后匹配客户"
      >
        <el-table-column label="客户名称" prop="customerName" min-width="140" show-overflow-tooltip />
        <el-table-column label="客户内码" prop="customerId" width="150" show-overflow-tooltip />
        <el-table-column label="客户号" prop="customerNo" min-width="180" show-overflow-tooltip />
        <el-table-column label="归属机构" prop="attributionOrg" min-width="120" show-overflow-tooltip />
        <el-table-column label="管户经理" prop="managerName" min-width="110" show-overflow-tooltip />
        <el-table-column label="转换动作" min-width="150" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.targetTagged ? 'warning' : 'success'" effect="plain">
              {{ row.targetTagged ? '仅移除源标签' : '追加目标并移除源标签' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="convertOpen = false">取消</el-button>
          <el-button type="primary" :loading="convertSubmitLoading" :disabled="!canSubmitConvert" @click="submitConvert">确认转换</el-button>
        </div>
      </template>
    </el-dialog>


    <el-dialog v-model="importOpen" :title="importDialogTitle" width="780px" append-to-body :close-on-click-modal="false" @closed="resetImportDialog">
      <div class="import-panel">
        <div class="import-toolbar">
          <el-button plain icon="Download" @click="handleDownloadImportTemplate">下载模板</el-button>
          <span class="import-tip">{{ importTemplateTip }}</span>
        </div>
        <el-upload
            ref="importUploadRef"
            class="import-upload"
            drag
            :auto-upload="false"
            :limit="1"
            accept=".xls,.xlsx"
            :on-change="handleImportFileChange"
            :on-remove="handleImportFileRemove"
            :on-exceed="handleImportFileExceed"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽文件到此处，或 <em>点击选择</em></div>
          <template #tip>
            <div class="el-upload__tip">仅支持 .xls / .xlsx，单次上传一个文件。</div>
          </template>
        </el-upload>
        <div v-if="importResult" class="import-result">
          <div class="import-result__summary">
            <span>成功 {{ importResult.successCount || 0 }} 条</span>
            <span v-if="importMode === 'feature'">新增 {{ importResult.insertCount || 0 }} 个节点</span>
            <span v-if="importMode === 'feature'">更新 {{ importResult.updateCount || 0 }} 个节点</span>
            <span>失败 {{ importResult.failureCount || 0 }} 条</span>
            <el-button v-if="importFailures.length" link type="primary" @click="downloadImportFailures">下载失败明细</el-button>
          </div>
          <el-table v-if="importFailures.length" :data="importFailures" height="240" size="small" border>
            <el-table-column label="行号" prop="rowNum" width="70" align="center" />
            <el-table-column v-if="importMode === 'customer'" label="客户号" prop="customerNo" min-width="120" show-overflow-tooltip />
            <el-table-column v-if="importMode === 'feature'" label="层级" prop="level" width="80" align="center" />
            <el-table-column v-if="importMode === 'feature'" label="一级分类" prop="level1Name" min-width="120" show-overflow-tooltip />
            <el-table-column v-if="importMode === 'feature'" label="二级分类" prop="level2Name" min-width="120" show-overflow-tooltip />
            <el-table-column label="标签名称" prop="tagName" min-width="140" show-overflow-tooltip />
            <el-table-column v-if="importMode === 'customer'" label="操作" prop="action" width="90" align="center" />
            <el-table-column label="失败原因" prop="reason" min-width="180" show-overflow-tooltip />
          </el-table>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importOpen = false">关闭</el-button>
          <el-button type="primary" :loading="importUploading" :disabled="!importFile" @click="submitImport">开始导入</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="scopeOpen" title="展示范围配置" width="960px" append-to-body :close-on-click-modal="false" @closed="resetScopeDialog">
      <div class="scope-dialog" v-loading="scopeLoading">
        <div class="scope-dialog__toolbar">
          <el-radio-group v-model="scopeForm.scopeType" @change="handleScopeTypeChange">
            <el-radio-button label="ROLE">按角色配置</el-radio-button>
            <el-radio-button label="ORG">按机构配置</el-radio-button>
          </el-radio-group>
          <div class="scope-dialog__object">
            <el-select
                v-if="scopeForm.scopeType === 'ROLE'"
                v-model="scopeForm.scopeValue"
                placeholder="请选择角色"
                filterable
                clearable
                style="width: 280px"
                @change="loadScopeSnapshot"
            >
              <el-option
                  v-for="item in roleOptions"
                  :key="item.roleKey"
                  :label="formatRoleOption(item)"
                  :value="item.roleKey"
              />
            </el-select>
            <el-tree-select
                v-else
                v-model="scopeForm.scopeValue"
                :data="deptOptions"
                :props="deptTreeProps"
                value-key="id"
                placeholder="请选择机构"
                filterable
                clearable
                check-strictly
                default-expand-all
                :render-after-expand="false"
                style="width: 280px"
                @change="loadScopeSnapshot"
            />
          </div>
        </div>
        <div v-if="scopeForm.scopeType === 'ROLE' && scopeQuickRoleItems.length" class="scope-dialog__quick-items">
          <span class="scope-dialog__quick-label">{{ scopeContextTagName }}已配置角色</span>
          <el-button
              v-for="item in scopeQuickRoleItems"
              :key="item.value"
              link
              type="primary"
              @click="selectScopeQuickRole(item.value)"
          >
            {{ item.label }}
          </el-button>
        </div>
        <div v-if="scopeForm.scopeType === 'ORG' && scopeQuickOrgItems.length" class="scope-dialog__quick-items">
          <span class="scope-dialog__quick-label">{{ scopeContextTagName }}已配置机构</span>
          <el-button
              v-for="item in scopeQuickOrgItems"
              :key="item.value"
              link
              type="primary"
              @click="selectScopeQuickOrg(item.value)"
          >
            {{ item.label }}
          </el-button>
        </div>

        <div class="scope-dialog__body">
          <div class="scope-dialog__head">
            <span>可见标签</span>
            <span class="scope-dialog__count">已选 {{ scopeCheckedCount }} 个三级标签</span>
          </div>
          <el-tree
              ref="scopeTagTreeRef"
              class="scope-tag-tree"
              :data="scopeTagTree"
              node-key="id"
              show-checkbox
              default-expand-all
              :expand-on-click-node="false"
              :props="scopeTreeProps"
              empty-text="暂无标签数据"
              @check="handleScopeTagCheck"
          >
            <template #default="{ data }">
              <span
                  class="scope-tag-node"
                  :class="'scope-tag-node--' + data.level"
              >
                <el-icon><component :is="levelIcon(data.level)" /></el-icon>
                <el-tag
                    v-if="isScopeContextTag(data)"
                    size="small"
                    effect="plain"
                    type="primary"
                    class="scope-tag-node__current-tag"
                >
                  {{ data.tagName }}
                </el-tag>
                <span v-else>{{ data.tagName }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="scopeOpen = false">取消</el-button>
          <el-button type="primary" :loading="scopeSaving" @click="submitScopeSnapshot">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CrmPortrait">
import { computed, getCurrentInstance, nextTick, reactive, ref } from 'vue'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import {
  listFeatureTagManageTree,
  addFeatureTag,
  updateFeatureTag,
  delFeatureTag,
  previewTagConvert,
  convertTag,
  getTagScopeSnapshot,
  saveTagScopeSnapshot,
  getTagScopeSummary,
  listTagScopeRoleOptions,
  listTagScopeDeptOptions,
  listTagCustomers,
  downloadFeatureTagImportTemplate,
  importFeatureTags,
  downloadTagImportTemplate,
  importTagCustomers
} from '@/api/szhl/crm/attribution'
import SearchForm from '@/components/SearchForm'
import { useUserOptions } from '@/utils/userEnum'

const { proxy } = getCurrentInstance()
const {
  crm_public_private: dictPublicPrivateOptions,
  crm_customer_type: dictCustomerTypeOptions,
  sys_org_name: orgOptions
} = proxy.useDict('crm_public_private', 'crm_customer_type', 'sys_org_name')
const managerOptions = useUserOptions()

const showSearch = ref(true)
const loading = ref(false)
const allRows = ref([])
const treeRows = ref([])
const formOpen = ref(false)
const formTitle = ref('')
const expandMode = ref('all')
const tableKey = ref(0)
const treeTableRef = ref()
const selectedRows = ref([])
const convertOpen = ref(false)
const convertPreviewLoading = ref(false)
const convertSubmitLoading = ref(false)
const convertPreview = ref(null)
const scopeOpen = ref(false)
const scopeLoading = ref(false)
const scopeSaving = ref(false)
const scopeTagTreeRef = ref()
const roleOptions = ref([])
const deptOptions = ref([])
const scopeTagTree = ref([])
const scopeSummary = ref(null)
const scopeCheckedCount = ref(0)
const scopeContextTag = ref(null)
const scopeQuickRoleItems = ref([])
const scopeQuickOrgItems = ref([])
const scopeForm = reactive({
  scopeType: 'ROLE',
  scopeValue: undefined
})
const scopeOriginalTagIds = ref([])
const importOpen = ref(false)
const importMode = ref('feature')
const importUploading = ref(false)
const importFile = ref(null)
const importResult = ref(null)
const importUploadRef = ref()
const customerDialogOpen = ref(false)
const customerLoading = ref(false)
const customerRows = ref([])
const customerTotal = ref(0)
const customerDialogRow = ref(null)
const customerQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  tagIds: [],
  customerName: '',
  customerNo: '',
  customerType: undefined,
  attributionOrg: '',
  managerId: undefined,
  managerName: ''
})
const customerTableColumns = [
  { label: '客户名称', prop: 'customerName', minWidth: 160, showOverflowTooltip: true },
  { label: '客户内码', prop: 'customerId', width: 150, showOverflowTooltip: true },
  { label: '客户号', prop: 'customerNo', minWidth: 160, showOverflowTooltip: true },
  { label: '客户类型', prop: 'customerType', width: 100, align: 'center', slot: 'customerType' },
  { label: '归属机构', prop: 'attributionOrg', minWidth: 130, showOverflowTooltip: true },
  { label: '管户经理', key: 'customerManager', minWidth: 120, showOverflowTooltip: true, slot: 'customerManager' }
]

const queryParams = reactive({
  publicPrivateType: undefined,
  tagName: '',
  status: undefined,
  level: undefined,
  nature: undefined,
  selectType: undefined,
  advancedSearch: undefined
})

const form = reactive({
  id: undefined,
  level: 1,
  categoryId: undefined,
  parentId: undefined,
  tagName: '',
  publicPrivateType: '2',
  selectType: 'multiple',
  nature: 'neutral',
  status: 'active',
  sortOrder: 0,
  expireDate: '',
  remark: '',
  tagType: '公共'
})

const convertForm = reactive({
  sourceTagId: undefined,
  targetTagId: undefined
})

const fallbackPublicPrivateOptions = [
  { label: '对私', value: '0' },
  { label: '对公', value: '1' },
  { label: '通用', value: '2' }
]

const fallbackCustomerTypeOptions = [
  { label: '有贷', value: '1' },
  { label: '无贷', value: '0' }
]

const publicPrivateOptions = computed(() => {
  const dict = (dictPublicPrivateOptions.value || []).map(item => ({ label: item.label, value: item.value }))
  const values = new Set(dict.map(item => String(item.value)))
  fallbackPublicPrivateOptions.forEach(item => {
    if (!values.has(item.value)) {
      dict.push(item)
    }
  })
  return dict.length ? dict : fallbackPublicPrivateOptions
})

const customerTypeOptions = computed(() => {
  const dict = (dictCustomerTypeOptions.value || []).map(item => ({ label: item.label, value: item.value }))
  return dict.length ? dict : fallbackCustomerTypeOptions
})

const stats = computed(() => {
  const rows = allRows.value
  return {
    total: rows.length,
    level1: rows.filter(item => Number(item.level) === 1).length,
    level2: rows.filter(item => Number(item.level) === 2).length,
    level3: rows.filter(item => Number(item.level) === 3).length,
    active: rows.filter(item => item.status !== 'inactive').length,
    inactive: rows.filter(item => item.status === 'inactive').length
  }
})

const categoryOptions = computed(() => allRows.value.filter(item => Number(item.level) === 1))
const subCategoryOptions = computed(() => allRows.value.filter(item => Number(item.level) === 2 && String(item.parentId) === String(form.categoryId)))
const tagOptions = computed(() => allRows.value.filter(item => Number(item.level) === 3))
const expandAll = computed(() => expandMode.value === 'all')
const expandedRowKeys = computed(() => {
  if (expandMode.value !== 'first') return []
  return treeRows.value[0] ? [String(treeRows.value[0].id)] : []
})
const parentPublicPrivateTip = computed(() => {
  const parent = getFormParent()
  return parent ? `${parent.tagName}（${publicPrivateLabel(parent.publicPrivateType)}）` : ''
})
const parentPublicPrivateDifferent = computed(() => isPublicPrivateDifferentFromParent())
const convertCustomers = computed(() => convertPreview.value?.customers || [])
const canSubmitConvert = computed(() => !!convertPreview.value && convertCustomers.value.length > 0)
const importFailures = computed(() => importResult.value?.failures || [])
const importDialogTitle = computed(() => importMode.value === 'feature' ? '导入标签体系' : '导入标签客户')
const importTemplateTip = computed(() => importMode.value === 'feature'
    ? '模板列：层级、一级分类、二级分类、标签名称、公私类型、标签性质、可选类型、顺序、状态、过期时间、备注。'
    : '模板列：客户号、标签名称、操作；操作填写“打标”或“退标”。')
const customerDialogTitle = computed(() => {
  const row = customerDialogRow.value
  return row ? `${row.tagName} - 关联客户` : '关联客户'
})
const scopeSummaryText = computed(() => {
  if (!scopeSummary.value) return '加载中'
  const roleCount = Number(scopeSummary.value.roleCount || 0)
  const orgCount = Number(scopeSummary.value.orgCount || 0)
  if (roleCount === 0 && orgCount === 0) return '未配置范围，默认全员可见'
  const parts = []
  if (roleCount > 0) parts.push(`${roleCount} 个角色`)
  if (orgCount > 0) parts.push(`${orgCount} 个机构`)
  return parts.join('、') + '可见'
})
const scopeContextTagName = computed(() => {
  return scopeContextTag.value?.tagName ? `${scopeContextTag.value.tagName} ` : ''
})
const scopeTreeProps = { label: 'tagName', children: 'children' }
const deptTreeProps = { value: 'id', label: 'label', children: 'children', disabled: 'disabled' }

function isScopeContextTag(data) {
  return Number(data?.level) === 3 && scopeContextTag.value?.id && String(data.id) === String(scopeContextTag.value.id)
}

const searchFields = computed(() => [
  {
    label: '公私分类',
    prop: 'publicPrivateType',
    type: 'select',
    placeholder: '全部',
    options: publicPrivateOptions.value || []
  },
  {
    label: '标签名称',
    prop: 'tagName',
    type: 'input',
    placeholder: '搜索一级、二级、三级名称'
  },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    placeholder: '全部',
    options: [
      { label: '启用', value: 'active' },
      { label: '停用', value: 'inactive' }
    ]
  },
  { label: '层级', prop: 'level', type: 'select', placeholder: '全部', options: [{ label: '类别', value: 1 }, { label: '子类', value: 2 }, { label: '标签', value: 3 }] },
  { label: '标签性质', prop: 'nature', type: 'select', placeholder: '全部', options: [{ label: '正向', value: 'positive' }, { label: '中性', value: 'neutral' }, { label: '负向', value: 'negative' }] },
  { label: '可选类型', prop: 'selectType', type: 'select', placeholder: '全部', options: [{ label: '单选', value: 'single' }, { label: '多选', value: 'multiple' }] },
  { label: '高级搜索', prop: 'advancedSearch', type: 'select', placeholder: '请选择', options: advancedSearchOptions }
])

const advancedSearchOptions = [
  { label: '有客户使用', value: 'customerUsed' },
  { label: '无客户使用', value: 'customerUnused' },
  { label: '未配置展示范围', value: 'scopeNone' },
  { label: '已配置展示范围', value: 'scopeConfigured' },
  { label: '长期有效', value: 'expireLongTerm' },
  { label: '即将过期', value: 'expireExpiringSoon' },
  { label: '已过期', value: 'expireExpired' }
]

function normalizeRow(row) {
  return {
    ...row,
    id: Number(row.id),
    parentId: row.parentId == null ? null : Number(row.parentId),
    level: Number(row.level || 3),
    tagName: row.tagName || row.categoryName || '',
    publicPrivateType: row.publicPrivateType || '0',
    tagType: row.tagType || '公共',
    selectType: row.selectType || 'multiple',
    nature: row.nature || 'neutral',
    status: row.status || 'active',
    sortOrder: Number(row.sortOrder || 0),
    markCount: Number(row.markCount || row.customerCount || row.customerNum || row.relationCount || row.bindCount || 0),
    expireDate: row.expireDate || '',
    updateBy: row.updateBy || '',
    updateTime: row.updateTime || '',
    scopeRoleCount: Number(row.scopeRoleCount || 0),
    scopeOrgCount: Number(row.scopeOrgCount || 0),
    remark: row.remark || ''
  }
}


function hasScopeConfigured(row) {
  return Number(row.scopeRoleCount || 0) > 0 || Number(row.scopeOrgCount || 0) > 0
}

function isLeafTag(row) {
  return Number(row.level) === 3 && !(row.children || []).length
}

function scopeSummaryLabel(row) {
  const roleCount = Number(row.scopeRoleCount || 0)
  const orgCount = Number(row.scopeOrgCount || 0)
  return `${roleCount}/${orgCount}`
}

function hasStatusOption(row) {
  return Number(row.level) !== 1
}

function statusText(row) {
  return row.status === 'inactive' ? '停用' : '启用'
}

function showTagCustomerLink(row) {
  return isLeafTag(row) && Number(row.markCount || 0) > 0
}

function buildRoleScopeItems(roleKeys) {
  const roleMap = new Map(roleOptions.value.map(item => [String(item.roleKey), item]))
  return [...new Set((roleKeys || []).map(roleKey => String(roleKey || '').trim()).filter(Boolean))].map(roleKey => {
    const value = String(roleKey)
    const role = roleMap.get(value)
    return {
      label: role ? (role.roleName || value) : value,
      value
    }
  })
}

function buildOrgScopeItems(orgNos) {
  return [...new Set((orgNos || []).map(orgNo => String(orgNo || '').trim()).filter(Boolean))].map(orgNo => {
    const value = String(orgNo)
    const path = findDeptPath(value, deptOptions.value)
    return {
      label: path.length ? path.map(item => item.label).join(' / ') : value,
      value
    }
  })
}

function getExpireStatus(row) {
  if (Number(row.level) !== 3) return ''
  if (!row.expireDate) return 'longTerm'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expire = new Date(row.expireDate)
  if (Number.isNaN(expire.getTime())) return 'longTerm'
  expire.setHours(0, 0, 0, 0)
  if (expire.getTime() < today.getTime()) return 'expired'
  const diffDays = Math.ceil((expire.getTime() - today.getTime()) / 86400000)
  return diffDays <= 30 ? 'expiringSoon' : 'normal'
}

function expireStatusText(row) {
  if (!isLeafTag(row)) return ''
  return row.expireDate || '长期有效'
}

function isExpireDanger(row) {
  return isLeafTag(row) && ['expiringSoon', 'expired'].includes(getExpireStatus(row))
}

function inheritedSelectType(row) {
  if (Number(row.level) === 2) return row.selectType || 'multiple'
  if (Number(row.level) === 3) {
    const parent = getRowById(row.parentId)
    return parent ? (parent.selectType || 'multiple') : 'multiple'
  }
  return ''
}

function getList() {
  loading.value = true
  listFeatureTagManageTree({
    advancedSearch: queryParams.advancedSearch
  }).then(res => {
    allRows.value = (res.data || []).map(normalizeRow)
    refreshTable()
  }).finally(() => {
    loading.value = false
  })
}

function refreshTable() {
  clearSelection()
  treeRows.value = buildTree(filterRows(allRows.value))
  nextTick(() => {
    treeTableRef.value?.doLayout()
  })
}

function filterRows(rows) {
  const keyword = String(queryParams.tagName || '').trim()
  const matched = new Set()
  rows.forEach(row => {
    const matchPublicPrivate = !queryParams.publicPrivateType || row.publicPrivateType === queryParams.publicPrivateType
    const matchStatus = !queryParams.status || row.status === queryParams.status
    const matchLevel = !queryParams.level || Number(row.level) === Number(queryParams.level)
    const matchNature = !queryParams.nature || (Number(row.level) === 3 && row.nature === queryParams.nature)
    const matchSelectType = !queryParams.selectType || inheritedSelectType(row) === queryParams.selectType
    const matchAdvanced = matchAdvancedSearchScenario(row)
    const matchName = !keyword || String(row.tagName || '').includes(keyword)
    if (matchPublicPrivate && matchStatus && matchLevel && matchNature && matchSelectType && matchAdvanced && matchName) {
      markWithParents(row, rows, matched)
    }
  })
  return rows.filter(row => matched.has(row.id))
}

function matchAdvancedSearchScenario(row) {
  if (!queryParams.advancedSearch) return true
  if (Number(row.level) !== 3) return false
  switch (queryParams.advancedSearch) {
    case 'customerUsed':
      return Number(row.markCount || 0) > 0
    case 'customerUnused':
      return Number(row.markCount || 0) === 0
    case 'scopeNone':
      return !hasScopeConfigured(row)
    case 'scopeConfigured':
      return hasScopeConfigured(row)
    case 'expireLongTerm':
      return getExpireStatus(row) === 'longTerm'
    case 'expireExpiringSoon':
      return getExpireStatus(row) === 'expiringSoon'
    case 'expireExpired':
      return getExpireStatus(row) === 'expired'
    default:
      return true
  }
}

function markWithParents(row, rows, matched) {
  matched.add(row.id)
  if (row.parentId) {
    const parent = rows.find(item => item.id === row.parentId)
    if (parent) {
      markWithParents(parent, rows, matched)
    }
  }
}

function buildTree(rows) {
  const map = {}
  rows.forEach(row => {
    map[row.id] = { ...row, children: [] }
  })
  const roots = []
  rows.forEach(row => {
    const current = map[row.id]
    if (row.parentId && map[row.parentId]) {
      map[row.parentId].children.push(current)
    } else {
      roots.push(current)
    }
  })
  sortTree(roots)
  return roots
}

function sortTree(rows) {
  rows.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || (a.id || 0) - (b.id || 0))
  rows.forEach(row => sortTree(row.children || []))
}

function resetQuery() {
  queryParams.publicPrivateType = undefined
  queryParams.tagName = ''
  queryParams.status = undefined
  queryParams.level = undefined
  queryParams.nature = undefined
  queryParams.selectType = undefined
  queryParams.advancedSearch = undefined
  getList()
}

function setExpand(value) {
  clearSelection()
  expandMode.value = value ? 'all' : 'none'
  tableKey.value += 1
}

function handleSelectionChange(selection) {
  selectedRows.value = selection
}

function clearSelection() {
  treeTableRef.value?.clearSelection()
  selectedRows.value = []
}

function openAdd(level, parent) {
  resetForm()
  form.level = level
  if (parent) {
    if (Number(parent.level) === 1) {
      form.categoryId = parent.id
      form.parentId = parent.id
    } else if (Number(parent.level) === 2) {
      form.categoryId = parent.parentId
      form.parentId = parent.id
    }
    form.publicPrivateType = parent.publicPrivateType || '2'
  }
  formTitle.value = '新增' + levelText(level)
  formOpen.value = true
}

function openEdit(row) {
  resetForm()
  scopeSummary.value = null
  form.id = row.id
  form.level = Number(row.level)
  form.tagName = row.tagName
  form.publicPrivateType = row.publicPrivateType || '2'
  form.selectType = row.selectType || 'multiple'
  form.nature = row.nature || 'neutral'
  form.status = row.status || 'active'
  form.sortOrder = Number(row.sortOrder || 0)
  form.expireDate = row.expireDate || ''
  form.remark = row.remark || ''
  form.tagType = row.tagType || '公共'
  if (Number(row.level) === 2) {
    form.categoryId = row.parentId
    form.parentId = row.parentId
  } else if (Number(row.level) === 3) {
    const parent = allRows.value.find(item => item.id === row.parentId)
    form.categoryId = parent ? parent.parentId : undefined
    form.parentId = row.parentId
  }
  formTitle.value = '修改' + levelText(row.level)
  formOpen.value = true
  if (Number(row.level) === 3) {
    loadScopeSummary(row.id)
  }
}

function resetForm() {
  scopeSummary.value = null
  form.id = undefined
  form.level = 1
  form.categoryId = undefined
  form.parentId = undefined
  form.tagName = ''
  form.publicPrivateType = '2'
  form.selectType = 'multiple'
  form.nature = 'neutral'
  form.status = 'active'
  form.sortOrder = 0
  form.expireDate = ''
  form.remark = ''
  form.tagType = '公共'
}

function handleCategoryChange() {
  if (form.level === 2) {
    form.parentId = form.categoryId
    applyParentPublicPrivateType(getFormParent())
  } else if (form.level === 3) {
    form.parentId = undefined
    applyParentPublicPrivateType(getRowById(form.categoryId))
  }
}

function handleSubCategoryChange() {
  applyParentPublicPrivateType(getFormParent())
}

async function submitForm() {
  const error = validateForm()
  if (error) {
    proxy.$modal.msgWarning(error)
    return
  }
  if (isPublicPrivateDifferentFromParent()) {
    const parent = getFormParent()
    const currentType = publicPrivateLabel(form.publicPrivateType)
    const parentType = publicPrivateLabel(parent.publicPrivateType)
    try {
      await proxy.$modal.confirm(`当前公私分类为"${currentType}"，与父级"${parent.tagName}"的"${parentType}"不一致，确认保存吗？`)
    } catch {
      return
    }
  }
  const cascadeRows = getFormStatusCascadeRows()
  const ancestorRows = getFormInactiveAncestorsForActiveStatus()
  if (cascadeRows.length > 0) {
    const current = getRowById(form.id)
    try {
      await proxy.$modal.confirm(buildStatusCascadeMessage(current, cascadeRows))
    } catch {
      return
    }
  }
  await saveForm(cascadeRows, ancestorRows)
}

async function saveForm(cascadeRows = [], ancestorRows = []) {
  const payload = buildPayload()
  for (const row of ancestorRows) {
    await updateFeatureTag(row.id, buildStatusPayload(row, 'active'))
  }
  const request = form.id
      ? Promise.all([
        updateFeatureTag(form.id, payload),
        ...cascadeRows.map(row => updateFeatureTag(row.id, buildStatusPayload(row, 'inactive')))
      ])
      : addFeatureTag(payload)
  await request
  formOpen.value = false
  proxy.$modal.msgSuccess(ancestorRows.length > 0 ? `保存成功，已同步启用${buildAncestorEnableSummary(ancestorRows)}` : '保存成功')
  getList()
}

function getRowById(id) {
  if (id === undefined || id === null || id === '') return null
  return allRows.value.find(item => String(item.id) === String(id)) || null
}

function collectLeafTagIds(row) {
  if (!row) return []
  if (Number(row.level) === 3) return [Number(row.id)]
  const result = []
  const visit = (parentId) => {
    allRows.value.forEach(item => {
      if (String(item.parentId) === String(parentId)) {
        if (Number(item.level) === 3) {
          result.push(Number(item.id))
        } else {
          visit(item.id)
        }
      }
    })
  }
  visit(row.id)
  return [...new Set(result)]
}

function openTagCustomerDialog(row) {
  const tagIds = collectLeafTagIds(row)
  if (tagIds.length === 0) {
    proxy.$modal.msgWarning('当前节点下暂无可查询的标签')
    return
  }
  customerDialogRow.value = row
  resetCustomerQueryFields()
  customerQuery.pageNum = 1
  customerQuery.pageSize = 10
  customerQuery.tagIds = tagIds
  customerDialogOpen.value = true
  getTagCustomerList()
}

function resetCustomerQueryFields() {
  customerQuery.customerName = ''
  customerQuery.customerNo = ''
  customerQuery.customerType = undefined
  customerQuery.attributionOrg = ''
  customerQuery.managerId = undefined
  customerQuery.managerName = ''
}

function handleCustomerSearch() {
  customerQuery.pageNum = 1
  getTagCustomerList()
}

function resetCustomerSearch() {
  resetCustomerQueryFields()
  handleCustomerSearch()
}

function getTagCustomerList() {
  if (!customerQuery.tagIds || customerQuery.tagIds.length === 0) {
    customerRows.value = []
    customerTotal.value = 0
    return
  }
  customerLoading.value = true
  listTagCustomers({
    pageNum: customerQuery.pageNum,
    pageSize: customerQuery.pageSize,
    tagIds: customerQuery.tagIds,
    customerName: customerQuery.customerName,
    customerNo: customerQuery.customerNo,
    customerType: customerQuery.customerType,
    attributionOrg: customerQuery.attributionOrg,
    managerId: customerQuery.managerId,
    managerName: customerQuery.managerName
  }).then(res => {
    customerRows.value = res.rows || []
    customerTotal.value = Number(res.total || 0)
  }).finally(() => {
    customerLoading.value = false
  })
}

function customerTypeLabel(value) {
  if (value === undefined || value === null || value === '') return '-'
  if (String(value) === '1') return '有贷'
  if (String(value) === '0') return '无贷'
  return value
}

function getFormParent() {
  if (Number(form.level) === 2) {
    return getRowById(form.categoryId)
  }
  if (Number(form.level) === 3) {
    return getRowById(form.parentId)
  }
  return null
}

function applyParentPublicPrivateType(parent) {
  if (!parent || parent.publicPrivateType === undefined || parent.publicPrivateType === null || parent.publicPrivateType === '') return
  form.publicPrivateType = String(parent.publicPrivateType)
}

function isPublicPrivateDifferentFromParent() {
  const parent = getFormParent()
  if (!parent) return false
  return String(form.publicPrivateType) !== String(parent.publicPrivateType)
}

function validateForm() {
  if (form.level >= 2 && !form.categoryId) return '请选择所属类别'
  if (form.level === 3 && !form.parentId) return '请选择所属子类'
  if (!String(form.tagName || '').trim()) return '名称不能为空'
  if (!form.publicPrivateType) return '请选择公私分类'
  if (form.level === 2 && !form.selectType) return '请选择可选类型'
  return ''
}

function buildPayload() {
  return {
    id: form.id,
    level: form.level,
    parentId: form.level === 1 ? undefined : (form.level === 2 ? form.categoryId : form.parentId),
    tagName: String(form.tagName || '').trim(),
    publicPrivateType: form.publicPrivateType,
    tagType: form.tagType || '公共',
    selectType: form.level === 2 ? form.selectType : undefined,
    nature: form.level === 3 ? form.nature : undefined,
    status: hasStatusOption(form) ? form.status : 'active',
    sortOrder: form.sortOrder || 0,
    expireDate: form.level === 3 ? form.expireDate : undefined,
    remark: form.remark
  }
}

async function toggleStatus(row) {
  const nextStatus = row.status === 'inactive' ? 'active' : 'inactive'
  const cascadeRows = nextStatus === 'inactive' ? getActiveDescendants(row) : []
  const ancestorRows = nextStatus === 'active' ? getInactiveAncestors(row) : []
  if (cascadeRows.length > 0) {
    try {
      await proxy.$modal.confirm(buildStatusCascadeMessage(row, cascadeRows))
    } catch {
      return
    }
  }
  for (const parent of ancestorRows) {
    await updateFeatureTag(parent.id, buildStatusPayload(parent, 'active'))
  }
  await Promise.all([
    updateFeatureTag(row.id, buildStatusPayload(row, nextStatus)),
    ...cascadeRows.map(child => updateFeatureTag(child.id, buildStatusPayload(child, nextStatus)))
  ])
  const ancestorMessage = ancestorRows.length > 0 ? `，已同步启用${buildAncestorEnableSummary(ancestorRows)}` : ''
  proxy.$modal.msgSuccess(nextStatus === 'active' ? `已启用${ancestorMessage}` : '已停用')
  getList()
}

async function batchToggleStatus(nextStatus) {
  const rows = getSelectedSourceRows().filter(hasStatusOption)
  if (rows.length === 0) {
    proxy.$modal.msgWarning('请先选择需要操作的子类或标签')
    return
  }
  if (nextStatus === 'inactive') {
    await batchDisableRows(rows)
    return
  }
  await batchEnableRows(rows)
}

async function batchDisableRows(rows) {
  const selectedActiveRows = rows.filter(row => row.status !== 'inactive')
  const cascadeRows = uniqueRows(rows.flatMap(row => getActiveDescendants(row)))
  const targetRows = uniqueRows([...selectedActiveRows, ...cascadeRows])
  if (targetRows.length === 0) {
    proxy.$modal.msgWarning('所选节点已全部停用')
    return
  }
  const selectedIds = new Set(rows.map(row => String(row.id)))
  const extraCascadeRows = cascadeRows.filter(row => !selectedIds.has(String(row.id)))
  try {
    await proxy.$modal.confirm(buildBatchDisableMessage(rows, targetRows, extraCascadeRows))
  } catch {
    return
  }
  const result = await runBatchRequests(targetRows, row => updateFeatureTag(row.id, buildStatusPayload(row, 'inactive')))
  showBatchResult('停用', result)
  clearSelection()
  getList()
}

async function batchEnableRows(rows) {
  const selectedInactiveRows = rows.filter(row => row.status === 'inactive')
  const ancestorRows = uniqueRows(rows.flatMap(row => getInactiveAncestors(row)))
  const targetRows = uniqueRows([...ancestorRows, ...selectedInactiveRows])
  if (targetRows.length === 0) {
    proxy.$modal.msgWarning('所选节点已全部启用')
    return
  }
  try {
    await proxy.$modal.confirm(buildBatchEnableMessage(rows, ancestorRows))
  } catch {
    return
  }
  const result = await runBatchRequests(targetRows, row => updateFeatureTag(row.id, buildStatusPayload(row, 'active')))
  const ancestorMessage = ancestorRows.length > 0 ? `，已同步启用${buildAncestorEnableSummary(ancestorRows)}` : ''
  showBatchResult('启用', result, ancestorMessage)
  clearSelection()
  getList()
}

function handleDelete(row) {
  const blockedMessage = buildDeleteBlockedMessage([row])
  if (blockedMessage) {
    proxy.$modal.msgWarning(blockedMessage)
    return
  }
  proxy.$modal.confirm(`确认删除"${row.tagName}"吗？`).then(() => {
    return delFeatureTag(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    getList()
  }).catch(() => {})
}

async function batchDelete() {
  const rows = getSelectedSourceRows()
  if (rows.length === 0) {
    proxy.$modal.msgWarning('请先选择需要删除的节点')
    return
  }
  const blockedMessage = buildDeleteBlockedMessage(rows)
  if (blockedMessage) {
    proxy.$modal.msgWarning(blockedMessage)
    return
  }
  try {
    await proxy.$modal.confirm(`确认删除选中的 ${rows.length} 个节点吗？删除后不可恢复。`)
  } catch {
    return
  }
  const result = await runBatchRequests(rows, row => delFeatureTag(row.id))
  showBatchResult('删除', result)
  clearSelection()
  getList()
}

async function runBatchRequests(rows, requestBuilder) {
  const results = await Promise.allSettled(rows.map(row => requestBuilder(row)))
  const failures = []
  results.forEach((item, index) => {
    if (item.status === 'rejected') {
      failures.push({ row: rows[index], reason: item.reason?.message || item.reason?.msg || '接口处理失败' })
    }
  })
  return { successCount: rows.length - failures.length, failureCount: failures.length, failures }
}

function showBatchResult(actionText, result, extraMessage = '') {
  if (result.failureCount > 0) {
    const detail = result.failures.slice(0, 5).map(item => `${item.row.tagName}：${item.reason}`).join('；')
    proxy.$modal.msgWarning(`${actionText}完成：成功 ${result.successCount} 个，失败 ${result.failureCount} 个。${detail}`)
    return
  }
  proxy.$modal.msgSuccess(`已${actionText} ${result.successCount} 个节点${extraMessage}`)
}

function buildDeleteBlockedMessage(rows) {
  const childBlockedRows = []
  const customerBlockedRows = []
  rows.forEach(row => {
    const childCount = countDescendants(row)
    const customerCount = getAssociatedCustomerCount(row)
    if (childCount > 0) {
      childBlockedRows.push({ row, count: childCount })
    }
    if (customerCount > 0) {
      customerBlockedRows.push({ row, count: customerCount })
    }
  })
  if (childBlockedRows.length === 0 && customerBlockedRows.length === 0) return ''
  if (rows.length === 1) {
    const parts = []
    if (childBlockedRows.length > 0) parts.push(`存在 ${childBlockedRows[0].count} 个子项`)
    if (customerBlockedRows.length > 0) parts.push(`已关联 ${customerBlockedRows[0].count} 个客户`)
    return `"${rows[0].tagName}"${parts.join('，')}，不能删除`
  }
  const parts = []
  if (childBlockedRows.length > 0) parts.push(`${childBlockedRows.length} 个节点存在子项`)
  if (customerBlockedRows.length > 0) parts.push(`${customerBlockedRows.length} 个标签已关联客户`)
  return `所选数据中${parts.join('，')}，不能批量删除`
}

function countDescendants(row) {
  return getDescendants(row).length
}

function getAssociatedCustomerCount(row) {
  return Number(row.markCount || row.customerCount || row.customerNum || row.relationCount || row.bindCount || 0)
}

function getSelectedSourceRows() {
  return uniqueRows(selectedRows.value.map(row => getRowById(row.id) || row))
}

function uniqueRows(rows) {
  const map = new Map()
  rows.filter(Boolean).forEach(row => {
    map.set(String(row.id), getRowById(row.id) || row)
  })
  return Array.from(map.values())
}

function getFormStatusCascadeRows() {
  if (!form.id || form.status !== 'inactive') return []
  const current = getRowById(form.id)
  if (!current || current.status === 'inactive') return []
  return getActiveDescendants(current)
}

function getFormInactiveAncestorsForActiveStatus() {
  if (form.status !== 'active') return []
  return getInactiveAncestorsByParentId(getFormParentId())
}

function getFormParentId() {
  if (Number(form.level) === 2) return form.categoryId
  if (Number(form.level) === 3) return form.parentId
  return undefined
}

function getInactiveAncestors(row) {
  return getInactiveAncestorsByParentId(row?.parentId)
}

function getInactiveAncestorsByParentId(parentId) {
  const result = []
  let current = getRowById(parentId)
  while (current) {
    if (current.status === 'inactive') {
      result.unshift(current)
    }
    current = getRowById(current.parentId)
  }
  return result
}

function getActiveDescendants(row) {
  return getDescendants(row).filter(item => item.status !== 'inactive')
}

function getDescendants(row) {
  const result = []
  collectDescendants(row.id, result)
  return result
}

function collectDescendants(parentId, result) {
  allRows.value
      .filter(item => String(item.parentId) === String(parentId))
      .forEach(child => {
        result.push(child)
        collectDescendants(child.id, result)
      })
}

function buildStatusCascadeMessage(row, descendants) {
  const summary = buildDescendantStatusSummary(descendants)
  if (Number(row?.level) === 1) {
    return `该分类下 ${summary} 将同步修改为禁用状态，确认停用"${row.tagName}"吗？`
  }
  if (Number(row?.level) === 2) {
    return `该子类下 ${summary} 将同步修改为禁用状态，确认停用"${row.tagName}"吗？`
  }
  return `其下 ${summary} 将同步修改为禁用状态，确认停用"${row?.tagName || '当前节点'}"吗？`
}

function buildDescendantStatusSummary(descendants) {
  const subCategoryCount = descendants.filter(item => Number(item.level) === 2).length
  const tagCount = descendants.filter(item => Number(item.level) === 3).length
  const parts = []
  if (subCategoryCount > 0) parts.push(`${subCategoryCount} 个子类`)
  if (tagCount > 0) parts.push(`${tagCount} 个标签`)
  return parts.length > 0 ? parts.join('、') : `${descendants.length} 个子项`
}

function buildAncestorEnableSummary(ancestors) {
  const categoryCount = ancestors.filter(item => Number(item.level) === 1).length
  const subCategoryCount = ancestors.filter(item => Number(item.level) === 2).length
  const parts = []
  if (categoryCount > 0) parts.push(`${categoryCount} 个父级类别`)
  if (subCategoryCount > 0) parts.push(`${subCategoryCount} 个父级子类`)
  return parts.length > 0 ? parts.join('、') : `${ancestors.length} 个父级节点`
}

function buildBatchDisableMessage(selected, targetRows, extraCascadeRows) {
  const cascadeText = extraCascadeRows.length > 0 ? `，其中 ${buildDescendantStatusSummary(extraCascadeRows)} 为子项联动` : ''
  return `已选择 ${selected.length} 个节点，实际将停用 ${targetRows.length} 个节点${cascadeText}，确认继续吗？`
}

function buildBatchEnableMessage(selected, ancestorRows) {
  const ancestorText = ancestorRows.length > 0 ? `，并同步启用${buildAncestorEnableSummary(ancestorRows)}` : ''
  return `确认启用选中的 ${selected.length} 个节点${ancestorText}吗？`
}

function buildStatusPayload(row, status) {
  const level = Number(row.level)
  return {
    id: row.id,
    level,
    parentId: level === 1 ? undefined : row.parentId,
    tagName: row.tagName,
    publicPrivateType: row.publicPrivateType,
    tagType: row.tagType || '公共',
    selectType: level === 2 ? row.selectType : undefined,
    nature: level === 3 ? row.nature : undefined,
    status,
    sortOrder: row.sortOrder || 0,
    expireDate: level === 3 ? row.expireDate : undefined,
    remark: row.remark
  }
}

function openConvertDialog() {
  resetConvertForm()
  const selectedTags = getSelectedSourceRows().filter(row => Number(row.level) === 3)
  if (selectedTags.length === 1) {
    convertForm.sourceTagId = selectedTags[0].id
  }
  convertOpen.value = true
}

async function openScopeDialog(row) {
  scopeContextTag.value = getScopeContextTag(row)
  scopeQuickRoleItems.value = []
  scopeQuickOrgItems.value = []
  scopeOpen.value = true
  scopeLoading.value = true
  try {
    await Promise.all([loadScopeBaseOptions(), loadScopeTagTree()])
    await loadScopeQuickItems()
    applyDefaultConfiguredScope()
    await nextTick()
    await loadScopeSnapshot()
  } finally {
    scopeLoading.value = false
  }
}

function resetScopeDialog() {
  scopeLoading.value = false
  scopeSaving.value = false
  scopeCheckedCount.value = 0
  scopeContextTag.value = null
  scopeQuickRoleItems.value = []
  scopeQuickOrgItems.value = []
}

async function loadScopeBaseOptions() {
  await ensureScopeLookupOptions()
  ensureDefaultScopeValue()
}

async function ensureScopeLookupOptions() {
  const [roleRes, deptRes] = await Promise.all([
    roleOptions.value.length > 0 ? Promise.resolve({ data: roleOptions.value }) : listTagScopeRoleOptions(),
    deptOptions.value.length > 0 ? Promise.resolve({ data: deptOptions.value }) : listTagScopeDeptOptions()
  ])
  roleOptions.value = (roleRes.data || []).filter(item => item.roleKey)
  deptOptions.value = normalizeDeptTree(deptRes.data || [])
}

async function loadScopeTagTree() {
  if (scopeTagTree.value.length > 0) return
  const res = await listFeatureTagManageTree({})
  const rows = (res.data || []).map(normalizeRow)
  scopeTagTree.value = buildTree(rows)
}

function ensureDefaultScopeValue() {
  if (scopeForm.scopeType === 'ROLE') {
    if (!scopeForm.scopeValue && roleOptions.value.length > 0) {
      scopeForm.scopeValue = roleOptions.value[0].roleKey
    }
  } else if (!scopeForm.scopeValue && deptOptions.value.length > 0) {
    scopeForm.scopeValue = String(deptOptions.value[0].id)
  }
}

function handleScopeTypeChange() {
  scopeForm.scopeValue = undefined
  ensureDefaultScopeValue()
  loadScopeSnapshot()
}

function getScopeContextTag(row) {
  if (row && Number(row.level) === 3) {
    return row
  }
  if (formOpen.value && Number(form.level) === 3 && form.id) {
    return {
      id: form.id,
      tagName: form.tagName,
      level: 3
    }
  }
  const selectedTags = getSelectedSourceRows().filter(item => Number(item.level) === 3)
  return selectedTags.length === 1 ? selectedTags[0] : null
}

async function loadScopeQuickItems() {
  scopeQuickRoleItems.value = []
  scopeQuickOrgItems.value = []
  if (!scopeContextTag.value?.id) {
    return
  }
  const res = await getTagScopeSummary(scopeContextTag.value.id)
  const data = res.data || {}
  scopeQuickRoleItems.value = buildRoleScopeItems(data.roleKeys || [])
  scopeQuickOrgItems.value = buildOrgScopeItems(data.orgNos || [])
}

function applyDefaultConfiguredScope() {
  if (scopeForm.scopeType === 'ROLE' && scopeQuickRoleItems.value.length > 0) {
    scopeForm.scopeValue = scopeQuickRoleItems.value[0].value
    return
  }
  if (scopeForm.scopeType === 'ORG' && scopeQuickOrgItems.value.length > 0) {
    scopeForm.scopeValue = String(scopeQuickOrgItems.value[0].value)
    return
  }
  if (scopeQuickRoleItems.value.length > 0) {
    scopeForm.scopeType = 'ROLE'
    scopeForm.scopeValue = scopeQuickRoleItems.value[0].value
    return
  }
  if (scopeQuickOrgItems.value.length > 0) {
    scopeForm.scopeType = 'ORG'
    scopeForm.scopeValue = String(scopeQuickOrgItems.value[0].value)
    return
  }
  ensureDefaultScopeValue()
}

async function selectScopeQuickRole(roleKey) {
  if (!roleKey) return
  scopeForm.scopeType = 'ROLE'
  scopeForm.scopeValue = roleKey
  await loadScopeSnapshot()
}

async function selectScopeQuickOrg(orgNo) {
  if (!orgNo) return
  scopeForm.scopeType = 'ORG'
  scopeForm.scopeValue = String(orgNo)
  await loadScopeSnapshot()
}

async function loadScopeSnapshot() {
  const scopeValue = currentScopeValue()
  if (!scopeOpen.value || !scopeValue) {
    scopeOriginalTagIds.value = []
    setScopeCheckedKeys([])
    return
  }
  scopeLoading.value = true
  try {
    const res = await getTagScopeSnapshot({
      scopeType: scopeForm.scopeType,
      scopeValue
    })
    scopeOriginalTagIds.value = (res.data || []).map(id => Number(id))
    setScopeCheckedKeys(scopeOriginalTagIds.value)
  } finally {
    scopeLoading.value = false
  }
}

function setScopeCheckedKeys(tagIds) {
  nextTick(() => {
    scopeTagTreeRef.value?.setCheckedKeys(tagIds || [], false)
    refreshScopeCheckedCount()
  })
}

function handleScopeTagCheck(data, checkedInfo) {
  if (Number(data.level) !== 3) {
    const checkedKeys = new Set((checkedInfo.checkedKeys || []).map(id => String(id)))
    const halfCheckedKeys = new Set((checkedInfo.halfCheckedKeys || []).map(id => String(id)))
    const currentChecked = checkedKeys.has(String(data.id)) && !halfCheckedKeys.has(String(data.id))
    const leafIds = []
    collectLeafIds([data], leafIds)
    leafIds.forEach(id => {
      scopeTagTreeRef.value?.setChecked(id, currentChecked, false)
    })
  }
  refreshScopeCheckedCount()
}

function getScopeCheckedLeafIds() {
  const nodes = scopeTagTreeRef.value?.getCheckedNodes(false, false) || []
  return nodes
      .filter(item => Number(item.level) === 3)
      .map(item => Number(item.id))
      .filter(id => !Number.isNaN(id))
}

function refreshScopeCheckedCount() {
  scopeCheckedCount.value = getScopeCheckedLeafIds().length
}

async function submitScopeSnapshot() {
  const scopeValue = currentScopeValue()
  if (!scopeValue) {
    proxy.$modal.msgWarning(scopeForm.scopeType === 'ROLE' ? '请选择角色' : '请选择机构')
    return
  }
  const nextTagIds = getScopeCheckedLeafIds()
  try {
    await proxy.$modal.confirm(buildScopePreviewMessage(nextTagIds))
  } catch {
    return
  }
  scopeSaving.value = true
  try {
    await saveTagScopeSnapshot({
      scopeType: scopeForm.scopeType,
      scopeValue,
      tagIds: nextTagIds
    })
    scopeOriginalTagIds.value = [...nextTagIds]
    await loadScopeQuickItems()
    proxy.$modal.msgSuccess('展示范围保存成功')
    if (formOpen.value && form.level === 3 && form.id) {
      loadScopeSummary(form.id)
    }
    getList()
  } finally {
    scopeSaving.value = false
  }
}


function buildScopePreviewMessage(nextTagIds) {
  const oldSet = new Set((scopeOriginalTagIds.value || []).map(id => String(id)))
  const nextSet = new Set((nextTagIds || []).map(id => String(id)))
  const added = [...nextSet].filter(id => !oldSet.has(id)).length
  const removed = [...oldSet].filter(id => !nextSet.has(id)).length
  const objectText = scopeForm.scopeType === 'ROLE' ? '角色' : '机构'
  return `本次将为${objectText}保存 ${nextSet.size} 个可见标签，新增 ${added} 个、移除 ${removed} 个，确认保存吗？`
}

function loadScopeSummary(tagId) {
  scopeSummary.value = null
  getTagScopeSummary(tagId).then(res => {
    scopeSummary.value = res.data || { roleCount: 0, orgCount: 0 }
  })
}

function collectLeafIds(nodes, result) {
  nodes.forEach(node => {
    if (Number(node.level) === 3) {
      result.push(node.id)
    } else {
      collectLeafIds(node.children || [], result)
    }
  })
}

function findDeptPath(id, nodes, path = []) {
  for (const node of nodes || []) {
    const nextPath = [...path, node]
    if (String(node.id) === String(id)) return nextPath
    const found = findDeptPath(id, node.children || [], nextPath)
    if (found.length) return found
  }
  return []
}

function normalizeDeptTree(nodes) {
  return (nodes || []).map(item => ({
    ...item,
    id: String(item.id ?? item.deptId),
    label: item.label || item.deptName,
    children: normalizeDeptTree(item.children || [])
  }))
}

function formatRoleOption(row) {
  return row.roleName ? `${row.roleName}（${row.roleKey}）` : row.roleKey
}

function currentScopeValue() {
  return scopeForm.scopeValue ? String(scopeForm.scopeValue) : ''
}

function resetConvertForm() {
  convertForm.sourceTagId = undefined
  convertForm.targetTagId = undefined
  clearConvertPreview()
}

function clearConvertPreview() {
  convertPreview.value = null
}

function validateConvertForm() {
  if (!convertForm.sourceTagId) return '请选择源标签'
  if (!convertForm.targetTagId) return '请选择目标标签'
  if (String(convertForm.sourceTagId) === String(convertForm.targetTagId)) return '源标签和目标标签不能相同'
  const targetTag = getRowById(convertForm.targetTagId)
  const blockedReason = convertTargetBlockedReason(targetTag)
  if (blockedReason) return `接收标签${blockedReason}，不能作为目标标签`
  return ''
}

async function loadConvertPreview() {
  const error = validateConvertForm()
  if (error) {
    proxy.$modal.msgWarning(error)
    return
  }
  convertPreviewLoading.value = true
  try {
    const res = await previewTagConvert({
      sourceTagId: convertForm.sourceTagId,
      targetTagId: convertForm.targetTagId
    })
    convertPreview.value = res.data || null
  } finally {
    convertPreviewLoading.value = false
  }
}

async function submitConvert() {
  const error = validateConvertForm()
  if (error) {
    proxy.$modal.msgWarning(error)
    return
  }
  if (!convertPreview.value) {
    await loadConvertPreview()
  }
  if (!convertPreview.value || convertCustomers.value.length === 0) {
    proxy.$modal.msgWarning('未匹配到需要转换的客户')
    return
  }
  try {
    await proxy.$modal.confirm(buildConvertConfirmMessage())
  } catch {
    return
  }
  convertSubmitLoading.value = true
  try {
    const res = await convertTag({
      sourceTagId: convertForm.sourceTagId,
      targetTagId: convertForm.targetTagId
    })
    proxy.$modal.msgSuccess(buildConvertSuccessMessage(res.data))
    convertOpen.value = false
    getList()
  } finally {
    convertSubmitLoading.value = false
  }
}

function buildConvertConfirmMessage() {
  const sourceName = convertPreview.value?.sourceTagName || getTagName(convertForm.sourceTagId)
  const targetName = convertPreview.value?.targetTagName || getTagName(convertForm.targetTagId)
  return `确认将 ${convertCustomers.value.length} 户客户从"${sourceName}"转换到"${targetName}"吗？已有目标标签的客户将仅移除源标签。`
}

function buildConvertSuccessMessage(result) {
  if (!result) return '转换完成'
  return `转换完成：处理 ${result.updatedCount || 0} 户，追加目标标签 ${result.addTargetCount || 0} 户，仅移除源标签 ${result.removeOnlyCount || 0} 户`
}

function getTagName(id) {
  const tag = getRowById(id)
  return tag ? tag.tagName : ''
}

function formatTagSelectLabel(row) {
  const parents = getParentNames(row)
  const path = [parents.level1, parents.level2, row.tagName].filter(Boolean).join(' / ')
  const blockedReason = convertTargetBlockedReason(row)
  return blockedReason ? `${path}（${blockedReason}）` : path
}

function isConvertTargetDisabled(row) {
  return String(row.id) === String(convertForm.sourceTagId) || !!convertTargetBlockedReason(row)
}

function convertTargetBlockedReason(row) {
  if (!row) return ''
  if (row.status === 'inactive') return '已禁用'
  return getExpireStatus(row) === 'expired' ? '已过期' : ''
}



function openImportDialog(mode = 'feature') {
  importMode.value = mode
  resetImportDialog()
  importOpen.value = true
}

function resetImportDialog() {
  importUploading.value = false
  importFile.value = null
  importResult.value = null
  importUploadRef.value?.clearFiles()
}

function handleImportFileChange(file) {
  const name = file?.name || file?.raw?.name || ''
  if (!/\.(xls|xlsx)$/i.test(name)) {
    proxy.$modal.msgWarning('仅支持 .xls / .xlsx 文件')
    importUploadRef.value?.clearFiles()
    importFile.value = null
    return
  }
  importFile.value = file.raw || file
  importResult.value = null
}

function handleImportFileRemove() {
  importFile.value = null
}

function handleImportFileExceed(files) {
  importUploadRef.value?.clearFiles()
  const file = files && files[0]
  if (file) {
    importUploadRef.value?.handleStart(file)
  }
}

async function handleDownloadImportTemplate() {
  if (importMode.value === 'feature') {
    const blob = await downloadFeatureTagImportTemplate()
    saveAs(new Blob([blob]), '标签体系导入模板.xlsx')
    return
  }
  const blob = await downloadTagImportTemplate()
  saveAs(new Blob([blob]), '标签客户导入模板.xlsx')
}

async function submitImport() {
  if (!importFile.value) {
    proxy.$modal.msgWarning('请选择导入文件')
    return
  }
  const data = new FormData()
  data.append('file', importFile.value)
  importUploading.value = true
  try {
    const res = importMode.value === 'feature'
        ? await importFeatureTags(data)
        : await importTagCustomers(data)
    importResult.value = res.data || { successCount: 0, failureCount: 0, failures: [] }
    const featureSummary = importMode.value === 'feature'
        ? `，新增 ${importResult.value.insertCount || 0} 个节点，更新 ${importResult.value.updateCount || 0} 个节点`
        : ''
    proxy.$modal.msgSuccess(`导入完成：成功 ${importResult.value.successCount || 0} 条${featureSummary}，失败 ${importResult.value.failureCount || 0} 条`)
    getList()
  } finally {
    importUploading.value = false
  }
}

function downloadImportFailures() {
  const data = importMode.value === 'feature'
      ? [['行号', '层级', '一级分类', '二级分类', '标签名称', '失败原因']]
      : [['行号', '客户号', '标签名称', '操作', '失败原因']]
  if (importMode.value === 'feature') {
    importFailures.value.forEach(item => data.push([item.rowNum, item.level, item.level1Name, item.level2Name, item.tagName, item.reason]))
  } else {
    importFailures.value.forEach(item => data.push([item.rowNum, item.customerNo, item.tagName, item.action, item.reason]))
  }
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = importMode.value === 'feature'
      ? [{ wch: 8 }, { wch: 8 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 32 }]
      : [{ wch: 8 }, { wch: 18 }, { wch: 20 }, { wch: 10 }, { wch: 32 }]
  XLSX.utils.book_append_sheet(wb, ws, '失败明细')
  const fileName = importMode.value === 'feature' ? '标签体系导入失败明细' : '标签客户导入失败明细'
  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

function exportData() {
  const rows = []
  flattenRows(treeRows.value, rows)
  if (rows.length === 0) {
    proxy.$modal.msgWarning('没有可导出的数据')
    return
  }
  const data = [[
    'ID', '标签名称', '所属一级类别', '所属二级类别', '公私分类', '标签性质', '可选类型', '状态', '关联客户', '展示范围', '时效截止日期', '备注'
  ]]
  rows.forEach(row => {
    const parents = getParentNames(row)
    data.push([
      row.id,
      row.tagName,
      parents.level1,
      parents.level2,
      publicPrivateLabel(row.publicPrivateType),
      Number(row.level) === 3 ? natureLabel(row.nature) : '',
      Number(row.level) === 3 ? selectTypeText(row) : '',
      hasStatusOption(row) ? statusText(row) : '',
      isLeafTag(row) ? (row.markCount || 0) : '',
      isLeafTag(row) ? scopeSummaryLabel(row) : '',
      Number(row.level) === 3 ? (row.expireDate || '') : '',
      row.remark || ''
    ])
  })
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 8 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 15 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, ws, '标签数据')
  XLSX.writeFile(wb, `标签数据_三级结构_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

function flattenRows(rows, result) {
  rows.forEach(row => {
    result.push(row)
    flattenRows(row.children || [], result)
  })
}

function getParentNames(row) {
  if (Number(row.level) === 1) {
    return { level1: row.tagName, level2: '' }
  }
  const parent = allRows.value.find(item => item.id === row.parentId)
  if (Number(row.level) === 2) {
    return { level1: parent ? parent.tagName : '', level2: row.tagName }
  }
  const grandParent = parent ? allRows.value.find(item => item.id === parent.parentId) : null
  return {
    level1: grandParent ? grandParent.tagName : '',
    level2: parent ? parent.tagName : ''
  }
}

function levelText(level) {
  switch (Number(level)) {
    case 1: return '类别'
    case 2: return '子类'
    case 3: return '标签'
    default: return '未知'
  }
}

function levelIcon(level) {
  switch (Number(level)) {
    case 1: return 'Folder'
    case 2: return 'Collection'
    case 3: return 'PriceTag'
    default: return 'PriceTag'
  }
}

function publicPrivateLabel(value) {
  const item = publicPrivateOptions.value.find(option => String(option.value) === String(value))
  if (item) return item.label
  if (value === '对公' || value === '对私' || value === '通用') return value
  return '-'
}

function natureLabel(value) {
  if (value === 'positive') return '正向'
  if (value === 'negative') return '负向'
  return '中性'
}

function selectTypeText(row) {
  if (Number(row.level) === 2) {
    return row.selectType === 'single' ? '单选' : '多选'
  }
  if (Number(row.level) === 3) {
    const parent = allRows.value.find(item => item.id === row.parentId)
    return parent && parent.selectType === 'single' ? '单选' : '多选'
  }
  return ''
}

getList()
</script>

<style scoped>
.stats-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.stats-bar__item {
  white-space: nowrap;
}

.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 4px;
}

.batch-bar__summary {
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.batch-bar__actions {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.batch-bar__actions .el-button {
  margin-left: 0;
}

.tag-tree-table {
  background: var(--el-bg-color);
}

.name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.level-icon {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  font-size: 16px;
}

.level-icon-1 {
  color: var(--el-color-primary);
}

.level-icon-2 {
  color: var(--el-color-success);
}

.level-icon-3 {
  color: var(--el-text-color-secondary);
}

.node-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.level-name-1 {
  font-weight: 600;
  color: var(--el-color-primary);
}

.level-name-2 {
  font-weight: 600;
  color: var(--el-color-success);
}

.level-name-3 {
  color: var(--el-text-color-primary);
}

.nature-text {
  font-size: 13px;
  line-height: 22px;
}

.nature-text--positive {
  color: var(--el-color-danger);
}

.nature-text--negative {
  color: var(--el-color-success);
}

.nature-text--neutral {
  color: var(--el-color-primary);
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  vertical-align: middle;
}

.status-dot--active {
  background: var(--el-color-success);
}

.status-dot--inactive {
  background: var(--el-color-danger);
}

.status-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  white-space: nowrap;
}

.expire-date--danger {
  color: var(--el-color-danger);
}

.import-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.import-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
}

.import-tip {
  flex: 1;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 20px;
}

.import-upload {
  width: 100%;
}

.import-result {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
}

.import-result__summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-regular);
  font-size: 13px;
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

.tag-form {
  padding-right: 8px;
}

.scope-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  color: var(--el-text-color-regular);
}

.form-tip {
  width: 100%;
  margin-top: 6px;
  line-height: 18px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.form-tip--warning {
  color: var(--el-color-warning);
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.convert-form {
  margin-bottom: 8px;
}

.convert-form :deep(.el-form-item__label) {
  white-space: nowrap;
}

.convert-preview-btn {
  width: 100%;
}

.convert-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 8px 12px;
  margin-bottom: 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.convert-table {
  width: 100%;
}

.scope-dialog {
  min-height: 520px;
}

.scope-dialog__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.scope-dialog__object {
  flex: 0 0 auto;
}

.scope-dialog__quick-items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  margin: -4px 0 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.scope-dialog__quick-label {
  flex: 0 0 auto;
  color: var(--el-text-color-secondary);
}

.scope-dialog__quick-items :deep(.el-button) {
  height: 24px;
  padding: 0;
  margin-left: 0;
}

.scope-dialog__body {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
}

.scope-dialog__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.scope-dialog__count {
  color: var(--el-text-color-secondary);
}

.scope-tag-tree {
  height: 460px;
  padding: 8px 12px;
  overflow: auto;
}

.scope-tag-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 13px;
}

.scope-tag-node--1 {
  font-weight: 600;
  color: var(--el-color-primary);
}

.scope-tag-node--2 {
  font-weight: 600;
  color: var(--el-color-success);
}

.scope-tag-node--3 {
  color: var(--el-text-color-primary);
}

.scope-tag-node__current-tag {
  background: var(--el-bg-color);
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.scope-summary-link {
  padding: 0;
  height: auto;
}

.tag-customer-table {
  width: 100%;
}

.tag-customer-search {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  column-gap: 12px;
  row-gap: 8px;
  margin-bottom: 10px;
}

.tag-customer-search :deep(.el-form-item) {
  flex: 0 0 auto;
  margin-right: 0;
  margin-bottom: 0;
}

.tag-customer-search :deep(.el-form-item__label) {
  overflow: visible;
  white-space: nowrap;
}

.tag-customer-search :deep(.el-input),
.tag-customer-search :deep(.el-select) {
  width: 168px;
}

.tag-customer-search :deep(.tag-customer-search__actions.el-form-item) {
  margin-right: 0;
}

.tag-customer-search__actions :deep(.el-button) {
  margin-left: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
