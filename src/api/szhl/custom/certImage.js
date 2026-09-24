import request from '@/utils/request'

/** 查询证件影像列表（须传客户号） */
export function listCertImage(query) {
  return request({
    url: '/custom/certImage/list',
    method: 'get',
    params: query
  })
}

/** 根据客户姓名模糊查询客户号 */
export function queryCustByName(custName) {
  return request({
    url: '/custom/certImage/queryCustByName',
    method: 'get',
    params: { custName: custName || '' }
  })
}

/** 批量上传证件影像（一次请求提交多个文件，减少 Hive 往返） */
export function uploadCertImageBatch(data) {
  return request({
    url: '/custom/certImage/batchUpload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
      repeatSubmit: false
    }
  })
}

/** 查询详情 */
export function getCertImage(id) {
  return request({
    url: '/custom/certImage/' + id,
    method: 'get'
  })
}
