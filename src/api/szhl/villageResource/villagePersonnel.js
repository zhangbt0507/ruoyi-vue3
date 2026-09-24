import request from '@/utils/request'

export function listVillagePersonnel(query) {
  return request({
    url: '/szhl/villagePersonnel/list',
    method: 'get',
    params: query
  })
}

export function getVillagePersonnel(id, query) {
  return request({
    url: '/szhl/villagePersonnel/' + id,
    method: 'get',
    params: query
  })
}

export function addVillagePersonnelBatch(data) {
  return request({
    url: '/szhl/villagePersonnel/batchAdd',
    method: 'post',
    data
  })
}

export function addVillagePersonnel(data) {
  return request({
    url: '/szhl/villagePersonnel',
    method: 'post',
    data
  })
}

export function updateVillagePersonnel(data) {
  return request({
    url: '/szhl/villagePersonnel',
    method: 'put',
    data
  })
}

export function delVillagePersonnel(ids) {
  return request({
    url: '/szhl/villagePersonnel/' + ids,
    method: 'delete'
  })
}

export function exportVillagePersonnel(query) {
  return request({
    url: '/szhl/villagePersonnel/export',
    method: 'post',
    data: query
  })
}

export function downloadVillagePersonnelTemplate() {
  return request({
    url: '/szhl/villagePersonnel/importTemplate',
    method: 'post',
    responseType: 'blob'
  })
}
