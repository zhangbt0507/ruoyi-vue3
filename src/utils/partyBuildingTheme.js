/** 党建管理 - 红色主题切换工具（路由进入/离开时同步 Element Plus 主色） */
import { getDarkColor, getLightColor } from '@/utils/theme'

/** 党建管理主题色 */
export const PARTY_BUILDING_PRIMARY = '#C8161D'

const PRIMARY_VAR_KEYS = ['--el-color-primary']
for (let i = 1; i <= 9; i++) {
  PRIMARY_VAR_KEYS.push(`--el-color-primary-light-${i}`)
  PRIMARY_VAR_KEYS.push(`--el-color-primary-dark-${i}`)
}

/** 判断当前路由是否属于党建管理模块 */
export function isPartyBuildingRoute(path = '') {
  return /partyBuilding/i.test(path || '')
}

/** 应用党建红色主题（设置 body 类名与 CSS 变量） */
export function applyPartyBuildingTheme() {
  if (document.body.classList.contains('party-building-theme')) {
    return
  }
  document.body.classList.add('party-building-theme')
  document.body.style.setProperty('--el-color-primary', PARTY_BUILDING_PRIMARY)
  document.body.style.setProperty('--party-building-primary', PARTY_BUILDING_PRIMARY)
  for (let i = 1; i <= 9; i++) {
    document.body.style.setProperty(
      `--el-color-primary-light-${i}`,
      getLightColor(PARTY_BUILDING_PRIMARY, i / 10)
    )
    document.body.style.setProperty(
      `--el-color-primary-dark-${i}`,
      getDarkColor(PARTY_BUILDING_PRIMARY, i / 10)
    )
  }
}

export function removePartyBuildingTheme() {
  document.body.classList.remove('party-building-theme')
  document.body.style.removeProperty('--party-building-primary')
  PRIMARY_VAR_KEYS.forEach(key => {
    document.body.style.removeProperty(key)
  })
}

/** 根据路由路径自动切换或移除党建主题 */
export function syncPartyBuildingTheme(path) {
  if (isPartyBuildingRoute(path)) {
    applyPartyBuildingTheme()
  } else {
    removePartyBuildingTheme()
  }
}
