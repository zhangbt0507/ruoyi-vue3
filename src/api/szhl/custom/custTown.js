import request from '@/utils/request'


// 查询乡镇列表
export function listxz(query) {
    return request({
      url: '/custom/custTown/listxz',
      method: 'get',
      params: query
    })
}

// 查询行政村列表
export function listxzc(query) {
    return request({
      url: '/custom/custTown/listxzc',
      method: 'get',
      params: query
    })
}

// 查询自然村列表
export function listzrc(query) {
    return request({
      url: '/custom/custTown/listzrc',
      method: 'get',
      params: query
    })
}