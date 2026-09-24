import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'

function createGatewayProxy(apiRoot, suffix, target) {
  const gateway = `${apiRoot}-${suffix}`
  return {
    [gateway]: {
      target,
      changeOrigin: true,
      rewrite: (p) => p.replace(new RegExp(`^${gateway.replace(/\//g, '\\/')}`), '')
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_APP_ENV } = env
  const apiRoot = env.VITE_APP_BASE_API || '/dev-api'
  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 baseUrl 为 /admin/。
    base: VITE_APP_ENV === 'production' ? '/' : '/',
    plugins: createVitePlugins(env, command === 'build'),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src')
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    // vite 相关配置
    server: {
      port: 81,
      host: true,
      open: true,
      proxy: {
        ...createGatewayProxy(apiRoot, 'auth', 'http://localhost:8082'),
        ...createGatewayProxy(apiRoot, 'pricing', 'http://localhost:8083'),
        ...createGatewayProxy(apiRoot, 'performance', 'http://localhost:8084'),
        ...createGatewayProxy(apiRoot, 'party', 'http://localhost:8085'),
        ...createGatewayProxy(apiRoot, 'crm', 'http://localhost:8089'),
        ...createGatewayProxy(apiRoot, 'main', 'http://localhost:8088')
      }
    },

    //fix:error:stdin>:7356:1: warning: "@charset" must be the first rule in the file
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    }
  }
})