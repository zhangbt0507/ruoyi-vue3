import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

const url = '/org-temp-one';

// 获取普惠型贷款增幅
export function getLoanGrowRate(workDate) {
    return request({
      url: url + '/' + workDate,
      method: 'get'
    })
  }