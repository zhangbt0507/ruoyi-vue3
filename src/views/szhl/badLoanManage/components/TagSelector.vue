<template>
  <div class="tag-selection-dialog">
    <el-tabs type="border-card">
      <el-tab-pane label="社会身份">
        <div class="tag-group">
          <el-button plain size="small" @click="addTag('公务员/事业')" :class="{ 'tag-selected': selectedTags.includes('公务员/事业') }">公务员/事业</el-button>
          <el-button plain size="small" @click="addTag('国企')" :class="{ 'tag-selected': selectedTags.includes('国企') }">国企</el-button>
          <el-button plain size="small" @click="addTag('私企')" :class="{ 'tag-selected': selectedTags.includes('私企') }">私企</el-button>
          <el-button plain size="small" @click="addTag('普通员工')" :class="{ 'tag-selected': selectedTags.includes('普通员工') }">普通员工</el-button>
          <el-button plain size="small" @click="addTag('中层领导')" :class="{ 'tag-selected': selectedTags.includes('中层领导') }">中层领导</el-button>
          <el-button plain size="small" @click="addTag('高管')" :class="{ 'tag-selected': selectedTags.includes('高管') }">高管</el-button>
          <el-button plain size="small" @click="addTag('个体工商户')" :class="{ 'tag-selected': selectedTags.includes('个体工商户') }">个体工商户</el-button>
          <el-button plain size="small" @click="addTag('餐饮业')" :class="{ 'tag-selected': selectedTags.includes('餐饮业') }">餐饮业</el-button>
          <el-button plain size="small" @click="addTag('住宿业')" :class="{ 'tag-selected': selectedTags.includes('住宿业') }">住宿业</el-button>
          <el-button plain size="small" @click="addTag('教育培训')" :class="{ 'tag-selected': selectedTags.includes('教育培训') }">教育培训</el-button>
          <el-button plain size="small" @click="addTag('传统农业')" :class="{ 'tag-selected': selectedTags.includes('传统农业') }">传统农业</el-button>
        </div>
        <div class="tag-group">
          <el-button plain size="small" @click="addTag('教师')" :class="{ 'tag-selected': selectedTags.includes('教师') }">教师</el-button>
          <el-button plain size="small" @click="addTag('律师')" :class="{ 'tag-selected': selectedTags.includes('律师') }">律师</el-button>
          <el-button plain size="small" @click="addTag('医生')" :class="{ 'tag-selected': selectedTags.includes('医生') }">医生</el-button>
          <el-button plain size="small" @click="addTag('技工人才')" :class="{ 'tag-selected': selectedTags.includes('技工人才') }">技工人才</el-button>
          <el-button plain size="small" @click="addTag('IT人才')" :class="{ 'tag-selected': selectedTags.includes('IT人才') }">IT人才</el-button>
          <el-button plain size="small" @click="addTag('地产开发商')" :class="{ 'tag-selected': selectedTags.includes('地产开发商') }">地产开发商</el-button>
          <el-button plain size="small" @click="addTag('工程承包人')" :class="{ 'tag-selected': selectedTags.includes('工程承包人') }">工程承包人</el-button>
          <el-button plain size="small" @click="addTag('体力活')" :class="{ 'tag-selected': selectedTags.includes('体力活') }">体力活</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="家庭属性">
        <div class="tag-group">
          <el-button plain size="small" @click="addTag('父母健在')" :class="{ 'tag-selected': selectedTags.includes('父母健在') }">父母健在</el-button>
          <el-button plain size="small" @click="addTag('父亲单身')" :class="{ 'tag-selected': selectedTags.includes('父亲单身') }">父亲单身</el-button>
          <el-button plain size="small" @click="addTag('母亲单身')" :class="{ 'tag-selected': selectedTags.includes('母亲单身') }">母亲单身</el-button>
          <el-button plain size="small" @click="addTag('离异单身')" :class="{ 'tag-selected': selectedTags.includes('离异单身') }">离异单身</el-button>
          <el-button plain size="small" @click="addTag('丧偶单身')" :class="{ 'tag-selected': selectedTags.includes('丧偶单身') }">丧偶单身</el-button>
          <el-button plain size="small" @click="addTag('离异再婚')" :class="{ 'tag-selected': selectedTags.includes('离异再婚') }">离异再婚</el-button>
          <el-button plain size="small" @click="addTag('丧偶再婚')" :class="{ 'tag-selected': selectedTags.includes('丧偶再婚') }">丧偶再婚</el-button>
          <el-button plain size="small" @click="addTag('子女已婚')" :class="{ 'tag-selected': selectedTags.includes('子女已婚') }">子女已婚</el-button>
        </div>
        <div class="tag-group">
          <el-button plain size="small" @click="addTag('父母重病')" :class="{ 'tag-selected': selectedTags.includes('父母重病') }">父母重病</el-button>
          <el-button plain size="small" @click="addTag('本人重疾')" :class="{ 'tag-selected': selectedTags.includes('本人重疾') }">本人重疾</el-button>
          <el-button plain size="small" @click="addTag('配偶重疾')" :class="{ 'tag-selected': selectedTags.includes('配偶重疾') }">配偶重疾</el-button>
          <el-button plain size="small" @click="addTag('子女重疾')" :class="{ 'tag-selected': selectedTags.includes('子女重疾') }">子女重疾</el-button>
          <el-button plain size="small" @click="addTag('遭遇重灾')" :class="{ 'tag-selected': selectedTags.includes('遭遇重灾') }">遭遇重灾</el-button>
          <el-button plain size="small" @click="addTag('父母需要赡养')" :class="{ 'tag-selected': selectedTags.includes('父母需要赡养') }">父母需要赡养</el-button>
          <el-button plain size="small" @click="addTag('父母财力较好')" :class="{ 'tag-selected': selectedTags.includes('父母财力较好') }">父母财力较好</el-button>
          <el-button plain size="small" @click="addTag('父母品行良好')" :class="{ 'tag-selected': selectedTags.includes('父母品行良好') }">父母品行良好</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="个人品行">
        <div class="tag-group">
          <el-button plain size="small" @click="addTag('按时还款')" :class="{ 'tag-selected': selectedTags.includes('按时还款') }">按时还款</el-button>
          <el-button plain size="small" @click="addTag('偶尔逾期')" :class="{ 'tag-selected': selectedTags.includes('偶尔逾期') }">偶尔逾期</el-button>
          <el-button plain size="small" @click="addTag('经常逾期')" :class="{ 'tag-selected': selectedTags.includes('经常逾期') }">经常逾期</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div class="custom-tag-section">
      <el-input v-model="customTag1" placeholder="自定义标签1 限20字" class="custom-tag-input" />
      <el-input v-model="customTag2" placeholder="自定义标签2 限20字" class="custom-tag-input" />
      <el-input v-model="customTag3" placeholder="自定义标签3 限20字" class="custom-tag-input" />
      <el-input v-model="customTag4" placeholder="自定义标签4 限20字" class="custom-tag-input" />
    </div>
    <div class="tag-dialog-buttons">
      <el-button type="primary" @click="confirmSelection">选定</el-button>
      <el-button @click="cancelSelection">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialTags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:tags', 'confirm', 'cancel'])

const selectedTags = ref([])
const customTag1 = ref('')
const customTag2 = ref('')
const customTag3 = ref('')
const customTag4 = ref('')

// 监听初始标签变化
watch(() => props.initialTags, (val) => {
  selectedTags.value = [...val]
}, { immediate: true, deep: true })

// 添加/移除标签
function addTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
  emit('update:tags', selectedTags.value)
}

// 确认选择
function confirmSelection() {
  const allTags = [...selectedTags.value]
  
  // 添加自定义标签
  const customTags = [customTag1.value, customTag2.value, customTag3.value, customTag4.value]
    .filter(tag => tag.trim())
    .filter(tag => !allTags.includes(tag.trim()))
    .map(tag => tag.trim())
  
  allTags.push(...customTags)
  
  emit('confirm', allTags)
}

// 取消选择
function cancelSelection() {
  emit('cancel')
}
</script>

<style scoped>
.tag-selection-dialog {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f5f7fa;
  margin-bottom: 20px;
}

.tag-dialog-buttons {
  margin-top: 15px;
  text-align: right;
}

.custom-tag-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.custom-tag-input {
  width: calc(50% - 5px);
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.tag-selected {
  color: #409eff;
  border-color: #409eff;
  background-color: #ecf5ff;
}
</style> 