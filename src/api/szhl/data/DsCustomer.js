import request from '@/utils/request'

const url = '/DsCustomer';

// 获取列表
export function getDsCustomerList(query) {
    return request({
        url: url + '/list',
        method: 'get',
        params: query
      })
  }

  // 获取单个
export function getDsCustomer(custId,workDate) {
    return request({
        url: url + '/'+custId+'/'+workDate,
        method: 'get'
      })
  }

    // 获取贷款信息
export function getDsLoan(custIsn,workDate,frnm) {
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