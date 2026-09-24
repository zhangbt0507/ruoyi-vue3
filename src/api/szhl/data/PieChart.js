
import { createRequest } from '@/utils/subRequest'
const request = createRequest('performance')

const url = '/pie-chart';
// 获取图表数据
export function getDepositPieChart(workDate,assessOrg) {
    return request({
        url: url + '/deposit?workDate='+workDate+'&assessOrg='+assessOrg,
        method: 'get'
        })
    }

// 获取图表数据
export function getBaseDepositPieChart(workDate,assessOrg) {
    return request({
        url: url + '/base-deposit?workDate='+workDate+'&assessOrg='+assessOrg,
        method: 'get'
        })
    }

// 获取图表数据
export function getLoanPieChart(workDate,assessOrg) {
    return request({
        url: url + '/loan?workDate='+workDate+'&assessOrg='+assessOrg,
        method: 'get'
        })
    }