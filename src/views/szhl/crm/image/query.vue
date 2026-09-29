<template>
  <div class="app-container crm-page">
    <div class="image-search-panel">
      <div v-show="showSearch" class="image-search-tip">
        <el-icon><WarningFilled /></el-icon>
        <span>查询规则：</span>
        <strong>客户名称、客户号均需输入完整内容，按精确匹配查询。</strong>
      </div>

      <el-form class="image-search-form" :model="queryParams" label-width="86px" @submit.prevent>
        <el-row v-show="showSearch" :gutter="16">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <el-form-item label="客户名称">
              <el-input
                v-model="queryParams.customerName"
                clearable
                placeholder="请输入完整客户名称"
                prefix-icon="User"
                @keyup.enter="handleQuery"
                @clear="getList"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <el-form-item label="客户号">
              <el-input
                v-model="queryParams.customerNo"
                clearable
                placeholder="请输入完整客户号"
                prefix-icon="Tickets"
                @keyup.enter="handleQuery"
                @clear="getList"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item class="image-search-actions-row" label-width="0">
          <div class="image-search-actions__bar">
            <div class="image-search-actions__left">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              <el-button
                type="info"
                plain
                icon="Setting"
                @click="categoryOpen = true"
                v-hasPermi="['crm:image:category']"
                v-hasRole="['crm_header']"
              >
                影像分类管理
              </el-button>
            </div>
            <div class="image-search-actions__right">
              <right-toolbar v-model:showSearch="showSearch" @queryTable="handleToolbarQuery" />
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <common-table
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :loading="loading"
      :data="tableList"
      :columns="customerTableColumns"
      :total="total"
      :empty-string="customerTableEmptyText"
      @pagination="getList"
    >
      <template #actions="{ row }">
        <div class="image-row-actions">
          <el-button link type="primary" @click="openCustomerImages(row)">影像明细</el-button>
          <el-button link type="primary" @click="openUploadDialog(row)">上传</el-button>
        </div>
      </template>
      <template #customerName="{ row }">
        <CustomerLink :row="row" mode="name" />
      </template>
      <template #customerNo="{ row }">
        <CustomerLink :row="row" mode="no" />
      </template>
      <template #publicPrivateType="{ row }">
        {{ row.publicPrivateType === '1' ? '对公' : '对私' }}
      </template>
      <template #attributionOrg="{ row }">
        <dict-tag :options="orgOptions" :value="row.attributionOrg" />
      </template>
      <template #manager="{ row }">{{ formatUser(row.managerId, row.managerName) }}</template>
      <template #imageCount="{ row }">
        <el-button
          v-if="row.imageCount > 0"
          class="image-count-link"
          link
          type="primary"
          @click="openCustomerImages(row)"
        >
          {{ row.imageCount }} 份
        </el-button>
      </template>
      <template #latestUploadDate="{ row }">
        <span :class="row.latestUploadDate ? 'latest-upload-date' : 'table-empty-text'">
          {{ parseTime(row.latestUploadDate, '{y}-{m}-{d}') || '未上传' }}
        </span>
      </template>
    </common-table>

    <el-dialog
      v-model="detailOpen"
      fullscreen
      append-to-body
      :show-close="false"
      class="image-detail-dialog"
      @closed="resetDetailDialog"
    >
      <template #header>
        <el-page-header class="image-detail-header" :content="detailTitle" title="关闭" @back="detailOpen = false" />
      </template>
      <div class="image-detail-layout">
        <aside class="image-detail-list">
          <div class="image-detail-list__header">
            <div>
              <div class="image-detail-list__title">影像资料列表</div>
              <div class="image-detail-list__sub">共 {{ detailTotal }} 条记录</div>
            </div>
            <el-button type="primary" plain icon="Upload" @click="openUploadDialog(detailCustomer)" v-hasPermi="['crm:image:upload']">上传影像</el-button>
          </div>

          <div class="image-detail-status">
            <el-radio-group v-model="detailQuery.delFlag" size="small" @change="handleDetailStatusChange">
              <el-radio-button label="0">当前文件</el-radio-button>
              <el-radio-button label="1">删除历史</el-radio-button>
            </el-radio-group>
          </div>

          <div class="image-detail-filter">
            <el-input
              v-model="detailQuery.docName"
              class="image-detail-filter__name"
              placeholder="按资料名称搜索"
              clearable
              prefix-icon="Search"
              @input="handleDetailFilterDebounced"
              @clear="handleDetailFilter"
            />
            <el-popover
              placement="bottom-end"
              :width="240"
              trigger="click"
              popper-class="category-filter-popover"
              v-model:visible="categoryFilterVisible"
            >
              <template #reference>
                <el-button
                  class="image-detail-filter__btn"
                  icon="Filter"
                  :type="detailQuery.imageCategoryId ? 'primary' : 'default'"
                  :plain="!!detailQuery.imageCategoryId"
                  title="按分类筛选"
                />
              </template>
              <div class="category-filter">
                <el-tree
                  :data="categoryTree"
                  node-key="value"
                  highlight-current
                  :current-node-key="detailQuery.imageCategoryId"
                  :expand-on-click-node="false"
                  default-expand-all
                  empty-text="暂无分类"
                  @node-click="handleCategoryNodeClick"
                />
                <div class="category-filter__footer">
                  <el-button link type="primary" size="small" @click="clearCategoryFilter">清除筛选</el-button>
                </div>
              </div>
            </el-popover>
          </div>

          <div v-loading="detailLoading" class="image-card-list">
            <el-empty v-if="!detailLoading && detailRows.length === 0" :description="detailEmptyDescription" />
            <div
              v-for="item in detailRows"
              :key="item.id"
              class="image-card"
              :class="{ 'is-active': isActiveDetailRow(item), 'is-deleted': item.delFlag === '1' }"
              @click="selectDetailImage(item)"
            >
              <div class="image-card__icon" :style="{ background: fileKindOf(item.filePath).color }">{{ fileKindOf(item.filePath).label }}</div>
              <div class="image-card__body">
                <div class="image-card__top">
                  <span class="image-card__tag" :style="{ background: fileKindOf(item.filePath).bg, color: fileKindOf(item.filePath).color }">{{ formatCategoryPath(item) }}</span>
                  <el-dropdown trigger="click" @command="handleCardCommand($event, item)">
                    <el-icon class="image-card__more" @click.stop><MoreFilled /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <template v-if="item.delFlag === '1'">
                          <el-dropdown-item command="restore" v-hasPermi="['crm:image:remove']">还原</el-dropdown-item>
                          <el-dropdown-item v-if="isUploader(item)" command="delete" divided v-hasPermi="['crm:image:remove']">彻底删除</el-dropdown-item>
                        </template>
                        <el-dropdown-item v-else command="delete" v-hasPermi="['crm:image:remove']">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
                <div class="image-card__name">{{ item.docName || '-' }}</div>
                <div v-if="item.delFlag === '1'" class="image-card__time image-card__time--deleted">
                  删除于 {{ parseTime(item.deleteDate, '{y}-{m}-{d} {h}:{i}') || '-' }} / {{ formatUser(item.deleteBy) }}
                </div>
                <div v-else class="image-card__time">更新于 {{ parseTime(item.uploadDate, '{y}-{m}-{d} {h}:{i}') || '-' }}</div>
              </div>
            </div>
          </div>

          <div v-if="detailTotal > 0" class="image-detail-pagination">
            <el-pagination
              background
              small
              layout="prev, pager, next"
              :current-page="detailQuery.pageNum"
              :page-size="detailQuery.pageSize"
              :total="detailTotal"
              :pager-count="5"
              @current-change="handleDetailPageChange"
            />
          </div>
        </aside>

        <main class="image-detail-main">
          <template v-if="previewRow && previewRow.id">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="客户名称">{{ previewRow.customerName }}</el-descriptions-item>
              <el-descriptions-item label="客户号">{{ previewRow.customerNo }}</el-descriptions-item>
              <el-descriptions-item label="资料类别">{{ previewRow.imageCategory }} / {{ previewRow.imageSubcategory }}</el-descriptions-item>
              <el-descriptions-item label="资料名称">{{ previewRow.docName }}</el-descriptions-item>
              <el-descriptions-item label="上传人">{{ formatUser(previewRow.uploadBy) }}</el-descriptions-item>
              <el-descriptions-item label="上传日期">{{ parseTime(previewRow.uploadDate, '{y}-{m}-{d}') || '-' }}</el-descriptions-item>
              <el-descriptions-item v-if="previewRow.delFlag === '1'" label="删除人">{{ formatUser(previewRow.deleteBy) }}</el-descriptions-item>
              <el-descriptions-item v-if="previewRow.delFlag === '1'" label="删除时间">{{ parseTime(previewRow.deleteDate, '{y}-{m}-{d} {h}:{i}') || '-' }}</el-descriptions-item>
              <el-descriptions-item label="文件地址" :span="2">{{ previewRow.filePath }}</el-descriptions-item>
            </el-descriptions>

            <div class="image-preview-panel">
              <el-image
                v-if="previewKind === 'image' && previewUrl"
                :src="previewUrl"
                :preview-src-list="[previewUrl]"
                fit="contain"
                class="image-preview-panel__image"
              >
                <template #error>
                  <el-empty description="图片加载失败，可通过文件地址下载查看" />
                </template>
              </el-image>
              <iframe
                v-else-if="previewKind === 'pdf' && previewUrl"
                :src="previewUrl"
                class="image-preview-panel__frame"
              />
              <div
                v-else-if="(previewKind === 'docx' || previewKind === 'excel') && previewUrl"
                v-loading="officeLoading"
                class="image-preview-panel__office"
              >
                <el-empty v-if="officeError" :description="officeError" />
                <div v-else class="office-content" :class="`office-content--${previewKind}`" v-html="officeHtml"></div>
              </div>
              <el-empty v-else-if="previewUrl" description="该格式暂不支持在线预览，可通过文件地址下载查看" />
              <el-empty v-else description="暂无影像文件" />
            </div>
          </template>
          <el-empty v-else description="请在左侧选择影像资料" />
        </main>
      </div>
    </el-dialog>

    <el-dialog
      title="影像上传"
      v-model="uploadOpen"
      width="1080px"
      append-to-body
      class="crm-image-upload-dialog"
      @closed="resetUploadDialog"
    >
      <div class="upload-dialog-customer">
        <el-form :model="uploadForm" label-width="86px">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="客户名称">
                <el-select
                  v-model="uploadForm.customerId"
                  placeholder="请输入完整客户名称搜索"
                  filterable
                  remote
                  clearable
                  default-first-option
                  :remote-method="keyword => remoteSearchUploadCustomers(keyword, 'customerName')"
                  :loading="uploadCustomerLoading"
                  style="width: 100%"
                  @change="handleUploadCustomerSelect"
                  @clear="clearUploadCustomer"
                >
                  <el-option
                    v-for="item in uploadCustomerOptions"
                    :key="getCustomerValue(item)"
                    :label="item.customerName || '-'"
                    :value="getCustomerValue(item)"
                  >
                    <span>{{ formatCustomerOption(item) }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="客户号">
                <el-select
                  v-model="uploadForm.customerId"
                  placeholder="请输入客户号搜索"
                  filterable
                  remote
                  clearable
                  default-first-option
                  :remote-method="keyword => remoteSearchUploadCustomers(keyword, 'customerNo')"
                  :loading="uploadCustomerLoading"
                  style="width: 100%"
                  @change="handleUploadCustomerSelect"
                  @clear="clearUploadCustomer"
                >
                  <el-option
                    v-for="item in uploadCustomerOptions"
                    :key="getCustomerValue(item)"
                    :label="item.customerNo || '-'"
                    :value="getCustomerValue(item)"
                  >
                    <span>{{ formatCustomerOption(item) }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="当前客户">
                <span class="upload-dialog-customer__summary">
                  {{ uploadForm.customerName || '-' }} / {{ uploadForm.customerNo || '-' }}
                </span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="upload-dialog-toolbar">
        <div class="upload-dialog-toolbar__title">待上传资料</div>
        <div>
          <el-button type="primary" plain icon="Plus" @click="addUploadRow">新增行</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="uploadSelection.length === 0" @click="removeSelectedUploadRows">删除行</el-button>
        </div>
      </div>

      <el-table class="upload-dialog-table" :data="uploadRows" max-height="360" @selection-change="uploadSelection = $event">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="序号" type="index" width="64" align="center" />
        <el-table-column label="影像大类" width="160">
          <template #default="scope">
            <el-select v-model="scope.row.imageCategory" placeholder="请选择" class="upload-dialog-table__field" @change="handleUploadCategoryChange(scope.row)">
              <el-option v-for="item in mainCategories" :key="item" :label="item" :value="item" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="影像分类" width="180">
          <template #default="scope">
            <el-select v-model="scope.row.imageCategoryId" placeholder="请选择" class="upload-dialog-table__field" @change="handleUploadSubcategoryChange(scope.row)">
              <el-option v-for="item in getSubcategories(scope.row.imageCategory)" :key="item.id" :label="item.imageSubcategory" :value="item.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="资料名称" min-width="200">
          <template #default="scope">
            <el-input v-model="scope.row.docName" placeholder="请输入资料名称" class="upload-dialog-table__field" />
          </template>
        </el-table-column>
        <el-table-column label="文件" min-width="280">
          <template #default="scope">
            <div class="upload-file-cell">
              <el-upload
                v-if="!scope.row.fileName"
                class="upload-file-trigger"
                :auto-upload="false"
                :show-file-list="false"
                action="#"
                :on-change="file => handleUploadFileChange(scope.row, file)"
              >
                <el-button icon="Upload">选择文件</el-button>
              </el-upload>
              <template v-else>
                <span class="upload-file-selected">
                  <span class="upload-file-name" :title="scope.row.fileName">{{ scope.row.fileName }}</span>
                  <button class="upload-file-remove" type="button" title="移除文件" @click="handleUploadFileRemove(scope.row)">×</button>
                </span>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="88" align="center">
          <template #default="scope">
            <el-button link type="danger" @click="removeUploadRow(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="uploadOpen = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="submitUploadDialog">上传</el-button>
      </template>
    </el-dialog>

    <el-dialog title="影像资料分类管理" v-model="categoryOpen" width="760px" append-to-body>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" @click="newCategoryOpen = true">新增分类</el-button>
        </el-col>
      </el-row>
      <el-table :data="categoryOptions">
        <el-table-column label="影像大类" prop="imageCategory" min-width="160" />
        <el-table-column label="影像小类" prop="imageSubcategory" min-width="160" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="danger" @click="handleDelCategory(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog title="新增分类" v-model="newCategoryOpen" width="520px" append-to-body>
      <el-form :model="newCategoryForm" label-width="100px">
        <el-form-item label="影像大类">
          <el-select
            v-model="newCategoryForm.imageCategory"
            allow-create
            filterable
            default-first-option
            placeholder="请选择或输入影像大类"
            style="width: 100%"
          >
            <el-option v-for="item in mainCategories" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="影像小类">
          <el-input v-model="newCategoryForm.imageSubcategory" placeholder="请输入影像小类" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="saveCategory">保存</el-button>
        <el-button @click="newCategoryOpen = false">取消</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="CrmImageQuery">
import { computed, getCurrentInstance, reactive, ref, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as XLSX from 'xlsx'
import mammoth from 'mammoth/mammoth.browser.js'
import { listImage, listImageCustomer, delImage, restoreImage, listImageCategory, addImageCategory, delImageCategory, uploadImage } from '@/api/szhl/crm/image'
import CustomerLink from '@/views/szhl/crm/components/CustomerLink'
import { formatUserDisplayName, useUserOptions } from '@/utils/userEnum'
import useUserStore from '@/store/modules/user'
import gatewayUrl from '@/utils/gatewayUrl'

const { proxy } = getCurrentInstance()
const { sys_org_name: orgOptions } = proxy.useDict('sys_org_name')
const managerOptions = useUserOptions()
const route = useRoute()
const userStore = useUserStore()

const showSearch = ref(true)
const loading = ref(false)
const tableList = ref([])
const total = ref(0)
const lastCustomerSearch = ref({ customerName: '', customerNo: '' })
const detailOpen = ref(false)
const detailLoading = ref(false)
const detailRows = ref([])
const detailTotal = ref(0)
const detailCustomer = ref({})
const previewRow = ref({})
const categoryOptions = ref([])
const categoryFilterVisible = ref(false)
const categoryOpen = ref(false)
const newCategoryOpen = ref(false)
const uploadOpen = ref(false)
const uploadRows = ref([])
const uploadSelection = ref([])
const uploading = ref(false)
const uploadCustomerOptions = ref([])
const uploadCustomerLoading = ref(false)
const uploadForm = reactive({
  customerId: '',
  customerName: '',
  customerNo: ''
})
const newCategoryForm = reactive({
  imageCategory: '',
  imageSubcategory: ''
})
let uploadCustomerTimer
let uploadCustomerSeq = 0

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: undefined,
    customerNo: undefined
  }
})

const detailQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  delFlag: '0',
  imageCategoryId: undefined,
  docName: undefined
})

const { queryParams } = toRefs(data)

const previewUrl = computed(() => {
  return previewRow.value.filePath ? gatewayUrl(previewRow.value.filePath, 'crm') : ''
})

const customerTableEmptyText = computed(() => {
  const searched = !!(lastCustomerSearch.value.customerName || lastCustomerSearch.value.customerNo)
  return searched
    ? '未查询到匹配的客户，请确认客户名称或客户号是否完整准确'
    : '请先输入完整客户名称或客户号后搜索'
})

const detailEmptyDescription = computed(() => detailQuery.delFlag === '1' ? '暂无删除历史' : '暂无影像资料')

// 影像卡片：按文件后缀映射图标后缀文字与配色（图标背景 / 标签底色 / 标签字色同色系）
const FILE_KIND_STYLES = {
  word: { color: '#4f7cff', bg: '#eef2ff' },
  pdf: { color: '#f04438', bg: '#fef3f2' },
  image: { color: '#12b76a', bg: '#ecfdf3' },
  excel: { color: '#099250', bg: '#e9f9f0' },
  ppt: { color: '#f79009', bg: '#fff6ea' },
  other: { color: '#667085', bg: '#f2f4f7' }
}
function fileKindOf(name) {
  const text = String(name || '')
  const dot = text.lastIndexOf('.')
  const ext = dot >= 0 ? text.slice(dot + 1).toLowerCase() : ''
  let kind = 'other'
  if (['doc', 'docx'].includes(ext)) kind = 'word'
  else if (ext === 'pdf') kind = 'pdf'
  else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) kind = 'image'
  else if (['xls', 'xlsx', 'csv'].includes(ext)) kind = 'excel'
  else if (['ppt', 'pptx'].includes(ext)) kind = 'ppt'
  return { label: ext ? ext.toUpperCase() : 'FILE', ...FILE_KIND_STYLES[kind] }
}
function handleCardCommand(command, item) {
  if (command === 'delete') handleDelete(item)
  if (command === 'restore') handleRestore(item)
}

// 预览类型：按文件后缀自动适配（image/pdf 浏览器原生，docx/excel 前端渲染，其余降级下载）
const previewKind = computed(() => {
  const name = previewRow.value.filePath || previewRow.value.docName || ''
  const dot = String(name).lastIndexOf('.')
  const ext = dot >= 0 ? String(name).slice(dot + 1).toLowerCase() : ''
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx') return 'docx'
  if (['xlsx', 'xls'].includes(ext)) return 'excel'
  return 'unsupported'
})

const officeHtml = ref('')
const officeLoading = ref(false)
const officeError = ref('')

// 拉取文件二进制，docx 用 mammoth 转 HTML，excel 用 SheetJS 转表格（逐 sheet 拼接）
async function renderOfficePreview() {
  officeHtml.value = ''
  officeError.value = ''
  const kind = previewKind.value
  if ((kind !== 'docx' && kind !== 'excel') || !previewUrl.value) return
  officeLoading.value = true
  try {
    const resp = await fetch(previewUrl.value)
    if (!resp.ok) throw new Error('load failed')
    const buffer = await resp.arrayBuffer()
    if (kind === 'docx') {
      const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
      officeHtml.value = result.value || '<p>（空文档）</p>'
    } else {
      const wb = XLSX.read(buffer, { type: 'array' })
      officeHtml.value = wb.SheetNames
        .map(n => `<h4 class="sheet-title">${n}</h4>${XLSX.utils.sheet_to_html(wb.Sheets[n])}`)
        .join('') || '<p>（空表格）</p>'
    }
  } catch (e) {
    officeError.value = '该文件预览失败，可通过文件地址下载查看'
  } finally {
    officeLoading.value = false
  }
}

watch(() => previewRow.value && previewRow.value.id, () => {
  renderOfficePreview()
})

const detailTitle = computed(() => {
  const name = detailCustomer.value.customerName || '-'
  const no = detailCustomer.value.customerNo || '-'
  return `影像资料 - ${name} / ${no}`
})

const mainCategories = computed(() => [...new Set(categoryOptions.value.map(item => item.imageCategory))])
// 分类树：第一级影像大类（不可选），叶子为影像小类，value 为分类记录 id
const categoryTree = computed(() => {
  const map = new Map()
  categoryOptions.value.forEach(item => {
    if (!map.has(item.imageCategory)) {
      map.set(item.imageCategory, { value: `cat:${item.imageCategory}`, label: item.imageCategory, children: [] })
    }
    map.get(item.imageCategory).children.push({ value: item.id, label: item.imageSubcategory })
  })
  return [...map.values()]
})

const customerTableColumns = computed(() => [
  { key: 'actions', label: '操作', width: 140, align: 'center', fixed: 'right', slot: 'actions' },
  { key: 'customerName', label: '客户名称', prop: 'customerName', width: 160, align: 'left', fixed: 'left', showOverflowTooltip: true, slot: 'customerName' },
  { key: 'customerId', label: '客户内码', prop: 'customerId', width: 150, showOverflowTooltip: true },
  { key: 'customerNo', label: '客户号', prop: 'customerNo', width: 180, showOverflowTooltip: true, slot: 'customerNo' },
  { key: 'imageCount', label: '已上传数量', prop: 'imageCount', width: 110, align: 'center', slot: 'imageCount' },
  { key: 'latestUploadDate', label: '最近上传时间', prop: 'latestUploadDate', width: 130, align: 'center', slot: 'latestUploadDate' },
  { key: 'publicPrivateType', label: '公私类型', prop: 'publicPrivateType', width: 90, align: 'center', slot: 'publicPrivateType' },
  { key: 'customerType', label: '客户类型', prop: 'customerType', width: 100, align: 'center' },
  { key: 'attributionOrg', label: '归属机构', prop: 'attributionOrg', width: 120, align: 'center', slot: 'attributionOrg' },
  { key: 'manager', label: '管户经理', prop: 'managerId', width: 120, align: 'center', slot: 'manager' },
  { key: 'contactPhone', label: '联系电话', prop: 'contactPhone', width: 130, showOverflowTooltip: true },
  { key: 'contactAddress', label: '联系地址', prop: 'contactAddress', minWidth: 220, showOverflowTooltip: true }
])

function getQueryValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function initQueryFromRoute() {
  queryParams.value.customerName = getQueryValue(route.query.customerName)
  queryParams.value.customerNo = getQueryValue(route.query.customerNo)
}

watch(
  () => [route.query.customerName, route.query.customerNo],
  () => {
    initQueryFromRoute()
    queryParams.value.pageNum = 1
    getList()
  }
)

function hasCustomerKeyword(params = queryParams.value) {
  return !!String(params.customerName || '').trim() || !!String(params.customerNo || '').trim()
}

function getCustomerKeywordSnapshot(params = queryParams.value) {
  return {
    customerName: String(params.customerName || '').trim(),
    customerNo: String(params.customerNo || '').trim()
  }
}

function clearCustomerSearchSnapshot() {
  lastCustomerSearch.value = { customerName: '', customerNo: '' }
}

function clearList() {
  tableList.value = []
  total.value = 0
}

function buildImageQuery(extra = {}) {
  return {
    pageNum: queryParams.value.pageNum,
    pageSize: queryParams.value.pageSize,
    customerName: String(queryParams.value.customerName || '').trim() || undefined,
    customerNo: String(queryParams.value.customerNo || '').trim() || undefined,
    ...extra
  }
}

function getList(options = {}) {
  if (!hasCustomerKeyword()) {
    clearCustomerSearchSnapshot()
    clearList()
    loading.value = false
    if (options.showWarning) {
      proxy.$modal.msgWarning('请输入完整客户名称或客户号后搜索')
    }
    return
  }
  lastCustomerSearch.value = getCustomerKeywordSnapshot()
  loading.value = true
  listImageCustomer(buildImageQuery()).then(res => {
    tableList.value = res.rows || []
    total.value = res.total || 0
  }).finally(() => {
    loading.value = false
  })
}

function handleToolbarQuery() {
  getList({ showWarning: true })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList({ showWarning: true })
}

function resetQuery() {
  Object.assign(queryParams.value, {
    pageNum: 1,
    customerName: undefined,
    customerNo: undefined
  })
  clearList()
  clearCustomerSearchSnapshot()
}

function openCustomerImages(row) {
  detailCustomer.value = row
  detailQuery.pageNum = 1
  detailQuery.delFlag = '0'
  detailQuery.imageCategoryId = undefined
  detailQuery.docName = undefined
  detailOpen.value = true
  loadCustomerImages()
}

function loadCustomerImages() {
  if (!detailCustomer.value.customerId) {
    detailRows.value = []
    detailTotal.value = 0
    return
  }
  detailLoading.value = true
  listImage({
    pageNum: detailQuery.pageNum,
    pageSize: detailQuery.pageSize,
    customerId: detailCustomer.value.customerId,
    delFlag: detailQuery.delFlag,
    imageCategoryId: detailQuery.imageCategoryId || undefined,
    docName: detailQuery.docName || undefined
  }).then(res => {
    detailRows.value = res.rows || []
    detailTotal.value = res.total || 0
    const active = detailRows.value.find(item => item.id === previewRow.value.id)
    previewRow.value = active || detailRows.value[0] || {}
  }).finally(() => {
    detailLoading.value = false
  })
}

function openUploadDialog(row) {
  uploadOpen.value = true
  if (uploadRows.value.length === 0) {
    addUploadRow()
  }
  const target = row && row.customerNo ? row : (tableList.value && tableList.value.length === 1 ? tableList.value[0] : null)
  if (target && target.customerNo) {
    quoteUploadCustomer(target)
  }
}

function resetUploadDialog() {
  uploadCustomerSeq++
  uploadCustomerLoading.value = false
  uploadCustomerOptions.value = []
  uploadSelection.value = []
}

function getCustomerValue(row) {
  return String(row.customerId || row.customerNo || '')
}

function formatCustomerOption(row) {
  const org = row.attributionOrg || '-'
  const manager = row.managerName || row.managerId || '-'
  return `${row.customerName || '-'} / ${row.customerNo || '-'} / ${org} / ${manager}`
}

function formatUser(value, fallback) {
  return formatUserDisplayName(managerOptions.value, value, '-', fallback)
}

function quoteUploadCustomer(row) {
  uploadForm.customerId = getCustomerValue(row)
  uploadForm.customerName = row.customerName || ''
  uploadForm.customerNo = row.customerNo || ''
  if (!uploadCustomerOptions.value.some(item => getCustomerValue(item) === uploadForm.customerId)) {
    uploadCustomerOptions.value.unshift(row)
  }
}

function clearUploadCustomer() {
  uploadForm.customerId = ''
  uploadForm.customerName = ''
  uploadForm.customerNo = ''
}

function handleUploadCustomerSelect(value) {
  const row = uploadCustomerOptions.value.find(item => getCustomerValue(item) === value)
  if (row) {
    quoteUploadCustomer(row)
  }
}

function remoteSearchUploadCustomers(keyword, field) {
  const text = String(keyword || '').trim()
  if (uploadCustomerTimer) {
    clearTimeout(uploadCustomerTimer)
  }
  if (!text) {
    uploadCustomerSeq++
    uploadCustomerLoading.value = false
    uploadCustomerOptions.value = uploadForm.customerId
      ? uploadCustomerOptions.value.filter(item => getCustomerValue(item) === uploadForm.customerId)
      : []
    return
  }
  uploadCustomerTimer = setTimeout(() => {
    const seq = ++uploadCustomerSeq
    uploadCustomerLoading.value = true
    queryUploadCustomers(text, field).then(rows => {
      if (seq === uploadCustomerSeq) {
        uploadCustomerOptions.value = rows
      }
    }).finally(() => {
      if (seq === uploadCustomerSeq) {
        uploadCustomerLoading.value = false
      }
    })
  }, 300)
}

function queryUploadCustomers(keyword, field) {
  const params = field === 'customerNo' ? { customerNo: keyword } : { customerName: keyword }
  return listImageCustomer({ pageNum: 1, pageSize: 20, ...params }).then(res => {
    const map = new Map()
    ;(res.rows || res.data || []).forEach(row => {
      const key = getCustomerValue(row)
      if (key && !map.has(key)) {
        map.set(key, row)
      }
    })
    return [...map.values()]
  })
}

function getSubcategories(category) {
  return categoryOptions.value.filter(item => item.imageCategory === category)
}

function removeUploadDocNamePrefix(row) {
  const oldPrefix = row.docNamePrefix || ''
  const currentName = row.docName || ''
  if (oldPrefix && currentName.startsWith(oldPrefix)) {
    row.docName = currentName.slice(oldPrefix.length)
  }
  row.docNamePrefix = ''
}

function handleUploadCategoryChange(row) {
  row.imageCategoryId = undefined
  removeUploadDocNamePrefix(row)
}

function handleUploadSubcategoryChange(row) {
  const subcategory = categoryOptions.value.find(item => item.id === row.imageCategoryId)
  const nextPrefix = subcategory && subcategory.imageSubcategory ? `${subcategory.imageSubcategory}-` : ''
  if (!nextPrefix) return

  const oldPrefix = row.docNamePrefix || ''
  const currentName = row.docName || ''
  const suffix = oldPrefix && currentName.startsWith(oldPrefix)
    ? currentName.slice(oldPrefix.length)
    : currentName

  row.docName = currentName.startsWith(nextPrefix) ? currentName : `${nextPrefix}${suffix}`
  row.docNamePrefix = nextPrefix
}

function loadCategories() {
  listImageCategory().then(res => {
    categoryOptions.value = res.data || []
  })
}

function addUploadRow() {
  uploadRows.value.push({
    id: Date.now() + Math.random(),
    imageCategory: '',
    imageCategoryId: undefined,
    docNamePrefix: '',
    docName: '',
    fileName: '',
    rawFile: undefined
  })
}

function removeUploadRow(index) {
  uploadRows.value.splice(index, 1)
}

function removeSelectedUploadRows() {
  const ids = uploadSelection.value.map(item => item.id)
  uploadRows.value = uploadRows.value.filter(item => !ids.includes(item.id))
  uploadSelection.value = []
}

function handleUploadFileChange(row, file) {
  row.fileName = file.name
  row.rawFile = file.raw
}

function handleUploadFileRemove(row) {
  row.fileName = ''
  row.rawFile = undefined
}

async function submitUploadDialog() {
  if (!uploadForm.customerId) {
    proxy.$modal.msgWarning('请先选择客户')
    return
  }
  if (uploadRows.value.length === 0) {
    proxy.$modal.msgWarning('请先新增上传行')
    return
  }
  const invalid = uploadRows.value.find(row => !row.imageCategoryId || !row.rawFile)
  if (invalid) {
    proxy.$modal.msgWarning('请为每一行选择影像分类和上传文件')
    return
  }
  uploading.value = true
  let successCount = 0
  let failCount = 0
  for (const row of uploadRows.value) {
    const formData = new FormData()
    formData.append('file', row.rawFile)
    formData.append('customerId', uploadForm.customerId)
    formData.append('customerName', uploadForm.customerName)
    formData.append('customerNo', uploadForm.customerNo)
    formData.append('imageCategoryId', row.imageCategoryId)
    formData.append('docName', row.docName || row.fileName)
    try {
      await uploadImage(formData)
      successCount++
    } catch {
      failCount++
    }
  }
  uploading.value = false
  if (failCount === 0) {
    proxy.$modal.msgSuccess(`影像资料上传完成，共 ${successCount} 个文件`)
    uploadRows.value = []
    addUploadRow()
    uploadOpen.value = false
  } else {
    proxy.$modal.msgWarning(`上传完成：成功 ${successCount} 个，失败 ${failCount} 个`)
  }
  if (detailOpen.value) {
    loadCustomerImages()
  }
  getList()
}

function selectDetailImage(row) {
  previewRow.value = row || {}
}

function isActiveDetailRow(row) {
  return !!row && !!previewRow.value && row.id === previewRow.value.id
}

function handleDetailPageChange(page) {
  detailQuery.pageNum = page
  loadCustomerImages()
}

function handleDetailStatusChange() {
  detailQuery.pageNum = 1
  previewRow.value = {}
  loadCustomerImages()
}

function handleDetailFilter() {
  detailQuery.pageNum = 1
  loadCustomerImages()
}

// 资料名称输入：300ms 防抖自动筛选
let detailFilterTimer
function handleDetailFilterDebounced() {
  clearTimeout(detailFilterTimer)
  detailFilterTimer = setTimeout(handleDetailFilter, 300)
}

function handleCategoryNodeClick(node) {
  // 大类节点仅用于展开，不参与筛选
  if (node.children && node.children.length) return
  detailQuery.imageCategoryId = node.value
  categoryFilterVisible.value = false
  handleDetailFilter()
}

function clearCategoryFilter() {
  detailQuery.imageCategoryId = undefined
  categoryFilterVisible.value = false
  handleDetailFilter()
}

function formatCategoryPath(item) {
  if (item.imageCategory && item.imageSubcategory) {
    return `${item.imageCategory}/${item.imageSubcategory}`
  }
  return item.imageCategory || item.imageSubcategory || '未分类'
}

function resetDetailDialog() {
  previewRow.value = {}
  detailRows.value = []
  detailTotal.value = 0
  detailQuery.pageNum = 1
  detailQuery.delFlag = '0'
  detailQuery.imageCategoryId = undefined
  detailQuery.docName = undefined
}

function isUploader(row) {
  return String(row && row.uploadBy || '') === String(userStore.name || '')
}

function getDeleteConfirmMessage(row) {
  if (isUploader(row)) {
    return '确认彻底删除该影像资料？物理删除会同步删除文件，删除后不可还原。'
  }
  return '确认删除该影像资料？非上传者删除会进入删除历史，可在历史中还原。'
}

function handleDelete(row) {
  proxy.$modal.confirm(getDeleteConfirmMessage(row)).then(() => {
    return delImage(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    loadCustomerImages()
    getList()
  }).catch(() => {})
}

function handleRestore(row) {
  proxy.$modal.confirm('确认还原该影像资料？还原后文件会重新回到当前文件列表。').then(() => {
    return restoreImage(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('还原成功')
    loadCustomerImages()
    getList()
  }).catch(() => {})
}

function saveCategory() {
  if (!newCategoryForm.imageCategory || !newCategoryForm.imageSubcategory) {
    proxy.$modal.msgWarning('请填写影像大类和影像小类')
    return
  }
  addImageCategory({
    imageCategory: newCategoryForm.imageCategory,
    imageSubcategory: newCategoryForm.imageSubcategory
  }).then(() => {
    newCategoryForm.imageCategory = ''
    newCategoryForm.imageSubcategory = ''
    newCategoryOpen.value = false
    proxy.$modal.msgSuccess('分类已保存')
    loadCategories()
  })
}

function handleDelCategory(row) {
  proxy.$modal.confirm(`是否确认删除分类"${row.imageCategory}/${row.imageSubcategory}"？`).then(() => {
    return delImageCategory(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('删除成功')
    loadCategories()
  }).catch(() => {})
}

loadCategories()
initQueryFromRoute()
getList()
</script>

<style scoped>
.image-manage-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  margin-bottom: 10px;
  padding: 0 2px;
}

.image-manage-toolbar__title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.image-manage-toolbar__main {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.image-manage-toolbar__sub {
  color: #909399;
  font-size: 13px;
  line-height: 20px;
}

.image-search-panel {
  margin-bottom: 4px;
}

.image-search-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  margin-bottom: 10px;
  padding: 6px 12px;
  border: 1px solid #ffd591;
  border-radius: 4px;
  background: #fff7e6;
  color: #ad6800;
  font-size: 13px;
  line-height: 20px;
}

.image-search-tip strong {
  font-weight: 600;
}

.image-search-form :deep(.el-form-item) {
  display: flex;
  margin-bottom: 12px;
}

.image-search-form :deep(.el-form-item__label) {
  flex: 0 0 86px;
  color: #606266;
  font-weight: 400;
}

.image-search-form :deep(.el-form-item__content) {
  flex: 1;
  min-width: 0;
}

.image-search-form :deep(.el-input) {
  width: 100%;
}

.image-search-actions-row {
  margin-bottom: 8px;
}

.image-search-actions__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.image-search-actions__left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.image-search-actions__right {
  flex: 0 0 auto;
}

.image-search-actions__left :deep(.el-button),
.image-search-actions__left :deep(.el-dropdown),
.image-search-actions__left > .el-button {
  margin-left: 0;
}

.image-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.image-count-link {
  font-weight: 600;
}

.image-count-link :deep(.el-button__text),
.image-count-link :deep(span) {
  font-weight: 600;
}

.latest-upload-date {
  color: #303133;
  font-weight: 500;
}

.table-empty-text {
  color: #909399;
}

.image-detail-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.image-detail-header :deep(.el-page-header__left) {
  color: var(--el-color-primary);
  font-weight: 600;
}

.image-detail-header :deep(.el-page-header__content) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.image-detail-layout {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 16px;
  height: calc(100vh - 112px);
  min-height: 520px;
}

.image-detail-list,
.image-detail-main {
  min-height: 0;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.image-detail-list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.image-detail-list__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px 10px;
  border-bottom: 1px solid #ebeef5;
}

.image-detail-list__title {
  color: #303133;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

.image-detail-list__sub {
  color: #909399;
  font-size: 12px;
  line-height: 20px;
}

.image-detail-status {
  padding: 10px 14px 0;
}

.image-detail-status :deep(.el-radio-group) {
  width: 100%;
}

.image-detail-status :deep(.el-radio-button) {
  flex: 1;
}

.image-detail-status :deep(.el-radio-button__inner) {
  width: 100%;
}

.image-card-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
}

.image-detail-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #ebeef5;
}

.image-detail-filter__name {
  flex: 1;
  min-width: 0;
}

.image-detail-filter__btn {
  flex: 0 0 auto;
}

.category-filter__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #ebeef5;
}

.image-card {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 14px 16px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  background: #fff;
  transition: border-color .15s, background-color .15s, box-shadow .15s;
}

.image-card + .image-card {
  margin-top: 10px;
}

.image-card:hover {
  border-color: #c6e2ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, .12);
}

.image-card.is-active {
  border-color: #409eff;
  background: #ecf5ff;
}

.image-card.is-deleted {
  border-color: #f3d19e;
  background: #fdf6ec;
}

.image-card.is-deleted.is-active {
  border-color: #e6a23c;
  background: #fdf1df;
}

.image-card__icon {
  flex: 0 0 auto;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .5px;
}

.image-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.image-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.image-card__tag {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

.image-card__more {
  flex: 0 0 auto;
  color: #909399;
  font-size: 16px;
  cursor: pointer;
  outline: none;
}

.image-card__more:hover {
  color: #409eff;
}

.image-card__name {
  overflow: hidden;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-card__time {
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}

.image-card__time--deleted {
  color: #b88230;
}

.image-detail-pagination {
  display: flex;
  justify-content: center;
  padding: 10px 8px 12px;
  border-top: 1px solid #ebeef5;
}

.image-detail-main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 14px;
}

.image-preview-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  margin-top: 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
}

.image-preview-panel__image {
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 300px);
}

.image-preview-panel__frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
}

.image-preview-panel__office {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #fff;
}

.office-content {
  padding: 24px 28px;
  color: #303133;
  font-size: 14px;
  line-height: 1.7;
}

.office-content :deep(p) {
  margin: 0 0 8px;
}

.office-content :deep(img) {
  max-width: 100%;
}

.office-content :deep(.sheet-title) {
  margin: 18px 0 8px;
  color: #409eff;
  font-size: 14px;
  font-weight: 600;
}

.office-content :deep(.sheet-title:first-child) {
  margin-top: 0;
}

.office-content :deep(table) {
  border-collapse: collapse;
  margin-bottom: 12px;
}

.office-content :deep(td),
.office-content :deep(th) {
  border: 1px solid #ebeef5;
  padding: 6px 10px;
  font-size: 13px;
}

.office-content--excel :deep(td),
.office-content--excel :deep(th) {
  white-space: nowrap;
}

.upload-dialog-customer {
  margin-bottom: 8px;
}

.crm-image-upload-dialog :deep(.upload-dialog-customer .el-form-item) {
  margin-bottom: 12px;
}

.upload-dialog-customer__summary {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  color: #303133;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-dialog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.upload-dialog-toolbar__title {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.upload-dialog-table {
  width: 100%;
}

.upload-dialog-table :deep(.el-table__cell) {
  padding: 10px 0;
}

.upload-dialog-table :deep(.cell) {
  padding: 0 12px;
  overflow: visible;
}

.upload-dialog-table__field {
  display: block;
  width: 100%;
}

.crm-image-upload-dialog :deep(.el-form-item__content > .el-select),
.crm-image-upload-dialog :deep(.el-form-item__content > .el-input),
.upload-dialog-table__field :deep(.el-input) {
  width: 100%;
}

.crm-image-upload-dialog :deep(.el-input__wrapper) {
  justify-content: flex-start;
  min-height: 36px;
  padding: 1px 12px;
}

.crm-image-upload-dialog :deep(.el-select .el-input__wrapper) {
  padding: 1px 16px 1px 12px;
}

.crm-image-upload-dialog :deep(.el-input__inner) {
  text-align: left;
}

.crm-image-upload-dialog :deep(.el-input__suffix) {
  margin-left: 8px;
}

.crm-image-upload-dialog :deep(.el-input__suffix-inner) {
  display: inline-flex;
  align-items: center;
}

.crm-image-upload-dialog :deep(.el-select__caret) {
  color: #909399;
  font-size: 14px;
}

.crm-image-upload-dialog :deep(.el-table__body .cell) {
  display: flex;
  align-items: center;
}

.upload-dialog-table :deep(.el-input__wrapper) {
  min-height: 34px;
}

.upload-dialog-table :deep(.el-select .el-input__inner) {
  padding-right: 8px;
}

.upload-dialog-table :deep(.el-input__inner) {
  font-size: 13px;
}

.upload-dialog-table :deep(.el-button) {
  min-height: 34px;
}

.upload-file-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  width: 100%;
}

.upload-file-trigger {
  flex: 0 0 auto;
}

.upload-file-selected {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-width: 0;
}

.upload-file-name {
  min-width: 0;
  color: #606266;
  font-size: 12px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-file-remove {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  margin-left: 2px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #909399;
  cursor: pointer;
  font-size: 16px;
  line-height: 18px;
  text-align: center;
}

.upload-file-remove:hover {
  background: #fef0f0;
  color: #f56c6c;
}

.crm-image-upload-dialog :deep(.el-dialog) {
  max-width: calc(100vw - 48px);
}

.crm-image-upload-dialog :deep(.el-dialog__body) {
  overflow-x: auto;
}

@media (max-width: 992px) {
  .image-detail-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .image-detail-list,
  .image-detail-main {
    min-height: 360px;
  }
}

@media (max-width: 768px) {
  .image-search-tip {
    align-items: flex-start;
    line-height: 20px;
  }

  .image-search-actions__bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .image-manage-toolbar {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .image-manage-toolbar__title {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
  }

  .crm-image-upload-dialog :deep(.el-dialog) {
    width: calc(100vw - 24px) !important;
  }
}
</style>
