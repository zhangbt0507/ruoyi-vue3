import { getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { getCustomerPublicPrivateType } from '@/api/szhl/crm/customer'

// 客户号编码：个人 = 101 + 身份证号，对公 = 202 + 统一社会信用代码
const CUSTOMER_NO_PREFIX = { person: '101', corp: '202' }
const CUSTOMER_360_ROUTE = { '0': 'CrmCustomer360', '1': 'CrmEnterprise360' }

// 客户号点击跳转 360 视图：按公私类型路由；调用方未提供类型时从归属表查询
export function useCustomer360Nav() {
  const { proxy } = getCurrentInstance()
  const router = useRouter()

  function isEmpty(value) {
    return value === undefined || value === null || value === '' || value === '--'
  }

  function navigate(customerNo, publicPrivateType, customerName) {
    const name = CUSTOMER_360_ROUTE[String(publicPrivateType).trim()]
    if (!name) {
      return false
    }
    const query = {}
    if (!isEmpty(customerName)) {
      query.customerName = customerName
    }
    router.push({ name, params: { customerNo }, query })
    return true
  }

  function openViewByNo(customerNo, publicPrivateType, customerName) {
    if (isEmpty(customerNo)) {
      return
    }
    const no = String(customerNo).trim()
    if (navigate(no, publicPrivateType, customerName)) {
      return
    }
    getCustomerPublicPrivateType(no).then(res => {
      if (isEmpty(res.data)) {
        proxy.$modal.msgWarning('该客户非我行客户，暂无 360 视图')
        return
      }
      if (!navigate(no, res.data, customerName)) {
        proxy.$modal.msgWarning('客户公私类型异常，暂无 360 视图')
      }
    })
  }

  // type: 'person'（证件号）| 'corp'（统信码）
  function openViewByCert(cert, type, customerName) {
    if (isEmpty(cert)) {
      return
    }
    const prefix = CUSTOMER_NO_PREFIX[type]
    if (!prefix) {
      return
    }
    openViewByNo(prefix + String(cert).trim(), undefined, customerName)
  }

  return { openViewByNo, openViewByCert }
}
