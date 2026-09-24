import { createRequest } from '@/utils/subRequest'
const request = createRequest('rate-pricing')

// 查询行权限定价字典列表
export function listRateBankPowerParam(query) {
  return request({
    url: '/rate/bankPower/list',
    method: 'get',
    params: query
  })
}

// 获取行权限定价字典详细信息
export function getInfo(paramId, effectDate) {
  // 如果effectDate是字符串格式的日期，后端需要Date类型
  // 这里我们不做转换，直接将日期字符串传递给后端
  // 后端框架应该会负责将字符串转换为Date对象
  
  return request({
    url: '/rate/bankPower/getInfo',
    method: 'get',
    params: { 
      paramId: paramId,
      effectDate: effectDate
    }
  })
}

// 新增行权限定价字典
export function add(data) {
  return request({
    url: '/rate/bankPower',
    method: 'post',
    data: data
  })
}

// 修改行权限定价字典
export function edit(data) {
  return request({
    url: '/rate/bankPower',
    method: 'put',
    data: data
  })
} 

// 获取行权限定价信息
export function getRateBankPowerInfo(pledgeType) {
  return request({
    url: '/rate/bankPower/getRateBankPowerInfo',
    method: 'get',
    params: {
      pledgeType
    }
  })
}