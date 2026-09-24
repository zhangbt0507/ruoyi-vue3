import request from '@/utils/request'

// 查询待复核列表
export function queryBeReview(query) {
    return request({
      url: '/scrap/card/queryBeReview',
      method: 'get',
      params: query
    })
}

// 根据卡号查姓名
export function queryNameByNo(query) {
    return request({
      url: '/scrap/card/queryNameByNo',
      method: 'get',
      params: query
    })
}

// 新增废卡
export function addCard(data) {
    return request({
      url: '/scrap/card/add',
      method: 'post',
      data: data
    })
}


// 废卡复核、作废
export function review(data) {
    return request({
      url: '/scrap/card/review',
      method: 'post',
      data: data
    })
}

// 查询待销毁列表
export function queryBeDestroyed(query) {
  return request({
    url: '/scrap/card/queryBeDestroyed',
    method: 'get',
    params: query
  })
}

// 销毁登记操作
export function destroyedRegist(data) {
  return request({
    url: '/scrap/card/destroyedRegist',
    method: 'post',
    data: data
  })
}


// 查询销毁监督列表
export function queryDestroyed(query) {
  return request({
    url: '/scrap/card/queryDestroyed',
    method: 'get',
    params: query
  })
}

// 查询废卡清单
export function queryAllCard(data) {
  return request({
    url: '/scrap/card/queryAllCard?pageNum='+data.pageNum+'&pageSize='+data.pageSize,
    method: 'post',
    data: data
  })
}

// 回退操作
export function updateStatusById(data) {
  return request({
    url: '/scrap/card/updateStatusById',
    method: 'post',
    data: data
  })
}

