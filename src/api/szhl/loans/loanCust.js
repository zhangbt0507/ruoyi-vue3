import request from '@/utils/request'

// 查询贷款客户清单
export function queryLoanCust(data) {
    return request({
      url: '/loan/cust/queryLoanCust?pageNum='+data.pageNum+'&pageSize='+data.pageSize,
      method: 'post',
      data: data
    })
}

// 保存不良贷款客户信息
export function insertBadLoanCust(data) {
    return request({
      url: '/loan/cust/insertBadLoanCust',
      method: 'post',
      data: data
    })
}

// 更新不良贷款客户信息
export function updateBadLoanCust(data) {
    return request({
      url: '/loan/cust/updateBadLoanCust',
      method: 'post',
      data: data
    })
}

// 查询不良贷款客户信息列表
export function queryBadLoanCust(data) {
    return request({
      url: '/loan/cust/queryBadLoanCust?pageNum='+data.pageNum+'&pageSize='+data.pageSize,
      method: 'post',
      data: data
    })
}

// 查询不良客户详情
export function queryBadLoanCustDetail(query) {
    return request({
      url: '/loan/cust/queryBadLoanCustDetail?id='+query,
      method: 'get',
    })
}

// 删除不良客户信息
export function deleteInfo(query){
    return request({
      url: '/loan/cust/delete?id='+query,
      method: 'get',
    })
}
