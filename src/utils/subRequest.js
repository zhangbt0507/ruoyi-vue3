import service from '@/utils/request'

/**
 * 创建绑定子系统的 request（方案1：API 层声明归属）
 * @param {string} defaultAppCode auth-center | main | rate-pricing | performance | party-building
 */
export function createRequest(defaultAppCode) {
  return function request(config) {
    return service({
      ...config,
      appCode: config.appCode ?? defaultAppCode
    })
  }
}

export default createRequest
