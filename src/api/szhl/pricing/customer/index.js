import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 查询客户列表
export function listCustomer(query) {
  return request({
    url: '/customer/list',
    method: 'get',
    params: query
  })
}

// 根据客户姓名模糊查询客户
export function queryCustomerByName(customerName) {
  return request({
    url: '/customer/query',
    method: 'get',
    params: { customerName: customerName || '' }
  })
}

// 查询客户详细
export function getCustomer(customerId) {
  return request({
    url: '/customer/' + customerId,
    method: 'get'
  })
}

// 新增客户
export function addCustomer(data) {
  return request({
    url: '/customer',
    method: 'post',
    data: data
  })
}

// 修改客户
export function updateCustomer(data) {
  return request({
    url: '/customer',
    method: 'put',
    data: data
  })
}

// 删除客户
export function delCustomer(customerId) {
  return request({
    url: '/customer/' + customerId,
    method: 'delete'
  })
}

// 根据借款人查询存款列表
export function listDepositor(customerId) {
  return request({
    url: '/rateDepositor/' + customerId,
    method: 'get'
  })
}

// 新增存款
export function addDepositor(data) {
  return request({
    url: '/rateDepositor',
    method: 'post',
    data: data
  })
}

// 删除存款
export function delDepositor(depositorId,borrowerId) {
  return request({
    url: '/rateDepositor',
    method: 'delete',
    params:{
      depositorId:depositorId,
      borrowerId:borrowerId
    }
  })
}


// 根据客户号查询客户
export function queryCustomerByNo(customerNo) {
  return request({
    url: '/rateDepositor/query',
    method: 'get',
    params: { customerNo: customerNo || '' }
  })
}

// 查询存款信息列表
export function custDepositList(query) {
  return request({
    url: '/rateDepositor/custDepositList',
    method: 'get',
    params: query
  })
}