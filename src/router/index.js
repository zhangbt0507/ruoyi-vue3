import { createWebHistory, createRouter } from 'vue-router'
/* Layout */
import Layout from '@/layout'

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register'),
    hidden: true
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import('@/views/error/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401'),
    hidden: true
  },
  // {
  //   path: '/szhl/credit/ComUseReportDetails',
  //   component: () => import('@/views/szhl/credit/comp/ComUseReportDetails'),
  //   hidden: true
  // },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index'),
        name: 'Home',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  {
    path: '/szhl/manager/khjl',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'deposit',
        component: () => import('@/views/szhl/manager/khjl/deposit/index'),
        name: 'deposit',
        meta: { title: '客户经理存款明细' }
      }
    ]
  },
  {
    path: '/szhl/manager/khjl',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'loan',
        component: () => import('@/views/szhl/manager/khjl/loan/index'),
        name: 'loan',
        meta: { title: '客户经理贷款明细' }
      }
    ]
  },
  {
    path: '/szhl/report',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'agency',
        component: () => import('@/views/szhl/report/agency/index'),
        name: 'agency',
        meta: { title: '报表查看' }
      }
    ]
  }
  ,{
    path: '/szhl/home',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'assess',
        component: () => import('@/views/szhl/home/assess'),
        name: 'assess',
        meta: { title: '指标详情' }
      }
    ]
  },{
    path: '/data',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'deposit',
        component: () => import('@/views/szhl/data/deposit'),
        name: 'deposit',
        meta: { title: '存款账号明细' }
      }
    ]
  }
  ,{
    path: '/data',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'loanCustomer',
        component: () => import('@/views/szhl/data/loanCustomer'),
        name: 'loanCustomer',
        meta: { title: '贷款客户明细' }
      }
    ]
  },{
    path: '/data',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'loanCustomerManager',
        component: () => import('@/views/szhl/data/loanCustomerManager'),
        name: 'loanCustomerManager',
        meta: { title: '客户经理管户' }
      }
    ]
  }
  ,{
    path: '/manager',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'performance',
        component: () => import('@/views/szhl/manager/khjl/performance'),
        name: 'performance',
        meta: { title: '客户经理业绩' }
      }
    ]
  }
  ,{
    path: '/szhl/home-manager',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'home',
        component: () => import('@/views/szhl/home/ManagerHome.vue'),
        name: 'home',
        meta: { title: '管理首页' }
      }
    ]
  },
  {
    path: '/credit',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'detail',
        component: () => import('@/views/szhl/credit/comp/ComUseReportDetails'),
        name: 'CreditDetail',
        meta: { title: '报告详情' }
      },
      {
        path: 'person/detail',
        component: () =>  import('@/views/szhl/credit/person/detail'),
        name: 'PersonReportDetail',
        meta: {title: '个人报告详情'}
      },
      {
        path: 'xy/person',
        component: () => import('@/views/szhl/credit/person/index'),
        name: 'PersonReport',
        meta: { 
          title: '个人征信', 
          activeMenu: '/szhl/credit/person',
          keepAlive: true,
          usePathKey: true
        },
        hidden: true
      }
    ]
  },
  {
    path: '/customer',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'detail/:custIsn(\\d+)',
        component: () => import('@/views/szhl/cust/CustomerDetails'),
        name: 'CustomerDetail',
        meta: { title: '客户360'}
      }
    ]
  },
  {
    path: '/dg-customer',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'info',
        component: () => import('@/views/szhl/data/DgCustomer/info'),
        name: 'info',
        meta: { title: '对公客户视图'}
      }
    ]
  },
  {
    path: '/customerRate',
    component: Layout,
    hidden: true,
    redirect: 'noRedirect',
    name: 'CustomerManage',
    meta: { 
      title: '客户管理',
      icon: 'user'
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/szhl/pricing/customer/index'),
        name: 'customerRate',
        meta: { title: '客户信息', icon: 'list' }
      },
      {
        path: 'customer/ratePrice',
        component: () => import('@/views/szhl/pricing/customer/ratePrice'),
        name: 'RatePrice',
        meta: { 
          title: '利率定价', 
          activeMenu: '/szhl/pricing/customer',
          keepAlive: true,
          usePathKey: true
        },
        hidden: true
      },
      {
        path: 'process',
        component: () => import('@/views/szhl/pricing/customer/processIndex'),
        name: 'RateProcess',
        meta: { title: '定价流程', icon: 'peoples' }
      },
      {
        path: 'sharedList',
        name: 'SharedList',
        component: () => import('@/views/szhl/pricing/customer/sharedList'),
        meta: { title: '定价奖励', icon: 'share' }
      }
    ]
  },
  {
    path: '/pricing',
    component: Layout,
    hidden: false,
    redirect: '/pricing/process',
    name: 'PricingManage',
    children: [
      {
        path: 'process/detail/:id',
        component: () => import('@/views/szhl/pricing/customer/processDetail'),
        name: 'ProcessDetail',
        meta: { title: '定价流程详情', activeMenu: '/pricing/process', noCache: true },
        hidden: true
      }
    ]
  },
  {
    path: '/gridManage',
    component: Layout,
    hidden: true,
    redirect: 'noRedirect',
    name: 'GridManage',
    meta: {
      title: '网格管理',
      icon: 'system'
    },
    children: [
      {
        path: 'gridManage/externalPersonnel',
        component: () => import('@/views/szhl/gridManage/externalPersonnel/index'),
        name: 'ExternalPersonnel',
        meta: { title: '在外人员管理', icon: 'user', activeMenu: '/gridManage', usePathKey: false },
        hidden: true
      }
    ]
  },
  {
    path: '/villageResource',
    component: Layout,
    hidden: true,
    redirect: 'noRedirect',
    name: 'SzhlVillageResource',
    children: [
      {
        path: 'personnel',
        component: () => import('@/views/szhl/villageResource/villagePersonnel/index.vue'),
        name: 'VillagePersonnel',
        meta: { title: '村人员信息', icon: 'peoples', activeMenu: '/szhl/villageResource/personnel' }
      },
      {
        path: 'info',
        component: () => import('@/views/szhl/villageResource/villageInfo/index.vue'),
        name: 'VillageInfo',
        meta: { title: '村信息', icon: 'tree', activeMenu: '/szhl/villageResource/info' }
      },
      {
        path: 'villageWeeklyJournal',
        component: () => import('@/views/szhl/villageResource/villageWeeklyJournal/index.vue'),
        name: 'villageWeeklyJournal',
        meta: { title: '周志记录', icon: 'documentation', activeMenu: '/villageResource/villageWeeklyJournal' }
      },
      {
        path: 'villageReport',
        component: () => import('@/views/szhl/villageResource/villageReport/index.vue'),
        name: 'VillageReport',
        meta: { title: '资源采集表', icon: 'documentation', activeMenu: '/villageResource/villageReport' }
      }
    ]
  }
  
  
]

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
 
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: '分配角色', activeMenu: '/system/user' }
      }
    ]
  },
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser'),
        name: 'AuthUser',
        meta: { title: '分配用户', activeMenu: '/system/role' }
      }
    ]
  },
  {
    path: '/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data'),
        name: 'Data',
        meta: { title: '字典数据', activeMenu: '/system/dict' }
      }
    ]
  },
  {
    path: '/monitor/job-log',
    component: Layout,
    hidden: true,
    permissions: ['monitor:job:list'],
    children: [
      {
        path: 'index/:jobId(\\d+)',
        component: () => import('@/views/monitor/job/log'),
        name: 'JobLog',
        meta: { title: '调度日志', activeMenu: '/monitor/job' }
      }
    ]
  },
  {
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/editTable'),
        name: 'GenEdit',
        meta: { title: '修改生成配置', activeMenu: '/tool/gen' }
      }
    ]
  },
  {
    path: '/szhl/report-data',
    component: Layout,
    hidden: true,
    permissions: ['report:agency'],
    children: [
      {
        path: 'index/:assess/:deptId/:workDate/:managerId',
        component: () => import('@/views/szhl/report/ReportData'),
        name: 'ReportData',
        meta: { title: '指标明细', activeMenu: '/szhl/report' }
      }
    ]
  },
  {
    path: '/finance/rate',
    component: Layout,
    hidden: true,
    permissions: ['finance:rate:edit'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/szhl/pricing/param/config'),
        name: 'RateManage',
        meta: { title: '利率定价管理', activeMenu: '/finance/rate' }
      }
    ]
  }
,
  {
    path: '/crm/dataplatform/contract',
    component: Layout,
    hidden: true,
    permissions: ['crm:contact:list'],
    children: [
      {
        path: '',
        component: () => import('@/views/szhl/crm/contact/index'),
        name: 'CrmDataPlatformContract',
        meta: { title: '分解分层触达', activeMenu: '/crm/dataplatform/contract' }
      }
    ]
  },
  {
    path: '/crm/attributionMgr/image',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/szhl/crm/image/query'),
        name: 'CrmImageQuery',
        meta: { title: '影像资料管理', activeMenu: '/crm/attributionMgr/image' }
      }
    ]
  },
  {
    path: '/crm/customer360',
    component: Layout,
    hidden: true,
    permissions: ['crm:attribution:list'],
    children: [
      {
        path: ':customerNo?',
        component: () => import('@/views/szhl/crm/customer360/index'),
        name: 'CrmCustomer360',
        meta: { title: '个人360视图', activeMenu: '/crm/attribution/index', multiInstance: true },
        beforeEnter: to => {
          if (!to.params.customerNo && to.query.customerNo) {
            const query = { ...to.query }
            delete query.customerNo
            return { name: 'CrmCustomer360', params: { customerNo: to.query.customerNo }, query, replace: true }
          }
        }
      }
    ]
  },
  {
    path: '/crm/enterprise360',
    component: Layout,
    hidden: true,
    permissions: ['crm:attribution:list'],
    children: [
      {
        path: ':customerNo?',
        component: () => import('@/views/szhl/crm/enterprise360/index'),
        name: 'CrmEnterprise360',
        meta: { title: '企业360视图', activeMenu: '/crm/attribution/index', multiInstance: true },
        beforeEnter: to => {
          if (!to.params.customerNo && to.query.customerNo) {
            const query = { ...to.query }
            delete query.customerNo
            return { name: 'CrmEnterprise360', params: { customerNo: to.query.customerNo }, query, replace: true }
          }
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
});

export default router;
