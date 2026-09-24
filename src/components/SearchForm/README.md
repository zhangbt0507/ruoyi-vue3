# SearchForm 搜索表单组件

基于 Element Plus 封装的通用搜索表单组件，支持多种字段类型、表单校验、展开收起等功能。

## 功能特性

- ✅ Grid 布局（`el-row` + `el-col`），每行默认4列，响应式适配
- ✅ 支持多种字段类型：`input`、`textarea`、`select`（单选/多选）、`userSelect`、`radio`、`date`、`daterange`、`slot`
- ✅ 支持表单校验（基于 Element Plus Form 校验规则）
- ✅ 支持展开/收起（通过 `showSearch` prop 控制）
- ✅ 集成搜索/重置按钮，支持额外自定义按钮
- ✅ 支持标准操作行左右插槽，左侧放查询/业务按钮，右侧放 `right-toolbar`
- ✅ 支持字段级自定义插槽
- ✅ 支持字段联动（通过 `change` 回调）
- ✅ 支持 v-model 双向绑定

## 基础用法

```vue
<template>
  <div>
    <SearchForm
      v-model="queryParams"
      :fields="searchFields"
      :show-search="showSearch"
      @search="handleQuery"
      @reset="resetQuery"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SearchForm from '@/components/SearchForm'

const showSearch = ref(true)
const queryParams = ref({
  customerName: undefined,
  customerType: undefined,
  dateRange: []
})

const searchFields = [
  {
    label: '客户名称',
    prop: 'customerName',
    type: 'input',
    placeholder: '请输入客户名称',
    clearable: true
  },
  {
    label: '客户类别',
    prop: 'customerType',
    type: 'select',
    placeholder: '请选择',
    clearable: true,
    options: [
      { label: '对公', value: '1' },
      { label: '对私', value: '0' }
    ]
  },
  {
    label: '创建时间',
    prop: 'dateRange',
    type: 'daterange',
    dateType: 'daterange',
    valueFormat: 'YYYY-MM-DD',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  }
]

const handleQuery = () => {
  console.log('搜索', queryParams.value)
}

const resetQuery = () => {
  console.log('重置')
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|-----|------|------|--------|--------|
| fields | 字段配置数组（见下方字段配置） | Array | — | [] |
| modelValue / v-model | 表单数据对象 | Object | — | — |
| rules | 表单校验规则 | Object | — | {} |
| labelWidth | label 宽度 | String | — | '92px' |
| showSearch | 是否显示搜索区域 | Boolean | — | true |
| showActionsWhenCollapsed | 搜索区域收起时是否保留操作行 | Boolean | — | false |
| resetFieldsOnReset | 点击重置时是否先执行内部 resetFields；设为 false 时由父组件完全接管重置 | Boolean | — | true |
| searchButton | 搜索按钮配置（false 则不显示） | Object / Boolean | — | { text: '搜索', icon: 'Search', type: 'primary' } |
| resetButton | 重置按钮配置（false 则不显示） | Object / Boolean | — | { text: '重置', icon: 'Refresh' } |
| extraButtons | 额外按钮配置数组 | Array | — | [] |
| gutter | 行间距 | Number | — | 16 |

## 字段配置（fields）

### 通用属性

| 属性 | 说明 | 类型 | 必填 |
|-----|------|------|------|
| label | 字段标签 | String | 是 |
| prop | 绑定属性名 | String | 是 |
| type | 字段类型 | String | 是 |
| placeholder | 占位文本 | String | 否 |
| clearable | 是否可清空 | Boolean | 否（默认 true） |
| change | 字段变化回调函数 | Function(value) | 否 |
| span | 自定义列宽 | Object | 否（默认 4 列布局） |

### type: 'input' - 输入框

```javascript
{
  label: '客户名称',
  prop: 'customerName',
  type: 'input',
  placeholder: '请输入客户名称',
  clearable: true
}
```

### type: 'textarea' - 文本域

```javascript
{
  label: '备注',
  prop: 'remark',
  type: 'textarea',
  placeholder: '请输入备注',
  rows: 3  // 行数，默认 3
}
```

### type: 'select' - 下拉框

```javascript
{
  label: '客户类别',
  prop: 'customerType',
  type: 'select',
  placeholder: '请选择',
  clearable: true,
  filterable: true,  // 是否可搜索
  multiple: false,   // 是否多选
  options: [
    { label: '对公', value: '1' },
    { label: '对私', value: '0' }
  ]
}
```

### type: 'userSelect' - 员工选择

```javascript
{
  label: '管户经理',
  prop: 'managerId',
  type: 'userSelect',
  placeholder: '可输入姓名或工号',
  clearable: true
}
```

员工选项来自 `SysUserController` 对应接口，显示为“姓名 (工号)”，支持按姓名或工号过滤。

### type: 'radio' - 单选按钮组

```javascript
{
  label: '是否跟踪',
  prop: 'needFollowup',
  type: 'radio',
  options: [
    { label: '是', value: '1' },
    { label: '否', value: '0' }
  ]
}
```

### type: 'date' - 日期选择器

```javascript
{
  label: '触达日期',
  prop: 'contactDate',
  type: 'date',
  dateType: 'date',  // 'date' | 'month' | 'year' | 'datetime'
  valueFormat: 'YYYY-MM-DD',
  placeholder: '请选择日期'
}
```

### type: 'daterange' - 日期范围选择器

```javascript
{
  label: '创建时间',
  prop: 'dateRange',
  type: 'daterange',
  dateType: 'daterange',  // 'daterange' | 'monthrange'
  valueFormat: 'YYYY-MM-DD',
  rangeSeparator: '-',
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期'
}
```

### type: 'slot' - 自定义插槽

```javascript
{
  label: '画像标签',
  prop: 'portraitTag',
  type: 'slot',
  slotName: 'portraitTag'  // 插槽名称
}
```

模板中使用：

```vue
<SearchForm v-model="queryParams" :fields="searchFields">
  <template #portraitTag="{ field, model }">
    <el-input
      v-model="portraitTagLabel"
      placeholder="点击选择画像标签"
      readonly
      @click="openTagDialog"
    />
  </template>
</SearchForm>
```

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|---------|
| search | 搜索按钮点击（校验通过后触发） | — |
| reset | 重置按钮点击 | — |
| field-change | 任意字段变化 | { prop, value } |

## Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| [slotName] | 字段级插槽（动态） | { field, model } |
| actions | 完全自定义操作按钮区 | { search, reset } |
| actions-left | 标准操作行左侧追加内容，默认位于搜索/重置按钮后 | { search, reset } |
| actions-right | 标准操作行右侧内容，常用于 `right-toolbar` | { search, reset } |

## 高级用法

### 1. 标准列表操作行

```vue
<SearchForm
  v-model="queryParams"
  :fields="searchFields"
  :show-search="showSearch"
  show-actions-when-collapsed
  @search="handleQuery"
  @reset="resetQuery"
>
  <template #actions-left>
    <el-button type="primary" plain icon="Plus" @click="openAdd">新增</el-button>
    <el-button plain icon="Download" @click="handleExport">导出</el-button>
  </template>

  <template #actions-right>
    <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
  </template>
</SearchForm>
```

`actions-left` 会和搜索、重置按钮保持同一行左对齐；`actions-right` 会靠右展示。`show-actions-when-collapsed` 用于保证搜索区域收起后，`right-toolbar` 等常驻工具仍可操作。

### 2. 字段联动

街道选择后清空社区：

```javascript
const searchFields = [
  {
    label: '街道/乡镇',
    prop: 'gridStreet',
    type: 'select',
    options: streetNodes.value,
    change: (value) => {
      // 清空关联字段
      queryParams.value.gridCommunity = undefined
    }
  },
  {
    label: '社区/村庄',
    prop: 'gridCommunity',
    type: 'select',
    options: communityNodes.value
  }
]
```

### 2. 表单校验

```vue
<template>
  <SearchForm
    v-model="queryParams"
    :fields="searchFields"
    :rules="searchRules"
    @search="handleQuery"
  />
</template>

<script setup>
const searchRules = {
  customerName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  customerType: [
    { required: true, message: '请选择客户类别', trigger: 'change' }
  ]
}
</script>
```

### 3. 额外按钮

```vue
<template>
  <SearchForm
    v-model="queryParams"
    :fields="searchFields"
    :extra-buttons="extraButtons"
    @search="handleQuery"
  />
</template>

<script setup>
const extraButtons = [
  {
    text: '客户号精准搜索',
    icon: 'Search',
    type: 'primary',
    plain: true,
    click: handleExactSearch
  },
  {
    text: '高级搜索',
    icon: 'Operation',
    click: openAdvancedSearch
  }
]

const handleExactSearch = () => {
  console.log('精准搜索')
}

const openAdvancedSearch = () => {
  console.log('打开高级搜索')
}
</script>
```

### 4. 自定义列宽

某个字段占 2 列（8/24 = 1/3）：

```javascript
{
  label: '详细地址',
  prop: 'address',
  type: 'input',
  span: {
    xs: 24,  // 手机端占满一行
    sm: 24,
    md: 16,  // 中屏占 2 列
    lg: 12,  // 大屏占 2 列
    xl: 12
  }
}
```

### 5. 自定义操作按钮区

```vue
<SearchForm v-model="queryParams" :fields="searchFields">
  <template #actions="{ search, reset }">
    <div style="display: flex; justify-content: space-between; width: 100%;">
      <div>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">清空</el-button>
      </div>
      <div>
        <el-button type="success" icon="Download">导出</el-button>
      </div>
    </div>
  </template>
</SearchForm>
```

### 6. 调用组件方法

```vue
<template>
  <SearchForm
    ref="searchFormRef"
    v-model="queryParams"
    :fields="searchFields"
  />
</template>

<script setup>
import { ref } from 'vue'

const searchFormRef = ref(null)

// 手动触发校验
const validate = async () => {
  try {
    await searchFormRef.value.validate()
    console.log('校验通过')
  } catch (error) {
    console.log('校验失败')
  }
}

// 重置表单
const reset = () => {
  searchFormRef.value.resetFields()
}

// 清空校验
const clearValidate = () => {
  searchFormRef.value.clearValidate()
}
</script>
```

## 完整示例

参考 `crm/attribution/index.vue` 的复杂搜索场景：

```vue
<template>
  <div class="app-container">
    <SearchForm
      v-model="queryParams"
      :fields="searchFields"
      :show-search="showSearch"
      :extra-buttons="extraButtons"
      @search="handleQuery"
      @reset="resetQuery"
    >
      <!-- 画像标签自定义插槽 -->
      <template #portraitTag="{ model }">
        <el-input
          v-model="portraitTagLabel"
          placeholder="点击选择画像标签"
          readonly
          @click="openTagDialog"
        >
          <template #suffix>
            <el-tooltip v-if="portraitTagLabel" content="清空画像标签" placement="top">
              <el-icon class="query-input-clear-icon" @click.stop="clearPortraitTag">
                <circle-close />
              </el-icon>
            </el-tooltip>
          </template>
        </el-input>
      </template>
    </SearchForm>

    <!-- 其他内容：按钮组、表格、分页等 -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SearchForm from '@/components/SearchForm'

const showSearch = ref(true)
const queryParams = ref({
  publicPrivateType: undefined,
  customerType: undefined,
  customerName: undefined,
  customerNo: undefined,
  attributionOrg: undefined,
  managerId: undefined,
  gridStreet: undefined,
  gridCommunity: undefined,
  portraitTagId: undefined,
  marketingStatus: undefined
})

const portraitTagLabel = ref('')

const searchFields = [
  {
    label: '公私类别',
    prop: 'publicPrivateType',
    type: 'select',
    placeholder: '请选择',
    clearable: true,
    options: [
      { label: '对公', value: '1' },
      { label: '对私', value: '0' }
    ]
  },
  {
    label: '客户类别',
    prop: 'customerType',
    type: 'select',
    placeholder: '请选择',
    clearable: true,
    multiple: true,
    options: []
  },
  {
    label: '客户名称',
    prop: 'customerName',
    type: 'input',
    placeholder: '请输入客户名称',
    clearable: true
  },
  {
    label: '客户号',
    prop: 'customerNo',
    type: 'input',
    placeholder: '请输入客户号',
    clearable: true
  },
  {
    label: '归属机构',
    prop: 'attributionOrg',
    type: 'select',
    placeholder: '可输入汉字或数字',
    filterable: true,
    clearable: true,
    options: []
  },
  {
    label: '管户经理',
    prop: 'managerId',
    type: 'select',
    placeholder: '可输入汉字或数字',
    filterable: true,
    clearable: true,
    options: []
  },
  {
    label: '街道/乡镇',
    prop: 'gridStreet',
    type: 'select',
    placeholder: '请选择',
    clearable: true,
    options: [],
    change: (value) => {
      queryParams.value.gridCommunity = undefined
    }
  },
  {
    label: '社区/村庄',
    prop: 'gridCommunity',
    type: 'select',
    placeholder: '请选择',
    clearable: true,
    options: []
  },
  {
    label: '画像标签',
    prop: 'portraitTagId',
    type: 'slot',
    slotName: 'portraitTag'
  },
  {
    label: '营销状态',
    prop: 'marketingStatus',
    type: 'select',
    placeholder: '请选择',
    clearable: true,
    options: []
  }
]

const extraButtons = [
  {
    text: '客户号精准搜索',
    icon: 'Search',
    type: 'primary',
    plain: true,
    click: handleExactSearch
  }
]

const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

const resetQuery = () => {
  portraitTagLabel.value = ''
  getList()
}

const handleExactSearch = () => {
  console.log('精准搜索')
}

const openTagDialog = () => {
  console.log('打开标签选择')
}

const clearPortraitTag = () => {
  queryParams.value.portraitTagId = undefined
  portraitTagLabel.value = ''
}

const getList = () => {
  console.log('查询列表', queryParams.value)
}
</script>

<style scoped>
.query-input-clear-icon {
  cursor: pointer;
  color: #909399;
}

.query-input-clear-icon:hover {
  color: #409eff;
}
</style>
```

## 注意事项

1. **v-model 绑定**：组件通过 `v-model` 双向绑定表单数据，内部会自动同步
2. **字段 prop**：必须与 `modelValue` 对象的属性名一致
3. **校验规则**：校验失败时不会触发 `@search` 事件
4. **重置行为**：会调用 `form.resetFields()`，恢复到初始值（非清空）
5. **响应式布局**：默认每行 4 列，手机端自动变为 1 列
6. **插槽命名**：字段插槽名由 `field.slotName` 指定，必须唯一

## 与 RuoYi 集成

配合 RuoYi 框架的其他组件使用：

```vue
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <SearchForm
      v-model="queryParams"
      :fields="searchFields"
      v-model:show-search="showSearch"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <!-- 按钮工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="tableList">
      <!-- ... -->
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>
```
