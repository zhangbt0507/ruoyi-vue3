import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

const url = '/direct-credit';

// 获取列表
export function getDirectCreditList(query) {
    return request({
        url: url + '/list',
        method: 'get',
        params: query
      })
  }
  // 获取列表
export function getDirectCreditSumsList(query) {
  return request({
      url: url + '/list-sums',
      method: 'get',
      params: query
    })
}
  // 查询贷款合同信息
export function getCreditInfo(contractNo) {
    return request({
      url: url + '/' + contractNo,
      method: 'get'
    })
  }

   // 新增
export function addDirectCredit(data) {
    return request({
      url: url,
      method: 'post',
      data: data
    })
  }

  // 删除
export function delDirectCredit(nos) {
  return request({
    url: url + '/' + nos,
    method: 'delete'
  })
}
  // 查询直销贷款合同信息
  export function getDirectCreditInfo(contractNo,workDate) {
    return request({
      url: url + '/info?contractNo=' + contractNo + '&workDate='+workDate,
      method: 'get'
    })
  }

  // 修改机构类客户
export function updateDirectCredit(data) {
  return request({
    url: url,
    method: 'put',
    data: data
  })
}