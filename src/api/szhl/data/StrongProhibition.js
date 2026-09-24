import request from '@/utils/request'

const url = '/StrongProhibition';

//查询强禁入数据
export function selectList(data) {
  return request({
    url: url+"/list",
    method: 'get',
    params: data
  })
}

//根据身份证查询客户姓名
export function selectCustomerName(data) {
  return request({
    url: url+"/selectCustomerName",
    method: 'get',
    params: data
  })
}

// 记录PDF下载日志
export function saveDownloadLog(data) {
  return request({
    url: url + '/downloadLog',
    method: 'post',
    data
  })
}

// 查询PDF下载日志列表
export function listDownloadLog(query) {
  return request({
    url: url + '/downloadLog/list',
    method: 'get',
    params: query
  })
}