import request from '@/utils/request'

// 客群列表
export function listGroup(query) {
  return request({
    url: '/crm/group/list',
    method: 'get',
    params: query
  })
}

// 创建客群
export function createGroup(data) {
  return request({
    url: '/crm/group/create',
    method: 'post',
    data: data
  })
}

// 修改客群
export function updateGroup(data) {
  return request({
    url: '/crm/group/update',
    method: 'put',
    data: data
  })
}

// 删除客群（已分发的需先撤回）
export function delGroup(id) {
  return request({
    url: '/crm/group/' + id,
    method: 'delete'
  })
}

// 手动重新校验导入数据（query 传参，结果摘要在 msg）
export function verifyGroup(groupId) {
  return request({
    url: '/crm/group/verify',
    method: 'post',
    params: { groupId }
  })
}

// 导入客户明细（临时表，含校验结果）
export function listImportTemp(query) {
  return request({
    url: '/crm/group/import/temp/list',
    method: 'get',
    params: query
  })
}

// 已分发客群客户明细
export function listGroupCustomerDetail(query) {
  return request({
    url: '/crm/group/customer/list',
    method: 'get',
    params: query
  })
}

// 删除导入数据（清空临时表）
export function delImportTemp(groupId) {
  return request({
    url: '/crm/group/import/temp/' + groupId,
    method: 'delete'
  })
}

// 客群分发（way: ATTRIBUTION 客户归属 / TEMPLATE 模板机构 / ASSIGN 设定机构）
export function distributeGroup(data) {
  return request({
    url: '/crm/group/distribute',
    method: 'post',
    data: data
  })
}

// 客群撤回
export function withdrawGroup(groupId) {
  return request({
    url: '/crm/group/withdraw/' + groupId,
    method: 'post'
  })
}

// 客群选择弹窗（仅有效客群精简字段，distributeDate 为最近一次有效下发日期）
export function selectGroupList(groupName) {
  return request({
    url: '/crm/group/select/list',
    method: 'get',
    params: { groupName }
  })
}

// 客群列表触达总盘（与列表同筛选）
export function summaryGroup(query) {
  return request({
    url: '/crm/group/summary',
    method: 'get',
    params: query
  })
}
