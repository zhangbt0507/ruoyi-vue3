import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

// 获取考核指标链接
export function assessReportUrl(zbmc) {
  return request({
    url: '/assess/report-url?zbmc='+zbmc,
    method: 'get'
  })
}
// 获取考核指标结果汇总
export function selectSumAssess(workDate,orgNo) {
  return request({
    url: '/assess/query-sum?workDate='+workDate+"&orgNo="+orgNo,
    method: 'get'
  })
}

// 获取考核指标结果汇总
export function selectModeSumAssess(workDate,orgNo) {
  return request({
    url: '/assess/query-mode-sum?workDate='+workDate+"&orgNo="+orgNo,
    method: 'get'
  })
}

// 获取支行考核指标结果
export function selectAssessByCode(name,workDate) {
    return request({
      url: '/assess/query?name='+name+'&workDate='+workDate,
      method: 'get'
    })
  }

  // 获取支行考核指标结果 T+2
export function selectAssessByCode2Day(name,workDate) {
  return request({
    url: '/assess/query-2day?name='+name+'&workDate='+workDate,
    method: 'get'
  })
}

  // 获取网点考核指标结果
export function selectAssessByCodeWd(name,workDate) {
  return request({
    url: '/assess/query-wd?name='+name+'&workDate='+workDate,
    method: 'get'
  })
}

  // 获取网点考核指标结果 T+2
  export function selectAssessByCodeWd2Day(name,workDate) {
    return request({
      url: '/assess/query-wd-2day?name='+name+'&workDate='+workDate,
      method: 'get'
    })
  }

  // 获取指标跑批日期
export function getAssessDate() {
  return request({
    url: '/assess/date',
    method: 'get'
  })
}

  // 获取指标列表
  export function getAssessList() {
    return request({
      url: '/assess/list',
      method: 'get'
    })
  }
   // 获取指标列表
   export function getAllEnableAssessList() {
    return request({
      url: '/assess/all-list',
      method: 'get'
    })
  }

  // 获取考核指标结果
  export function getOrgScoreRank(workDate,plan) {
    return request({
      url: '/assess/rank?workDate='+workDate+"&plan="+plan,
      method: 'get'
    })
  }

  // 获取考核指标结果
  export function getOrgScoreRankWd(workDate,plan) {
    return request({
      url: '/assess/rank-wd?workDate='+workDate+"&plan="+plan,
      method: 'get'
    })
  }

    // 获取客户经理履职考核指标结果
    export function getManagerLz(managerId,workDate) {
      return request({
        url: '/assess/manager-lz?managerId='+managerId+'&workDate='+workDate,
        method: 'get'
      })
    }

    // 获取客户经理履职考核指标结果
    export function getImpManagerLz(managerId,workDate) {
      return request({
        url: '/assess/imp-manager-lz?managerId='+managerId+'&workDate='+workDate,
        method: 'get'
      })
    }

      // 获取客户经理万家行2.0考核指标结果
      export function getVisitTwoResultList(managerId,workDate,dictLabel) {
        return request({
          url: '/assess/visit-score?managerId='+managerId+'&workDate='+workDate+'&dictLabel='+dictLabel,
          method: 'get'
        })
      }