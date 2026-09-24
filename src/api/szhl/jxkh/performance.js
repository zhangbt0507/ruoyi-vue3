import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')
const url = '/performance';
// 获取客户经理2025营销达人
export function getMarketScore(workDate) {
    return request({
      url: url+'/market/'+workDate,
      method: 'get'
    })
  }

// 获取客户经理2025营销达人指标明细
export function getMarketAssessScore(workDate) {
  return request({
    url: url+'/market-assess/'+workDate,
    method: 'get'
  })
}

export function formatNumberWithRegex(number) {
    if(number === undefined){
        return;
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

   // 获取客户经理待移交合同
export function countCreditFile() {
  return request({
    url: url+'/credit-file',
    method: 'get'
  })
}

   // 获取客户经理绩效2024
   export function getPerformance(managerId,workDate) {
    return request({
      url: url+'?managerId='+managerId+'&workDate='+workDate,
      method: 'get'
    })
  }
   // 获取客户经理绩效2024
   export function getPerformanceList(assessOrg,workDate) {
    return request({
      url: url+'/list?assessOrg='+assessOrg+'&workDate='+workDate,
      method: 'get'
    })
  }
  // 获取客户经理履职2024
  export function getManagerLzList(assessOrg,workDate) {
    return request({
      url: url+'/lz-list?assessOrg='+assessOrg+'&workDate='+workDate,
      method: 'get'
    })
  }
    // 获取客户经理万家行2.0
    export function getVisitList(assessOrg,workDate) {
      return request({
        url: url+'/visit?assessOrg='+assessOrg+'&workDate='+workDate,
        method: 'get'
      })
    }