import request from '@/utils/request'


// 新增操作日志
export function operateLog(data) {
    return request({
      url: '/system/operate',
      method: 'post',
      data: data
    })
  }
  