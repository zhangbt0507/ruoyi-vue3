import request from '@/utils/request'

// 异议列表
export function listDispute(query) {
  return request({
    url: '/crm/dispute/list',
    method: 'get',
    params: query
  })
}

// 异议详情
export function getDispute(id) {
  return request({
    url: '/crm/dispute/' + id,
    method: 'get'
  })
}

// 发起异议
export function createDispute(data) {
  return request({
    url: '/crm/dispute/create',
    method: 'post',
    data: data
  })
}

// 调入时可选的新管户机构（当前机构及辖属机构号）
export function listTransferInOrgs() {
  return request({
    url: '/crm/dispute/transferInOrgs',
    method: 'get'
  })
}

// 异议处理（action: AGREE 复议同意 / REJECT 复议不同意升级裁定 / ADJUDICATE 总行裁定）
export function processDispute(data) {
  return request({
    url: '/crm/dispute/process',
    method: 'post',
    data: data
  })
}
