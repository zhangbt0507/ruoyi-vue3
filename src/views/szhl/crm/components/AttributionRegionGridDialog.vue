<template>
  <!-- 网格维护：弹窗内直接内嵌行政区划级联面板，数据源为行政区划表 crm_region_code。
       原先复用通用 CrmRegionSelect（popover 触发式）——弹层宽 720、teleport 到 body，
       套进 480 宽的小弹窗里定位错乱、层级叠加体验差。这里改为弹窗原生托管面板，去掉嵌套 popover。 -->
  <el-dialog :title="props.mode === 'select' ? '选择客户网格' : '网格维护'" v-model="visible" width="720px" append-to-body class="region-grid-dialog">
    <div class="region-grid">
      <!-- 客户上下文：只读展示当前操作的客户（维护场景才有） -->
      <div v-if="props.mode === 'maintain'" class="region-grid__customer">
        <span class="region-grid__customer-label">客户名称</span>
        <span class="region-grid__customer-name" :title="gridForm.customerName">{{ gridForm.customerName || '—' }}</span>
      </div>

      <!-- 名称定位：弹窗内没有触发输入框，改用独立搜索框，回车或点「定位」按名称跳转并暂选 -->
      <div class="region-grid__search">
        <el-input
          v-model="keyword"
          placeholder="输入名称定位，如：磐安"
          clearable
          :prefix-icon="Search"
          @keydown.enter.prevent="doLocate"
          @clear="handleClearKeyword"
        />
        <!-- 辅助操作，主色留给底部确认/保存 -->
        <el-button :icon="Search" @click="doLocate">查询</el-button>
      </div>

      <!-- 快捷跳转 -->
      <div class="region-grid__shortcuts">
        <span class="region-grid__shortcuts-label">快捷跳转：</span>
        <el-button
          v-for="item in shortcuts"
          :key="item.code"
          size="small"
          text
          @click="handleShortcut(item)"
        >
          {{ item.name }}
        </el-button>
      </div>

      <!-- 当前浏览路径 / 定位错误提示 -->
      <div class="region-grid__crumb">
        <span v-if="locateError" class="region-grid__crumb-error">{{ locateError }}</span>
        <template v-else-if="browsePath.length">
          <span class="region-grid__crumb-hint">当前浏览：</span>
          <template v-for="(node, index) in browsePath" :key="node.code">
            <span :class="['region-grid__crumb-item', { 'is-last': index === browsePath.length - 1 }]">{{ node.name }}</span>
            <span v-if="index < browsePath.length - 1" class="region-grid__crumb-sep">›</span>
          </template>
        </template>
        <span v-else class="region-grid__crumb-hint">点击名称逐级展开，末级点击整行即可选中</span>
      </div>
      <!-- 级联面板：懒加载每一列，横向滚动展示更深层级 -->
      <div ref="panelRef" class="region-grid__panel">
        <div
          v-for="(column, ci) in columns"
          :key="column.key"
          :ref="el => setColumnRef(el, ci)"
          class="region-grid__column"
        >
          <div v-if="column.loading" class="region-grid__tip">
            <el-icon class="is-loading"><Loading /></el-icon><span>加载中</span>
          </div>
          <div v-else-if="column.error" class="region-grid__tip is-error" @click="retryColumn(ci)">
            {{ column.error }}（点击重试）
          </div>
          <div v-else-if="!column.nodes.length" class="region-grid__tip">暂无下级</div>

          <div
            v-for="node in column.nodes"
            :key="node.code"
            :data-code="node.code"
            :class="nodeClass(node, ci)"
            :title="nodeTitle(node)"
            @click="handleNodeClick(node, ci)"
          >
            <span class="region-grid__label">{{ node.name }}</span>
            <span v-if="node.level === 1 && node.scope === 'IN'" class="region-grid__badge">省内</span>
            <el-icon v-if="canExpand(node)" class="region-grid__arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 暂选提示：点弹窗底部「保存」才落库 -->
      <div class="region-grid__hint">
        <span :class="{ 'is-ok': !!draftNode }" :title="draftHint">{{ draftHint }}</span>
      </div>
    </div>

    <template #footer>
      <el-button v-if="props.mode === 'maintain'" type="primary" @click="submitGrid">保存</el-button>
      <el-button v-else type="primary" @click="confirmSelect">确认</el-button>
      <el-button @click="visible = false">{{ props.mode === 'maintain' ? '关闭' : '取消' }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, ref } from 'vue'
import { ArrowRight, Loading, Search } from '@element-plus/icons-vue'
import { isLeafNode, loadChildren, loadPath, searchRegionNodes } from '@/views/szhl/crm/composables/useRegionTree'
import { saveRegionGrid } from '@/api/szhl/crm/attribution'

const props = defineProps({
  // maintain=网格维护，选中末级后落库；select=供筛选等场景选用，确认后把所选网格抛给调用方
  mode: {
    type: String,
    default: 'maintain'
  }
})

const emit = defineEmits(['success', 'confirm'])
const { proxy } = getCurrentInstance()

const SEARCH_LIMIT = 10
// crm_region_code 位数即层级：2/4/6/9/12/15。仅当存量 grid_code 恰好是合法 region 编码时才回显；
// 旧网格编码与新体系同码不同义，回显落空就留空让用户重选（过渡期可接受）。
const REGION_CODE_LENGTHS = [2, 4, 6, 9, 12, 15]
// 网格维护未带 gridCode 时的默认展开位置：浙江省 / 金华市 / 磐安县
const DEFAULT_REGION_CODE = '330727'

// 快捷跳转城市列表（按层级+常用度排序）
const shortcuts = [
  { code: '33', name: '浙江省' },
  { code: '3301', name: '杭州市' },
  { code: '3302', name: '宁波市' },
  { code: '3307', name: '金华市' },
  { code: '330727', name: '磐安县' },
  { code: '330782', name: '义乌市' },
  { code: '330783', name: '东阳市' },
  { code: '31', name: '上海市' },
  { code: '11', name: '北京市' }
]

const visible = ref(false)
const gridForm = ref({})
const keyword = ref('')
const locateError = ref('')

const panelRef = ref(null)
const columnEls = ref([])
// 每列：{ key, parentCode, nodes, loading, error }
const columns = ref([])
// 已展开的节点链，第 i 项是第 i 列的展开节点；长度恒为 columns.length - 1
const browsePath = ref([])
// 每一级各有一个选中项：下标 = 列下标，点选后每级都会亮起；末项即当前选中的网格
const selectedPath = ref([])
const draftNode = computed(() => selectedPath.value[selectedPath.value.length - 1] || null)

// 已选择：完整链路只列名称，编码单独列末级（最下级）那一个
const selectedChain = computed(() => selectedPath.value.map(node => node.name).join(' / '))

// 维护场景只有末级网格能落库，筛选场景任意层级都能作为筛选范围
const requireLeaf = computed(() => props.mode === 'maintain')

const draftHint = computed(() => {
  if (!selectedPath.value.length) return '未选择网格'
  const chain = `已选择：${selectedChain.value}　编码：${draftNode.value.code}`
  return requireLeaf.value && !isLeafNode(draftNode.value) ? `${chain}（请继续选到末级网格）` : chain
})

// 需要滚入可视区的编码：逐级选中链上的每一级（末级也在其中）
const activeCodes = computed(() => selectedPath.value.map(node => node.code))

function isRegionCode (code) {
  return typeof code === 'string' && /^\d+$/.test(code) && REGION_CODE_LENGTHS.includes(code.length)
}

function setColumnRef (el, ci) {
  if (el) columnEls.value[ci] = el
}

function buildColumn (key, parentCode) {
  return { key, parentCode, nodes: [], loading: true, error: '' }
}
// 只收列下标、从 columns.value 上取列对象：这里必须改响应式代理上的属性才会触发重新渲染。
// 若直接改 buildColumn 返回的原始对象，赋值绕过了代理的 setter，UI 会一直卡在「加载中」。
async function loadColumn (ci) {
  const column = columns.value[ci]
  if (!column) return
  column.loading = true
  column.error = ''
  try {
    column.nodes = await loadChildren(column.parentCode)
  } catch (e) {
    column.error = '加载失败'
  } finally {
    column.loading = false
  }
}

// 回到只有根列的状态（未回显到有效编码，以及清空搜索时重置浏览位置）
async function resetColumns () {
  columns.value = [buildColumn('__ROOT__', '')]
  browsePath.value = []
  await loadColumn(0)
}

/**
 * 按一条完整路径逐级展开：复用 expandTo 一级一级建列，每级都写入 selectedPath（逐级点亮），
 * 这样每一级都能看到选中态，最下一级（末级网格）也随最后一列一起呈现。
 * path 从省级开始、末位是目标节点自身。
 */
async function buildColumnsAlongPath (path) {
  if (!path || !path.length) return resetColumns()
  await resetColumns()
  selectedPath.value = []
  for (let ci = 0; ci < path.length; ci++) {
    const node = columns.value[ci]?.nodes.find(item => item.code === path[ci].code)
    if (!node) break
    // 末级只选中、不再展开，避免多出一列「暂无下级」
    if (ci === path.length - 1 && isLeafNode(node)) {
      selectedPath.value = [...selectedPath.value.slice(0, ci), node]
      break
    }
    await expandTo(node, ci)
  }
  scrollActiveIntoView()
}
// 横向滚到最新列，纵向把每列的展开/暂选节点滚到中间
async function scrollActiveIntoView () {
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

function canExpand (node) { return !isLeafNode(node) }

function nodeClass (node, ci) {
  const chosen = selectedPath.value[ci]
  const hit = !!chosen && chosen.code === node.code
  return ['region-grid__node', {
    // 链路上的祖先级只做浅色标记，真正选中的末级才用主色实底，避免整条链路多块蓝
    'is-selected': hit,
    'is-current': hit && ci === selectedPath.value.length - 1
  }]
}

// 末级没有下级可展开；非末级两种模式都可选中，差别只在能否直接提交
function nodeTitle (node) {
  if (isLeafNode(node)) return `${node.name}（点击整行即可选中）`
  return requireLeaf.value ? `${node.name}（点击展开下一级）` : `${node.name}（点击选中并展开下一级）`
}
async function expandTo (node, ci) {
  locateError.value = ''
  // 点选本级：写入本级选中并清掉更深的级，避免保存到已看不见的旧选中
  selectedPath.value = [...selectedPath.value.slice(0, ci), node]
  browsePath.value = [...browsePath.value.slice(0, ci), node]
  const next = columns.value.slice(0, ci + 1)
  next.push(buildColumn(`${ci + 1}:${node.code}`, node.code))
  columns.value = next
  await loadColumn(ci + 1)
  scrollActiveIntoView()
}

async function handleNodeClick (node, ci) {
  // 末级：整行任意位置都可选中，弹窗保持展开，由「保存」/「确认」提交
  if (isLeafNode(node)) {
    selectedPath.value = [...selectedPath.value.slice(0, ci), node]
    // 选中末级后，更深的列属于别的分支，收起来避免误导
    browsePath.value = browsePath.value.slice(0, ci)
    columns.value = columns.value.slice(0, ci + 1)
    locateError.value = ''
    return
  }
  // 非末级：点击整行即选中本级并展开下一级（筛选场景可就此层级直接确认）
  await expandTo(node, ci)
}

function retryColumn (ci) {
  loadColumn(ci)
}
async function doLocate () {
  const kw = keyword.value.trim()
  if (!kw) return
  locateError.value = ''
  let hits = []
  try {
    hits = await searchRegionNodes(kw, SEARCH_LIMIT)
  } catch (e) {
    locateError.value = '名称定位失败，请重试'
    return
  }
  if (!hits.length) {
    locateError.value = `未找到名称包含「${kw}」的行政区/网格`
    return
  }
  await locateTo(hits[0])
}

/**
 * 定位到某个节点：逐级展开到它并逐级点亮。
 * 同名节点取首个命中，需精确挑选时按面板逐级展开。
 */
async function locateTo (node) {
  const path = node.path && node.path.length ? node.path : [{ code: node.code, name: node.name }]
  await buildColumnsAlongPath(path)
}

// 搜索框清空：只重置浏览位置到根，不动已暂选值
async function handleClearKeyword () {
  keyword.value = ''
  locateError.value = ''
  await resetColumns()
  scrollActiveIntoView()
}

// 快捷跳转：按城市编码快速定位
async function handleShortcut (item) {
  keyword.value = ''
  locateError.value = ''
  const node = await loadPath(item.code)
  if (node) {
    await locateTo(node)
  } else {
    locateError.value = `无法定位到 ${item.name}`
  }
}

async function open (row) {
  gridForm.value = { customerId: row.customerId, customerName: row.customerName }
  keyword.value = ''
  locateError.value = ''
  selectedPath.value = []
  visible.value = true
  const code = row.gridCode == null ? '' : String(row.gridCode)
  if (isRegionCode(code)) {
    // 走缓存反查路径，再逐级展开回显（每级都会亮起）；编码非法/查不到则走下面的默认位置
    const node = await loadPath(code)
    if (node && node.path && node.path.length) {
      await buildColumnsAlongPath(node.path)
      return
    }
  }
  // 没有可回显的网格（维护未填编码、筛选首次打开）：默认展开到浙江省/金华市/磐安县，省去从省逐级点选
  const node = await loadPath(DEFAULT_REGION_CODE)
  if (node && node.path && node.path.length) {
    await buildColumnsAlongPath(node.path)
    return
  }
  await resetColumns()
  scrollActiveIntoView()
}

// 维护场景只有末级（叶子）能落库；筛选场景任意层级都能作为筛选范围。校验不过返回 null
function pickedNode () {
  const node = draftNode.value
  if (!node) {
    proxy.$modal.msgWarning(requireLeaf.value ? '请选择归属网格' : '请选择网格')
    return null
  }
  if (requireLeaf.value && !isLeafNode(node)) {
    proxy.$modal.msgWarning('请逐级选择到末级网格')
    return null
  }
  return node
}

function submitGrid () {
  const node = pickedNode()
  if (!node) return
  saveRegionGrid({
    customerIds: [gridForm.value.customerId],
    gridCode: node.code
  }).then(() => {
    visible.value = false
    proxy.$modal.msgSuccess('网格信息已保存')
    emit('success')
  })
}

// 筛选场景：把所选层级（省/市/县/街道/网格任意一级）抛给调用方，不落库
function confirmSelect () {
  const node = pickedNode()
  if (!node) return
  emit('confirm', { code: node.code, name: node.name })
  visible.value = false
}

defineExpose({ open })
</script>

<style scoped>
.region-grid {
  color: var(--el-text-color-regular);
  font-size: var(--el-font-size-base);
}

/* 客户上下文 */
.region-grid__customer {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.region-grid__customer-label {
  flex: none;
  margin-right: 12px;
  color: var(--el-text-color-secondary);
}
.region-grid__customer-name {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

/* 名称定位搜索行 */
.region-grid__search {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.region-grid__search .el-input {
  flex: 1;
}

/* 快捷跳转行：text 按钮自带外边距会把间距撑歪，统一清零后用 gap 控制 */
.region-grid__shortcuts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
}
.region-grid__shortcuts-label {
  flex: none;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.region-grid__shortcuts .el-button + .el-button {
  margin-left: 0;
}

/* 当前浏览路径 */
.region-grid__crumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 20px;
  margin-bottom: 10px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.region-grid__crumb-hint { color: var(--el-text-color-placeholder); }
.region-grid__crumb-error { color: var(--el-color-danger); }
.region-grid__crumb-item { color: var(--el-text-color-regular); }
.region-grid__crumb-item.is-last { color: var(--el-text-color-primary); font-weight: 600; }
.region-grid__crumb-sep { margin: 0 6px; color: var(--el-text-color-placeholder); }
/* 级联面板：定高，横向滚动展示更深层级，避免逐级展开时弹窗高度跳动 */
.region-grid__panel {
  display: flex;
  height: 320px;
  overflow-x: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}
.region-grid__column {
  flex: none;
  width: 192px;
  overflow-y: auto;
  border-right: 1px solid var(--el-border-color-lighter);
}
.region-grid__column:last-child { border-right: none; }
.region-grid__tip {
  display: flex;
  align-items: center;
  padding: 12px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
.region-grid__tip.is-error { color: var(--el-color-danger); cursor: pointer; }
.region-grid__tip .el-icon { margin-right: 4px; }
/* 节点：有子项的和末级一样是可点击的，光标统一为手型 */
.region-grid__node {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 12px;
  cursor: pointer;
}
.region-grid__node:hover { background: var(--el-fill-color-light); }
/* 链路祖先级：灰底深字，只表示"从这里下来的"，不抢主色 */
.region-grid__node.is-selected,
.region-grid__node.is-selected:hover { background: var(--el-fill-color); }
.region-grid__node.is-selected .region-grid__label {
  color: var(--el-text-color-primary);
  font-weight: 600;
}
/* 末级选中：整个弹窗里唯一的主色实底 */
.region-grid__node.is-current,
.region-grid__node.is-current:hover { background: var(--el-color-primary); }
.region-grid__node.is-current .region-grid__label { color: #fff; font-weight: 600; }
.region-grid__node.is-current .region-grid__badge {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
}
.region-grid__node.is-current .region-grid__arrow { color: #fff; }
.region-grid__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* 「省内」是静态标注不是状态，走中性灰 */
.region-grid__badge {
  flex: none;
  height: 16px;
  margin-left: 6px;
  padding: 0 5px;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color);
  border-radius: 2px;
  color: var(--el-text-color-secondary);
  font-size: 11px;
  line-height: 15px;
}
.region-grid__arrow { flex: none; margin-left: 8px; color: var(--el-text-color-placeholder); }

/* 已选择：完整链路较长，换行完整展示，不做省略 */
.region-grid__hint {
  margin-top: 10px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.7;
  word-break: break-all;
}
/* 已选择结果：正文色即可，不需要整行蓝字 */
.region-grid__hint .is-ok { color: var(--el-text-color-primary); }
</style>

<!-- 滚动条：全局 ruoyi.scss 把所有 .el-dialog 内的滚动条刷成主色 thumb + 浅蓝 track。
     不能用 revert 撤——全局那条规则已让 Chromium 进入自定义滚动条模式，revert 会把 thumb
     变透明，横向滚动条直接看不见。这里显式写成浏览器默认那套灰度。
     只按本弹窗类名限定，不改全局以免影响其他弹窗。
     dialog 被 append-to-body，scoped 选择器够不到，故单开非 scoped 块。 -->
<style>
.region-grid-dialog {
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.region-grid-dialog ::-webkit-scrollbar-thumb,
.region-grid-dialog *::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 4px;
}

.region-grid-dialog ::-webkit-scrollbar-thumb:hover,
.region-grid-dialog *::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}

.region-grid-dialog ::-webkit-scrollbar-track,
.region-grid-dialog *::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}
</style>
