import { createRequest } from '@/utils/subRequest'
const request = createRequest('crm')
// 影像列表
export function listImage(query) {
  return request({
    url: '/crm/image/list',
    method: 'get',
    params: query
  })
}

// 影像客户汇总列表
export function listImageCustomer(query) {
  return request({
    url: '/crm/image/customer-list',
    method: 'get',
    params: query
  })
}

// 影像详情
export function getImage(id) {
  return request({
    url: '/crm/image/' + id,
    method: 'get'
  })
}

// 上传影像（multipart，data 为 FormData；多行连续上传需关闭防重复提交）
export function uploadImage(data) {
  return request({
    url: '/crm/image/upload',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data', repeatSubmit: false },
    data: data
  })
}

// 删除影像（上传者物理删，非上传者逻辑删）
export function delImage(id) {
  return request({
    url: '/crm/image/' + id,
    method: 'delete'
  })
}

// 还原逻辑删除的影像
export function restoreImage(id) {
  return request({
    url: '/crm/image/' + id + '/restore',
    method: 'put'
  })
}

// 影像分类列表
export function listImageCategory() {
  return request({
    url: '/crm/image/category/list',
    method: 'get'
  })
}

// 新增影像分类
export function addImageCategory(data) {
  return request({
    url: '/crm/image/category/add',
    method: 'post',
    data: data
  })
}

// 删除影像分类
export function delImageCategory(id) {
  return request({
    url: '/crm/image/category/' + id,
    method: 'delete'
  })
}
