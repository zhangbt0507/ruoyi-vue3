import request from '@/utils/request'

// 查询贷款流失提示清单
export function listLoanReduce(query) {
    return request({
      url: '/market/reduce/list',
      method: 'get',
      params: query
    })
  }

 // 新增交互信息
 export function addCustInterActiveRecord(data) {
  return request({
    url: '/market/reduce/add-record',
    method: 'post',
    data: data
  })
}

// 获取最近一次交互信息
export function prevRecordByCustId(custId) {
  return request({
    url: '/market/contract/record-prev/'+custId,
    method: 'get'
  })
}

  // 修改责任人
  export function updateLoanReduceUserName(data) {
    return request({
      url: '/market/reduce/reduce-edit',
      method: 'put',
      data: data
    })
  }