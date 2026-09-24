import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 查询产品利率参数列表
export function listRateProductDict(query) {
  return request({
    url: '/rate/product/list',
    method: 'get',
    params: query
  })
}

// 查询产品利率参数详细
export function getRateProductDict(paramId, effectDate, customerType, pledgeType, calculateType) {
  return request({
    url: '/rate/product/getInfo',
    method: 'get',
    params: {
      paramId,
      effectDate,
      customerType,
      pledgeType,
      calculateType
    }
  })
}

// 新增产品利率参数
export function addRateProductDict(data) {
  return request({
    url: '/rate/product',
    method: 'post',
    data: data
  })
}

// 更新利率产品字典
export function updateRateProductDict(data) {
  return request({
    url: '/rate/product',
    method: 'put',
    data: data
  })
}

// 获取产品列表接口
export function getRateProductList(customerType, guaranteeType) {
  return request({
    url: '/rate/product/getRateProductList',
    method: 'get',
    params: {
      customerType: customerType,
      guaranteeType: guaranteeType
    }
  })
}