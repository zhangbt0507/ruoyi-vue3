import request from '@/utils/request'

export function listVillageWeeklyJournal(query) {
  return request({
    url: '/szhl/villageWeeklyJournal/list',
    method: 'get',
    params: query
  })
}

export function getVillageWeeklyJournal(id) {
  return request({
    url: '/szhl/villageWeeklyJournal/' + id,
    method: 'get'
  })
}

/** 新增村走访周志 */
export function addVillageWeeklyJournal(data) {
  return request({
    url: '/szhl/villageWeeklyJournal',
    method: 'post',
    data
  })
}

export function updateVillageWeeklyJournal(data) {
  return request({
    url: '/szhl/villageWeeklyJournal',
    method: 'put',
    data
  })
}

export function delVillageWeeklyJournal(ids) {
  return request({
    url: '/szhl/villageWeeklyJournal/' + ids,
    method: 'delete'
  })
}
