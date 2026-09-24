import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

// 获取存贷款变动前10
export function getRiseAndDownItem(date,orgNo) {
    return request({
      url: '/in-and-out/query?date='+date+"&orgNo="+orgNo,
      method: 'get'
    })
  }