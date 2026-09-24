<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="tagsViewStore.cachedViews">
          <component
            v-if="!route.meta.link"
            :is="getViewComponent(Component, route)"
            :key="getViewKey(route)"
          />
        </keep-alive>
      </transition>
    </router-view>
    <iframe-toggle />
  </section>
</template>

<script setup>
import iframeToggle from "./IframeToggle/index"
import { defineComponent, h } from 'vue'
import useTagsViewStore from '@/store/modules/tagsView'
import { getViewCacheName } from '@/utils/tagsView'

const tagsViewStore = useTagsViewStore()
const viewComponents = new Map()

function getViewKey(route) {
  if (route.meta.multiInstance) {
    return route.path
  }
  return route.meta.usePathKey ? (route.path + JSON.stringify(route.query)) : route.path
}

function getViewComponent(Component, route) {
  if (!route.meta.multiInstance) {
    return Component
  }
  const cacheName = getViewCacheName(route)
  if (!viewComponents.has(cacheName)) {
    viewComponents.set(cacheName, defineComponent({
      name: cacheName,
      setup() {
        return () => h(Component)
      }
    }))
  }
  return viewComponents.get(cacheName)
}
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 6px;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #141414;
}

::-webkit-scrollbar-thumb {
  background-color: #0a0a0a;
  border-radius: 3px;
}
</style>

