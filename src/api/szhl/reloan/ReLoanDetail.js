import  request  from '@/utils/request'
const url = '/reLoan';
// 获取贷款明细列表
export function getLoanDetailList(query) {
    return request({
      url: url + '/list',
      method: 'get',
      params: query
    })
  }

  // 获取贷款明细列表
export function getReLoanDetailList(query) {
  return request({
    url: url + '/query',
    method: 'get',
    params: query
  })
}