import { getCurrentInstance, onUnmounted, ref } from 'vue'
import { getExportStatus } from '@/api/szhl/crm/stats'

export function useStatsExportPolling(submitExport) {
  const { proxy } = getCurrentInstance()
  const exportPolling = ref(false)
  let exportTimer = null

  function stopExportPolling() {
    exportPolling.value = false
    if (exportTimer) {
      clearInterval(exportTimer)
      exportTimer = null
    }
  }

  function startExportPolling() {
    exportPolling.value = true
    exportTimer = setInterval(() => {
      getExportStatus().then(res => {
        const status = res.data || {}
        if (status.status === 'SUCCESS') {
          stopExportPolling()
          proxy.$modal.msgSuccess('导出完成，开始下载')
          // 文件由 ruoyi-crm 写盘，下载必须落回 crm 网关（见 gatewayUrl 的 appCode 参数）
          proxy.$download.name(status.fileName, true, 'crm')
        } else if (status.status === 'FAIL') {
          stopExportPolling()
          proxy.$modal.msgError('导出失败：' + (status.errorMessage || '未知原因'))
        } else if (status.status === 'NONE') {
          stopExportPolling()
        }
      }).catch(() => stopExportPolling())
    }, 3000)
  }

  function submit(params) {
    if (exportPolling.value) {
      proxy.$modal.msgWarning('导出任务进行中，请等待完成')
      return
    }
    submitExport(params).then(() => {
      proxy.$modal.msgSuccess('导出任务已提交，完成后将自动下载')
      startExportPolling()
    })
  }

  onUnmounted(stopExportPolling)

  return {
    exportPolling,
    submit
  }
}
