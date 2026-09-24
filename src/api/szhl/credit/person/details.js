import request from '@/utils/request'

// 获取基本信息
export function queryBaseInfo(reportId) {
    return request({
      url: '/credit/person/analy/queryBaseInfo',
      method: 'get',
      params: { reportId }
    })
  }

  // 获取贷款信息
export function queryLoanInfos(reportId) {
  return request({
    url: '/credit/person/analy/queryLoanInfos',
    method: 'get',
    params: { reportId }
  })
}
  
  // 获取信用卡信息
  export function getBcrCreditcardInfos(reportId) {
    return request({
      url: '/credit/person/analy/getBcrCreditCardInfos',
      method: 'get',
      params: { reportId }
    })
  }

  // 获取信用卡汇总信息
  export function getBcrCreditCardSummary(reportId) {
    return request({
      url: '/credit/person/analy/getBcrCreditCardSummary',
      method: 'get',
      params: { reportId }
    })
  }

  // 获取相关还款责任明细信息
  export function getBcrOtherLoanInfos(reportId) {
    return request({
      url: '/credit/person/analy/getBcrOtherLoanInfos',
      method: 'get',
      params: { reportId }
    })
  }

// 历史数据分析：获取近三年“每季度最后一份报告”列表
export function getReportHistory(idNo, reportDate) {
  return request({
    url: '/credit/person/analy/getReportHistory',
    method: 'get',
    params: { idNo, reportDate }
  })
}


// 查询二代前置并解析企业征信报告
export function queryAndParsePersonCredit(data) {
  return request({
    url: '/credit/perInfo/queryAndParsePersonCredit',
    method: 'post',
    data: data
  })
}
