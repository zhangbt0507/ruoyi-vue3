import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')

function normalizeAttributionQuery(query) {
  const params = { ...query }
  if (Array.isArray(params.portraitTagIds)) {
    params.portraitTagIds = params.portraitTagIds.join(',')
  }
  if (Array.isArray(params.dataFields)) {
    params.dataFields = params.dataFields.join(',')
  }
  return params
}

// 查询客户归属列表
export function listAttribution(query) {
  return request({
    url: '/crm/attribution/list',
    method: 'get',
    params: normalizeAttributionQuery(query)
  })
}

// 客户归属贷款明细：按客户内码查询，支持历史报告日及关联组全量口径。
export function queryAttributionLoanDetail(data) {
  return request({
    url: '/crm/attribution/loan-detail/page',
    method: 'post',
    data
  })
}

export function exportAttributionLoanDetail(data) {
  return request({
    url: '/crm/attribution/loan-detail/export',
    method: 'post',
    data
  })
}

// 客户号精准搜索（不受数据权限限制）
export function preciseSearch(customerNo) {
  return request({
    url: '/crm/attribution/precise',
    method: 'get',
    params: { customerNo }
  })
}

// 分配管户
export function assignManager(data) {
  return request({
    url: '/crm/attribution/assign',
    method: 'post',
    data: data
  })
}

// 网格维护保存
export function saveGrid(data) {
  return request({
    url: '/crm/attribution/grid/save',
    method: 'post',
    data: data
  })
}

// 网格树（扁平列表，前端按 parentCode 组树）
export function getGridTree() {
  return request({
    url: '/crm/attribution/grid/tree',
    method: 'get'
  })
}

// 关联客户列表
export function listRelation(customerId) {
  return request({
    url: '/crm/attribution/relation/list',
    method: 'get',
    params: { customerId }
  })
}

// 查询画像标签关联客户概要明细
export function listTagCustomers(query) {
  const params = { ...query }
  if (Array.isArray(params.tagIds)) {
    params.tagIds = params.tagIds.join(',')
  }
  return request({
    url: '/crm/attribution/tag/customer/list',
    method: 'get',
    params
  })
}

// 新增关联
export function addRelation(data) {
  return request({
    url: '/crm/attribution/relation/add',
    method: 'post',
    data: data
  })
}

// 变更主客
export function setMainCustomer(customerId) {
  return request({
    url: '/crm/attribution/relation/main/' + customerId,
    method: 'put'
  })
}

// 删除关联
export function delRelation(customerId) {
  return request({
    url: '/crm/attribution/relation/' + customerId,
    method: 'delete'
  })
}

// 关联客户批量认领到当前登录人所在机构
export function claimRelation(data) {
  return request({
    url: '/crm/attribution/relation/claim',
    method: 'post',
    data: data
  })
}

// 画像标签库列表
export function listFeatureTag(query) {
  return request({
    url: '/crm/attribution/tag/feature/list',
    method: 'get',
    params: query
  })
}

// 画像标签三级树列表
export function listFeatureTagTree(query) {
  return request({
    url: '/crm/attribution/tag/feature/tree',
    method: 'get',
    params: query
  })
}

// 画像标签管理三级树列表（总行标签管理使用全量）
export function listFeatureTagManageTree(query) {
  return request({
    url: '/crm/attribution/tag/feature/manage/tree',
    method: 'get',
    params: query
  })
}

// 查询标签展示范围快照
export function getTagScopeSnapshot(query) {
  return request({
    url: '/crm/attribution/tag/scope/snapshot',
    method: 'get',
    params: query
  })
}

// 保存标签展示范围快照
export function saveTagScopeSnapshot(data) {
  return request({
    url: '/crm/attribution/tag/scope/snapshot',
    method: 'put',
    data: data
  })
}

// 查询单个标签展示范围摘要
export function getTagScopeSummary(tagId) {
  return request({
    url: '/crm/attribution/tag/scope/summary',
    method: 'get',
    params: { tagId }
  })
}

// 标签展示范围角色选项
export function listTagScopeRoleOptions() {
  return request({
    url: '/crm/attribution/tag/scope/role/options',
    method: 'get'
  })
}

// 标签展示范围机构选项
export function listTagScopeDeptOptions() {
  return request({
    url: '/crm/attribution/tag/scope/dept/options',
    method: 'get'
  })
}

// 新增画像标签
export function addFeatureTag(data) {
  return request({
    url: '/crm/attribution/tag/feature/add',
    method: 'post',
    data: data
  })
}

// 修改画像标签
export function updateFeatureTag(id, data) {
  return request({
    url: '/crm/attribution/tag/feature/' + id,
    method: 'put',
    data: data
  })
}

// 删除画像标签
export function delFeatureTag(id) {
  return request({
    url: '/crm/attribution/tag/feature/' + id,
    method: 'delete'
  })
}

// 下载标签体系导入模板
export function downloadFeatureTagImportTemplate() {
  return request({
    url: '/crm/attribution/tag/feature/importTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

// 导入标签体系
export function importFeatureTags(data) {
  return request({
    url: '/crm/attribution/tag/feature/import',
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data', repeatSubmit: false }
  })
}

// 画像打标
export function markTag(data) {
  return request({
    url: '/crm/attribution/tag/mark',
    method: 'post',
    data: data
  })
}

// 画像退标
export function unmarkTag(data) {
  return request({
    url: '/crm/attribution/tag/unmark',
    method: 'post',
    data: data
  })
}

// 标签批量转换预览
export function previewTagConvert(query) {
  return request({
    url: '/crm/attribution/tag/convert/preview',
    method: 'get',
    params: query
  })
}

// 标签批量转换
export function convertTag(data) {
  return request({
    url: '/crm/attribution/tag/convert',
    method: 'post',
    data: data
  })
}

// 下载标签客户导入模板
export function downloadTagImportTemplate() {
  return request({
    url: '/crm/attribution/tag/batch/importTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

// 下载批量打退标客户号导入模板
export function downloadBatchTagImportTemplate() {
  return request({
    url: '/crm/attribution/tag/batch/customerNoImportTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

// 导入标签客户（FormData 可携带 tagId/action，对整份客户文件统一打标或退标）
export function importTagCustomers(data) {
  return request({
    url: '/crm/attribution/tag/batch/import',
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data', repeatSubmit: false }
  })
}

// 下载批量修改归属导入模板
export function downloadBatchModifyTemplate () {
  return request({
    url: '/crm/attribution/batchModify/importTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

// 上传批量修改归属文件并触发校验，返回 taskId
export function validateBatchModify (data) {
  return request({
    url: '/crm/attribution/batchModify/validate',
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data', repeatSubmit: false }
  })
}

// 查询批量修改归属任务状态与结果
export function getBatchModifyTask (taskId) {
  return request({
    url: `/crm/attribution/batchModify/task/${taskId}`,
    method: 'get'
  })
}

// 提交校验通过的批量修改归属任务
export function submitBatchModify (taskId) {
  return request({
    url: `/crm/attribution/batchModify/submit/${taskId}`,
    method: 'post'
  })
}
