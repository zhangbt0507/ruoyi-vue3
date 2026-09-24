import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')
const url = '/take-over-assess';

// 获取列表
export function getTakeOverAssessList(query) {
    return request({
        url: url + '/list',
        method: 'get',
        params: query
      })
  }

  // 新增
export function addTakeOverAssess(data) {
    return request({
      url: url,
      method: 'post',
      data: data
    })
  }

  // 修改
export function updateTakeOverAssess(data) {
    return request({
      url: url,
      method: 'put',
      data: data
    })
  }
  // 获取员工信息
export function getTakeOverAssessInfo(uid) {
    return request({
      url: url +'/info/'+uid,
      method: 'get'
    })
  }

    // 修改
export function updateManager(data,managerId) {
  return request({
    url: url+'/assign/'+managerId,
    method: 'put',
    data: data
  })
}