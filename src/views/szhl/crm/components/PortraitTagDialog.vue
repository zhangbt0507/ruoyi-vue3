<template>
  <el-dialog
    v-model="visible"
    width="960px"
    top="6vh"
    append-to-body
    class="ptd-dialog"
    :close-on-click-modal="false"
    @closed="reset"
  >
    <template #header>
      <div class="ptd-cust">
        <div class="ptd-cust__avatar">
          <el-icon><component :is="mode === 'select' ? 'Search' : (customers.length > 1 ? 'UserFilled' : 'User')" /></el-icon>
        </div>
        <div class="ptd-cust__main">
          <div class="ptd-cust__line">
            <template v-if="mode === 'select'">
              <span class="ptd-cust__title">画像标签筛选</span>
            </template>
            <template v-else-if="customers.length > 1">
              <span class="ptd-cust__title">已选择 {{ customers.length }} 户客户</span>
              <el-tooltip placement="bottom-start" effect="light">
                <template #content>
                  <div class="ptd-cust__names">
                    <div v-for="(name, i) in customerNames" :key="i">{{ name }}</div>
                  </div>
                </template>
                <span class="ptd-cust__more">查看名单</span>
              </el-tooltip>
            </template>
            <template v-else>
              <span class="ptd-cust__label">当前客户</span>
              <span class="ptd-cust__title">{{ customerTitle }}</span>
              <span v-if="customerMeta" class="ptd-cust__id">{{ customerMeta }}</span>
            </template>
          </div>
        </div>
        <el-button
          v-if="showImport && mode === 'manage'"
          class="ptd-cust__import"
          type="primary"
          plain
          icon="Upload"
          v-hasRole="['crm_header']"
          v-hasPermi="['crm:attribution:tagManage']"
          @click="emit('batch-import')"
        >批量导入</el-button>
      </div>
    </template>

    <div v-loading="loading" class="ptd-tag-editor">
      <!-- 待选标签 -->
      <section class="ptd-pane">
        <div class="ptd-pane__head">
          <span class="ptd-pane__title">待选标签</span>
          <span class="ptd-pane__count">{{ availableCount }}</span>
        </div>
        <div class="ptd-pane__search ptd-pane__search--filters">
          <el-cascader
            v-model="availableCategoryPath"
            :options="availableCategoryOptions"
            :props="availableCategoryProps"
            clearable
            filterable
            placeholder="选择一级/二级分类"
            class="ptd-category-cascader"
            @change="onCategoryPathChange"
          />
          <el-input v-model="leftKeyword" prefix-icon="Search" clearable placeholder="搜索一级、二级或三级标签" />
        </div>
        <div class="ptd-pane__body ptd-pane__body--compact">
          <el-empty v-if="availableTree.length === 0" description="暂无待选标签" :image-size="72" />
          <div v-else class="ptd-compact-tree">
            <section v-for="level1 in availableTree" :key="level1.id" class="ptd-compact-l1">
              <div class="ptd-compact-l1__head">
                <span class="ptd-compact-l1__name">{{ level1.tagName }}</span>
                <span class="ptd-leaf__num">{{ countAllLeaves(level1.children) }}</span>
              </div>
              <template v-for="level2 in level1.children" :key="level2.id">
                <div v-if="isLeaf(level2)" class="ptd-tag-cloud ptd-tag-cloud--direct">
                  <el-tooltip :disabled="!level2.remark" :content="level2.remark" placement="top" :show-after="250">
                    <span
                      class="ptd-tag-chip"
                      :class="[tagChipClass(level2), { 'is-selected': isSelected(String(level2.id)) }]"
                      @click.stop="toggleAvailableTag(level2)"
                    >
                      <span class="ptd-tag-chip__name">{{ level2.tagName }}</span>
                    </span>
                  </el-tooltip>
                </div>
                <div v-else class="ptd-compact-l2">
                  <div class="ptd-compact-l2__head">
                    <span class="ptd-compact-l2__name">{{ level2.tagName }}</span>
                    <span v-if="level2.selectType" class="ptd-select-type" :class="'is-' + level2.selectType">
                      {{ level2.selectType === 'single' ? '单选' : '多选' }}
                    </span>
                    <span class="ptd-leaf__num">{{ countAllLeaves(level2.children) }}</span>
                  </div>
                  <div class="ptd-tag-cloud">
                    <el-tooltip v-for="tag in level2.children" :key="tag.id" :disabled="!tag.remark" :content="tag.remark" placement="top" :show-after="250">
                      <span
                        class="ptd-tag-chip"
                        :class="[tagChipClass(tag), { 'is-selected': isSelected(String(tag.id)) }]"
                        @click.stop="toggleAvailableTag(tag)"
                      >
                        <span class="ptd-tag-chip__name">{{ tag.tagName }}</span>
                      </span>
                    </el-tooltip>
                  </div>
                </div>
              </template>
            </section>
          </div>
        </div>
      </section>

      <!-- 已选标签 -->
      <section class="ptd-pane">
        <div class="ptd-pane__head">
          <span class="ptd-pane__title">已选标签</span>
          <span class="ptd-pane__count">{{ selectedCount }}</span>
          <el-button class="ptd-pane__clear" type="primary" link :disabled="selectedCount === 0" @click="clearAll">清空</el-button>
        </div>
        <div class="ptd-pane__search">
          <el-input v-model="rightKeyword" prefix-icon="Search" clearable placeholder="搜索已选标签" />
        </div>
        <div class="ptd-pane__body ptd-pane__body--tags">
          <div v-if="selectedLeafTags.length === 0" class="ptd-empty">
            {{ emptySelectedText }}
          </div>
          <div v-else class="ptd-tag-list">
            <el-tag
              v-for="tag in selectedLeafTags"
              :key="tag.id"
              class="ptd-tag-list__item"
              :type="natureTagType(tag.nature)"
              effect="plain"
              closable
              @close="removeTagFromAll(tag)"
            >{{ tag.tagName }}</el-tag>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="ptd-footer">
        <div v-if="mode === 'select'" class="ptd-footer__match">
          <el-select v-model="draftMatchMode" class="ptd-footer__match-select" size="small">
            <el-option label="任一符合" value="ANY" />
            <el-option label="全部符合" value="ALL" />
          </el-select>
        </div>
        <div class="ptd-footer__actions">
          <span v-if="mode === 'manage' && hasChanges" class="ptd-footer__summary">{{ changeSummary }}</span>
          <span v-else-if="mode === 'select' && selectedCount > 0" class="ptd-footer__summary">{{ matchSummaryText }}</span>
          <el-button @click="visible = false">取消</el-button>
          <el-button
            v-if="mode === 'manage'"
            type="primary"
            :loading="saving"
            :disabled="!hasChanges"
            @click="submit"
          >保存标签</el-button>
          <el-button
            v-else
            type="primary"
            :disabled="selectedCount === 0"
            @click="confirmSelect"
          >确认</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="PortraitTagDialog">
import { computed, getCurrentInstance, ref } from 'vue'
import { listFeatureTagTree, markTag, unmarkTag } from '@/api/szhl/crm/attribution'

const props = defineProps({
  mode: {
    type: String,
    default: 'manage'
  },
  showImport: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['success', 'batch-import', 'confirm'])
const { proxy } = getCurrentInstance()

const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const customers = ref([])
const tagRows = ref([])
const leftKeyword = ref('')
const rightKeyword = ref('')
const availableCategoryPath = ref([])
const pendingAddIds = ref([])
const pendingRemoveIds = ref([])
const initialSelectedIds = ref([])
const draftMatchMode = ref('ANY')

const customerIds = computed(() => customers.value.map(item => item.customerId).filter(Boolean))
const customerNames = computed(() => customers.value.map(item => item.customerName || item.customerNo || '-'))
const customerTitle = computed(() => {
  const row = customers.value[0]
  return row ? (row.customerName || '-') : '-'
})
const customerMeta = computed(() => {
  const row = customers.value[0]
  return row ? (row.customerNo || '') : ''
})

const tagMap = computed(() => {
  const map = {}
  tagRows.value.forEach(item => { map[String(item.id)] = item })
  return map
})
// 多客户时不展示各客户既有标签，一切按新增算（后端入库时已有标签自动跳过）
const initialCountMap = computed(() => {
  const map = {}
  if (props.mode === 'select') {
    initialSelectedIds.value.forEach(id => { map[String(id)] = 1 })
    return map
  }
  if (customers.value.length !== 1) return map
  customerPortraitTagIds(customers.value[0]).forEach(id => { map[id] = 1 })
  return map
})
// 可打标的标签：排除禁用 + 已过期叶子（过期仅三级配置）
const markableRows = computed(() => tagRows.value.filter(item => {
  if (item.status === 'inactive') return false
  if (Number(item.level) === 3 && isTagExpired(item.expireDate)) return false
  return true
}))
const activeLeafTags = computed(() => markableRows.value.filter(item => Number(item.level) === 3))
// 全量树（含禁用/过期），左侧已选标签需展示这些历史标签
const fullTree = computed(() => buildTree(tagRows.value))
// 分类级联仅到二级：一级分类 → 二级分类，三级标签只在待选区芯片中展示
const availableCategoryOptions = computed(() => buildCategoryOptions(fullTree.value))
const availableCategoryProps = {
  value: 'id',
  label: 'tagName',
  children: 'children',
  emitPath: true,
  checkStrictly: true
}

const effectiveSelectedIds = computed(() => {
  const ids = new Set()
  Object.keys(initialCountMap.value).forEach(id => {
    if (!pendingRemoveIds.value.includes(id)) ids.add(id)
  })
  pendingAddIds.value.forEach(id => ids.add(id))
  return [...ids]
})
const hasChanges = computed(() => pendingAddIds.value.length > 0 || pendingRemoveIds.value.length > 0)

// 右侧：待选标签库
const availableTree = computed(() => {
  return pruneTree(fullTree.value, (leaf, path) =>
    isMarkableLeaf(leaf) && matchAvailableFilters(path)
  )
})
// 已选标签
const selectedLeafTags = computed(() => {
  const kw = rightKeyword.value.trim()
  const known = new Set()
  collectLeafIds(fullTree.value, known)
  const list = []
  effectiveSelectedIds.value.forEach(id => {
    const tag = resolveTag(id)
    if (tag && matchKeyword(tag, kw)) list.push(tag)
  })
  return list
})
const availableCount = computed(() => countAllLeaves(availableTree.value))
const selectedCount = computed(() => selectedLeafTags.value.length)

const changeSummary = computed(() => customers.value.length > 1
  ? `新增 ${pendingAddIds.value.length} 个标签，应用到 ${customers.value.length} 户客户`
  : `新增 ${pendingAddIds.value.length} 个，移除 ${pendingRemoveIds.value.length} 个`)

const emptySelectedText = computed(() => '暂无已选标签')

const matchSummaryText = computed(() => `已选 ${selectedCount.value} 个`)

function open(rows, options = {}) {
  customers.value = Array.isArray(rows) ? [...rows] : []
  pendingAddIds.value = []
  pendingRemoveIds.value = []
  leftKeyword.value = ''
  rightKeyword.value = ''
  availableCategoryPath.value = normalizeCategoryPath([])
  initialSelectedIds.value = normalizeIdList(options.selectedIds)
  draftMatchMode.value = normalizeMatchMode(options.matchMode)
  visible.value = true
  loadTags()
}

function confirmSelect() {
  const ids = effectiveSelectedIds.value.map(id => {
    const n = Number(id)
    return Number.isNaN(n) ? id : n
  })
  emit('confirm', ids, draftMatchMode.value || 'ANY')
  visible.value = false
}

function reset() {
  loading.value = false
  saving.value = false
  customers.value = []
  tagRows.value = []
  pendingAddIds.value = []
  pendingRemoveIds.value = []
  leftKeyword.value = ''
  rightKeyword.value = ''
  availableCategoryPath.value = normalizeCategoryPath([])
  initialSelectedIds.value = []
  draftMatchMode.value = 'ANY'
}

function normalizeIdList(value) {
  return (Array.isArray(value) ? value : [])
    .filter(item => item !== undefined && item !== null && item !== '')
    .map(item => String(item))
}

function normalizeMatchMode(value) {
  return String(value).toUpperCase() === 'ALL' ? 'ALL' : 'ANY'
}

function loadTags() {
  loading.value = true
  listFeatureTagTree({}).then(res => {
    tagRows.value = res.data || []
  }).finally(() => {
    loading.value = false
  })
}

function customerPortraitTagIds(customer) {
  if (!customer || !Array.isArray(customer.portraitTagList)) return []
  return customer.portraitTagList
    .map(tag => tag?.tagId)
    .filter(id => id !== undefined && id !== null && id !== '')
    .map(id => String(id))
}

function todayStr() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// 过期日期为空表示长期有效；过期日当天仍可用，次日起视为过期（兼容含时分秒格式）
function isTagExpired(expireDate) {
  if (!expireDate) return false
  return String(expireDate).slice(0, 10) < todayStr()
}

function isMarkableLeaf(tag) {
  if (tag.status === 'inactive') return false
  if (isTagExpired(tag.expireDate)) return false
  return true
}

function isLeaf(data) {
  return Number(data.level) === 3
}

function matchKeyword(leaf, kw) {
  if (!kw) return true
  return String(leaf.tagName || '').includes(kw) || String(leaf.categoryName || '').includes(kw)
}

function onCategoryPathChange(value) {
  // el-cascader 清空时 v-model 可能变成 null，统一归一化为数组，避免待选区过滤失效
  availableCategoryPath.value = normalizeCategoryPath(value)
}

function normalizeCategoryPath(value) {
  if (!Array.isArray(value)) return []
  // 级联只保留一、二级路径，防止异常路径带入三级 id；id 类型保持与 options 一致
  return value.slice(0, 2).filter(id => id !== undefined && id !== null && id !== '')
}

function matchAvailableFilters(path) {
  const level1 = path.find(item => Number(item.level) === 1)
  const level2 = path.find(item => Number(item.level) === 2)
  // 始终走归一化：清空后可能是 null，需当成 []，待选区才能恢复全量
  const categoryPath = normalizeCategoryPath(availableCategoryPath.value).map(id => String(id))
  if (categoryPath[0] && String(level1?.id) !== categoryPath[0]) return false
  if (categoryPath[1] && String(level2?.id) !== categoryPath[1]) return false
  const kw = leftKeyword.value.trim()
  if (!kw) return true
  return path.some(item =>
    String(item.tagName || '').includes(kw) || String(item.categoryName || '').includes(kw)
  )
}

/** 级联选项：只暴露一级、二级分类，剥离三级叶子 */
function buildCategoryOptions(nodes) {
  return (nodes || []).map(level1 => ({
    id: level1.id,
    tagName: level1.tagName,
    level: level1.level,
    children: (level1.children || [])
      .filter(child => Number(child.level) === 2)
      .map(level2 => ({
        id: level2.id,
        tagName: level2.tagName,
        level: level2.level
        // 不挂 children，级联在二级终止
      }))
  }))
}

function buildTree(rows) {
  const map = {}
  rows.forEach(item => { map[String(item.id)] = { ...item, children: [] } })
  const roots = []
  rows.forEach(item => {
    const node = map[String(item.id)]
    const parent = map[String(item.parentId)]
    if (parent) parent.children.push(node)
    else if (Number(item.level) === 1) roots.push(node)
  })
  roots.forEach(sortNode)
  return roots
}

function sortNode(node) {
  node.children.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || sortId(a.id) - sortId(b.id))
  node.children.forEach(sortNode)
}

function sortId(id) {
  const value = Number(id)
  return Number.isNaN(value) ? 0 : value
}

// 按叶子谓词裁剪树，丢弃无匹配叶子的空分支
function pruneTree(nodes, keepLeaf, path = []) {
  const result = []
  nodes.forEach(node => {
    const nextPath = path.concat(node)
    if (Number(node.level) === 3) {
      if (keepLeaf(node, nextPath)) result.push(node)
    } else {
      const children = pruneTree(node.children || [], keepLeaf, nextPath)
      if (children.length > 0) result.push({ ...node, children })
    }
  })
  return result
}

function collectLeafIds(nodes, set) {
  nodes.forEach(node => {
    if (Number(node.level) === 3) set.add(String(node.id))
    else collectLeafIds(node.children || [], set)
  })
}

function countAllLeaves(nodes) {
  return (nodes || []).reduce((sum, node) =>
    sum + (Number(node.level) === 3 ? 1 : countAllLeaves(node.children)), 0)
}

function resolveTag(id) {
  return tagMap.value[String(id)] || null
}

function isSelected(id) {
  return effectiveSelectedIds.value.includes(String(id))
}

function tagChipClass(data) {
  return 'ptd-tag-chip--' + (data.nature || 'neutral')
}

// 与特征画像配置页色相保持一致
function natureTagType(nature) {
  if (nature === 'positive') return 'danger'
  if (nature === 'negative') return 'success'
  return 'primary'
}

function toggleAvailableTag(data) {
  if (isSelected(String(data.id))) {
    removeTagFromAll(data)
    return
  }
  addTagToAll(data)
}

function clearAll() {
  effectiveSelectedIds.value.slice().forEach(removeTagById)
}

function addTagToAll(tag) {
  const id = String(tag.id)
  if (tagSelectType(tag) === 'single') {
    siblingTags(tag).forEach(sibling => {
      const siblingId = String(sibling.id)
      if (siblingId === id) return
      removePendingAdd(siblingId)
      if (partialCount(siblingId) > 0) addPendingRemove(siblingId)
    })
  }
  removePendingRemove(id)
  if (props.mode === 'select') {
    addPendingAdd(id)
    return
  }
  if (partialCount(id) < customers.value.length) addPendingAdd(id)
}

function removeTagFromAll(tag) {
  removeTagById(String(tag.id))
}

function removeTagById(id) {
  removePendingAdd(id)
  if (partialCount(id) > 0) addPendingRemove(id)
}

function tagSelectType(tag) {
  const parent = tagMap.value[String(tag.parentId)]
  return parent?.selectType || tag.selectType || 'multiple'
}

function siblingTags(tag) {
  return activeLeafTags.value.filter(item => String(item.parentId) === String(tag.parentId))
}

function partialCount(id) {
  return initialCountMap.value[String(id)] || 0
}

function addPendingAdd(id) {
  if (!pendingAddIds.value.includes(id)) pendingAddIds.value = [...pendingAddIds.value, id]
}

function removePendingAdd(id) {
  pendingAddIds.value = pendingAddIds.value.filter(item => item !== id)
}

function addPendingRemove(id) {
  if (!pendingRemoveIds.value.includes(id)) pendingRemoveIds.value = [...pendingRemoveIds.value, id]
}

function removePendingRemove(id) {
  pendingRemoveIds.value = pendingRemoveIds.value.filter(item => item !== id)
}

function submit() {
  if (customerIds.value.length === 0) {
    proxy.$modal.msgWarning('请选择客户记录')
    return
  }
  if (!hasChanges.value) return
  saving.value = true
  const removeIds = [...pendingRemoveIds.value]
  const addIds = [...pendingAddIds.value]
  Promise.resolve()
    .then(() => {
      if (removeIds.length === 0) return null
      return unmarkTag({ customerIds: customerIds.value, tagIds: removeIds })
    })
    .then(() => {
      if (addIds.length === 0) return null
      return markTag({ customerIds: customerIds.value, tagIds: addIds })
    })
    .then(() => {
      proxy.$modal.msgSuccess(`标签已保存，新增 ${addIds.length} 个，移除 ${removeIds.length} 个`)
      visible.value = false
      emit('success')
    })
    .finally(() => {
      saving.value = false
    })
}

defineExpose({ open })
</script>

<style scoped>
/* 弹窗高度受视口约束，中间区域缩放后由左右面板各自滚动 */
:global(.ptd-dialog) {
  display: flex;
  flex-direction: column;
  max-height: 88vh;
  margin-bottom: 6vh;
}

:global(.ptd-dialog .el-dialog__header),
:global(.ptd-dialog .el-dialog__footer) {
  flex-shrink: 0;
}

:global(.ptd-dialog .el-dialog__body) {
  min-height: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

/* ===== Header 客户信息 ===== */
.ptd-cust {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ptd-cust__avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e6f0ff;
  color: #4f7cf7;
  font-size: 19px;
  flex-shrink: 0;
}

.ptd-cust__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ptd-cust__import {
  flex-shrink: 0;
  margin: 0 28px 0 auto;
}

.ptd-cust__line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ptd-cust__label {
  color: #8a94a6;
  font-size: 13px;
}

.ptd-cust__title {
  color: #1f2937;
  font-size: 17px;
  font-weight: 600;
}

.ptd-cust__id {
  padding: 2px 10px;
  border-radius: 6px;
  background: #eef2f8;
  color: #6b7689;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.ptd-cust__more {
  color: #4f7cf7;
  font-size: 13px;
  cursor: pointer;
}

.ptd-cust__more:hover {
  text-decoration: underline;
}

.ptd-cust__names {
  max-height: 240px;
  overflow: auto;
  line-height: 22px;
  font-size: 13px;
}

.ptd-tag-editor {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 16px;
  min-height: 0;
  height: 520px;
}

.ptd-pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

.ptd-pane__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f2f5;
  flex-shrink: 0;
}

.ptd-pane__title {
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.ptd-pane__count {
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #eef1f6;
  color: #909399;
  font-size: 12px;
}

.ptd-pane__clear {
  margin-left: auto;
}

.ptd-pane__search {
  padding: 10px 14px;
  flex-shrink: 0;
}

.ptd-pane__search--filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
}

.ptd-category-cascader {
  width: 100%;
  min-width: 0;
}

.ptd-pane__body {
  flex: 1;
  overflow: auto;
  padding: 4px 8px 10px;
}

.ptd-pane__body--compact {
  padding: 8px 10px 12px;
}

.ptd-pane__body--tags {
  padding: 10px 12px 12px;
}

.ptd-pane__body--compact :deep(.el-empty) {
  height: 100%;
}

.ptd-pane__body :deep(.el-tree) {
  background: transparent;
}

.ptd-pane__body :deep(.el-tree-node__content) {
  height: 34px;
  border-radius: 6px;
}

.ptd-empty {
  color: #c0c4cc;
  font-size: 13px;
  line-height: 22px;
  padding: 16px 4px;
}

.ptd-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

.ptd-tag-list__item {
  margin: 0;
}

/* ===== 标签叶子 / 分组 ===== */
.ptd-leaf {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
  font-size: 13px;
}

.ptd-leaf__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ptd-leaf__num {
  margin-left: auto;
  color: #a8abb2;
  font-size: 12px;
  font-weight: 400;
}

/* ===== 右侧待选标签紧凑展示 ===== */
.ptd-compact-tree {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ptd-compact-l1 {
  border: 1px solid #edf0f5;
  border-radius: 6px;
  background: #fff;
}

.ptd-compact-l1__head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 7px 10px;
  background: #f7f9fc;
  border-bottom: 1px solid #edf0f5;
}

.ptd-compact-l1__name {
  min-width: 0;
  color: #303133;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ptd-compact-l2 {
  padding: 8px 10px 9px 18px;
  border-top: 1px dashed #edf0f5;
}

.ptd-compact-l1__head + .ptd-compact-l2 {
  border-top: none;
}

.ptd-compact-l2__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.ptd-compact-l2__name {
  min-width: 0;
  color: #606266;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ptd-select-type {
  flex-shrink: 0;
  height: 18px;
  padding: 0 7px;
  border-radius: 9px;
  font-size: 11px;
  line-height: 18px;
}

.ptd-select-type.is-single {
  background: #fef2f2;
  color: #c45656;
}

.ptd-select-type.is-multiple {
  background: #f0f9eb;
  color: #529b2e;
}

.ptd-tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-content: flex-start;
}

.ptd-tag-cloud--direct {
  padding: 8px 10px 9px 18px;
}

.ptd-tag-chip {
  max-width: 100%;
  height: 26px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 9px;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  background: #fff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.15s, background-color 0.15s, color 0.15s;
}

.ptd-tag-chip:hover {
  border-color: #4f7cf7;
  background: #f5f8ff;
}

.ptd-tag-chip.is-selected {
  color: #fff;
  font-weight: 600;
  border-color: transparent;
}

.ptd-tag-chip--positive {
  background: #fff7f6;
  border-color: #f3c3c1;
  color: #c45656;
}

.ptd-tag-chip--positive.is-selected {
  background: #c45656;
}

.ptd-tag-chip--neutral {
  background: #f5f8ff;
  border-color: #b9cdfa;
  color: #3f74e3;
}

.ptd-tag-chip--neutral.is-selected {
  background: #3f74e3;
}

.ptd-tag-chip--negative {
  background: #f2fbf6;
  border-color: #b9e2ca;
  color: #2ba96a;
}

.ptd-tag-chip--negative.is-selected {
  background: #2ba96a;
}

.ptd-tag-chip__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 底部 ===== */
.ptd-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.ptd-footer__match {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.ptd-footer__match-select {
  width: 120px;
}

.ptd-footer__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
}

.ptd-footer__summary {
  color: #909399;
  font-size: 13px;
  margin-right: 2px;
}
</style>
