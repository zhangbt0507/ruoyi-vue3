import request from '@/utils/request'

// 获取列表
export function getLoanReviewList(query) {
return request({
        url: '/loanReview/list',
        method: 'get',
        params: query
    })
}

  // 新增
export function addLoanReviewCommit(data) {
return request({
        url: '/loanReview/addLoanReviewCommit',
        method: 'post',
        data: data
    })
}


// 下载文件
export function download(hyrq,zjh) {
return request({
        url: '/loanReview/download',
        method: 'get',
        params:{
            hyrq: hyrq,
            zjh: zjh
        },
        responseType:'blob'
    })
}