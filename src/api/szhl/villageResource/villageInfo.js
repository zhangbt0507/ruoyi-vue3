import request from '@/utils/request'

export function listVillageInfo(query) {
  return request({
    url: '/szhl/villageInfo/list',
    method: 'get',
    params: query
  })
}

export function getVillageInfo(id) {
  return request({
    url: '/szhl/villageInfo/' + id,
    method: 'get'
  })
}

export function getVillageReport(id) {
  return request({
    url: '/szhl/villageInfo/report/' + id,
    method: 'get'
  })
}

/** 资源采集表页：街道/乡镇下拉 */
export function listReportTownships() {
  return request({
    url: '/szhl/villageInfo/reportTownships',
    method: 'get'
  })
}

/** 资源采集表页：社区/村下拉 */
export function listReportVillages(townshipName) {
  return request({
    url: '/szhl/villageInfo/reportVillages',
    method: 'get',
    params: { townshipName }
  })
}

/** 资源采集表页：按街道+社区加载报告 */
export function getVillageReportByLocation(townshipName, villageName) {
  return request({
    url: '/szhl/villageInfo/reportByLocation',
    method: 'get',
    params: { townshipName, villageName }
  })
}

export function addVillageInfo(data) {
  return request({
    url: '/szhl/villageInfo',
    method: 'post',
    data
  })
}

export function updateVillageInfoStats(data) {
  return request({
    url: '/szhl/villageInfo/stats',
    method: 'put',
    data
  })
}

export function delVillageInfo(ids) {
  return request({
    url: '/szhl/villageInfo/' + ids,
    method: 'delete'
  })
}

export function downloadVillageInfoTemplate() {
  return request({
    url: '/szhl/villageInfo/importTemplate',
    method: 'post',
    responseType: 'blob'
  })
}
