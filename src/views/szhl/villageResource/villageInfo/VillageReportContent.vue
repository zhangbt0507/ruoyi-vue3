<template>
  <div v-if="report" class="report-sheet">
    <!-- 页眉 -->
    <header class="report-header">
      <div class="report-header__badge">磐石筑基 · 强深耕</div>
      <h1 class="report-header__title">村（社）资源采集表</h1>
      <div class="report-header__meta">
        <span class="meta-chip meta-chip--primary">
          <span class="meta-chip__label">街道 / 乡镇</span>
          <span class="meta-chip__value">{{ report.townshipName || '—' }}</span>
        </span>
        <span class="meta-chip">
          <span class="meta-chip__label">社区 / 村</span>
          <span class="meta-chip__value">{{ report.villageName || '—' }}</span>
        </span>
        <span class="meta-chip meta-chip--date">
          <span class="meta-chip__label">采集日期</span>
          <span class="meta-chip__value">{{ formatDate(report.collectDate) }}</span>
        </span>
      </div>
    </header>

    <!-- 基础信息 -->
    <section class="report-section">
      <div class="section-head">
        <span class="section-head__index">01</span>
        <span class="section-head__title">基础信息</span>
      </div>
      <div class="section-body section-body--desc">
        <el-descriptions :column="2" border class="report-descriptions">
          <el-descriptions-item label="街道 / 乡镇">{{ report.townshipName }}</el-descriptions-item>
          <el-descriptions-item label="社区 / 村">{{ report.villageName }}</el-descriptions-item>
          <el-descriptions-item label="客户经理" :span="2">
            <div class="report-manager-tags">
              <dict-tag
                v-for="code in reportManagerCodes"
                :key="String(code)"
                :options="sys_user_name"
                :value="code"
              />
              <span v-if="!reportManagerCodes.length" class="text-muted">—</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="采集日期">{{ formatDate(report.collectDate) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </section>

    <!-- 村情统计 -->
    <section class="report-section">
      <div class="section-head">
        <span class="section-head__index">02</span>
        <span class="section-head__title">村情统计</span>
      </div>
      <div class="section-body">
        <div class="stat-grid">
          <div class="stat-card">
            <span class="stat-card__label">户数</span>
            <span class="stat-card__value">{{ report.householdCount ?? '—' }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__label">人口总数</span>
            <span class="stat-card__value">{{ report.populationTotal ?? '—' }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__label">在外人口</span>
            <span class="stat-card__value">{{ report.populationOutside ?? '—' }}</span>
          </div>
        </div>
        <el-descriptions :column="1" border class="report-descriptions report-descriptions--compact">
          <el-descriptions-item label="主要产业">{{ emptyDash(report.mainIndustry) }}</el-descriptions-item>
          <el-descriptions-item label="集体经济年收入">{{ emptyDash(report.collectiveIncomeDesc) }}</el-descriptions-item>
          <el-descriptions-item label="村民主要收入来源">{{ emptyDash(report.mainIncomeSource) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </section>

    <!-- 人员分类 -->
    <section class="report-section">
      <div class="section-head">
        <span class="section-head__index">03</span>
        <div class="section-head__text">
          <span class="section-head__title">人员与资源分类</span>
          <span class="section-head__hint">数据来自「村人员信息」，按客户分类汇总</span>
        </div>
      </div>
      <div class="section-body">
        <div v-for="(cat, idx) in report.categories" :key="idx" class="category-card">
          <div class="category-card__head">
            <span class="category-card__no">{{ idx + 1 }}</span>
            <span class="category-card__title">{{ cat.title }}</span>
          </div>
          <div class="category-card__body">
            <template v-if="!cat.children || !cat.children.length">
              <p class="category-card__content">{{ cat.content || '—' }}</p>
            </template>
            <template v-else>
              <div
                v-for="(ch, j) in cat.children"
                :key="j"
                class="category-child"
                :class="{ 'category-child--last': j === cat.children.length - 1 }"
              >
                <span class="category-child__label">{{ ch.title }}</span>
                <span class="category-child__value">{{ ch.content || '—' }}</span>
              </div>
            </template>
          </div>
        </div>
        <el-empty
          v-if="!report.categories || !report.categories.length"
          description="暂无人员分类数据"
          :image-size="72"
          class="section-empty"
        />
      </div>
    </section>

    <!-- 周志 -->
    <section class="report-section">
      <div class="section-head">
        <span class="section-head__index">04</span>
        <span class="section-head__title">周志记录</span>
      </div>
      <div class="section-body">
        <template v-if="report.recentJournals && report.recentJournals.length">
          <div class="journal-timeline">
            <div
              v-for="(item, idx) in report.recentJournals"
              :key="item.id || idx"
              class="journal-item"
            >
              <div class="journal-item__dot" />
              <div class="journal-item__card">
                <div class="journal-item__meta">
                  <span class="journal-item__date">{{ formatDate(item.journalDate) }}</span>
                  <span v-if="item.recorderName" class="journal-item__recorder">{{ item.recorderName }}</span>
                </div>
                <p class="journal-item__text">{{ item.deepCultivationRecord || '—' }}</p>
              </div>
            </div>
          </div>
          <div v-if="hasMoreJournals" class="journal-footer">
            <el-icon class="journal-footer__icon"><InfoFilled /></el-icon>
            <span class="journal-footer__tip">
              共 {{ report.journalTotal }} 条周志，此处展示最近 {{ report.recentJournals.length }} 条
            </span>
            <el-link type="primary" :underline="false" @click="goJournalList">查看全部周志</el-link>
          </div>
        </template>
        <el-empty v-else description="暂无周志记录" :image-size="72" class="section-empty" />
      </div>
    </section>

    <footer class="report-footer">
      <el-icon class="report-footer__icon"><Document /></el-icon>
      <p class="report-footer__text">
        资源表每半年更新一次（1 月、7 月）；由客户经理建立并报普惠金融发展部备案。人员超过 5 人时以「1.姓名 2.姓名 …（共 N 人）」形式缩略展示。
      </p>
    </footer>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'
import { Document, InfoFilled } from '@element-plus/icons-vue'
import { parseTime } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance()
const { sys_user_name } = proxy.useDict('sys_user_name')

const props = defineProps({
  report: { type: Object, default: null }
})

const emit = defineEmits(['navigate-journals'])

const hasMoreJournals = computed(() => {
  const total = props.report?.journalTotal ?? 0
  const shown = props.report?.recentJournals?.length ?? 0
  return total > shown
})

function goJournalList() {
  emit('navigate-journals')
}

function splitManagerCodes(raw) {
  if (raw == null || raw === '') return []
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

const reportManagerCodes = computed(() => splitManagerCodes(props.report?.managerName))

function formatDate(d) {
  if (!d) return '—'
  return parseTime(d, '{y}年{m}月{d}日') || d
}

function emptyDash(v) {
  return v === null || v === undefined || v === '' ? '—' : v
}
</script>

<style scoped>
.report-sheet {
  --report-primary: #1a5fb4;
  --report-primary-light: #e8f1fc;
  --report-border: #e4e7ed;
  --report-bg: #f5f7fa;
  --report-text: #303133;
  --report-text-secondary: #606266;
  --report-text-muted: #909399;
  max-width: 920px;
  margin: 0 auto;
  padding: 4px 0 8px;
  font-size: 14px;
  color: var(--report-text);
  line-height: 1.6;
}

/* 页眉 */
.report-header {
  text-align: center;
  padding: 28px 24px 24px;
  margin-bottom: 20px;
  border-radius: 12px;
  background: linear-gradient(145deg, #1a5fb4 0%, #2d7dd2 55%, #4a9ad4 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(26, 95, 180, 0.22);
}
.report-header__badge {
  display: inline-block;
  font-size: 12px;
  letter-spacing: 0.12em;
  opacity: 0.92;
  margin-bottom: 10px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
}
.report-header__title {
  margin: 0 0 20px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1.4;
}
.report-header__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}
.meta-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 120px;
}
.meta-chip--primary {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.35);
}
.meta-chip__label {
  font-size: 11px;
  opacity: 0.85;
}
.meta-chip__value {
  font-size: 14px;
  font-weight: 600;
}

/* 区块 */
.report-section {
  margin-bottom: 20px;
  border-radius: 10px;
  border: 1px solid var(--report-border);
  background: #fff;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.section-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--report-bg);
  border-bottom: 1px solid var(--report-border);
}
.section-head__index {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--report-primary);
  background: var(--report-primary-light);
  border-radius: 8px;
}
.section-head__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.section-head__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--report-text);
}
.section-head__hint {
  font-size: 12px;
  color: var(--report-text-muted);
  font-weight: 400;
}
.section-body {
  padding: 16px 18px 18px;
}
.section-body--desc {
  padding-top: 14px;
}
.section-empty {
  padding: 12px 0;
}

/* Descriptions 统一样式 */
.report-descriptions :deep(.el-descriptions__label) {
  width: 130px;
  font-weight: 500;
  color: var(--report-text-secondary);
  background: #fafbfc !important;
}
.report-descriptions :deep(.el-descriptions__content) {
  color: var(--report-text);
}
.report-descriptions :deep(.el-descriptions__cell) {
  padding: 10px 14px !important;
}
.report-manager-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.text-muted {
  color: var(--report-text-muted);
}

/* 统计卡片 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  border-radius: 8px;
  background: linear-gradient(180deg, #f8fafc 0%, #f0f4f8 100%);
  border: 1px solid var(--report-border);
}
.stat-card__label {
  font-size: 12px;
  color: var(--report-text-muted);
}
.stat-card__value {
  font-size: 20px;
  font-weight: 700;
  color: var(--report-primary);
  font-variant-numeric: tabular-nums;
}

/* 人员分类 */
.category-card {
  margin-bottom: 12px;
  border: 1px solid var(--report-border);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.category-card:last-child {
  margin-bottom: 0;
}
.category-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--report-bg);
  border-bottom: 1px solid var(--report-border);
}
.category-card__no {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: var(--report-primary);
  border-radius: 6px;
}
.category-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--report-text);
}
.category-card__body {
  padding: 12px 14px;
}
.category-card__content {
  margin: 0;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--report-text-secondary);
}
.category-child {
  display: grid;
  grid-template-columns: 108px 1fr;
  gap: 8px 16px;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}
.category-child--last {
  border-bottom: none;
  padding-bottom: 0;
}
.category-child:first-child {
  padding-top: 0;
}
.category-child__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--report-text-muted);
}
.category-child__value {
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--report-text);
}

/* 周志时间线 */
.journal-timeline {
  position: relative;
  padding-left: 4px;
}
.journal-item {
  display: flex;
  gap: 14px;
  margin-bottom: 0;
  padding-bottom: 18px;
  position: relative;
}
.journal-item:last-child {
  padding-bottom: 0;
}
.journal-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 14px;
  bottom: 0;
  width: 2px;
  background: #dcdfe6;
}
.journal-item__dot {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  margin-top: 4px;
  border-radius: 50%;
  background: var(--report-primary);
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px var(--report-primary-light);
  z-index: 1;
}
.journal-item__card {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--report-bg);
  border: 1px solid var(--report-border);
}
.journal-item__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.journal-item__date {
  font-size: 13px;
  font-weight: 600;
  color: var(--report-text);
}
.journal-item__recorder {
  font-size: 12px;
  color: var(--report-text-muted);
  padding: 2px 8px;
  border-radius: 4px;
  background: #fff;
}
.journal-item__recorder::before {
  content: '录入 ';
  opacity: 0.7;
}
.journal-item__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--report-text-secondary);
}
.journal-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--report-primary-light);
  font-size: 13px;
}
.journal-footer__icon {
  color: var(--report-primary);
  font-size: 16px;
}
.journal-footer__tip {
  color: var(--report-text-secondary);
}

/* 页脚说明 */
.report-footer {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 8px;
  background: #fafbfc;
  border: 1px dashed var(--report-border);
}
.report-footer__icon {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 16px;
  color: var(--report-text-muted);
}
.report-footer__text {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--report-text-muted);
}

@media (max-width: 640px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
  .report-header__meta {
    flex-direction: column;
    align-items: stretch;
  }
  .meta-chip {
    min-width: 0;
    width: 100%;
  }
  .category-child {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
