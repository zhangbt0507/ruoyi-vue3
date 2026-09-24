<template>
  <div class="grid-manage-container">
    <div class="page-header">
      <h2>网格管理</h2>
      <p>综合管理网格内各类人员和事务信息</p>
    </div>
    
    <div class="module-grid">
      <div class="module-card" @click="goToExternalPersonnel">
        <div class="module-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="module-info">
          <h3>在外人员管理</h3>
          <p>管理在外人员的基本信息、联系方式、地址等</p>
          <div class="module-meta">
            <span class="count">共 {{ externalPersonnelCount }} 人</span>
            <!-- <span class="status">正常运行</span> -->
          </div>
        </div>
        <div class="module-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      
      <!-- 预留其他管理模块 -->
      <div class="module-card coming-soon">
        <div class="module-icon">
          <el-icon><Location /></el-icon>
        </div>
        <div class="module-info">
          <h3>网格巡查管理</h3>
          <p>网格内巡查记录、问题上报等功能</p>
          <div class="module-meta">
            <span class="count">功能开发中</span>
            <span class="status coming">敬请期待</span>
          </div>
        </div>
        <div class="module-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      
      <div class="module-card coming-soon">
        <div class="module-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="module-info">
          <h3>事件处理管理</h3>
          <p>网格内各类事件的登记、处理、跟踪</p>
          <div class="module-meta">
            <span class="count">功能开发中</span>
            <span class="status coming">敬请期待</span>
          </div>
        </div>
        <div class="module-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
    
    <!-- 统计信息
    <div class="stats-section">
      <div class="stats-card">
        <div class="stats-number">{{ externalPersonnelCount }}</div>
        <div class="stats-label">在外人员总数</div>
      </div>
      <div class="stats-card">
        <div class="stats-number">85%</div>
        <div class="stats-label">信息完整度</div>
      </div>
      <div class="stats-card">
        <div class="stats-number">12</div>
        <div class="stats-label">本月新增</div>
      </div>
      <div class="stats-card">
        <div class="stats-number">3</div>
        <div class="stats-label">待处理事项</div>
      </div>
    </div> -->
  </div>
</template>

<script setup name="GridManage">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, ArrowRight, Location, Document } from '@element-plus/icons-vue'

const router = useRouter()

// 在外人员数量（可以通过API获取）
const externalPersonnelCount = ref(156)

/** 跳转到在外人员管理 */
function goToExternalPersonnel() {
  router.push('/szhl/gridManage/externalPersonnel')
}
</script>

<style scoped>
.grid-manage-container {
  padding: 20px;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: center;
}

.page-header h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.module-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: #409eff;
}

.module-card.coming-soon {
  opacity: 0.7;
  cursor: not-allowed;
}

.module-card.coming-soon:hover {
  transform: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-color: #e8e8e8;
}

.module-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #409eff, #66b3ff);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
}

.module-icon .el-icon {
  font-size: 28px;
  color: white;
}

.module-info {
  flex: 1;
}

.module-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

.module-info p {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.module-meta {
  display: flex;
  gap: 16px;
}

.module-meta .count {
  background: #f0f9ff;
  color: #409eff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.module-meta .status {
  background: #f0f9ff;
  color: #67c23a;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.module-meta .status.coming {
  background: #fdf6ec;
  color: #e6a23c;
}

.module-arrow {
  margin-left: 16px;
  color: #c0c4cc;
  transition: all 0.3s ease;
}

.module-card:hover .module-arrow {
  color: #409eff;
  transform: translateX(4px);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e8e8;
}

.stats-number {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.stats-label {
  color: #606266;
  font-size: 14px;
}

@media (max-width: 768px) {
  .module-grid {
    grid-template-columns: 1fr;
  }
  
  .module-card {
    flex-direction: column;
    text-align: center;
  }
  
  .module-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .module-arrow {
    margin-left: 0;
    margin-top: 16px;
  }
}
</style>