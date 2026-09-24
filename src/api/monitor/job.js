import request from '@/utils/request'

/** sys_job.job_group → 网关 appCode（未映射则走主系统） */
const JOB_GROUP_APP_CODE = {
  performance: 'performance'
}

export function resolveJobAppCode(jobGroup) {
  return JOB_GROUP_APP_CODE[jobGroup] || 'main'
}

// 查询定时任务调度列表
export function listJob(query) {
  return request({
    url: '/monitor/job/list',
    method: 'get',
    params: query
  })
}

// 查询定时任务调度详细
export function getJob(jobId) {
  return request({
    url: '/monitor/job/' + jobId,
    method: 'get'
  })
}

// 新增定时任务调度
export function addJob(data) {
  return request({
    url: '/monitor/job',
    method: 'post',
    data: data,
    appCode: resolveJobAppCode(data?.jobGroup)
  })
}

// 修改定时任务调度
export function updateJob(data) {
  return request({
    url: '/monitor/job',
    method: 'put',
    data: data,
    appCode: resolveJobAppCode(data?.jobGroup)
  })
}

// 删除定时任务调度
export function delJob(jobId, jobGroup) {
  return request({
    url: '/monitor/job/' + jobId,
    method: 'delete',
    appCode: resolveJobAppCode(jobGroup)
  })
}

// 任务状态修改
export function changeJobStatus(jobId, status, jobGroup) {
  const data = {
    jobId,
    status
  }
  return request({
    url: '/monitor/job/changeStatus',
    method: 'put',
    data: data,
    appCode: resolveJobAppCode(jobGroup)
  })
}


// 定时任务立即执行一次（按任务组打到对应子系统，如 performance → 8084）
export function runJob(jobId, jobGroup) {
  const data = {
    jobId,
    jobGroup
  }
  return request({
    url: '/monitor/job/run',
    method: 'put',
    data: data,
    appCode: resolveJobAppCode(jobGroup)
  })
}
