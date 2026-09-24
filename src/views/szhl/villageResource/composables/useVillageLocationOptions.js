import { ref } from 'vue'
import { listReportTownships, listReportVillages } from '@/api/szhl/villageResource/villageInfo'

/**
 * 查询区乡镇 / 村名下拉（数据范围与村信息列表一致）
 * @param {import('vue').Ref|Function} queryParams 含 townshipName、villageName 的查询对象
 */
export function useVillageLocationOptions(queryParams) {
  const townshipOptions = ref([])
  const villageOptions = ref([])
  const townshipLoading = ref(false)
  const villageLoading = ref(false)

  function getParams() {
    const p = typeof queryParams === 'function' ? queryParams() : queryParams.value
    return p || {}
  }

  function loadTownships() {
    townshipLoading.value = true
    return listReportTownships()
      .then((res) => {
        townshipOptions.value = res.data || []
      })
      .finally(() => {
        townshipLoading.value = false
      })
  }

  function loadVillages(townshipName) {
    const t = townshipName ?? getParams().townshipName
    if (!t) {
      villageOptions.value = []
      return Promise.resolve()
    }
    villageLoading.value = true
    return listReportVillages(t)
      .then((res) => {
        villageOptions.value = res.data || []
        const p = getParams()
        if (p.villageName && !villageOptions.value.includes(p.villageName)) {
          p.villageName = undefined
        }
      })
      .finally(() => {
        villageLoading.value = false
      })
  }

  function onTownshipChange() {
    const p = getParams()
    p.villageName = undefined
    loadVillages()
  }

  function clearVillageOptions() {
    villageOptions.value = []
  }

  return {
    townshipOptions,
    villageOptions,
    townshipLoading,
    villageLoading,
    loadTownships,
    loadVillages,
    onTownshipChange,
    clearVillageOptions
  }
}
