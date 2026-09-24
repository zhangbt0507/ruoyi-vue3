import request from '@/utils/request'

// 查询企业征信列表
export function listComBcr(query) {
    return request({
      url: '/credit/comBcrInfo/list',
      method: 'get',
      params: query
    })
}


// 查询企业征信报告
export function addComUseReport(data) {
    return request({
      url: '/credit/comUse/addComUseReport',
      method: 'post',
      data: data
    })
}


// 新增征信操作日志
export function addComUseLog(data) {
  return request({
    url: '/credit/comUse/addLog',
    method: 'post',
    data: data
  })
}

// 查询二代前置并解析企业征信报告
export function queryAndParse(data) {
    return request({
      url: '/credit/comBcrInfo/queryAndParse',
      method: 'post',
      data: data
    })
}

// 修改中征码
export function editLnCode(data) {
  return request({
    url: '/credit/comBcrInfo/editLnCode',
    method: 'post',
    data: data
  })
}

// 修改社会信用代码
export function editScCode(data) {
  return request({
    url: '/credit/comBcrInfo/editScCode',
    method: 'post',
    data: data
  })
}

//模糊查询企业名称社会信用代码信息
export function queryComBcrName(data) {
  return request({
    url: '/credit/comBcrInfo/queryComBcrName',
    method: 'post',
    data: data
  })
}

//查询征信解析基础信息
export function queryAnalysBaseInfo(data) {
  return request({
    url: '/credit/comBcrAnalysis/queryBaseInfo',
    method: 'post',
    data: data
  })
}

//查询征信解析基础信息
export function queryFocusInfo(data) {
  return request({
    url: '/credit/comBcrAnalysis/queryFocusInfo',
    method: 'post',
    data: data
  })
}

//查询未结清负债明细
export function queryLoanDetail(data) {
  return request({
    url: '/credit/comBcrAnalysis/queryLoanDetail',
    method: 'post',
    data: data
  })
}

//查询未结清循环透支记录
export function queryCircleOverdrawDetail(data) {
  return request({
    url: '/credit/comBcrAnalysis/queryCircleOverdrawDetail',
    method: 'post',
    data: data
  })
}

//查询贴现 银行承兑汇票和信用证
export function queryDisDetail(data) {
  return request({
    url: '/credit/comBcrAnalysis/queryDisDetail',
    method: 'post',
    data: data
  })
}

//查询相关还款责任明细（贴现外其他业务）
export function queryRePayDetail(data) {
  return request({
    url: '/credit/comBcrAnalysis/queryRePayDetail',
    method: 'post',
    data: data
  })
}

//查询公共记录明细
export function queryCommonRecordDetail(data) {
  return request({
    url: '/credit/comBcrAnalysis/queryCommonRecordDetail',
    method: 'post',
    data: data
  })
}

//修改机构名称
export function editOrganizeName(data) {
  return request({
    url: '/credit/comBcrAnalysis/editOrganizeName',
    method: 'post',
    data: data
  })
}

//修改补录人名称
export function editRepayUserName(data) {
  return request({
    url: '/credit/comBcrAnalysis/editRepayUserName',
    method: 'post',
    data: data
  })
}

