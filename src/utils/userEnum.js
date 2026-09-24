import { ref } from 'vue'
import { queryAllUser, selectUserBydept } from '@/api/system/user'
import useUserStore from '@/store/modules/user'

export const USER_OPTION_SCOPE = {
  ALL: 'all',
  CRM_ASSIGNABLE: 'crmAssignable'
}

const FULL_ACCESS_ROLES = ['admin', 'crm_header']

const userOptions = ref([])
const crmAssignableUserOptions = ref([])
let userOptionsPromise
let crmAssignableUserOptionsPromise
let userOptionsLoaded = false
let crmAssignableUserOptionsLoaded = false
let crmAssignableCacheKey = ''

function toUserOption(user) {
  const userNo = user.userName || user.userId
  const displayName = user.nickName || user.userName || user.userId
  const label = userNo && displayName !== userNo ? `${displayName} (${userNo})` : displayName

  return {
    label,
    value: userNo,
    userId: user.userId,
    userName: user.userName,
    nickName: user.nickName,
    deptId: user.deptId,
    status: user.status
  }
}

function toUserOptions(response) {
  const rows = response.data || response.rows || []
  return rows.map(toUserOption).filter(item => item.value !== undefined && item.value !== null && item.value !== '')
}

export function getUserOptions(force = false) {
  if (!force && userOptionsLoaded) {
    return Promise.resolve(userOptions.value)
  }
  if (!force && userOptionsPromise) {
    return userOptionsPromise
  }
  userOptionsPromise = queryAllUser().then(response => {
    userOptions.value = toUserOptions(response)
    userOptionsLoaded = true
    return userOptions.value
  }).catch(error => {
    userOptionsPromise = undefined
    throw error
  })
  return userOptionsPromise
}

function getUserScopeKey() {
  const userStore = useUserStore()
  const roles = Array.isArray(userStore.roles) ? userStore.roles : []
  return [
    userStore.userId || userStore.id || userStore.name || '',
    userStore.deptId || '',
    roles.join(',')
  ].join('|')
}

function hasFullUserScope() {
  const userStore = useUserStore()
  const roles = Array.isArray(userStore.roles) ? userStore.roles : []
  return String(userStore.userId) === '1' || String(userStore.id) === '1' || roles.some(role => FULL_ACCESS_ROLES.includes(role))
}

function resetCrmAssignableCacheIfNeeded() {
  const cacheKey = getUserScopeKey()
  if (crmAssignableCacheKey === cacheKey) {
    return
  }
  crmAssignableCacheKey = cacheKey
  crmAssignableUserOptions.value = []
  crmAssignableUserOptionsPromise = undefined
  crmAssignableUserOptionsLoaded = false
}

export function getCrmAssignableUserOptions(force = false) {
  if (hasFullUserScope()) {
    return getUserOptions(force)
  }
  resetCrmAssignableCacheIfNeeded()
  if (!force && crmAssignableUserOptionsLoaded) {
    return Promise.resolve(crmAssignableUserOptions.value)
  }
  if (!force && crmAssignableUserOptionsPromise) {
    return crmAssignableUserOptionsPromise
  }
  crmAssignableUserOptionsPromise = selectUserBydept().then(response => {
    crmAssignableUserOptions.value = toUserOptions(response)
    crmAssignableUserOptionsLoaded = true
    return crmAssignableUserOptions.value
  }).catch(error => {
    crmAssignableUserOptionsPromise = undefined
    throw error
  })
  return crmAssignableUserOptionsPromise
}

export function getUserOptionsByScope(scope = USER_OPTION_SCOPE.ALL, force = false) {
  return scope === USER_OPTION_SCOPE.CRM_ASSIGNABLE
    ? getCrmAssignableUserOptions(force)
    : getUserOptions(force)
}

export function useUserOptions() {
  getUserOptions().catch(() => {
    userOptions.value = []
  })
  return userOptions
}

export function formatUserDisplayName(options, value, emptyText = '-', fallbackName = '') {
  const user = (options || []).find(item => String(item.value) === String(value))
  if (user?.nickName) return user.nickName
  if (fallbackName) return fallbackName
  if (value === undefined || value === null || value === '') return emptyText
  const text = String(value).trim()
  return /[\u4e00-\u9fa5]/.test(text) ? text : emptyText
}

export function useCrmAssignableUserOptions() {
  const fullScope = hasFullUserScope()
  getCrmAssignableUserOptions().catch(() => {
    if (fullScope) {
      userOptions.value = []
    } else {
      crmAssignableUserOptions.value = []
    }
  })
  return fullScope ? userOptions : crmAssignableUserOptions
}

export function useUserOptionsByScope(scope = USER_OPTION_SCOPE.ALL) {
  return scope === USER_OPTION_SCOPE.CRM_ASSIGNABLE
    ? useCrmAssignableUserOptions()
    : useUserOptions()
}

export function isUserOptionsLoaded() {
  return userOptionsLoaded
}

export function isCrmAssignableUserOptionsLoaded() {
  return hasFullUserScope() ? isUserOptionsLoaded() : crmAssignableUserOptionsLoaded
}

export function isUserOptionsLoadedByScope(scope = USER_OPTION_SCOPE.ALL) {
  return scope === USER_OPTION_SCOPE.CRM_ASSIGNABLE
    ? isCrmAssignableUserOptionsLoaded()
    : isUserOptionsLoaded()
}
