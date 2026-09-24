import request from '@/utils/request'

// 安全的参数处理函数，避免Object.keys(undefined/null)错误
function safeTansParams(params) {
  if (params === null || params === undefined || typeof params !== 'object') {
    return '';
  }
  
  let result = '';
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && value !== "" && typeof (value) !== "undefined") {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
            let params = propName + '[' + key + ']';
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result;
}

// 查询在外人员信息列表
export function listExternalPersonnel(query) {
  return request({
    url: '/szhl/externalPersonnel/list',
    method: 'get',
    params: query
  })
}

// 查询在外人员信息详细
export function getExternalPersonnel(id) {
  return request({
    url: '/szhl/externalPersonnel/' + id,
    method: 'get'
  })
}

// 新增在外人员信息
export function addExternalPersonnel(data) {
  return request({
    url: '/szhl/externalPersonnel',
    method: 'post',
    data: data
  })
}

// 修改在外人员信息
export function updateExternalPersonnel(data) {
  return request({
    url: '/szhl/externalPersonnel',
    method: 'put',
    data: data
  })
}

// 删除在外人员信息
export function delExternalPersonnel(customerCodes) {
  return request({
    url: '/szhl/externalPersonnel/' + customerCodes,
    method: 'delete'
  })
}

// 导出在外人员信息
export function exportExternalPersonnel(query) {
  return request({
    url: '/szhl/externalPersonnel/export',
    method: 'post',
    data: query
  })
}

// 导入在外人员信息
export function importExternalPersonnel(data, updateSupport = false) {
  return request({
    url: '/szhl/externalPersonnel/importData',
    method: 'post',
    data: data,
    params: { updateSupport }
  })
}

// 下载导入模板 - 使用安全的下载方法
export function downloadImportTemplate() {
  // 直接返回Blob数据而不是通过request下载
  return request({
    url: '/szhl/externalPersonnel/importTemplate',
    method: 'post',
    responseType: 'blob'
  })
}

// 安全的下载方法
export function safeDownload(url, params, filename, config) {
  // 使用我们自己的安全参数处理函数
  const download = (url, params, filename, config) => {
    const service = request; // 获取axios实例
    return service.post(url, params, {
      transformRequest: [(params) => { return safeTansParams(params || {}) }],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
      ...config
    });
  };
  
  return download(url, params, filename, config);
}

// 根据客户名称或证件号码搜索客户信息（用于客户选择器）
export function searchCustomerForSelector(query) {
  return request({
    url: '/szhl/externalPersonnel/searchCustomer',
    method: 'get',
    params: query
  })
}

// 获取在外人员统计信息
export function getExternalPersonnelStats() {
  return request({
    url: '/szhl/externalPersonnel/stats',
    method: 'get'
  })
}