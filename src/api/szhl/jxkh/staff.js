import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

const url = '/staff';
// 获取列表
export function getStaffList(query) {
    return request({
        url: url + '/list',
        method: 'get',
        params: query
      })
  }

  // 获取列表
export function getStaffAllList(query) {
  return request({
      url: url + '/all-list',
      method: 'get',
      params: query
    })
}

// 获取考核期员工数
export function getStaffsCount(period) {
  return request({
    url: url +'/period/' + period,
    method: 'get'
  })
}

  // 删除
export function delStaff(data) {
  return request({
    url: url,
    method: 'delete',
    data: data
  })
}

// 修改
export function updateStaff(data) {
  return request({
    url: url,
    method: 'put',
    data: data
  })
}

// 新增
export function addStaff(data) {
  return request({
    url: url,
    method: 'post',
    data: data
  })
}

// 获取员工信息
export function getStaffInfo(staffNo,workDate) {
  return request({
    url: url +'/info?staffNo=' + staffNo + '&workDate='+workDate,
    method: 'get'
  })
}