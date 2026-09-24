/** 应知应会制度库 API */
import request from '@/utils/request'

const url = '/policyLibrary'

/** 制度库专用上传地址（物理目录：{ruoyi.profile/policyLibrary}） */
export const POLICY_LIBRARY_UPLOAD_URL = import.meta.env.VITE_APP_BASE_API + url + '/upload'

/** 部室选项 */
export const DEPARTMENT_OPTIONS = [
  { label: '业务管理部', value: '业务管理部' },
  { label: '普惠发展部', value: '普惠发展部' },
  { label: '风险管理部', value: '风险管理部' },
  { label: '运营管理部', value: '运营管理部' },
  { label: '人力资源部', value: '人力资源部' },
  { label: '计划财务部', value: '计划财务部' },
  { label: '安全保卫部', value: '安全保卫部' },
  { label: '审计部', value: '审计部' },
  { label: '纪检办公室', value: '纪检办公室' },
  { label: '合规管理部', value: '合规管理部' },
  { label: '办公室', value: '办公室' },
  { label: '信息科技部', value: '信息科技部' }
]

/** 分类选项 */
export const CATEGORY_OPTIONS = [
  { label: '\u200B', value: '0' },
  { label: '*', value: '1' }
]

/** 分类筛选选项 */
export const CATEGORY_FILTER_OPTIONS = [
  { label: '*', value: '1' }
]

export function categoryLabel(value) {
  if (value === '0' || value === 0) return ''
  const item = CATEGORY_OPTIONS.find(o => o.value === value)
  return item ? item.label : value
}

export function categoryOptionLabel(item) {
  return item.value === '0' ? '\u200B' : item.label
}

export function listPolicyLibrary(query) {
  return request({
    url: url + '/list',
    method: 'get',
    params: query
  })
}

export function getPolicyLibrary(id) {
  return request({
    url: url + '/' + id,
    method: 'get'
  })
}

export function addPolicyLibrary(data) {
  return request({
    url,
    method: 'post',
    data
  })
}

export function updatePolicyLibrary(data) {
  return request({
    url,
    method: 'put',
    data
  })
}

export function changePolicyLibraryStatus(id, status) {
  return request({
    url: url + '/changeStatus',
    method: 'put',
    data: { id, status }
  })
}

export function distributePolicyLearning(policyIds) {
  return request({
    url: url + '/distribute',
    method: 'post',
    data: { policyIds }
  })
}