import request from '@/utils/request'

const url = '/DgCustomer';

// 获取列表
export function getDgCustomerList(query) {
    return request({
        url: url + '/list',
        method: 'get',
        params: query
      })
  }

  // 获取单个
export function getDgCustomer(custId,workDate) {
    return request({
        url: url + '/'+custId+'/'+workDate,
        method: 'get'
      })
  }

    // 获取贷款信息
export function getDgLoan(custIsn,workDate,frnm) {
  return request({
      url: url + '/loan-way/'+custIsn+'/'+workDate+'/'+frnm,
      method: 'get'
    })
}
    // 获取产品信息
export function getProduct(custIsn,workDate) {
  return request({
      url: url + '/product/'+custIsn+'/'+workDate,
      method: 'get'
    })
}

  // 获取走访信息
  export function getVisit(custIsn,workDate) {
  return request({
      url: url + '/visit/'+custIsn+'/'+workDate,
      method: 'get'
    })
}
// 获取借据
export function getLoanAccount(custIsn,workDate) {
  return request({
      url: url + '/account/'+custIsn+'/'+workDate,
      method: 'get'
    })
}


// 获取列表
export function getLoanEffect(query) {
  return request({
      url: url + '/effect',
      method: 'get',
      params: query
    })
}

// 获取征信
export function getComBcrInfo(custId) {
  return request({
      url: url + '/com-ncr/'+custId,
      method: 'get'
    })
}