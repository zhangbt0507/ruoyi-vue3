import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

const url = '/pred-cir-cal';

// 获取存款测算表结果
export function getPredCirList(workDate,assessOrg) {
    return request({
      url: url + '/query?workDate='+workDate+'&assessOrg='+assessOrg,
      method: 'get'
    })
  }

  // 获取贷款测算表结果
export function getLoanPredCirList(workDate,assessOrg) {
  return request({
    url: url + '/query-loan?workDate='+workDate+'&assessOrg='+assessOrg,
    method: 'get'
  })
}