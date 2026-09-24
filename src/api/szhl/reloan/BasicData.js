// import { createRequest } from '@/utils/subRequest'
// const request = createRequest('performance')
import  request  from '@/utils/request'
const url = '/basic-data';
// 获取报表列表
export function getBasicDataList(query) {
    return request({
      url: url + '/list',
      method: 'get',
      params: query
    })
  }

    // 同步数据
export function sync() {
    return request({
      url: url + '/sync',
      method: 'get'
    })
  }