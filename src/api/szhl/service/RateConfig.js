import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')
import { parseStrEmpty } from "@/utils/ruoyi";

const url = '/rate';
// 获取配置列表
export function getRateConfigList(query) {
    return request({
      url: url + '/list',
      method: 'get',
      params: query
    })
  }

  // 查询机构类客户详细
export function getRateConfig(key) {
    return request({
      url: url + '/' + key,
      method: 'get'
    })
  }

    // 新增配置
export function addRateConfig(data) {
    return request({
      url: url,
      method: 'post',
      data: data
    })
  }
  
  // 修改配置
  export function updateRateConfig(data) {
    return request({
      url: url,
      method: 'put',
      data: data
    })
  }

  // 删除配置
export function delRateConfig(key) {
    return request({
      url: url + '/' + key,
      method: 'delete'
    })
  }