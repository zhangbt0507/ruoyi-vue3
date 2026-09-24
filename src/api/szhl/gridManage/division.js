import request from '@/utils/request'

// 查询省级区划列表
export function getProvinces() {
  return request({
    url: '/addressBlock/division/provinces',
    method: 'get'
  })
}

// 根据父级代码获取子级区划
export function getChildren(parentCode) {
  return request({
    url: '/addressBlock/division/children',
    method: 'get',
    params: { parentCode }
  })
}

// 搜索区划
export function searchDivision(keyword) {
  return request({
    url: '/addressBlock/division/search',
    method: 'get',
    params: { keyword }
  })
}

// 根据代码获取区划路径
export function getDivisionPath(code) {
  return request({
    url: `/addressBlock/division/path/${code}`,
    method: 'get'
  })
}

// 获取级联数据
export function getCascadeData(parentCode) {
  return request({
    url: '/addressBlock/division/cascade',
    method: 'get',
    params: { parentCode }
  })
}

// 根据代码获取区划信息
export function getDivisionByCode(code) {
  return request({
    url: `/addressBlock/division/code/${code}`,
    method: 'get'
  })
}

// 查询行政区划列表
export function listDivision(query) {
  return request({
    url: '/addressBlock/division/list',
    method: 'get',
    params: query
  })
}

// 查询行政区划详细
export function getDivision(id) {
  return request({
    url: '/addressBlock/division/' + id,
    method: 'get'
  })
}

// 新增行政区划
export function addDivision(data) {
  return request({
    url: '/addressBlock/division',
    method: 'post',
    data: data
  })
}

// 修改行政区划
export function updateDivision(data) {
  return request({
    url: '/addressBlock/division',
    method: 'put',
    data: data
  })
}

// 删除行政区划
export function delDivision(ids) {
  return request({
    url: '/addressBlock/division/' + ids,
    method: 'delete'
  })
}