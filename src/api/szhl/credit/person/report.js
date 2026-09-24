import request from '@/utils/request'

// 查询报告列表
export function listReport(query) {
  return request({
    url: '/credit/perInfo/list',
    method: 'get',
    params: query
  })
}

// 查询个人授用信报告
export function queryCredit(data) {
  return request({
    url: '/credit/perInfo/queryCredit',
    method: 'post',
    data: data
  })
}

// 修改机构名称
export function editOrgName(type, reportNo, nos, orgName) {
  return request({
    url: '/credit/perInfo/editOrgName',
    method: 'get',
    params: { type, reportNo, nos, orgName }
  })
}