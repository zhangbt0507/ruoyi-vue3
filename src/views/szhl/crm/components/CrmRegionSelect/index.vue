<template>
  <el-popover
    :visible="panelVisible"
    :width="panelWidth"
    :show-arrow="false"
    :teleported="true"
    trigger="click"
    placement="bottom-start"
    popper-class="crm-region-popper"
    :popper-options="{ modifiers: [{ name: 'preventOverflow', options: { padding: 8 } }] }"
  >
    <template #reference>
      <div class="crm-region-trigger">
        <!-- 触发器即输入框：点击/聚焦展开弹层，输入关键词后回车或失焦触发后端定位 -->
        <el-input
          v-model="inputText"
          :placeholder="placeholder"
          :disabled="disabled"
          :suffix-icon="inputText ? undefined : ArrowDown"
          autocomplete="off"
          @focus="handleFocus"
          @click="handleFocus"
          @blur="handleBlur"
          @keydown.enter.prevent="doLocate"
        >
          <template v-if="inputText && !disabled" #suffix>
            <!-- mousedown 阻止默认行为，避免抢在 click 之前触发 blur 定位 -->
            <el-icon
              class="crm-region-trigger__clear"
              title="清空输入并重置浏览"
              @mousedown.prevent
              @click.stop="handleClear"
            >
              <CircleClose />
            </el-icon>
          </template>
        </el-input>
      </div>
    </template>

    <!-- 列上阻止 mousedown 默认行为，让焦点留在输入框：既保证 Esc 可用，也避免浏览面板时被 blur 定位打断。
         只挂在列上而不是整个弹层：弹层主体的横向滚动条要用鼠标拖，阻止了就没法拖了 -->
    <div class="crm-region-panel">
      <div class="crm-region-panel__crumb">
        <!-- 定位失败优先展示：用户手动展开过之后也需要看到这条提示 -->
        <span v-if="locateError" class="crm-region-panel__crumb-error">{{ locateError }}</span>
        <template v-else-if="browsePath.length">
          <span class="crm-region-panel__crumb-hint">当前浏览：</span>
          <template v-for="(node, index) in browsePath" :key="node.code">
            <span :class="['crm-region-panel__crumb-item', { 'is-last': index === browsePath.length - 1 }]">
              {{ node.name }}
            </span>
            <span v-if="index < browsePath.length - 1" class="crm-region-panel__crumb-sep">›</span>
          </template>
        </template>
        <span v-else class="crm-region-panel__crumb-hint">点击名称逐级展开，末级点击整行即可选中</span>
      </div>

      <div ref="panelRef" class="crm-region-panel__body">
        <div
          v-for="(column, ci) in columns"
          :key="column.key"
          :ref="el => setColumnRef(el, ci)"
          class="crm-region-column"
          @mousedown.prevent
        >
          <div class="crm-region-column__header">
            <span>{{ column.levelName || '下级' }}</span>
            <span class="crm-region-column__count">{{ column.nodes.length }} 项</span>
          </div>

          <div v-if="column.loading" class="crm-region-column__tip">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中</span>
          </div>
          <div v-else-if="column.error" class="crm-region-column__tip is-error" @click="retryColumn(ci)">
            {{ column.error }}（点击重试）
          </div>
          <div v-else-if="!column.nodes.length" class="crm-region-column__tip">暂无下级</div>

          <div
            v-for="node in column.nodes"
            :key="node.code"
            :data-code="node.code"
            :class="nodeClass(node, ci)"
            :title="nodeTitle(node)"
            @click="handleNodeClick(node, ci, $event)"
          >
            <span v-if="canSelect(node)" :class="['crm-region-node__radio', { 'is-checked': draftNode && draftNode.code === node.code }]" />
            <span class="crm-region-node__label">{{ node.name }}</span>
            <span v-if="node.level === 1 && node.scope === 'IN'" class="crm-region-node__badge">省内</span>
            <el-icon v-if="canExpand(node)" class="crm-region-node__arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <div class="crm-region-panel__footer">
        <!-- 确认制：面板内只产生「暂选」，点确定才提交，点关闭/Esc 放弃并还原已确认值 -->
        <span :class="['crm-region-panel__hint', { 'is-ok': !!draftNode }]" :title="draftHint">{{ draftHint }}</span>
        <div class="crm-region-panel__btns">
          <el-button v-if="clearable" link type="danger" :disabled="!draftNode" @click="clearDraft">清空</el-button>
          <el-button @click="revertAndClose">关 闭</el-button>
          <el-button type="primary" @click="handleConfirm">确 定</el-button>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowDown, ArrowRight, CircleClose, Loading } from '@element-plus/icons-vue'
import {
  isLeafNode,
  loadChildren,
  loadPath,
  pathNameOf,
  searchRegionNodes
} from '@/views/szhl/crm/composables/useRegionTree'

const props = defineProps({
  // 对外只存区划编码；空值统一收敛为 undefined，与页面重置行为一致
  modelValue: {
    type: [String, Number],
    default: undefined
  },
  placeholder: {
    type: String,
    default: '请选择或输入名称定位，如：磐安'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// change 抛的是节点对象而不是编码：调用方常要 levelName / pathName / leafCount
const emit = defineEmits(['update:modelValue', 'change'])

// 列宽、弹层宽度上限必须与 <style> 里的取值一致，否则列被压窄或弹层留白
const COLUMN_WIDTH = 192
const PANEL_PADDING = 24
const PANEL_MIN_WIDTH = 240
const PANEL_MAX_WIDTH = 720
const SEARCH_LIMIT = 10

const panelVisible = ref(false)
const inputText = ref('')
const panelRef = ref(null)
const columnEls = ref([])
const locateError = ref('')
// 每列：{ key, parentCode, levelName, nodes, loading, error }
const columns = ref([])
// 已展开的节点链，第 i 项是第 i 列的展开节点；长度恒为 columns.length - 1
const browsePath = ref([])
// 面板内的暂选（未提交），点「确 定」才写进 confirmedNode
const draftNode = ref(null)
// 已确认节点，是输入框回显与 v-model 的来源
const confirmedNode = ref(null)

// 输入框文本与「最近一次程序写入的文本」分开记录：
// blur 时若两者一致，说明用户没改过内容，不必再定位一次
let syncedText = ''

const panelWidth = computed(() => {
  const width = columns.value.length * COLUMN_WIDTH + PANEL_PADDING
  return `${Math.min(Math.max(width, PANEL_MIN_WIDTH), PANEL_MAX_WIDTH)}px`
})

const draftHint = computed(() => (draftNode.value ? `已暂选：${pathNameOf(draftNode.value)}` : '未选择'))

// 需要滚入可视区的编码：展开链 + 暂选（暂选可能不在展开链上）
const activeCodes = computed(() => {
  const codes = browsePath.value.map(node => node.code)
  if (draftNode.value && !codes.includes(draftNode.value.code)) {
    codes.push(draftNode.value.code)
  }
  return codes
})

function setInputText(text) {
  inputText.value = text
  syncedText = text
}

// 回显优先用暂选：定位到某个节点后，输入框应显示它的路径
function syncInputText() {
  setInputText(pathNameOf(draftNode.value) || pathNameOf(confirmedNode.value))
}

function setColumnRef(el, ci) {
  if (el) {
    columnEls.value[ci] = el
  }
}

function buildColumn(key, parentCode) {
  return { key, parentCode, levelName: '', nodes: [], loading: true, error: '' }
}

async function loadColumn(column) {
  column.loading = true
  column.error = ''
  try {
    const nodes = await loadChildren(column.parentCode)
    column.nodes = nodes
    column.levelName = nodes.length ? nodes[0].levelName : '下级'
  } catch (e) {
    column.error = '加载失败'
  } finally {
    column.loading = false
  }
}

// 回到只有根列的状态（未选任何值时，以及清空输入后重置浏览位置）
async function resetColumns() {
  const root = buildColumn('__ROOT__', '')
  columns.value = [root]
  browsePath.value = []
  await loadColumn(root)
}

/**
 * 按一条完整路径重建各列：开弹层回显与名称定位都走这里。
 * path 从省级开始、末位是目标节点自身，因此列数 = path.length，
 * 第 i 列的父级是 path[i - 1]（i 为 0 时是根）。
 * path 元素只用到 code / name（后端 search / path 返回的 path 项就这两项）。
 */
async function buildColumnsAlongPath(path) {
  if (!path || !path.length) return resetColumns()
  const parents = path.map((node, index) => (index === 0 ? '' : path[index - 1].code))
  const next = parents.map((parentCode, index) => buildColumn(`${index}:${parentCode}`, parentCode))
  columns.value = next
  browsePath.value = path.slice(0, path.length - 1)
  await Promise.all(next.map(loadColumn))
  scrollActiveIntoView()
}

// 横向滚到最新列，纵向把每列的展开/暂选节点滚到中间
async function scrollActiveIntoView() {
  const panel = panelRef.value
  if (!panel) return
  await nextTick()
  panel.scrollTo({ left: panel.scrollWidth, behavior: 'smooth' })
  const codes = activeCodes.value
  columns.value.forEach((column, ci) => {
    const columnEl = columnEls.value[ci]
    if (!columnEl) return
    const target = column.nodes.find(node => codes.includes(node.code))
    if (!target) return
    const nodeEl = columnEl.querySelector(`[data-code="${target.code}"]`)
    if (!nodeEl) return
    const columnRect = columnEl.getBoundingClientRect()
    const nodeRect = nodeEl.getBoundingClientRect()
    const top = columnEl.scrollTop + (nodeRect.top - columnRect.top) - (columnEl.clientHeight - nodeRect.height) / 2
    columnEl.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  })
}

function canSelect(node) {
  return isLeafNode(node)
}

function canExpand(node) {
  return !isLeafNode(node)
}

function nodeClass(node, ci) {
  return [
    'crm-region-node',
    {
      'is-selectable': canSelect(node),
      'is-selected': !!draftNode.value && draftNode.value.code === node.code,
      'is-expanded': !!browsePath.value[ci] && browsePath.value[ci].code === node.code
    }
  ]
}

function nodeTitle(node) {
  return canSelect(node) ? `${node.name}（点击整行即可选中）` : node.name
}

function closePanel() {
  panelVisible.value = false
  locateError.value = ''
}

// 把已确认值所在的路径重新铺成各列，保证弹层里的预览与提交值一致
async function restoreConfirmed() {
  const node = confirmedNode.value
  if (!node) {
    draftNode.value = null
    await resetColumns()
    syncInputText()
    return
  }
  // 走缓存，通常不会再发请求
  const resolved = await loadPath(node.code)
  draftNode.value = resolved || node
  if (resolved && Array.isArray(resolved.path) && resolved.path.length) {
    await buildColumnsAlongPath(resolved.path)
  } else {
    await resetColumns()
  }
  syncInputText()
}

async function handleFocus() {
  if (panelVisible.value) return
  panelVisible.value = true
  locateError.value = ''
  await restoreConfirmed()
  scrollActiveIntoView()
}

function handleBlur() {
  const keyword = inputText.value.trim()
  // 内容没被改过就不重复定位；点面板内节点会因 prevent 而不触发 blur
  if (!keyword || keyword === syncedText) return
  doLocate()
}

async function doLocate() {
  const keyword = inputText.value.trim()
  if (!keyword) return
  locateError.value = ''
  let hits = []
  try {
    hits = await searchRegionNodes(keyword, SEARCH_LIMIT)
  } catch (e) {
    locateError.value = '名称定位失败，请重试'
    return
  }
  if (!hits.length) {
    locateError.value = `未找到名称包含「${keyword}」的行政区/网格`
    return
  }
  await locateTo(hits[0])
}

/**
 * 定位到某个节点：展开到它并就地暂选。
 * 与原型不同的一点：原型只对末级和县/市/区自动暂选，这里只要定位成功就暂选。
 * 理由是名称定位是明确的挑选意图，暂选它才能让「输入框显示的内容」与「确定会提交的值」始终一致。
 * 同名节点（数据里确实存在，如「万锦华府」分属两个父级）取首个命中，需精确挑选时按面板逐级展开。
 */
async function locateTo(node) {
  const path = node.path && node.path.length ? node.path : [{ code: node.code, name: node.name }]
  await buildColumnsAlongPath(path)
  draftNode.value = node
  setInputText(pathNameOf(node))
}

async function expandTo(node, ci) {
  locateError.value = ''
  const next = columns.value.slice(0, ci + 1)
  browsePath.value = [...browsePath.value.slice(0, ci), node]
  const column = buildColumn(`${ci + 1}:${node.code}`, node.code)
  next.push(column)
  columns.value = next
  await loadColumn(column)
  scrollActiveIntoView()
}

async function handleNodeClick(node, ci, event) {
  // 末级：整行任意位置都可暂选，弹层保持展开，由「确 定」提交
  if (canSelect(node)) {
    draftNode.value = node
    locateError.value = ''
    return
  }
  // 非末级：只认名称和箭头，避免误点整行就展开
  const target = event.target
  if (!(target instanceof Element)) return
  if (!target.closest('.crm-region-node__label') && !target.closest('.crm-region-node__arrow')) return
  await expandTo(node, ci)
}

function retryColumn(ci) {
  const column = columns.value[ci]
  if (column) loadColumn(column)
}

function clearDraft() {
  draftNode.value = null
  locateError.value = ''
}

function handleConfirm() {
  confirmedNode.value = draftNode.value
  syncInputText()
  closePanel()
  emit('update:modelValue', confirmedNode.value ? confirmedNode.value.code : undefined)
  emit('change', confirmedNode.value)
}

// 「关 闭」/ Esc：放弃暂选并还原已确认值
async function revertAndClose() {
  draftNode.value = confirmedNode.value
  closePanel()
  await restoreConfirmed()
}

// 输入框右侧叉号：只清输入与浏览位置，不动已确认值（清空选中请用底栏「清空」）
async function handleClear() {
  setInputText('')
  locateError.value = ''
  await resetColumns()
  scrollActiveIntoView()
}

async function applyValue(value) {
  const code = value === undefined || value === null || value === '' ? '' : String(value)
  if (!code) {
    confirmedNode.value = null
  } else if (!confirmedNode.value || confirmedNode.value.code !== code) {
    confirmedNode.value = await loadPath(code)
  }
  draftNode.value = confirmedNode.value
  if (panelVisible.value) {
    await restoreConfirmed()
  } else {
    syncInputText()
  }
}

watch(() => props.modelValue, applyValue, { immediate: true })

// Esc 挂在 document 上：点过面板里的节点后焦点不在输入框，挂在输入框上会失效
function onDocumentKeydown(event) {
  if (event.key !== 'Escape' || !panelVisible.value) return
  event.preventDefault()
  revertAndClose()
}

watch(panelVisible, visible => {
  if (visible) {
    document.addEventListener('keydown', onDocumentKeydown)
  } else {
    document.removeEventListener('keydown', onDocumentKeydown)
  }
})

onBeforeUnmount(() => document.removeEventListener('keydown', onDocumentKeydown))
</script>

<style scoped>
.crm-region-trigger {
  width: 100%;
}

.crm-region-trigger__clear {
  cursor: pointer;
}

.crm-region-panel {
  color: var(--el-text-color-regular);
  font-size: var(--el-font-size-base);
}

/* ========== 当前浏览路径 ========== */
.crm-region-panel__crumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 20px;
  margin-bottom: 10px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.crm-region-panel__crumb-hint {
  color: var(--el-text-color-placeholder);
}

.crm-region-panel__crumb-error {
  color: var(--el-color-danger);
}

.crm-region-panel__crumb-item {
  color: var(--el-text-color-regular);
}

.crm-region-panel__crumb-item.is-last {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.crm-region-panel__crumb-sep {
  margin: 0 6px;
  color: var(--el-text-color-placeholder);
}

/* ========== 级联面板 ========== */
.crm-region-panel__body {
  display: flex;
  overflow-x: auto;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 4px;
}

.crm-region-column {
  flex: none;
  width: 192px;
  max-height: 300px;
  overflow-y: auto;
  border-right: 1px solid var(--el-border-color-extra-light);
}

.crm-region-column:last-child {
  border-right: none;
}

.crm-region-column__header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-extra-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.crm-region-column__count {
  color: var(--el-text-color-placeholder);
}

.crm-region-column__tip {
  display: flex;
  align-items: center;
  padding: 12px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.crm-region-column__tip.is-error {
  color: var(--el-color-danger);
  cursor: pointer;
}

.crm-region-column__tip .el-icon {
  margin-right: 4px;
}

/* ========== 节点 ========== */
.crm-region-node {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 12px;
  cursor: default;
}

.crm-region-node.is-selectable {
  cursor: pointer;
}

.crm-region-node.is-selectable:hover {
  background: var(--el-color-primary-light-9);
}

.crm-region-node.is-expanded {
  color: var(--el-color-primary);
  font-weight: 600;
}

.crm-region-node.is-selected {
  background: var(--el-color-primary-light-9);
}

.crm-region-node.is-selected .crm-region-node__label {
  color: var(--el-color-primary);
  font-weight: 600;
}

.crm-region-node__radio {
  flex: none;
  width: 14px;
  height: 14px;
  margin-right: 6px;
  border: 1px solid var(--el-border-color);
  border-radius: 50%;
}

.crm-region-node__radio.is-checked {
  border: 4px solid var(--el-color-primary);
}

.crm-region-node__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.crm-region-node__badge {
  flex: none;
  height: 16px;
  margin-left: 6px;
  padding: 0 5px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-8);
  border-radius: 2px;
  color: var(--el-color-primary);
  font-size: 11px;
  line-height: 15px;
}

.crm-region-node__arrow {
  flex: none;
  margin-left: 8px;
  color: var(--el-text-color-placeholder);
}

/* ========== 底栏 ========== */
.crm-region-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-extra-light);
}

.crm-region-panel__hint {
  flex: 1;
  min-width: 0;
  margin-right: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.crm-region-panel__hint.is-ok {
  color: var(--el-color-primary);
}

.crm-region-panel__btns {
  flex: none;
}
</style>
