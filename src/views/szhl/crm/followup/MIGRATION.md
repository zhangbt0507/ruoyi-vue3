# crm/followup 页面迁移对比

## 文件说明

- **原文件**：`src/views/szhl/crm/followup/index.vue`
- **新文件**：`src/views/szhl/crm/followup/index-new.vue`（使用 SearchForm 组件）

## 代码对比

### 原实现（inline 布局）

```vue
<!-- 24 行模板代码 -->
<el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="86px">
  <el-form-item label="客户名称" prop="customerName">
    <el-input v-model="queryParams.customerName" placeholder="请输入客户名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
  </el-form-item>
  <el-form-item label="客户号" prop="customerNo">
    <el-input v-model="queryParams.customerNo" placeholder="请输入客户号" clearable style="width: 220px" @keyup.enter="handleQuery" />
  </el-form-item>
  <el-form-item label="机构号" prop="queryOrg">
    <el-select v-model="queryParams.queryOrg" placeholder="请选择机构" filterable clearable style="width: 220px">
      <el-option v-for="item in orgOptions" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
  </el-form-item>
  <el-form-item label="管户经理" prop="managerId">
    <el-select v-model="queryParams.managerId" placeholder="请选择管户经理" filterable clearable style="width: 180px">
      <el-option v-for="item in managerOptions" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
    <el-button icon="Refresh" @click="resetQuery">重置</el-button>
  </el-form-item>
</el-form>

<script>
// 重置方法需要手动调用 resetForm
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
</script>
```

### 新实现（Grid 布局 + SearchForm 组件）

```vue
<!-- 7 行模板代码（减少 71%） -->
<SearchForm
  v-model="queryParams"
  :fields="searchFields"
  :show-search="showSearch"
  @search="handleQuery"
  @reset="resetQuery"
/>

<script>
// 导入组件
import SearchForm from '@/components/SearchForm'

// 配置式声明字段（42 行，结构清晰）
const searchFields = [
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
    label: '机构号',
    prop: 'queryOrg',
    type: 'select',
    placeholder: '请选择机构',
    filterable: true,
    clearable: true,
    options: orgOptions
  },
  {
    label: '管户经理',
    prop: 'managerId',
    type: 'select',
    placeholder: '请选择管户经理',
    filterable: true,
    clearable: true,
    options: managerOptions
  }
]

// 重置方法简化（不需要 ref 和 resetForm）
function resetQuery() {
  getList()
}
</script>
```

## 变化总结

### ✅ 改进点

| 项目 | 原实现 | 新实现 | 提升 |
|-----|--------|--------|------|
| **模板代码行数** | 24 行 | 7 行 | ↓ **71%** |
| **布局方式** | inline（自动换行，对齐不整齐） | grid（每行4列，完美对齐） | ✨ **更整齐** |
| **字段宽度** | 每个字段手动写 `style="width: XXXpx"` | 自动 100% 填充 | ✨ **更统一** |
| **响应式** | 无，手机端显示混乱 | 自动适配（xs/sm/md/lg/xl） | ✨ **更友好** |
| **维护性** | 模板和逻辑混杂 | 配置和逻辑分离 | ✨ **更清晰** |
| **回车搜索** | 每个 input 手动加 `@keyup.enter` | 组件内置 | ✨ **更方便** |
| **重置逻辑** | 需要 `ref="queryRef"` + `proxy.resetForm('queryRef')` | 组件内置 | ✨ **更简洁** |

### 📊 代码量对比

```
原实现搜索区：
- 模板：24 行
- 脚本：3 行（resetQuery）
- 总计：27 行

新实现搜索区：
- 模板：7 行
- 脚本：43 行（import + searchFields + resetQuery）
- 总计：50 行

✨ 虽然脚本行数增加，但：
1. 配置结构清晰，易读易维护
2. 可复用（多个页面共享相同字段配置）
3. 类型安全（字段配置结构统一）
```

### 🎨 视觉对比

#### 原布局（inline）
```
[客户名称____] [客户号________] [机构号________]
[管户经理______] [搜索] [重置]
```
- ❌ 字段宽度不一致
- ❌ 换行位置不可控
- ❌ 手机端显示混乱

#### 新布局（grid，每行4列）
```
[客户名称_____________] [客户号______________] [机构号______________] [管户经理____________]
                                                                      [搜索] [重置]
```
- ✅ 每行固定4列，完美对齐
- ✅ 字段等宽，视觉统一
- ✅ 响应式适配，手机端自动变为1列

## 如何测试

### 1. 备份原文件（可选）

```bash
cd Ruoyi-Vue3_online/src/views/szhl/crm/followup
cp index.vue index-old.vue
```

### 2. 替换为新实现

```bash
cp index-new.vue index.vue
```

### 3. 启动开发服务器

```bash
cd Ruoyi-Vue3_online
yarn dev
```

### 4. 访问页面测试

访问：`http://localhost/crm/followup`（具体路径根据路由配置）

### 5. 测试功能点

- ✅ 搜索功能正常
- ✅ 重置功能正常
- ✅ 回车键触发搜索
- ✅ 下拉框可搜索（filterable）
- ✅ 清空按钮正常
- ✅ 展开/收起（右上角工具栏按钮）
- ✅ 响应式布局（缩小浏览器窗口测试）

## 迁移清单

### 已迁移
- ✅ `crm/followup/index.vue`（测试中）
- ✅ `crm/stats/contact.vue`、`group.vue`、`customer.vue`（已拆分为独立页面）

### 待迁移（建议按此顺序）

简单页面（字段少，无复杂交互）：
1. ⏳ `crm/group/index.vue`（3个字段）
2. ⏳ `crm/defer/index.vue`（4个字段）
3. ⏳ `crm/dispute/index.vue`（6个字段）

中等复杂（字段多，有联动）：
4. ⏳ `crm/contact/index.vue`（8个字段，有联动）

复杂页面（字段多，有自定义插槽）：
5. ⏳ `crm/attribution/index.vue`（12个字段，2个自定义插槽，1个额外按钮）

## 回滚方案

如果测试发现问题，可以立即回滚：

```bash
cd Ruoyi-Vue3_online/src/views/szhl/crm/followup
cp index-old.vue index.vue
```

## 注意事项

1. **字典数据**：确保 `orgOptions` 和 `managerOptions` 已正确加载
2. **响应式**：新布局在手机端会自动变为1列，需要测试
3. **样式**：原有的 `.crm-page` 样式保持不变
4. **逻辑**：业务逻辑（表格、分页、弹窗等）完全不变

## 效果预览

### 桌面端（1920px）
- 每行4列，完美对齐
- 字段宽度一致

### 平板端（768px）
- 每行3列

### 手机端（375px）
- 每行1列，纵向排列

## 下一步

测试通过后，建议：
1. 迁移其他简单页面（group、defer、dispute）
2. 积累迁移经验和最佳实践
3. 制定统一的字段配置规范
4. 考虑将常用字段配置抽取为可复用的 composables
