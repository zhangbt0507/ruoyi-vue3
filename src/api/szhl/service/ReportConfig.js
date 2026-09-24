import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')
import { parseStrEmpty } from "@/utils/ruoyi";

const url = '/report';
// 获取报表列表
export function getReportList(query) {
    return request({
      url: url + '/list',
      method: 'get',
      params: query
    })
  }

  // 获取启用报表列表
export function getEnableReportList() {
  return request({
    url: url + '/enable-list',
    method: 'get'
  })
}

  // 新增报表
export function addReport(data) {
  return request({
    url: url,
    method: 'post',
    data: data
  })
}

// 修改用户
export function updateReport(data) {
  return request({
    url: url,
    method: 'put',
    data: data
  })
}

// 根据id获取报表
export function getReport(id) {
  return request({
    url: url + '/' + parseStrEmpty(id),
    method: 'get'
  })
}

// 用户状态修改
export function changeReportEnable(id, enable) {
  const data = {
    id,
    enable
  }
  return request({
    url: url + '/changeEnable',
    method: 'put',
    data: data
  })
}

// 删除报表
export function delReport(id) {
  return request({
    url: url + '/' + id,
    method: 'delete'
  })
}