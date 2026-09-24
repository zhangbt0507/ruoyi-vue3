import request from '@/utils/request'

// 查询企业解析用户
export function queryCreditUser(query) {
    return request({
      url: '/credit/user/queryUser',
      method: 'get',
      params: query
    })
}

// 修改/保存征信前置用户
export function creditUserManage(data) {
    return request({
      url: '/credit/user/manage',
      method: 'post',
      data: data
    })
}

// 查看企业解析用户是否存在权限
export function checkPermission(query) {
  return request({
    url: '/credit/user/checkPermission',
    method: 'get',
    params: query
  })
}
