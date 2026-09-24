/** 党建管理 - 党组织 API */
import request from '@/utils/request'

/** 党组织管理接口前缀 */
const url = '/PartyOrganization'

/** 分页查询党组织列表 */
export function selectList(data) {
  return request({
    url: url + '/list',
    method: 'get',
    params: data
  })
}

/** 新增党组织 */
export function addPartyOrganization(data) {
  return request({
    url: url,
    method: 'post',
    data: data
  })
}

/** 修改党组织 */
export function updatePartyOrganization(data) {
  return request({
    url: url,
    method: 'put',
    data: data
  })
}

/** 删除党组织 */
export function delPartyOrganization(idstr) {
  return request({
    url: url + '/' + idstr,
    method: 'delete'
  })
}
