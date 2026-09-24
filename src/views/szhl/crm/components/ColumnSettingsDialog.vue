<template>
  <el-dialog :title="title" :model-value="modelValue" width="min(1200px, 94vw)" top="6vh" append-to-body @update:model-value="value => emit('update:modelValue', value)" @open="onDialogOpen">
    <div class="column-actions">
      <el-input v-model="columnKeyword" size="small" placeholder="输入关键字筛选字段" clearable class="column-search" />
      <el-button size="small" @click="setColumns('all')">全选</el-button>
      <el-button size="small" @click="setColumns('none')">不选</el-button>
      <el-button size="small" @click="setColumns('common')">常用</el-button>
      <el-radio-group v-if="scopeOptions.length > 1" v-model="columnScopeFilter" size="small" class="column-scope-filter">
        <el-radio-button v-for="opt in scopeOptions" :key="opt.value" :label="opt.value">{{ opt.label }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="column-selected">
      <span>已选 <strong :class="{ 'is-limit-reached': isLimitReached }">{{ checkedColumnKeys.length }}</strong> / {{ maxSelected }} 列</span>
      <span v-if="isLimitReached" class="column-selected__warning">已达上限，不能继续选择</span>
    </div>
    <div class="column-body">
      <nav v-if="filteredColumnGroups.length > 1" class="column-nav">
        <div
          v-for="group in filteredColumnGroups"
          :key="group.key"
          class="column-nav__item"
          :class="{ 'is-active': activeColumnNavKey === group.key }"
          @click="scrollToColumnGroup(group.key)"
        >
          <span class="column-nav__label">{{ group.label }}</span>
          <span class="column-nav__count">{{ group.items.length }}</span>
        </div>
      </nav>
      <div ref="columnChecksRef" class="column-checks" @scroll.passive="onColumnChecksScroll">
        <section
          v-for="group in filteredColumnGroups"
          :key="group.key"
          :ref="el => setColumnGroupRef(group.key, el)"
          class="column-group"
        >
          <div class="column-group__header">
            <el-checkbox
              :model-value="isGroupChecked(group)"
              :indeterminate="!isGroupChecked(group) && group.items.some(item => checkedColumnKeys.includes(item.key))"
              @change="checked => toggleGroup(group, checked)"
            >{{ group.label }}</el-checkbox>
            <span class="column-group__count">{{ group.items.length }}</span>
          </div>
          <div class="column-group__items">
            <el-checkbox-group v-model="checkedColumnKeys" @change="handleCheckedColumnsChange">
              <el-checkbox v-for="item in group.items" :key="item.key" :label="item.key" :disabled="isColumnDisabled(item)">
                <el-tooltip :content="item.label" placement="top">
                  <span class="column-check-label">
                    <span v-if="scopeBadge(item)" class="column-scope-badge" :class="`is-${item.subjectScope.toLowerCase()}`">{{ scopeBadge(item) }}</span>{{ item.label }}
                  </span>
                </el-tooltip>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </section>
      </div>
    </div>

    <div v-if="filteredColumnGroups.length === 0" class="column-empty">无匹配字段</div>
    <template #footer>
      <div class="column-footer">
        <el-button icon="Collection" @click="emit('save', [...checkedColumnKeys])">记住选项</el-button>
        <div class="column-footer__actions">
          <el-button @click="emit('update:modelValue', false)">取消</el-button>
          <el-button type="primary" @click="emit('apply', [...checkedColumnKeys])">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="ColumnSettingsDialog">
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '列显示设定'
  },
  // [{key,label,visible,dataField,subjectScope,categoryId,...}]
  columns: {
    type: Array,
    default: () => []
  },
  // 数据标签自定义分类（/crm/dataTag/list 的 categories）
  categories: {
    type: Array,
    default: () => []
  },
  // 「常用」按钮对应的列 key 集合（各页面自定义）
  commonKeys: {
    type: Array,
    default: () => []
  },
  // 弹窗允许选择的列数；客户列表默认 30 列，业绩页可按后端约束单独传入
  maxSelected: {
    type: Number,
    default: 30
  }
})

const emit = defineEmits(['update:modelValue', 'apply', 'save'])

const checkedColumnKeys = ref([])
// 列选择弹窗关键字（只过滤显示，不影响勾选）
const columnKeyword = ref('')
// 标签展示筛选（全部/通用/对私/对公），只切换展示的标签，不影响勾选
const columnScopeFilter = ref('ALL')

const maxSelected = computed(() => Math.max(1, Math.floor(Number(props.maxSelected) || 30)))
// 存在对应候选标签的筛选项才展示；只有「全部」时整组隐藏
const scopeOptions = computed(() => {
  const has = scope => props.columns.some(item => item.dataField && item.subjectScope === scope)
  const opts = [{ value: 'ALL', label: '全部' }]
  if (has('COMMON')) opts.push({ value: 'COMMON', label: '通用' })
  if (has('PERSONAL')) opts.push({ value: 'PERSONAL', label: '对私' })
  if (has('CORPORATE')) opts.push({ value: 'CORPORATE', label: '对公' })
  return opts
})
const isLimitReached = computed(() => checkedColumnKeys.value.length >= maxSelected.value)

function scopeBadge(item) {
  if (!item.dataField) return ''
  if (item.subjectScope === 'PERSONAL') return '私'
  if (item.subjectScope === 'CORPORATE') return '公'
  return ''
}

// 弹窗分组：关键字 × 标签筛选（全部/通用/对私/对公）两个维度叠加过滤展示；
// 未归类的数据列落「其他」，非数据列固定「基础信息」且不受标签筛选影响
const filteredColumnGroups = computed(() => {
  const keyword = columnKeyword.value.trim()
  const scope = columnScopeFilter.value
  const inTab = props.columns
    .filter(item => !keyword || item.label.includes(keyword))
    .filter(item => !item.dataField || scope === 'ALL' || item.subjectScope === scope)
  const groups = [
    { key: 'BASE', label: '基础信息', items: inTab.filter(item => !item.dataField) }
  ]
  const sortedCategories = [...props.categories].sort((a, b) => a.sortOrder - b.sortOrder)
  // 后端分类可能重复下发，同 id 只保留首个，避免出现重复分组
  const seenCategoryIds = new Set()
  sortedCategories.forEach(cat => {
    if (seenCategoryIds.has(cat.id)) return
    seenCategoryIds.add(cat.id)
    groups.push({
      key: `CAT_${cat.id}`,
      label: cat.categoryName,
      items: inTab.filter(item => item.dataField && item.categoryId === cat.id)
    })
  })
  groups.push({
    key: 'OTHER',
    label: '其他',
    items: inTab.filter(item => item.dataField && (item.categoryId == null
      || !sortedCategories.some(cat => cat.id === item.categoryId)))
  })
  return groups.filter(group => group.items.length > 0)
})

// 组级全选
function isGroupChecked(group) {
  return group.items.every(item => checkedColumnKeys.value.includes(item.key))
}

function normalizeCheckedKeys(keys) {
  const validKeys = new Set(props.columns.map(item => item.key))
  return [...new Set(keys)].filter(key => validKeys.has(key))
}

function updateCheckedKeys(keys) {
  const normalized = normalizeCheckedKeys(keys)
  checkedColumnKeys.value = normalized.slice(0, maxSelected.value)
}

function handleCheckedColumnsChange(keys) {
  updateCheckedKeys(keys)
}

function isColumnDisabled(item) {
  return checkedColumnKeys.value.length >= maxSelected.value && !checkedColumnKeys.value.includes(item.key)
}

function toggleGroup(group, checked) {
  const keys = group.items.map(item => item.key)
  if (checked) {
    const missingKeys = keys.filter(key => !checkedColumnKeys.value.includes(key))
    updateCheckedKeys(checkedColumnKeys.value.concat(missingKeys))
    return
  }
  updateCheckedKeys(checkedColumnKeys.value.filter(key => !keys.includes(key)))
}

// 左侧快捷导航：点击定位到分组，滚动时反向高亮当前分组
const columnChecksRef = ref(null)
const activeColumnGroupKey = ref('')
const columnGroupEls = new Map()
let columnNavLockUntil = 0

// 筛选/切栏后当前组可能已不在列表中，回落到第一组
const activeColumnNavKey = computed(() => {
  const groups = filteredColumnGroups.value
  if (groups.some(group => group.key === activeColumnGroupKey.value)) return activeColumnGroupKey.value
  return groups.length ? groups[0].key : ''
})

function setColumnGroupRef(key, el) {
  if (el) columnGroupEls.set(key, el)
  else columnGroupEls.delete(key)
}

function scrollToColumnGroup(key) {
  const container = columnChecksRef.value
  const target = columnGroupEls.get(key)
  if (!container || !target) return
  activeColumnGroupKey.value = key
  // 平滑滚动期间暂停 scrollspy，避免高亮跟着滚动过程跳动
  columnNavLockUntil = Date.now() + 600
  container.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
}

function onColumnChecksScroll() {
  if (Date.now() < columnNavLockUntil) return
  const container = columnChecksRef.value
  const groups = filteredColumnGroups.value
  if (!container || !groups.length) return
  // 滚动到底时末组可能永远到不了容器顶部，直接高亮最后一组
  if (container.scrollTop + container.clientHeight >= container.scrollHeight - 4) {
    activeColumnGroupKey.value = groups[groups.length - 1].key
    return
  }
  const line = container.scrollTop + 25
  let current = groups[0].key
  groups.forEach(group => {
    const el = columnGroupEls.get(group.key)
    if (el && el.offsetTop <= line) current = group.key
  })
  activeColumnGroupKey.value = current
}

function resetColumnNavScroll() {
  activeColumnGroupKey.value = ''
  nextTick(() => {
    if (columnChecksRef.value) columnChecksRef.value.scrollTop = 0
  })
}

watch([columnScopeFilter, columnKeyword], resetColumnNavScroll)

// 打开弹窗：从当前生效列重置勾选，关闭即放弃未确认的修改
function onDialogOpen() {
  columnKeyword.value = ''
  columnScopeFilter.value = 'ALL'
  updateCheckedKeys(props.columns.filter(item => item.visible).map(item => item.key))
  resetColumnNavScroll()
}

function setColumns(type) {
  if (type === 'all') updateCheckedKeys(props.columns.map(item => item.key))
  if (type === 'none') updateCheckedKeys([])
  if (type === 'common') updateCheckedKeys(props.commonKeys)
}
</script>

<style scoped>
.column-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.column-search {
  flex: 1 1 260px;
  max-width: 360px;
  margin-right: 4px;
}

.column-selected {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 16px;
  margin-bottom: 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 20px;
}

.column-selected strong {
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.column-selected strong.is-limit-reached {
  color: var(--el-color-warning);
}

.column-selected__warning {
  color: var(--el-color-warning);
}

.column-scope-filter {
  margin-left: auto;
}

.column-scope-badge {
  display: inline-block;
  margin-right: 4px;
  padding: 0 3px;
  border: 1px solid currentColor;
  border-radius: 3px;
  font-size: 11px;
  line-height: 14px;
}

.column-scope-badge.is-personal {
  color: var(--el-color-primary);
}

.column-scope-badge.is-corporate {
  color: var(--el-color-warning);
}

.column-body {
  display: flex;
  gap: 16px;
}

.column-nav {
  flex: 0 0 128px;
  max-height: 56vh;
  overflow-y: auto;
  padding: 2px 0;
  border-right: 1px solid var(--el-border-color-lighter);
}

.column-nav__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px 7px 12px;
  border-left: 2px solid transparent;
  color: var(--el-text-color-regular);
  font-size: 13px;
  line-height: 18px;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.column-nav__item:hover {
  color: var(--el-color-primary);
}

.column-nav__item.is-active {
  border-left-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}

.column-nav__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.column-nav__count {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.column-nav__item.is-active .column-nav__count {
  color: var(--el-color-primary);
}

.column-checks {
  position: relative;
  flex: 1;
  min-width: 0;
  max-height: 56vh;
  min-height: 320px;
  padding-right: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 14px;
  line-height: 20px;
}

.column-group + .column-group {
  margin-top: 20px;
}

.column-group__header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding:0 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.column-group__header :deep(.el-checkbox__label) {
  color: var(--el-color-primary);
  font-weight: 600;
}

.column-group__count {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 400;
}

/* grid 需作用在 el-checkbox-group 上，复选框才是网格项；放在外层会整体挤进第一列 */
.column-group__items :deep(.el-checkbox-group) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px 20px;
}

.column-group__items .el-checkbox {
  align-items: flex-start;
  min-width: 0;
  height: auto;
  margin-right: 0;
  max-width: 100%;
}

.column-group__items :deep(.el-checkbox__input) {
  margin-top: 3px;
}

.column-group__items :deep(.el-checkbox__label) {
  min-width: 0;
  padding-right: 4px;
  line-height: 20px;
  white-space: normal;
}

.column-check-label {
  display: block;
  max-width: 100%;
  overflow: visible;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.column-empty {
  text-align: center;
  color: #909399;
  line-height: 60px;
}

.column-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
}

.column-footer__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.column-footer__actions .el-button + .el-button {
  margin-left: 0;
}

@media (max-width: 992px) {
  .column-group__items :deep(.el-checkbox-group) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .column-group__items :deep(.el-checkbox-group) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .column-nav {
    display: none;
  }

  .column-checks {
    min-height: 280px;
  }

  .column-group__items :deep(.el-checkbox-group) {
    grid-template-columns: 1fr;
  }

  .column-search {
    flex-basis: 100%;
    max-width: none;
  }

  .column-footer__actions {
    width: 100%;
  }
}
</style>
