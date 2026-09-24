import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

const url = '/deposit-manager';

// 获取列表
export function geDepositManagerList(query) {
    return request({
        url: url + '/list',
        method: 'get',
        params: query
      })
  }

    // 查询存款账号信息
export function getDepositInfo(tAcctNo) {
    return request({
      url: url + '/' + tAcctNo,
      method: 'get'
    })
  }

     // 新增
export function addDepositManager(data) {
    return request({
      url: url,
      method: 'post',
      data: data
    })
  }

    // 删除
export function delDepositManager(nos) {
    return request({
      url: url + '/' + nos,
      method: 'delete'
    })
  }

      // 查询客户经理绩效汇总
export function getDepositManagerJx(workDate,managerId) {
    return request({
      url: url + '/list-jx/' + workDate + '/' + managerId,
      method: 'get'
    })
  }