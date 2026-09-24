import request from '@/utils/request'

// 查询到期合同列表
export function listDueContract(query) {
    return request({
      url: '/market/contract/list',
      method: 'get',
      params: query
    })
  }


// 修改到期合同状态
export function updateDueContractStatus(parentId) {
    return request({
      url: '/market/contract/update-status/'+parentId,
      method: 'put'
    })
  }

// 获取历史征信信息
export function getCreditList(custId) {
  return request({
    url: '/market/contract/contract-credit/'+custId,
    method: 'get'
  })
}

// 获取合同基本信息
export function contractInfo(contractNo) {
  return request({
    url: '/market/contract/contract-info/'+contractNo,
    method: 'get'
  })
}

// 获取合同借据信息
export function contractAccountList(contractNo,reportDate) {
  return request({
    url: '/market/contract/contract-account?contractNo='+contractNo+'&reportDate='+reportDate,
    method: 'get'
  })
}

// 获取他行贷款信息
export function otherBankLoanList(reportNo) {
  return request({
    url: '/market/contract/contract-otherBankLoan/'+reportNo,
    method: 'get'
  })
}

 // 新增交互信息
 export function addCustInterActiveRecord(data) {
  return request({
    url: '/market/contract/add-record',
    method: 'post',
    data: data
  })
}

 // 获取交互信息
export function selectRecordList(custId) {
  return request({
    url: '/market/contract/record-list/'+custId,
    method: 'get'
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
  export function updateDueContractUserName(data) {
    return request({
      url: '/market/contract/contract-edit',
      method: 'put',
      data: data
    })
  }
