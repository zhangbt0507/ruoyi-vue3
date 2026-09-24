import request from '@/utils/request'


// 查询客户列表
export function listCustom(query) {
    return request({
      url: '/custom/customInfo/list',
      method: 'get',
      params: query
    })
}

// 查询客户详情
export function queryCustBasicInfo(custIsn,idNo) {
  return request({
    url: '/custom/customInfo/queryCustBasicInfo?custIsn='+custIsn+"&idNo="+idNo,
    method: 'get'
  })
}

// 查询客户联系信息详情
export function queryCustContactInfo(query) {
    return request({
      url: '/custom/customInfo/queryCustContactInfo',
      method: 'get',
      params: query
    })
}

// 查询客户联系信息详情
export function queryCustAssetInfo(query) {
    return request({
      url: '/custom/customInfo/queryCustAssetInfo',
      method: 'get',
      params: query
    })
}

// 查询客户户籍信息
export function queryCustHjxxInfo(data) {
    return request({
      url: '/custom/customInfo/queryCustHjxxInfo',
      method: 'post',
      data: data
    })
}

// 查询客户负债信息
export function queryCustLoanInfo(data) {
    return request({
      url: '/custom/customInfo/queryCustLoanInfo',
      method: 'post',
      data: data
    })
}

// 查询客户相关还款责任信息
export function queryCustOtherLoanInfo(data) {
  return request({
    url: '/custom/customInfo/queryCustOtherLoanInfo',
    method: 'post',
    data: data
  })
}

// 查询信用卡信息
export function queryCreditCardInfo(data) {
  return request({
    url: '/custom/customInfo/queryCreditCardInfo',
    method: 'post',
    data: data
  })
}

// 查询客户产品详情
export function queryCustProductInfo(query) {
  return request({
    url: '/custom/customInfo/queryCustProductInfo',
    method: 'get',
    params: query
  })
}

// 查询客户企业贷款信息
export function queryCustBusinessInfo(data) {
  return request({
    url: '/custom/customInfo/queryCustBusinessInfo',
    method: 'post',
    data: data
  })
}