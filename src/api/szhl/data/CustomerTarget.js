import request from '@/utils/request'

const url = '/CustomerTarget';


// // 获取最近系统触达信息（获取最近一次交互信息）
// export function prevRecordByCustId(custId) {
//   return request({
//     url: '/market/contract/record-prev/'+custId,
//     method: 'get'
//   })
// }

// // 获取走访信息
// export function getVisit(custIsn,workDate) {
//   return request({
//       url: '/DgCustomer/visit/'+custIsn+'/'+workDate,
//       method: 'get'
//     })
// }


// /**
//  * 获取对公客户指标是否存在
//  * @param {*} data 
//  * @returns {Promise}
//  */
// export function ifExistTarget(data) {
//   return request({
//     url: url+"/getCount",
//     method: 'get',
//     params: data
//   })
// }

// //新增对公客户目标设置
// export function addTarget(data) {
//   return request({
//     url: url,
//     method: 'post',
//     data: data
//   })
// }

// //修改对公客户目标设置
// export function updateTarget(data) {
//   return request({
//     url: url,
//     method: 'put',
//     data: data
//   })
// }

// //获取客户指标列表
// export function getCustomerTargetList(data) {
//   return request({
//     url: "/CustomerTarget/list",
//     method: 'get',
//     params: data
//   })
// }

// //获取指标库
// export function getCustAssess() {
//   return request({
//     url: "/CustAssess/list",
//     method: 'get'
//   })
// }


//第一层
export function selectFirstList(data) {
  return request({
    url: "/CustomerTarget/firstList",
    method: 'get',
    params: data
  })
}
//获取指标数量
export function selectCustomerTargetCount(customerTarget) {
  const data = {
    ...customerTarget
  }
  return request({
    url: "/CustomerTarget/getCount",
    method: 'get',
    params: data
  })
}
//第二层
export function selectSecondList(data) {
  return request({
    url: "/CustomerTarget/secondList",
    method: 'get',
    params: data
  })
}
//第三层
export function selectThirdList(data) {
  return request({
    url: "/CustomerTarget/thirdList",
    method: 'get',
    params: data
  })
}


//第一层(根据客户类型分类)
export function getFirstListGroupbyCustomerType(data) {
  return request({
    url: "/CustomerTarget/firstListGroupbyCustomerType",
    method: 'get',
    params: data
  })
}

//获取客户经理未完成数量
export function getManagerDontcompletecountList(data) {
  return request({
    url: "/CustomerTarget/managerDontcompletecountList",
    method: 'get',
    params: data
  })
}

//查询指标列表
export function getCustomerTargetDetail(data) {
  return request({
    url: "/CustomerTarget/customerTargetDetail",
    method: 'get',
    params: data
  })
}

//修改指标
export function updateCustomerTarget(data) {
  return request({
    url: url,
    method: 'put',
    data: data
  })
}