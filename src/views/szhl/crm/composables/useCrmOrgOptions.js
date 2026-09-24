import { ref } from 'vue'
import { listDeptAssess } from '@/api/system/dept'

// 模块级共享状态：CRM 各页面共用同一次机构列表请求，来回切换不重复请求
const orgOptions = ref([])
const loading = ref(false)
const loadFailed = ref(false)
let loadPromise = null

export function useCrmOrgOptions() {
  if (!loadPromise) {
    loading.value = true
    loadFailed.value = false
    loadPromise = listDeptAssess()
      .then(res => {
        // listAssess 返回扁平机构列表：正常机构 code 即机构号，汇总行只有 code（9070x0L）与名称
        orgOptions.value = (res.data || [])
          .filter(item => item && item.code)
          .map(item => ({ code: String(item.code), name: item.deptName || String(item.code) }))
      })
      .catch(() => {
        // 失败提示由 request 拦截器统一弹出，这里只记录状态并允许下个页面重试
        loadFailed.value = true
        loadPromise = null
      })
      .finally(() => {
        loading.value = false
      })
  }
  return { orgOptions, loading, loadFailed }
}
