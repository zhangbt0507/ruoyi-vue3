<template>
  <el-dialog
    title="行政区划选择"
    v-model="dialogVisible"
    width="800px"
    @close="handleClose"
    draggable
    class="division-dialog division-selector-unique-class chrome87-fix"
    :modal="true"
    :lock-scroll="true"
    :append-to-body="true"
  >
    <div class="division-selector">
      <!-- 常用地址快捷选择 -->
      <div class="quick-select-section" v-if="favoriteAddresses.length > 0">
        <div class="quick-select-header">常用地址</div>
        <div class="quick-select-buttons">
          <el-button 
            v-for="address in favoriteAddresses" 
            :key="address.code"
            size="small"
            @click="selectFavoriteAddress(address)"
            class="quick-select-button"
          >
            {{ address.name }}
          </el-button>
        </div>
      </div>
      
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="地名、代码"
          prefix-icon="Search"
          clearable
          @input="handleSearchDebounced"
          @keyup.enter="handleSearch"
          class="search-input"
        />
        <el-button type="primary" @click="handleSearch" :disabled="!searchKeyword.trim()">搜索</el-button>
      </div>

      <!-- 面包屑导航 -->
      <div class="breadcrumb-section" v-if="breadcrumbs.length > 0">
        <div class="breadcrumb-container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item 
              v-for="(item, index) in breadcrumbs" 
              :key="item.code"
              @click="handleBreadcrumbClick(index)"
              class="breadcrumb-item"
            >
              {{ item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
          <div class="selected-code-display" v-if="selectedDivision.code">
            代码：{{ selectedDivision.code }}
          </div>
        </div>
      </div>

      <!-- 搜索结果（移到级联面板上方） -->
      <div class="search-results" v-if="searchResults.length > 0">
        <div class="search-header">搜索结果 - 共{{ searchResults.length }}条</div>
        <div class="search-list">
          <div 
            v-for="item in searchResults" 
            :key="item.code"
            class="search-item"
            @click="selectSearchResult(item)"
          >
            <div class="search-item-main">
              <div class="search-item-name">{{ item.name }}</div>
              <div class="search-item-code">代码：{{ item.code }}</div>
            </div>
            <div class="search-item-path">
              <span class="path-item" v-for="(pathItem, index) in getPathItems(item.fullPath)" :key="index">
                <span class="path-text">{{ pathItem }}</span>
                <span class="path-separator" v-if="index < getPathItems(item.fullPath).length - 1"> > </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 级联选择区域 -->
      <div class="cascade-section" v-if="searchResults.length === 0">
        <div class="level-container">
          <!-- 省份 -->
          <div class="level-panel" v-if="provinceList.length > 0">
            <div class="level-header">省/直辖市</div>
            <div class="level-content">
              <div 
                v-for="item in provinceList" 
                :key="item.code"
                class="division-item"
                :class="{ active: selectedProvince?.code === item.code }"
                @click="selectProvince(item)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>

          <!-- 城市 -->
          <div class="level-panel" v-if="cityList.length > 0">
            <div class="level-header">市/州</div>
            <div class="level-content">
              <div 
                v-for="item in cityList" 
                :key="item.code"
                class="division-item"
                :class="{ active: selectedCity?.code === item.code }"
                @click="selectCity(item)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>

          <!-- 区县 -->
          <div class="level-panel" v-if="districtList.length > 0">
            <div class="level-header">区/县</div>
            <div class="level-content">
              <div 
                v-for="item in districtList" 
                :key="item.code"
                class="division-item"
                :class="{ active: selectedDistrict?.code === item.code }"
                @click="selectDistrict(item)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>

          <!-- 街道 -->
          <div class="level-panel" v-if="streetList.length > 0">
            <div class="level-header">街道/乡镇</div>
            <div class="level-content">
              <div 
                v-for="item in streetList" 
                :key="item.code"
                class="division-item"
                :class="{ active: selectedStreet?.code === item.code }"
                @click="selectStreet(item)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>

          <!-- 村/社区 -->
          <div class="level-panel" v-if="villageList.length > 0">
            <div class="level-header">村/社区</div>
            <div class="level-content">
              <div 
                v-for="item in villageList" 
                :key="item.code"
                class="division-item"
                :class="{ active: selectedVillage?.code === item.code }"
                @click="selectVillage(item)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索结果（已移到上方） -->

      <!-- 当前选择
      <div class="selected-section" v-if="selectedDivision.code">
        <div class="selected-header">当前选择</div>
        <div class="selected-content">
          <div class="selected-path">{{ selectedDivision.fullPath }}</div>
          <div class="selected-code">代码：{{ selectedDivision.code }}</div>
        </div>
      </div> -->

      <!-- 详细地址输入 -->
      <div class="detail-address-section" v-if="selectedDivision.code">
        <div class="detail-header">详细地址</div>
        <el-input
          v-model="detailAddress"
          placeholder="具体小区号楼号门牌号（手工输入）"
          type="textarea"
          :rows="2"
          resize="vertical"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleConfirm" :disabled="!selectedDivision.code">
          引用
        </el-button>
        <el-button @click="handleClose">返回</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, defineExpose } from 'vue'
import { getProvinces, getChildren, searchDivision, getDivisionByCode } from '@/api/szhl/gridManage/division'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const dialogVisible = ref(false)
const searchKeyword = ref('')
const detailAddress = ref('')
const searchTimer = ref(null) // 搜索防抖定时器

// 常用地址
const favoriteAddresses = ref([
  { code: '330000', name: '浙江省', provinceCode: '330000', provinceName: '浙江省' },
  { code: '330100', name: '杭州市', provinceCode: '330000', provinceName: '浙江省' },
  { code: '110000', name: '北京市', provinceCode: '110000', provinceName: '北京市' },
  { code: '440100', name: '广州市', provinceCode: '440000', provinceName: '广东省' },
  { code: '310000', name: '上海市', provinceCode: '310000', provinceName: '上海市' },
  { code: '330700', name: '金华市', provinceCode: '330000', provinceName: '浙江省' },
  { code: '330727', name: '磐安县', provinceCode: '330000', provinceName: '浙江省' }
])

// 各级列表数据
const provinceList = ref([])
const cityList = ref([])
const districtList = ref([])
const streetList = ref([])
const villageList = ref([]) // 新增村/社区级数据

// 搜索结果
const searchResults = ref([])

// 选中的数据
const selectedProvince = ref(null)
const selectedCity = ref(null)
const selectedDistrict = ref(null)
const selectedStreet = ref(null)
const selectedVillage = ref(null) // 新增村/社区选中数据

// 面包屑
const breadcrumbs = ref([])

// 当前选择的区划
const selectedDivision = computed(() => {
  if (selectedVillage.value) {
    return {
      code: selectedVillage.value.code,
      name: selectedVillage.value.name,
      fullPath: `${selectedProvince.value?.name || ''} > ${selectedCity.value?.name || ''} > ${selectedDistrict.value?.name || ''} > ${selectedStreet.value?.name || ''} > ${selectedVillage.value?.name || ''}`
    }
  } else if (selectedStreet.value) {
    return {
      code: selectedStreet.value.code,
      name: selectedStreet.value.name,
      fullPath: `${selectedProvince.value?.name || ''} > ${selectedCity.value?.name || ''} > ${selectedDistrict.value?.name || ''} > ${selectedStreet.value?.name || ''}`
    }
  } else if (selectedDistrict.value) {
    return {
      code: selectedDistrict.value.code,
      name: selectedDistrict.value.name,
      fullPath: `${selectedProvince.value?.name || ''} > ${selectedCity.value?.name || ''} > ${selectedDistrict.value?.name || ''}`
    }
  } else if (selectedCity.value) {
    return {
      code: selectedCity.value.code,
      name: selectedCity.value.name,
      fullPath: `${selectedProvince.value?.name || ''} > ${selectedCity.value?.name || ''}`
    }
  } else if (selectedProvince.value) {
    return {
      code: selectedProvince.value.code,
      name: selectedProvince.value.name,
      fullPath: selectedProvince.value.name
    }
  }
  return {}
})

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    loadProvinces()
    // 为Chrome 87应用兼容性修复
    applyChromeCompatibilityFix()
  }
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

// 加载省份数据
async function loadProvinces() {
  try {
    const response = await getProvinces()
    provinceList.value = response.data || []
  } catch (error) {
    console.error('加载省份数据失败:', error)
    // 如果API调用失败，使用指定的省份数据
    provinceList.value = [
      { code: '110000', name: '北京市' },
      { code: '120000', name: '天津市' },
      { code: '130000', name: '河北省' },
      { code: '310000', name: '上海市' },
      { code: '330000', name: '浙江省' },
      { code: '440000', name: '广东省' },
      { code: '500000', name: '重庆市' }
    ]
  }
}

// 选择省份
async function selectProvince(province) {
  selectedProvince.value = province
  selectedCity.value = null
  selectedDistrict.value = null
  selectedStreet.value = null
  selectedVillage.value = null
  
  // 清空下级数据
  cityList.value = []
  districtList.value = []
  streetList.value = []
  villageList.value = []
  
  // 加载城市数据
  try {
    const response = await getChildren(province.code)
    cityList.value = response.data || []
  } catch (error) {
    console.error('加载城市数据失败:', error)
    // 如果API调用失败，使用指定的模拟数据
    if (province.code === '330000') { // 浙江省
      cityList.value = [
        { code: '330100', name: '杭州市' },
        { code: '330200', name: '宁波市' },
        { code: '330700', name: '金华市' }
      ]
    } else if (province.code === '440000') { // 广东省
      cityList.value = [
        { code: '440100', name: '广州市' },
        { code: '440300', name: '深圳市' },
        { code: '440600', name: '佛山市' }
      ]
    }
  }
  
  updateBreadcrumbs()
  
  // 强制更新样式
  setTimeout(() => {
    forceUpdateSelectedStyles()
  }, 100)
}

// 选择城市
async function selectCity(city) {
  selectedCity.value = city
  selectedDistrict.value = null
  selectedStreet.value = null
  selectedVillage.value = null
  
  // 清空下级数据
  districtList.value = []
  streetList.value = []
  villageList.value = []
  
  // 加载区县数据
  try {
    const response = await getChildren(city.code)
    districtList.value = response.data || []
  } catch (error) {
    console.error('加载区县数据失败:', error)
    // 如果API调用失败，使用模拟数据
    if (city.code === '330700') { // 金华市
      districtList.value = [
        { code: '330702', name: '婺城区' },
        { code: '330703', name: '金东区' },
        { code: '330723', name: '武义县' },
        { code: '330726', name: '浦江县' },
        { code: '330727', name: '磐安县' },
        { code: '330781', name: '兰溪市' },
        { code: '330782', name: '义乌市' },
        { code: '330783', name: '东阳市' },
        { code: '330784', name: '永康市' }
      ]
    } else if (city.code === '330100') { // 杭州市
      districtList.value = [
        { code: '330102', name: '上城区' },
        { code: '330105', name: '拱墅区' },
        { code: '330106', name: '西湖区' },
        { code: '330108', name: '滨江区' },
        { code: '330109', name: '萧山区' },
        { code: '330110', name: '余杭区' },
        { code: '330111', name: '富阳区' },
        { code: '330112', name: '临安区' },
        { code: '330122', name: '桐庐县' },
        { code: '330127', name: '淳安县' },
        { code: '330182', name: '建德市' }
      ]
    } else if (city.code === '330200') { // 宁波市
      districtList.value = [
        { code: '330203', name: '海曙区' },
        { code: '330205', name: '江北区' },
        { code: '330206', name: '北仑区' },
        { code: '330211', name: '镇海区' },
        { code: '330212', name: '鄞州区' },
        { code: '330213', name: '奉化区' },
        { code: '330225', name: '象山县' },
        { code: '330226', name: '宁海县' },
        { code: '330281', name: '余姚市' },
        { code: '330282', name: '慈溪市' }
      ]
    }
  }
  
  updateBreadcrumbs()
  
  // 强制更新样式
  setTimeout(() => {
    forceUpdateSelectedStyles()
  }, 100)
}

// 选择区县
async function selectDistrict(district) {
  selectedDistrict.value = district
  selectedStreet.value = null
  selectedVillage.value = null
  
  // 清空下级数据
  streetList.value = []
  villageList.value = []
  
  // 加载街道数据
  try {
    const response = await getChildren(district.code)
    streetList.value = response.data || []
  } catch (error) {
    console.error('加载街道数据失败:', error)
    // 如果API调用失败，使用模拟数据
    if (district.code === '330727') { // 磐安县
      streetList.value = [
        { code: '330727001', name: '安文街道' },
        { code: '330727100', name: '新渥街道' },
        { code: '330727101', name: '玉山街道' },
        { code: '330727102', name: '尖山镇' },
        { code: '330727103', name: '深泽乡' },
        { code: '330727104', name: '万苍乡' },
        { code: '330727105', name: '高二乡' },
        { code: '330727106', name: '九和乡' },
        { code: '330727107', name: '胡宅乡' },
        { code: '330727108', name: '窈川乡' },
        { code: '330727010', name: '尚湖镇' }
      ]
    }
  }
  
  updateBreadcrumbs()
  
  // 强制更新样式
  setTimeout(() => {
    forceUpdateSelectedStyles()
  }, 100)
}

// 选择街道
async function selectStreet(street) {
  selectedStreet.value = street
  selectedVillage.value = null
  
  // 清空下级数据
  villageList.value = []
  
  // 加载村/社区数据
  try {
    const response = await getChildren(street.code)
    villageList.value = response.data || []
  } catch (error) {
    console.error('加载村/社区数据失败:', error)
    // 如果API调用失败，使用模拟数据
    if (street.code === '330727100') { // 新渥街道
      villageList.value = [
        { code: '330727100001', name: '新渥社区' },
        { code: '330727100002', name: '东山村' },
        { code: '330727100003', name: '西山村' },
        { code: '330727100004', name: '南山村' },
        { code: '330727100005', name: '北山村' },
        { code: '330727100006', name: '中山村' }
      ]
    } else if (street.code === '330727001') { // 安文街道
      villageList.value = [
        { code: '330727001001', name: '安文社区' },
        { code: '330727001002', name: '春月村' },
        { code: '330727001003', name: '秋月村' },
        { code: '330727001004', name: '夏月村' },
        { code: '330727001005', name: '冬月村' }
      ]
    }
  }
  
  updateBreadcrumbs()
  
  // 强制更新样式
  setTimeout(() => {
    forceUpdateSelectedStyles()
  }, 100)
}

// 选择村/社区
function selectVillage(village) {
  selectedVillage.value = village
  updateBreadcrumbs()
  
  // 强制更新样式
  setTimeout(() => {
    forceUpdateSelectedStyles()
  }, 100)
}

// 更新面包屑
function updateBreadcrumbs() {
  breadcrumbs.value = []
  if (selectedProvince.value) {
    breadcrumbs.value.push(selectedProvince.value)
  }
  if (selectedCity.value) {
    breadcrumbs.value.push(selectedCity.value)
  }
  if (selectedDistrict.value) {
    breadcrumbs.value.push(selectedDistrict.value)
  }
  if (selectedStreet.value) {
    breadcrumbs.value.push(selectedStreet.value)
  }
  if (selectedVillage.value) {
    breadcrumbs.value.push(selectedVillage.value)
  }
}

// 面包屑点击 - 智能级联导航
async function handleBreadcrumbClick(index) {
  if (index === 0) {
    // 点击省份 - 保留省份选中，显示市级列表，清空下级
    selectedCity.value = null
    selectedDistrict.value = null
    selectedStreet.value = null
    selectedVillage.value = null
    districtList.value = []
    streetList.value = []
    villageList.value = []
    
    // 重新加载市级数据
    if (selectedProvince.value) {
      try {
        const response = await getChildren(selectedProvince.value.code)
        cityList.value = response.data || []
      } catch (error) {
        console.error('加载市级数据失败:', error)
        // 使用指定的模拟数据
        if (selectedProvince.value.code === '330000') { // 浙江省
          cityList.value = [
            { code: '330100', name: '杭州市' },
            { code: '330200', name: '宁波市' },
            { code: '330700', name: '金华市' }
          ]
        } else if (selectedProvince.value.code === '440000') { // 广东省
          cityList.value = [
            { code: '440100', name: '广州市' },
            { code: '440300', name: '深圳市' },
            { code: '440600', name: '佛山市' }
          ]
        }
      }
    }
  } else if (index === 1) {
    // 点击市 - 保留省市选中，显示区县列表，清空下级
    selectedDistrict.value = null
    selectedStreet.value = null
    selectedVillage.value = null
    streetList.value = []
    villageList.value = []
    
    // 重新加载区县数据
    if (selectedCity.value) {
      try {
        const response = await getChildren(selectedCity.value.code)
        districtList.value = response.data || []
      } catch (error) {
        console.error('加载区县数据失败:', error)
        // 使用模拟数据
        loadMockDistrictData(selectedCity.value.code)
      }
    }
  } else if (index === 2) {
    // 点击区县 - 保留省市区选中，显示街道列表，清空下级
    selectedStreet.value = null
    selectedVillage.value = null
    villageList.value = []
    
    // 重新加载街道数据
    if (selectedDistrict.value) {
      try {
        const response = await getChildren(selectedDistrict.value.code)
        streetList.value = response.data || []
      } catch (error) {
        console.error('加载街道数据失败:', error)
        // 使用模拟数据
        loadMockStreetData(selectedDistrict.value.code)
      }
    }
  } else if (index === 3) {
    // 点击街道 - 保留省市区街选中，显示村/社区列表
    selectedVillage.value = null
    
    // 重新加载村/社区数据
    if (selectedStreet.value) {
      try {
        const response = await getChildren(selectedStreet.value.code)
        villageList.value = response.data || []
      } catch (error) {
        console.error('加载村/社区数据失败:', error)
        // 使用模拟数据
        loadMockVillageData(selectedStreet.value.code)
      }
    }
  }
  
  updateBreadcrumbs()
}

// 加载模拟区县数据
function loadMockDistrictData(cityCode) {
  if (cityCode === '330700') { // 金华市
    districtList.value = [
      { code: '330702', name: '婺城区' },
      { code: '330703', name: '金东区' },
      { code: '330723', name: '武义县' },
      { code: '330726', name: '浦江县' },
      { code: '330727', name: '磐安县' },
      { code: '330781', name: '兰溪市' },
      { code: '330782', name: '义乌市' },
      { code: '330783', name: '东阳市' },
      { code: '330784', name: '永康市' }
    ]
  } else if (cityCode === '330100') { // 杭州市
    districtList.value = [
      { code: '330102', name: '上城区' },
      { code: '330105', name: '拱墅区' },
      { code: '330106', name: '西湖区' },
      { code: '330108', name: '滨江区' },
      { code: '330109', name: '萧山区' },
      { code: '330110', name: '余杭区' },
      { code: '330111', name: '富阳区' },
      { code: '330112', name: '临安区' },
      { code: '330122', name: '桐庐县' },
      { code: '330127', name: '淳安县' },
      { code: '330182', name: '建德市' }
    ]
  } else if (cityCode === '330200') { // 宁波市
    districtList.value = [
      { code: '330203', name: '海曙区' },
      { code: '330205', name: '江北区' },
      { code: '330206', name: '北仑区' },
      { code: '330211', name: '镇海区' },
      { code: '330212', name: '鄞州区' },
      { code: '330213', name: '奉化区' },
      { code: '330225', name: '象山县' },
      { code: '330226', name: '宁海县' },
      { code: '330281', name: '余姚市' },
      { code: '330282', name: '慈溪市' }
    ]
  }
}

// 加载模拟街道数据
function loadMockStreetData(districtCode) {
  if (districtCode === '330727') { // 磐安县
    streetList.value = [
      { code: '330727001', name: '安文街道' },
      { code: '330727100', name: '新渥街道' },
      { code: '330727101', name: '玉山街道' },
      { code: '330727102', name: '尖山镇' },
      { code: '330727103', name: '深泽乡' },
      { code: '330727104', name: '万苍乡' },
      { code: '330727105', name: '高二乡' },
      { code: '330727106', name: '九和乡' },
      { code: '330727107', name: '胡宅乡' },
      { code: '330727108', name: '窈川乡' },
      { code: '330727010', name: '尚湖镇' }
    ]
  }
}

// 获取路径项目数组（用于搜索结果显示）
function getPathItems(fullPath) {
  if (!fullPath) return []
  return fullPath.split(' > ').filter(item => item.trim())
}

// 生成完整路径的辅助函数
async function generateFullPath(division) {
  if (division.fullPath) {
    return division.fullPath
  }
  
  // 根据代码长度和内容推断层级
  const code = division.code
  const name = division.name
  
  if (code.length === 2) {
    // 省级（2位）
    return name
  } else if (code.length === 4) {
    // 市级（4位）
    const provinceCode = code.substring(0, 2)
    const provinceName = await getProvinceNameByCode(provinceCode)
    return `${provinceName} > ${name}`
  } else if (code.length === 6) {
    // 区县级或省市级（6位）
    if (code.endsWith('0000')) {
      // 省级（如330000）
      return name
    } else if (code.endsWith('00')) {
      // 市级（如330100）
      const provinceCode = code.substring(0, 2)
      const provinceName = await getProvinceNameByCode(provinceCode)
      return `${provinceName} > ${name}`
    } else {
      // 区县级（如330102）
      const provinceCode = code.substring(0, 2)
      const cityCode = code.substring(0, 4)
      const provinceName = await getProvinceNameByCode(provinceCode)
      const cityName = await getCityNameByCode(cityCode)
      return `${provinceName} > ${cityName} > ${name}`
    }
  } else if (code.length === 9) {
    // 街道级
    const provinceCode = code.substring(0, 2)
    const cityCode = code.substring(0, 4)
    const districtCode = code.substring(0, 6)
    const provinceName = await getProvinceNameByCode(provinceCode)
    const cityName = await getCityNameByCode(cityCode)
    const districtName = await getDistrictNameByCode(districtCode)
    return `${provinceName} > ${cityName} > ${districtName} > ${name}`
  } else if (code.length === 12) {
    // 村/社区级
    const provinceCode = code.substring(0, 2)
    const cityCode = code.substring(0, 4)
    const districtCode = code.substring(0, 6)
    const streetCode = code.substring(0, 9)
    const provinceName = await getProvinceNameByCode(provinceCode)
    const cityName = await getCityNameByCode(cityCode)
    const districtName = await getDistrictNameByCode(districtCode)
    const streetName = await getStreetNameByCode(streetCode)
    return `${provinceName} > ${cityName} > ${districtName} > ${streetName} > ${name}`
  }
  
  return name
}

// 加载模拟村/社区数据
function loadMockVillageData(streetCode) {
  if (streetCode === '330727100') { // 新渥街道
    villageList.value = [
      { code: '330727100001', name: '新渥社区' },
      { code: '330727100002', name: '东山村' },
      { code: '330727100003', name: '西山村' },
      { code: '330727100004', name: '南山村' },
      { code: '330727100005', name: '北山村' },
      { code: '330727100006', name: '中山村' }
    ]
  } else if (streetCode === '330727001') { // 安文街道
    villageList.value = [
      { code: '330727001001', name: '安文社区' },
      { code: '330727001002', name: '春月村' },
      { code: '330727001003', name: '秋月村' },
      { code: '330727001004', name: '夏月村' },
      { code: '330727001005', name: '冬月村' }
    ]
  } else if (streetCode === '330727010') { // 尚湖镇
    villageList.value = [
      { code: '330727010001', name: '尚湖村' },
      { code: '330727010002', name: '湖上村' },
      { code: '330727010003', name: '湖下村' },
      { code: '330727010004', name: '下溪滩村' },
      { code: '330727010005', name: '上溪滩村' },
      { code: '330727010006', name: '忠信庄村' },
      { code: '330727010007', name: '大王村' },
      { code: '330727010008', name: '陈雷村' },
      { code: '330727010009', name: '倪雷村' },
      { code: '330727010010', name: '山宅村' }
    ]
  }
}

// 根据省代码获取省名称
async function getProvinceNameByCode(code) {
  try {
    // 优先调用API获取省信息
    const response = await getDivisionByCode(code)
    if (response && response.data) {
      return response.data.name
    }
  } catch (error) {
    console.warn('获取省名称失败:', error)
  }
  
  // API失败时的本地映射备份
  const provinceMap = {
    // 2位码格式
    '11': '北京市',
    '12': '天津市',
    '13': '河北省',
    '33': '浙江省',
    '44': '广东省',
    // 6位码格式（数据库实际格式）
    '110000': '北京市',
    '120000': '天津市',
    '130000': '河北省',
    '330000': '浙江省',
    '440000': '广东省'
  }
  return provinceMap[code] || '未知省份'
}

// 根据市代码获取市名称
async function getCityNameByCode(code) {
  try {
    // 优先调用API获取市信息
    const response = await getDivisionByCode(code)
    if (response && response.data) {
      return response.data.name
    }
  } catch (error) {
    console.warn('获取市名称失败:', error)
  }
  
  // API失败时的本地映射备份
  const cityMap = {
    // 4位码格式
    '3301': '杭州市',
    '3302': '宁波市',
    '3303': '温州市',
    '3304': '嘉兴市',
    '3305': '湖州市',
    '3306': '绍兴市',
    '3307': '金华市',
    '3308': '衢州市',
    '3309': '舟山市',
    '3310': '台州市',
    '3311': '丽水市',
    // 6位码格式（数据库实际格式）
    '330100': '杭州市',
    '330200': '宁波市',
    '330300': '温州市',
    '330400': '嘉兴市',
    '330500': '湖州市',
    '330600': '绍兴市',
    '330700': '金华市',
    '330800': '衢州市',
    '330900': '舟山市',
    '331000': '台州市',
    '331100': '丽水市'
  }
  return cityMap[code] || '未知市县'
}

// 根据区县代码获取区县名称
async function getDistrictNameByCode(code) {
  try {
    // 优先调用API获取区县信息
    const response = await getDivisionByCode(code)
    if (response && response.data) {
      return response.data.name
    }
  } catch (error) {
    console.warn('获取区县名称失败，使用本地映射:', error)
  }
  
  // API失败时的本地映射备份
  const districtMap = {
    '330102': '上城区', '330105': '拱墅区', '330106': '西湖区', '330108': '滨江区',
    '330109': '萧山区', '330110': '余杭区', '330111': '富阳区', '330112': '临安区',
    '330122': '桐庐县', '330127': '淳安县', '330182': '建德市',
    '330702': '婺城区', '330703': '金东区', '330723': '武义县', '330726': '浦江县',
    '330727': '磐安县', '330781': '兰溪市', '330782': '义乌市', '330783': '东阳市', '330784': '永康市'
  }
  return districtMap[code] || code // 如果找不到就返回代码本身
}

// 根据街道代码获取街道名称
async function getStreetNameByCode(code) {
  try {
    // 优先调用API获取街道信息
    const response = await getDivisionByCode(code)
    if (response && response.data) {
      return response.data.name
    }
  } catch (error) {
    console.warn('获取街道名称失败，使用本地映射:', error)
  }
  
  // API失败时的本地映射备份
  const streetMap = {
    '330727001': '安文街道', '330727100': '新渥街道', '330727101': '玉山街道',
    '330727102': '尖山镇', '330727103': '深泽乡', '330727104': '万苍乡',
    '330727105': '高二乡', '330727106': '九和乡', '330727107': '胡宅乡', 
    '330727108': '窈川乡', '330727109': '尚湖镇', '330727010': '尚湖镇'
  }
  return streetMap[code] || code // 如果找不到就返回代码本身
}

// 防抖搜索
function handleSearchDebounced() {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  
  searchTimer.value = setTimeout(() => {
    handleSearch()
  }, 300) // 300ms 防抖
}

// 搜索
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }
  
  try {
    // 优先调用后端搜索接口
    const response = await searchDivision(searchKeyword.value)
    const results = response.data || []
    
    // 异步生成完整路径
    const resultsWithFullPath = []
    for (const item of results) {
      const fullPath = await generateFullPath(item)
      resultsWithFullPath.push({
        ...item,
        fullPath: fullPath
      })
    }
    
    searchResults.value = resultsWithFullPath
  } catch (error) {
    console.error('搜索区划数据失败:', error)
    // 如果后端接口失败，使用扩展的本地搜索数据
    const mockData = [
      // 省级（6位码，与数据库一致）
      { code: '110000', name: '北京市', parentCode: '', fullPath: '北京市' },
      { code: '120000', name: '天津市', parentCode: '', fullPath: '天津市' },
      { code: '130000', name: '河北省', parentCode: '', fullPath: '河北省' },
      { code: '330000', name: '浙江省', parentCode: '', fullPath: '浙江省' },
      { code: '440000', name: '广东省', parentCode: '', fullPath: '广东省' },
      
      // 浙江省市级（6位码，与数据库一致）
      { code: '330100', name: '杭州市', parentCode: '330000', fullPath: '浙江省 > 杭州市' },
      { code: '330200', name: '宁波市', parentCode: '330000', fullPath: '浙江省 > 宁波市' },
      { code: '330300', name: '温州市', parentCode: '330000', fullPath: '浙江省 > 温州市' },
      { code: '330400', name: '嘉兴市', parentCode: '330000', fullPath: '浙江省 > 嘉兴市' },
      { code: '330500', name: '湖州市', parentCode: '330000', fullPath: '浙江省 > 湖州市' },
      { code: '330600', name: '绍兴市', parentCode: '330000', fullPath: '浙江省 > 绍兴市' },
      { code: '330700', name: '金华市', parentCode: '330000', fullPath: '浙江省 > 金华市' },
      { code: '330800', name: '衢州市', parentCode: '330000', fullPath: '浙江省 > 衢州市' },
      { code: '330900', name: '舟山市', parentCode: '330000', fullPath: '浙江省 > 舟山市' },
      { code: '331000', name: '台州市', parentCode: '330000', fullPath: '浙江省 > 台州市' },
      { code: '331100', name: '丽水市', parentCode: '330000', fullPath: '浙江省 > 丽水市' },
      
      // 杭州市区县
      { code: '330102', name: '上城区', parentCode: '330100', fullPath: '浙江省 > 杭州市 > 上城区' },
      { code: '330105', name: '拱墅区', parentCode: '330100', fullPath: '浙江省 > 杭州市 > 拱墅区' },
      { code: '330106', name: '西湖区', parentCode: '330100', fullPath: '浙江省 > 杭州市 > 西湖区' },
      { code: '330108', name: '滨江区', parentCode: '330100', fullPath: '浙江省 > 杭州市 > 滨江区' },
      { code: '330109', name: '萧山区', parentCode: '330100', fullPath: '浙江省 > 杭州市 > 萧山区' },
      { code: '330110', name: '余杭区', parentCode: '330100', fullPath: '浙江省 > 杭州市 > 余杭区' },
      { code: '330111', name: '富阳区', parentCode: '330100', fullPath: '浙江省 > 杭州市 > 富阳区' },
      { code: '330112', name: '临安区', parentCode: '330100', fullPath: '浙江省 > 杭州市 > 临安区' },
      { code: '330122', name: '桐庐县', parentCode: '330100', fullPath: '浙江省 > 杭州市 > 桐庐县' },
      { code: '330127', name: '淳安县', parentCode: '330100', fullPath: '浙江省 > 杭州市 > 淳安县' },
      { code: '330182', name: '建德市', parentCode: '330100', fullPath: '浙江省 > 杭州市 > 建德市' },
      
      // 金华市区县
      { code: '330702', name: '婺城区', parentCode: '330700', fullPath: '浙江省 > 金华市 > 婺城区' },
      { code: '330703', name: '金东区', parentCode: '330700', fullPath: '浙江省 > 金华市 > 金东区' },
      { code: '330723', name: '武义县', parentCode: '330700', fullPath: '浙江省 > 金华市 > 武义县' },
      { code: '330726', name: '浦江县', parentCode: '330700', fullPath: '浙江省 > 金华市 > 浦江县' },
      { code: '330727', name: '磐安县', parentCode: '330700', fullPath: '浙江省 > 金华市 > 磐安县' },
      { code: '330781', name: '兰溪市', parentCode: '330700', fullPath: '浙江省 > 金华市 > 兰溪市' },
      { code: '330782', name: '义乌市', parentCode: '330700', fullPath: '浙江省 > 金华市 > 义乌市' },
      { code: '330783', name: '东阳市', parentCode: '330700', fullPath: '浙江省 > 金华市 > 东阳市' },
      { code: '330784', name: '永康市', parentCode: '330700', fullPath: '浙江省 > 金华市 > 永康市' },
      
      // 磐安县街道
      { code: '330727001', name: '安文街道', parentCode: '330727', fullPath: '浙江省 > 金华市 > 磐安县 > 安文街道' },
      { code: '330727100', name: '新渥街道', parentCode: '330727', fullPath: '浙江省 > 金华市 > 磐安县 > 新渥街道' },
      { code: '330727101', name: '玉山街道', parentCode: '330727', fullPath: '浙江省 > 金华市 > 磐安县 > 玉山街道' },
      { code: '330727102', name: '尖山镇', parentCode: '330727', fullPath: '浙江省 > 金华市 > 磐安县 > 尖山镇' },
      { code: '330727103', name: '深泽乡', parentCode: '330727', fullPath: '浙江省 > 金华市 > 磐安县 > 深泽乡' },
      { code: '330727104', name: '万苍乡', parentCode: '330727', fullPath: '浙江省 > 金华市 > 磐安县 > 万苍乡' },
      { code: '330727105', name: '高二乡', parentCode: '330727', fullPath: '浙江省 > 金华市 > 磐安县 > 高二乡' },
      { code: '330727106', name: '九和乡', parentCode: '330727', fullPath: '浙江省 > 金华市 > 磐安县 > 九和乡' },
      { code: '330727107', name: '胡宅乡', parentCode: '330727', fullPath: '浙江省 > 金华市 > 磐安县 > 胡宅乡' },
      { code: '330727108', name: '窈川乡', parentCode: '330727', fullPath: '浙江省 > 金华市 > 磐安县 > 窈川乡' },
      { code: '330727010', name: '尚湖镇', parentCode: '330727', fullPath: '浙江省 > 金华市 > 磐安县 > 尚湖镇' },
      
      // 新渥街道村/社区
      { code: '330727100001', name: '新渥社区', parentCode: '330727100', fullPath: '浙江省 > 金华市 > 磐安县 > 新渥街道 > 新渥社区' },
      { code: '330727100002', name: '东山村', parentCode: '330727100', fullPath: '浙江省 > 金华市 > 磐安县 > 新渥街道 > 东山村' },
      { code: '330727100003', name: '西山村', parentCode: '330727100', fullPath: '浙江省 > 金华市 > 磐安县 > 新渥街道 > 西山村' },
      { code: '330727100004', name: '南山村', parentCode: '330727100', fullPath: '浙江省 > 金华市 > 磐安县 > 新渥街道 > 南山村' },
      { code: '330727100005', name: '北山村', parentCode: '330727100', fullPath: '浙江省 > 金华市 > 磐安县 > 新渥街道 > 北山村' },
      { code: '330727100006', name: '中山村', parentCode: '330727100', fullPath: '浙江省 > 金华市 > 磐安县 > 新渥街道 > 中山村' },
      
      // 安文街道村/社区
      { code: '330727001001', name: '安文社区', parentCode: '330727001', fullPath: '浙江省 > 金华市 > 磐安县 > 安文街道 > 安文社区' },
      { code: '330727001002', name: '春月村', parentCode: '330727001', fullPath: '浙江省 > 金华市 > 磐安县 > 安文街道 > 春月村' },
      { code: '330727001003', name: '秋月村', parentCode: '330727001', fullPath: '浙江省 > 金华市 > 磐安县 > 安文街道 > 秋月村' },
      { code: '330727001004', name: '夏月村', parentCode: '330727001', fullPath: '浙江省 > 金华市 > 磐安县 > 安文街道 > 夏月村' },
      { code: '330727001005', name: '冬月村', parentCode: '330727001', fullPath: '浙江省 > 金华市 > 磐安县 > 安文街道 > 冬月村' },
      
      // 其他街道的村/社区示例
      { code: '330727101001', name: '玉山社区', parentCode: '330727101', fullPath: '浙江省 > 金华市 > 磐安县 > 玉山街道 > 玉山社区' },
      { code: '330727101002', name: '玉山村', parentCode: '330727101', fullPath: '浙江省 > 金华市 > 磐安县 > 玉山街道 > 玉山村' },
      { code: '330727102001', name: '尖山村', parentCode: '330727102', fullPath: '浙江省 > 金华市 > 磐安县 > 尖山镇 > 尖山村' },
      { code: '330727102002', name: '尖山社区', parentCode: '330727102', fullPath: '浙江省 > 金华市 > 磐安县 > 尖山镇 > 尖山社区' },
      
      // 尚湖镇村/社区
      { code: '330727010001', name: '尚湖村', parentCode: '330727010', fullPath: '浙江省 > 金华市 > 磐安县 > 尚湖镇 > 尚湖村' },
      { code: '330727010002', name: '湖上村', parentCode: '330727010', fullPath: '浙江省 > 金华市 > 磐安县 > 尚湖镇 > 湖上村' },
      { code: '330727010003', name: '湖下村', parentCode: '330727010', fullPath: '浙江省 > 金华市 > 磐安县 > 尚湖镇 > 湖下村' },
      { code: '330727010004', name: '下溪滩村', parentCode: '330727010', fullPath: '浙江省 > 金华市 > 磐安县 > 尚湖镇 > 下溪滩村' },
      { code: '330727010005', name: '上溪滩村', parentCode: '330727010', fullPath: '浙江省 > 金华市 > 磐安县 > 尚湖镇 > 上溪滩村' },
      { code: '330727010006', name: '忠信庄村', parentCode: '330727010', fullPath: '浙江省 > 金华市 > 磐安县 > 尚湖镇 > 忠信庄村' },
      { code: '330727010007', name: '大王村', parentCode: '330727010', fullPath: '浙江省 > 金华市 > 磐安县 > 尚湖镇 > 大王村' },
      { code: '330727010008', name: '陈雷村', parentCode: '330727010', fullPath: '浙江省 > 金华市 > 磐安县 > 尚湖镇 > 陈雷村' },
      { code: '330727010009', name: '倪雷村', parentCode: '330727010', fullPath: '浙江省 > 金华市 > 磐安县 > 尚湖镇 > 倪雷村' },
      { code: '330727010010', name: '山宅村', parentCode: '330727010', fullPath: '浙江省 > 金华市 > 磐安县 > 尚湖镇 > 山宅村' },
      
      // 宁波市区县
      { code: '330203', name: '海曙区', parentCode: '3302', fullPath: '浙江省 > 宁波市 > 海曙区' },
      { code: '330205', name: '江北区', parentCode: '3302', fullPath: '浙江省 > 宁波市 > 江北区' },
      { code: '330206', name: '北仑区', parentCode: '3302', fullPath: '浙江省 > 宁波市 > 北仑区' },
      { code: '330211', name: '镇海区', parentCode: '3302', fullPath: '浙江省 > 宁波市 > 镇海区' },
      { code: '330212', name: '鄞州区', parentCode: '3302', fullPath: '浙江省 > 宁波市 > 鄞州区' },
      { code: '330213', name: '奉化区', parentCode: '3302', fullPath: '浙江省 > 宁波市 > 奉化区' },
      { code: '330225', name: '象山县', parentCode: '3302', fullPath: '浙江省 > 宁波市 > 象山县' },
      { code: '330226', name: '宁海县', parentCode: '3302', fullPath: '浙江省 > 宁波市 > 宁海县' },
      { code: '330281', name: '余姚市', parentCode: '3302', fullPath: '浙江省 > 宁波市 > 余姚市' },
      { code: '330282', name: '慈溪市', parentCode: '3302', fullPath: '浙江省 > 宁波市 > 慈溪市' }
    ]
    
    // 支持多种搜索方式：名称、代码、拼音首字母
    const keyword = searchKeyword.value.toLowerCase()
    searchResults.value = mockData.filter(item => {
      const name = item.name.toLowerCase()
      const code = item.code.toLowerCase()
      
      // 名称包含关键字
      if (name.includes(keyword)) return true
      
      // 代码包含关键字
      if (code.includes(keyword)) return true
      
      // 简单的拼音首字母匹配（可以根据需要扩展）
      const pinyinMap = {
        'bj': '北京', 'tj': '天津', 'hb': '河北', 'zj': '浙江', 'gd': '广东',
        'hz': '杭州', 'nb': '宁波', 'wz': '温州', 'jx': '嘉兴', 'hu': '湖州',
        'sx': '绍兴', 'jh': '金华', 'qz': '衢州', 'zs': '舟山', 'tz': '台州', 'ls': '丽水',
        'sc': '上城', 'gs': '拱墅', 'xh': '西湖', 'bj': '滨江', 'xs': '萧山',
        'yh': '余杭', 'fy': '富阳', 'la': '临安', 'tl': '桐庐', 'ca': '淳安', 'jd': '建德',
        'wc': '婺城', 'jd': '金东', 'wy': '武义', 'pj': '浦江', 'pa': '磐安',
        'lx': '兰溪', 'yw': '义乌', 'dy': '东阳', 'yk': '永康'
      }
      
      if (pinyinMap[keyword] && name.includes(pinyinMap[keyword])) {
        return true
      }
      
      return false
    }).filter(item => {
      // 只显示一级匹配结果，避免多级相同显示
      const searchKeywordOriginal = searchKeyword.value;
      const searchKeywordLower = searchKeywordOriginal.toLowerCase();
      
      // 精确匹配省份名称时，只显示省份级别（6位代码以0000结尾）
      if (['浙江省', '河北省', '广东省', '北京市', '天津市', '上海市', '重庆市'].includes(searchKeywordOriginal)) {
        return item.code.endsWith('0000') && item.code.length === 6;
      }
      // 精确匹配直辖市市辖区时，只显示市级级别（6位代码以00结尾但不以0000结尾）
      else if (['北京市市辖区', '天津市市辖区', '上海市市辖区', '重庆市市辖区'].includes(searchKeywordOriginal)) {
        return item.code.endsWith('00') && item.code.length === 6 && !item.code.endsWith('0000');
      }
      // 模糊匹配包含"省"的关键字时，只显示省份级别
      else if (searchKeywordLower.includes('省')) {
        return item.code.endsWith('0000') && item.code.length === 6;
      }
      // 模糊匹配包含"市"的关键字时，只显示市级级别（6位代码以00结尾但不以0000结尾）
      else if (searchKeywordLower.includes('市')) {
        return item.code.endsWith('00') && item.code.length === 6 && !item.code.endsWith('0000');
      }
      // 模糊匹配包含"县"或"区"的关键字时，只显示区县级别（6位代码不以00结尾）
      else if (searchKeywordLower.includes('县') || searchKeywordLower.includes('区')) {
        return item.code.length === 6 && !item.code.endsWith('00');
      }
      // 默认显示所有匹配结果
      return true;
    }).slice(0, 20) // 限制搜索结果数量
  }
}

// 选择搜索结果 - 智能级联选择
async function selectSearchResult(item) {
  const code = item.code
  const codeLength = code.length
  try {
    // 清空搜索结果和关键字
    searchResults.value = []
    searchKeyword.value = ''
    
    if (codeLength === 6) {
      // 6位代码处理
      if (code.endsWith('0000')) {
        // 省级 - 直接选择省份
        const province = { code: item.code, name: item.name }
        await selectProvince(province)
      } else if (code.endsWith('00')) {
        // 市级 - 先选择省份，再选择市
        await selectCascadeByCode(code, 'city')
      } else {
        // 区县级 - 逐级选择到区县
        await selectCascadeByCode(code, 'district')
      }
    } else if (codeLength === 9) {
      // 9位街道级代码处理
      await selectCascadeByCode(code, 'street')
    } else if (codeLength === 12) {
      // 12位村/社区级代码处理
      await selectCascadeByCode(code, 'village')
    }
  } catch (error) {
    console.error('选择搜索结果失败:', error)
  }
}

// 根据代码智能级联选择到指定级别
async function selectCascadeByCode(code, targetLevel) {
  const codeLength = code.length
  
  // 根据代码后缀判断级别并确定需要展示的级别
  // 如果后四位是0，代表是省级，只需要查询这个省下的市，只需要展示下面一级即可
  // 如果只有后两位是0，代表市级，只需要展示省级、市级及这个市下面的县即可
  if (code.endsWith('0000')) {
    // 省级代码处理：只加载该省下的市级数据
    const provinceCode = code;
    const provinceName = await getProvinceNameByCode(provinceCode);
    const province = { code: provinceCode, name: provinceName };
    await selectProvince(province);
    return;
  } else if (code.endsWith('00') && !code.endsWith('0000')) {
    // 市级代码处理：展示省级、市级及该市下面的县
    const cityCode = code;
    const provinceCode = code.substring(0, 2) + '0000';
    const provinceName = await getProvinceNameByCode(provinceCode);
    const cityName = await getCityNameByCode(cityCode);
    
    // 选择省份
    const province = { code: provinceCode, name: provinceName };
    await selectProvince(province);
    
    // 选择城市
    await new Promise(resolve => {
      selectCity({ code: cityCode, name: cityName }).then(() => {
        // 等待下一级数据加载完成
        const checkDistrictLoaded = setInterval(() => {
          if (districtList.value.length > 0) {
            clearInterval(checkDistrictLoaded);
            resolve();
          }
        }, 50); // 每50ms检查一次，比固定延迟更高效
      });
    });
    return;
  }
  
  // 原有逻辑处理区县级、街道级、村/社区级
  let provinceCode, cityCode, districtCode, streetCode
  
  // 按照用户要求优化代码解析逻辑：
  // 6位代码：前2位代表省份，中间2位代表市，最后2位代表县
  // 12位代码：前6位与6位代码处理方式相同，中间3位代表镇，最后3位代表村/社区
  if (codeLength === 6) {
    // 6位区县级代码处理
    provinceCode = code.substring(0, 2) + '0000' // 前2位 + "0000"
    cityCode = code.substring(0, 4) + '00'       // 前4位 + "00"
    districtCode = code                         // 完整6位
  } else if (codeLength === 9) {
    // 9位街道级代码处理
    provinceCode = code.substring(0, 2) + '0000' // 前2位 + "0000"
    cityCode = code.substring(0, 4) + '00'       // 前4位 + "00"
    districtCode = code.substring(0, 6)          // 前6位
    streetCode = code                           // 完整9位
  } else if (codeLength === 12) {
    // 12位村/社区级代码处理
    provinceCode = code.substring(0, 2) + '0000'  // 前2位 + "0000"
    cityCode = code.substring(0, 4) + '00'        // 前4位 + "00"
    districtCode = code.substring(0, 6)           // 前6位
    streetCode = code.substring(0, 9)             // 前9位
    // 最后3位为村/社区代码，包含在完整code中
  }
  
  // 使用异步方式获取省和市的名称
  const provinceName = await getProvinceNameByCode(provinceCode)
  const cityName = cityCode ? await getCityNameByCode(cityCode) : ''
  const districtName = districtCode ? await getDistrictNameByCode(districtCode) : ''
  const streetName = streetCode ? await getStreetNameByCode(streetCode) : ''
  
  // 步骤1：选择省份
  const province = { code: provinceCode, name: provinceName }
  await selectProvince(province)
  
  if (targetLevel === 'province') return
  
  // 步骤2：选择市级（等待省级数据加载完成）
  if (cityCode) {
    await new Promise(resolve => {
      selectCity({ code: cityCode, name: cityName }).then(() => {
        // 等待下一级数据加载完成
        const checkDistrictLoaded = setInterval(() => {
          if (districtList.value.length > 0) {
            clearInterval(checkDistrictLoaded)
            resolve()
          }
        }, 50) // 每50ms检查一次，比固定延迟更高效
      })
    })
  }
  
  if (targetLevel === 'city') return
  
  // 步骤3：选择区县（等待市级数据加载完成）
  if (districtCode) {
    await new Promise(resolve => {
      selectDistrict({ code: districtCode, name: districtName }).then(() => {
        // 等待下一级数据加载完成
        const checkStreetLoaded = setInterval(() => {
          if (streetList.value.length > 0) {
            clearInterval(checkStreetLoaded)
            resolve()
          }
        }, 50) // 每50ms检查一次，比固定延迟更高效
      })
    })
  }
  
  if (targetLevel === 'district') return
  
  // 步骤4：选择街道（等待区县数据加载完成）
  if (streetCode) {
    await new Promise(resolve => {
      selectStreet({ code: streetCode, name: streetName }).then(() => {
        // 等待下一级数据加载完成
        const checkVillageLoaded = setInterval(() => {
          if (villageList.value.length > 0) {
            clearInterval(checkVillageLoaded)
            resolve()
          }
        }, 50) // 每50ms检查一次，比固定延迟更高效
      })
    })
  }
  
  if (targetLevel === 'street') return
  
  // 步骤5：选择村/社区（等待街道数据加载完成）
  if (codeLength === 12) {
    await new Promise(resolve => {
      getVillageNameFromSearchResults(code).then(villageName => {
        selectVillage({ code: code, name: villageName })
        resolve()
      })
    })
  }
}

// 从搜索结果或API中获取村/社区名称
async function getVillageNameFromSearchResults(code) {
  try {
    // 优先调用API获取村/社区信息
    const response = await getDivisionByCode(code)
    if (response && response.data) {
      return response.data.name
    }
  } catch (error) {
    console.warn('获取村/社区名称失败，尝试其他方式:', error)
  }
  
  // 如果映射中没有找到，尝试从最近的搜索结果中获取
  if (searchResults.value.length > 0) {
    const found = searchResults.value.find(item => item.code === code)
    if (found) {
      return found.name
    }
  }
  
  // 本地映射备份（仅作为最后的备选）
  const villageMap = {
    // 新渥街道村/社区
    '330727100001': '新渥社区',
    '330727100002': '东山村',
    '330727100003': '西山村',
    '330727100004': '南山村',
    '330727100005': '北山村',
    '330727100006': '中山村',
    
    // 安文街道村/社区
    '330727001001': '安文社区',
    '330727001002': '春月村',
    '330727001003': '秋月村',
    '330727001004': '夏月村',
    '330727001005': '冬月村',
    
    // 玉山街道村/社区
    '330727101001': '玉山社区',
    '330727101002': '玉山村',
    
    // 尖山镇村/社区
    '330727102001': '尖山村',
    '330727102002': '尖山社区',
    
    // 尚湖镇村/社区（重点补充）
    '330727010001': '尚湖村',
    '330727010002': '湖上村',
    '330727010003': '湖下村',
    '330727010004': '下溪滩村',
    '330727010005': '上溪滩村',
    '330727010006': '忠信庄村',
    '330727010007': '大王村',
    '330727010008': '陈雷村',
    '330727010009': '倪雷村',
    '330727010010': '山宅村'
  }
  
  return villageMap[code] || code // 如果找不到就返回代码本身
}

// 确认选择
function handleConfirm() {
  if (selectedDivision.value.code) {
    emit('confirm', {
      code: selectedDivision.value.code,
      fullPath: selectedDivision.value.fullPath,
      detailAddress: detailAddress.value
    })
    handleClose()
  }
}

// 关闭对话框
function handleClose() {
  dialogVisible.value = false
  
  // 清理防抖定时器
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
    searchTimer.value = null
  }
  
  // 重置数据
  searchKeyword.value = ''
  detailAddress.value = ''
  searchResults.value = []
  selectedProvince.value = null
  selectedCity.value = null
  selectedDistrict.value = null
  selectedStreet.value = null
  selectedVillage.value = null
  breadcrumbs.value = []
  cityList.value = []
  districtList.value = []
  streetList.value = []
  villageList.value = []
}

// 选择常用地址
async function selectFavoriteAddress(address) {
  try {
    // 清空搜索结果和关键字
    searchResults.value = []
    searchKeyword.value = ''
    
    if (address.code === '330727') {
      // 特殊处理磐安县（区县级）
      // 先选择浙江省
      const province = { code: '330000', name: '浙江省' }
      await selectProvince(province)
      
      // 再选择金华市
      await new Promise(resolve => {
        selectCity({ code: '330700', name: '金华市' }).then(() => {
          // 等待下一级数据加载完成
          const checkDistrictLoaded = setInterval(() => {
            if (districtList.value.length > 0) {
              clearInterval(checkDistrictLoaded)
              resolve()
            }
          }, 50)
        })
      })
      
      // 最后选择磐安县
      await selectDistrict({ code: '330727', name: '磐安县' })
    } else if (address.code.length === 6 && address.code.endsWith('0000')) {
      // 省级地址（6位代码，以0000结尾）
      // 只加载该省下的市级数据，展示下面一级即可
      const province = { code: address.code, name: address.name }
      await selectProvince(province)
    } else if (address.code.length === 6 && address.code.endsWith('00')) {
      // 市级地址（6位代码，以00结尾但不以0000结尾）
      // 展示省级、市级及该市下面的县
      const cityCode = address.code;
      const provinceCode = address.code.substring(0, 2) + '0000';
      const provinceName = await getProvinceNameByCode(provinceCode);
      const cityName = await getCityNameByCode(cityCode);
      
      // 选择省份
      const province = { code: provinceCode, name: provinceName };
      await selectProvince(province);
      
      // 选择城市
      await new Promise(resolve => {
        selectCity({ code: cityCode, name: cityName }).then(() => {
          // 等待下一级数据加载完成
          const checkDistrictLoaded = setInterval(() => {
            if (districtList.value.length > 0 || cityList.value.length > 0) {
              clearInterval(checkDistrictLoaded)
              resolve()
            }
          }, 50)
        })
      })
    } else if (address.code.length === 6 && !address.code.endsWith('00')) {
      // 区县级地址（6位代码，不以00结尾）
      // 需要先获取上级市和省的信息
      const provinceCode = address.code.substring(0, 2) + '0000'
      const cityCode = address.code.substring(0, 4) + '00'
      
      // 获取省和市的名称
      const provinceName = await getProvinceNameByCode(provinceCode)
      const cityName = await getCityNameByCode(cityCode)
      
      // 选择省份
      const province = { code: provinceCode, name: provinceName }
      await selectProvince(province)
      
      // 选择城市
      await new Promise(resolve => {
        selectCity({ code: cityCode, name: cityName }).then(() => {
          // 等待下一级数据加载完成
          const checkDistrictLoaded = setInterval(() => {
            if (districtList.value.length > 0) {
              clearInterval(checkDistrictLoaded)
              resolve()
            }
          }, 50)
        })
      })
      
      // 选择区县
      await selectDistrict({ code: address.code, name: address.name })
    } else if (address.code.length === 2) {
      // 省级地址（2位代码）
      const province = { code: address.code + '0000', name: address.name }
      await selectProvince(province)
    }
  } catch (error) {
    console.error('选择常用地址失败:', error)
  }
}

// 设置选中的区划（用于回显）- 优化版本
async function setSelectedDivision(division) {
  try {
    if (!division || !division.code) {
      return
    }
    
    const code = division.code
    const codeLength = code.length
    
    // 重置所有选择
    selectedProvince.value = null
    selectedCity.value = null
    selectedDistrict.value = null
    selectedStreet.value = null
    selectedVillage.value = null
    
    // 清空所有列表
    cityList.value = []
    districtList.value = []
    streetList.value = []
    villageList.value = []
    
    // 设置详细地址
    detailAddress.value = division.detailAddress || ''
    
    // 确保省份数据已加载
    if (!provinceList.value.length) {
      await loadProvinces()
    }
    
    if (codeLength >= 6) {
      // 所有6位及以上的代码都需要逐级回显
      
      // 1. 省级：前2位 + "0000"
      const provinceCode = code.substring(0, 2) + '0000'
      const province = provinceList.value.find(p => p.code === provinceCode)
      if (province) {
        // 使用Promise包装selectProvince以确保数据加载完成
        await new Promise((resolve) => {
          selectProvince(province).then(() => {
            // 等待下一级数据加载完成
            const checkCityLoaded = setInterval(() => {
              if (cityList.value.length > 0) {
                clearInterval(checkCityLoaded)
                resolve()
              }
            }, 50)
          })
        });
        
        if (codeLength >= 6 && !code.endsWith('0000')) {
          // 2. 市级：前4位 + "00"
          const cityCode = code.substring(0, 4) + '00'
          const city = cityList.value.find(c => c.code === cityCode)
          if (city) {
            // 使用Promise包装selectCity以确保数据加载完成
            await new Promise((resolve) => {
              selectCity(city).then(() => {
                // 等待下一级数据加载完成
                const checkDistrictLoaded = setInterval(() => {
                  if (districtList.value.length > 0) {
                    clearInterval(checkDistrictLoaded)
                    resolve()
                  }
                }, 50)
              })
            });
            
            if (codeLength >= 6 && !code.endsWith('00')) {
              // 3. 区县级：前6位
              const districtCode = code.substring(0, 6)
              const district = districtList.value.find(d => d.code === districtCode)
              if (district) {
                // 使用Promise包装selectDistrict以确保数据加载完成
                await new Promise((resolve) => {
                  selectDistrict(district).then(() => {
                    // 等待下一级数据加载完成
                    const checkStreetLoaded = setInterval(() => {
                      if (streetList.value.length > 0) {
                        clearInterval(checkStreetLoaded)
                        resolve()
                      }
                    }, 50)
                  })
                });
                
                if (codeLength >= 9) {
                  // 4. 街道级：前9位
                  const streetCode = code.substring(0, 9)
                  const street = streetList.value.find(s => s.code === streetCode)
                  if (street) {
                    // 使用Promise包装selectStreet以确保数据加载完成
                    await new Promise((resolve) => {
                      selectStreet(street).then(() => {
                        // 等待下一级数据加载完成
                        const checkVillageLoaded = setInterval(() => {
                          if (villageList.value.length > 0) {
                            clearInterval(checkVillageLoaded)
                            resolve()
                          }
                        }, 50)
                      })
                    });
                    
                    if (codeLength === 12) {
                      // 5. 村/社区级：完整12位
                      const village = villageList.value.find(v => v.code === code)
                      if (village) {
                        selectVillage(village)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else if (codeLength === 4) {
      // 4位市级代码
      const provinceCode = code.substring(0, 2) + '0000'
      const province = provinceList.value.find(p => p.code === provinceCode)
      if (province) {
        // 使用Promise包装selectProvince以确保数据加载完成
        await new Promise((resolve) => {
          selectProvince(province).then(() => {
            // 等待下一级数据加载完成
            const checkCityLoaded = setInterval(() => {
              if (cityList.value.length > 0) {
                clearInterval(checkCityLoaded)
                resolve()
              }
            }, 50)
          })
        });
        
        // 市级：4位代码 + "00"
        const cityCode = code + '00'
        const city = cityList.value.find(c => c.code === cityCode)
        if (city) {
          selectCity(city)
        }
      }
    }
  } catch (error) {
    console.error('设置选中区划失败:', error)
  }
}

// Chrome 87兼容性修复函数 - 简化版本，只修复布局不影响事件
function applyChromeCompatibilityFix() {
  setTimeout(() => {
    try {
      // 检测Chrome版本
      const isChrome87OrBelow = (() => {
        const userAgent = navigator.userAgent
        const chromeMatch = userAgent.match(/Chrome\/(\d+)/)
        if (chromeMatch) {
          const chromeVersion = parseInt(chromeMatch[1])
          return chromeVersion <= 87
        }
        return true // 默认应用修复
      })()
      
      console.log('Chrome版本检测:', navigator.userAgent, '应用修复:', isChrome87OrBelow)
      
      if (isChrome87OrBelow) {
        console.log('应用Chrome 87兼容性修复...')
        
        // 查找对话框元素
        const dialog = document.querySelector('.division-selector-unique-class')
        if (!dialog) return
        
        // 修复对话框标题和内容间距问题
        const header = dialog.querySelector('.el-dialog__header')
        const body = dialog.querySelector('.el-dialog__body')
        const selector = dialog.querySelector('.division-selector')
        
        if (header) {
          header.style.setProperty('padding', '10px 20px 0px', 'important')
          header.style.setProperty('margin-bottom', '0', 'important')
        }
        
        if (body) {
          body.style.setProperty('padding', '0px 20px', 'important')
          body.style.setProperty('margin-top', '-5px', 'important')
        }
        
        if (selector) {
          selector.style.setProperty('margin-top', '10px', 'important')
          selector.style.setProperty('padding-top', '0px', 'important')
        }
        
        // 修复面包屑和代码显示的布局问题
        const breadcrumbContainer = dialog.querySelector('.breadcrumb-container')
        if (breadcrumbContainer) {
          breadcrumbContainer.style.setProperty('display', 'flex', 'important')
          breadcrumbContainer.style.setProperty('justify-content', 'space-between', 'important')
          breadcrumbContainer.style.setProperty('align-items', 'center', 'important')
          breadcrumbContainer.style.setProperty('flex-wrap', 'nowrap', 'important')
        }
        
        // 修复搜索框和搜索按钮的布局问题
        const searchSection = dialog.querySelector('.search-section')
        if (searchSection) {
          searchSection.style.setProperty('display', 'flex', 'important')
          searchSection.style.setProperty('gap', '10px', 'important')
          searchSection.style.setProperty('align-items', 'center', 'important')
          searchSection.style.setProperty('flex-wrap', 'nowrap', 'important')
          
          // 确保搜索输入框占据剩余空间
          const searchInput = searchSection.querySelector('.search-input')
          if (searchInput) {
            searchInput.style.setProperty('flex', '1', 'important')
            searchInput.style.setProperty('min-width', '200px', 'important')
          }
        }
        
        // 查找级联容器
        const container = dialog.querySelector('.cascade-section .level-container')
        if (!container) return
        
        // 强制应用表格布局
        container.style.setProperty('display', 'table', 'important')
        container.style.setProperty('table-layout', 'fixed', 'important')
        container.style.setProperty('width', '100%', 'important')
        container.style.setProperty('border', '1px solid #e4e7ed', 'important')
        container.style.setProperty('border-radius', '6px', 'important')
        container.style.setProperty('min-height', '300px', 'important')
        container.style.setProperty('background', 'white', 'important')
        container.style.setProperty('overflow', 'hidden', 'important')
        container.style.setProperty('box-sizing', 'border-box', 'important')
        
        // 查找所有面板并应用表格单元格布局
        const panels = container.querySelectorAll('.level-panel')
        console.log('找到面板数量:', panels.length)
        
        panels.forEach((panel, index) => {
          const panelWidth = 100 / panels.length
          panel.style.setProperty('display', 'table-cell', 'important')
          panel.style.setProperty('vertical-align', 'top', 'important')
          panel.style.setProperty('width', `${panelWidth}%`, 'important')
          panel.style.setProperty('border-right', index < panels.length - 1 ? '1px solid #e4e7ed' : 'none', 'important')
          panel.style.setProperty('box-sizing', 'border-box', 'important')
          
          // 修复标题样式
          const header = panel.querySelector('.level-header')
          if (header) {
            const hasData = panel.querySelector('.division-item')
            header.style.setProperty('background', hasData ? '#409eff' : '#f5f7fa', 'important')
            header.style.setProperty('color', hasData ? 'white' : '#606266', 'important')
            header.style.setProperty('text-align', 'center', 'important')
            panel.style.setProperty('background', hasData ? '#fafbfc' : 'white', 'important')
          }
        })
        
        console.log('Chrome 87兼容性修复已完成，包括标题间距修复')
      }
    } catch (error) {
      console.error('应用Chrome兼容性修复时出错:', error)
    }
  }, 200) // 延迟200ms确保DOM和Vue事件都绑定完成
}

// 强制更新选中状态样式的函数 - 简化版本，不干扰Vue事件
function forceUpdateSelectedStyles() {
  setTimeout(() => {
    try {
      const dialog = document.querySelector('.division-selector-unique-class')
      if (!dialog) return
      
      // 首先清除所有选中状态的样式，但不影响其他属性
      const allItems = dialog.querySelectorAll('.division-item')
      allItems.forEach(item => {
        // 只重置选中相关的样式
        item.style.setProperty('background', 'white', 'important')
        item.style.setProperty('color', '#606266', 'important')
        item.style.setProperty('font-weight', 'normal', 'important')
        item.style.setProperty('border-left', 'none', 'important')
      })
      
      // 然后只为真正有active类的选项设置选中样式
      const activeItems = dialog.querySelectorAll('.division-item.active')
      console.log('当前选中的项目数量:', activeItems.length)
      activeItems.forEach(item => {
        // 强制设置选中样式
        item.style.setProperty('background', '#409eff', 'important')
        item.style.setProperty('color', 'white', 'important')
        item.style.setProperty('font-weight', '500', 'important')
        item.style.setProperty('border-left', '3px solid #1890ff', 'important')
        
        console.log('应用选中样式到:', item.textContent, '所属面板:', item.closest('.level-panel')?.querySelector('.level-header')?.textContent)
      })
      
    } catch (error) {
      console.error('强制更新选中状态样式时出错:', error)
    }
  }, 100) // 延迟时间适当增加，确保Vue处理完成
}

// 监听数据变化，重新应用修复
watch([provinceList, cityList, districtList, streetList, villageList], () => {
  if (dialogVisible.value) {
    applyChromeCompatibilityFix()
    forceUpdateSelectedStyles()
  }
}, { deep: true })

// 监听选中状态变化
watch([selectedProvince, selectedCity, selectedDistrict, selectedStreet, selectedVillage], () => {
  if (dialogVisible.value) {
    forceUpdateSelectedStyles()
  }
}, { deep: true })

// 暴露方法供父组件调用
defineExpose({
  setSelectedDivision
})
</script>

<style scoped>
.division-dialog {
  .el-dialog__body {
    padding: 5px 20px;
  }
}

/* 添加全局样式重置 */
.division-selector {
  /* 确保容器有明确的字体设置 */
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  margin-top: -10px; /* 减少与对话框标题的间距 */
  
  /* 添加全局重置 */
  * {
    box-sizing: border-box;
  }
  
  .quick-select-section {
    margin-bottom: 5px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e4e7ed;
    
    .quick-select-header {
      font-weight: 500;
      margin-bottom: 12px;
      color: #606266;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .quick-select-buttons {
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      -webkit-flex-wrap: wrap;
      -ms-flex-wrap: wrap;
      flex-wrap: wrap;
      gap: 8px;
      -webkit-box-align: start;
      -webkit-align-items: flex-start;
      -ms-flex-align: start;
      align-items: flex-start;
      
      .quick-select-button {
        margin-bottom: 0;
        margin-right: 0;
        border-radius: 6px !important;
        padding: 8px 14px !important;
        font-size: 13px !important;
        line-height: 1.4 !important;
        background: #f8f9fa !important;
        border: 1px solid #e4e7ed !important;
        color: #606266 !important;
        transition: all 0.3s ease !important;
        -webkit-transition: all 0.3s ease !important;
        -moz-transition: all 0.3s ease !important;
        -ms-transition: all 0.3s ease !important;
        -o-transition: all 0.3s ease !important;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        -webkit-box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        -moz-box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        -ms-box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        -o-box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        
        &:hover {
          background: #409eff !important;
          color: white !important;
          border-color: #409eff !important;
          transform: translateY(-1px) !important;
          -webkit-transform: translateY(-1px) !important;
          -moz-transform: translateY(-1px) !important;
          -ms-transform: translateY(-1px) !important;
          -o-transform: translateY(-1px) !important;
          box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3) !important;
          -webkit-box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3) !important;
          -moz-box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3) !important;
          -ms-box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3) !important;
          -o-box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3) !important;
        }
        
        &:active {
          transform: translateY(0) !important;
          -webkit-transform: translateY(0) !important;
          -moz-transform: translateY(0) !important;
          -ms-transform: translateY(0) !important;
          -o-transform: translateY(0) !important;
        }
      }
    }
  }
  
  .search-section {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    
    .search-input {
      flex: 1;
    }
  }
  
  .breadcrumb-section {
    margin-bottom: 15px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
  }
  
  .breadcrumb-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .selected-code-display {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
    white-space: nowrap;
  }
  
  .breadcrumb-item {
    cursor: pointer;
    
    &:hover {
      color: #409eff;
    }
  }
  
  .cascade-section {
    .level-container {
      display: flex;
      gap: 1px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      overflow: hidden;
      min-height: 300px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      
      /* 确保容器有明确的背景色 */
      background: white;
      
      /* 确保在小屏幕下也能正常显示 */
      @media (max-width: 768px) {
        flex-direction: column;
        min-height: auto;
      }
      
      .level-panel {
        flex: 1;
        border-right: 1px solid #e4e7ed;
        min-width: 0; /* 防止flex项目溢出 */
        
        /* 确保面板有明确的背景色 */
        background: white;
        
        &:last-child {
          border-right: none;
        }
        
        /* 在小屏幕下调整样式 */
        @media (max-width: 768px) {
          border-right: none;
          border-bottom: 1px solid #e4e7ed;
          
          &:last-child {
            border-bottom: none;
          }
        }
        
        .level-header {
          background: #f5f7fa;
          padding: 8px 12px;
          font-weight: 500;
          border-bottom: 1px solid #e4e7ed;
          font-size: 14px;
          color: #606266;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          
          /* 确保标题有明确的样式 */
          margin: 0 !important;
        }
        
        .level-content {
          max-height: 270px;
          overflow-y: auto;
          
          /* 添加滚动条样式 */
          &::-webkit-scrollbar {
            width: 6px;
          }
          
          &::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          &::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }
          
          &::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
          
          /* 添加更明确的样式重置 */
          .division-item {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            
            /* 确保样式优先级 */
            background: transparent !important;
            color: #606266 !important;
            transition: all 0.3s ease !important;
            display: block !important;
            width: 100% !important;
            box-sizing: border-box !important;
            
            &:hover {
              background: #f5f7fa !important;
              color: #606266 !important;
            }
            
            &.active {
              background: #409eff !important;
              color: white !important;
              
              &:hover {
                background: #409eff !important;
                color: white !important;
              }
            }
            
            /* 添加默认状态样式 */
            &:not(.active) {
              background: white !important;
              color: #606266 !important;
            }
            
            /* 确保文本对齐 */
            text-align: left !important;
          }
        }
      }
    }
  }
  
  .search-results {
    margin-bottom: 15px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    max-height: 300px;
    
    .search-header {
      background: #f5f7fa;
      padding: 8px 12px;
      font-weight: 500;
      border-bottom: 1px solid #e4e7ed;
      font-size: 14px;
      color: #606266;
    }
    
    .search-list {
      max-height: 250px;
      overflow-y: auto;
      
      .search-item {
        padding: 12px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        transition: all 0.2s;
        
        &:hover {
          background: #f5f7fa;
        }
        
        .search-item-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          
          .search-item-name {
            font-size: 15px;
            font-weight: 500;
            color: #303133;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .search-item-code {
            font-size: 12px;
            color: #909399;
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
            flex-shrink: 0;
            margin-left: 10px;
          }
        }
        
        .search-item-path {
          font-size: 13px;
          color: #666;
          line-height: 1.4;
          
          .path-item {
            display: inline;
            
            .path-text {
              color: #666;
            }
            
            .path-separator {
              color: #ccc;
              margin: 0 3px;
            }
            
            &:last-child .path-text {
              color: #409eff;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
  
  .selected-section {
    margin-top: 15px;
    padding: 12px;
    background: #f0f9ff;
    border: 1px solid #b3d8ff;
    border-radius: 4px;
    
    .selected-header {
      font-weight: 500;
      margin-bottom: 8px;
      color: #409eff;
    }
    
    .selected-content {
      .selected-path {
        font-size: 14px;
        color: #303133;
        margin-bottom: 4px;
        word-break: break-all;
      }
      
      .selected-code {
        font-size: 12px;
        color: #909399;
      }
    }
  }
  
  .detail-address-section {
    margin-top: 15px;
    
    .detail-header {
      margin-bottom: 8px;
      font-weight: 500;
      color: #606266;
    }
  }
}

/* 添加全局样式以确保组件在不同环境下的一致性 */
:deep(.division-selector-unique-class) {
  .el-dialog__header {
    padding: 15px 20px 5px !important;
    margin-bottom: 0 !important;
  }
  .el-dialog__body {
    padding: 0px 20px !important;
  }
  
  /* 确保对话框在各种环境下的一致性 */
  .el-dialog {
    max-width: 100% !important;
  }
  
  /* 确保按钮样式一致性 */
  .el-button {
    font-size: 14px !important;
  }
  
  /* 确保输入框样式一致性 */
  .el-input__inner {
    font-size: 14px !important;
  }
}

/* 为级联面板添加额外的特异性选择器 - 增强浏览器兼容性 */
:deep(.division-selector-unique-class) .division-selector .cascade-section {
  /* 容器样式 */
  .level-container {
    display: -webkit-box !important;
    display: -ms-flexbox !important;
    display: flex !important;
    -ms-flex-wrap: nowrap !important;
    flex-wrap: nowrap !important;
    -webkit-box-orient: horizontal !important;
    -webkit-box-direction: normal !important;
    -ms-flex-direction: row !important;
    flex-direction: row !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 1px solid #e4e7ed !important;
    border-radius: 4px !important;
    overflow: hidden !important;
    min-height: 300px !important;
    background: white !important;
    width: 100% !important;
    
    /* 面板样式 */
    .level-panel {
      -webkit-box-flex: 1 !important;
      -ms-flex: 1 1 0% !important;
      flex: 1 1 0% !important;
      border-right: 1px solid #e4e7ed !important;
      background: white !important;
      min-width: 0 !important; /* 防止flex项目溢出 */
      position: relative !important;
      width: 20% !important; /* 兼容不支持flex的浏览器 */
      float: left !important; /* 兼容不支持flex的浏览器 */
      
      &:last-child {
        border-right: none !important;
      }
      
      /* 面板标题 */
      .level-header {
        background: #f5f7fa !important;
        padding: 8px 12px !important;
        font-weight: 500 !important;
        border-bottom: 1px solid #e4e7ed !important;
        font-size: 14px !important;
        color: #606266 !important;
        margin: 0 !important;
        height: auto !important;
        line-height: 1.5 !important;
        position: relative !important;
        z-index: 1 !important;
      }
      
      /* 面板内容区 */
      .level-content {
        max-height: 270px !important;
        overflow-y: auto !important;
        position: relative !important;
        
        /* 列表项 */
        .division-item {
          padding: 8px 12px !important;
          cursor: pointer !important;
          border-bottom: 1px solid #f0f0f0 !important;
          font-size: 14px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          background: transparent !important;
          color: #606266 !important;
          -webkit-transition: all 0.3s ease !important;
          -moz-transition: all 0.3s ease !important;
          -o-transition: all 0.3s ease !important;
          transition: all 0.3s ease !important;
          display: block !important;
          width: 100% !important;
          -webkit-box-sizing: border-box !important;
          -moz-box-sizing: border-box !important;
          box-sizing: border-box !important;
          text-align: left !important;
          height: auto !important;
          line-height: normal !important;
          margin: 0 !important;
          position: relative !important;
          
          /* 悬停状态 */
          &:hover {
            background: #f5f7fa !important;
            color: #606266 !important;
          }
          
          /* 选中状态 */
          &.active {
            background: #409eff !important;
            color: white !important;
            
            &:hover {
              background: #409eff !important;
              color: white !important;
            }
          }
          
          /* 非选中状态 */
          &:not(.active) {
            background: white !important;
            color: #606266 !important;
          }
        }
      }
    }
  }
}

/* 添加传统浏览器兼容性支持 */
:deep(.division-selector-unique-class) .division-selector .cascade-section .level-container::after {
  content: "" !important;
  display: table !important;
  clear: both !important;
}

/* IE 兼容性修复 */
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  :deep(.division-selector-unique-class) .division-selector .cascade-section .level-container {
    display: table !important;
    width: 100% !important;
    
    .level-panel {
      display: table-cell !important;
      width: 20% !important;
    }
  }
}

/* 旧版Chrome兼容性修复 (针对Chrome 87及以下版本) */
@supports (-webkit-appearance: none) and (not (overflow:-webkit-marquee)) and (not (-ms-ime-align:auto)) and (not (-moz-appearance:none)) {
  /* 针对旧版Chrome的样式 */
  .chrome87-fix .division-selector .cascade-section {
    /* 使用表格布局作为备选方案 */
    .level-container {
      display: table !important;
      table-layout: fixed !important;
      width: 100% !important;
      
      .level-panel {
        display: table-cell !important;
        vertical-align: top !important;
        width: 20% !important;
        
        .level-content {
          overflow-x: hidden !important;
          
          .division-item {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box !important;
            border-bottom: 1px solid #f0f0f0 !important;
            padding: 8px 12px !important;
          }
        }
      }
    }
  }
}

/* Chrome 87专用强制样式 - 使用内联样式级别的优先级 */
.division-selector-unique-class .division-selector .cascade-section .level-container {
  display: -webkit-box !important;
  display: -webkit-flex !important;
  display: -ms-flexbox !important;
  display: flex !important;
  -webkit-box-orient: horizontal !important;
  -webkit-box-direction: normal !important;
  -webkit-flex-direction: row !important;
  -ms-flex-direction: row !important;
  flex-direction: row !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 4px !important;
  min-height: 300px !important;
  background: white !important;
  overflow: hidden !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel {
  -webkit-box-flex: 1 !important;
  -webkit-flex: 1 !important;
  -ms-flex: 1 !important;
  flex: 1 !important;
  border-right: 1px solid #e4e7ed !important;
  background: white !important;
  min-width: 0 !important;
  max-width: none !important;
  width: auto !important;
  display: block !important;
  position: relative !important;
  box-sizing: border-box !important;
}

.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel:last-child {
  border-right: none !important;
}

.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel .level-header {
  background: #f5f7fa !important;
  padding: 8px 12px !important;
  font-weight: 500 !important;
  border-bottom: 1px solid #e4e7ed !important;
  font-size: 14px !important;
  color: #606266 !important;
  margin: 0 !important;
  line-height: 1.5 !important;
  height: auto !important;
  display: block !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel .level-content {
  max-height: 270px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  position: relative !important;
  display: block !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel .level-content .division-item {
  padding: 10px 12px !important;
  cursor: pointer !important;
  border-bottom: 1px solid #f0f0f0 !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  background: white !important;
  color: #606266 !important;
  display: block !important;
  width: 100% !important;
  margin: 0 !important;
  min-height: 20px !important;
  text-align: left !important;
  box-sizing: border-box !important;
  -webkit-transition: background-color 0.2s ease !important;
  -moz-transition: background-color 0.2s ease !important;
  -o-transition: background-color 0.2s ease !important;
  transition: background-color 0.2s ease !important;
}

.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel .level-content .division-item:hover {
  background: #f5f7fa !important;
  color: #606266 !important;
}

.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel .level-content .division-item.active {
  background: #409eff !important;
  color: white !important;
}

.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel .level-content .division-item.active:hover {
  background: #409eff !important;
  color: white !important;
}

/* 针对Chrome 87的特殊兼容处理 */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .division-selector-unique-class .division-selector .cascade-section .level-container {
    display: table !important;
    table-layout: fixed !important;
    width: 100% !important;
  }
  
  .division-selector-unique-class .division-selector .cascade-section .level-container .level-panel {
    display: table-cell !important;
    vertical-align: top !important;
    width: 20% !important;
    -webkit-box-flex: none !important;
    -webkit-flex: none !important;
    -ms-flex: none !important;
    flex: none !important;
  }
}

/* 强制覆盖Element Plus的默认样式 */
.division-selector-unique-class .el-dialog__header {
  padding: 15px 20px 5px !important;
  margin-bottom: 0 !important;
}

.division-selector-unique-class .el-dialog__body {
  padding: 0px 20px !important;
}

.division-selector-unique-class * {
  box-sizing: border-box !important;
}

.division-selector-unique-class .division-selector {
  margin-top: -10px !important; /* 减少与对话框标题的间距 */
}

/* Chrome 87专用样式修复 - 针对标题和内容间距 */
@supports ((-webkit-appearance: none) and (not (container-type: inline-size))) {
  .division-selector-unique-class .el-dialog__header {
    padding: 10px 20px 0px !important;
  }
  
  .division-selector-unique-class .el-dialog__body {
    padding: 0px 20px !important;
    margin-top: -5px !important;
  }
  
  .division-selector-unique-class .division-selector {
    margin-top: -15px !important; /* Chrome 87需要更大的负边距 */
    padding-top: 0px !important;
  }
  
  /* 修复面包屑和代码显示的布局 */
  .division-selector-unique-class .breadcrumb-container {
    display: -webkit-box !important;
    display: -webkit-flex !important;
    display: flex !important;
    -webkit-box-pack: justify !important;
    -webkit-justify-content: space-between !important;
    justify-content: space-between !important;
    -webkit-box-align: center !important;
    -webkit-align-items: center !important;
    align-items: center !important;
    -webkit-flex-wrap: nowrap !important;
    flex-wrap: nowrap !important;
  }
  
  /* 修复搜索框和按钮的布局 */
  .division-selector-unique-class .search-section {
    display: -webkit-box !important;
    display: -webkit-flex !important;
    display: flex !important;
    -webkit-box-align: center !important;
    -webkit-align-items: center !important;
    align-items: center !important;
    gap: 10px !important;
    -webkit-flex-wrap: nowrap !important;
    flex-wrap: nowrap !important;
  }
  
  .division-selector-unique-class .search-section .search-input {
    -webkit-box-flex: 1 !important;
    -webkit-flex: 1 !important;
    flex: 1 !important;
    min-width: 200px !important;
  }
}

/* 添加更具体的Chrome 87检测和修复 */
@supports ((-webkit-appearance: none) and (not (container-type: inline-size))) {
  .division-selector-unique-class .division-selector .cascade-section .level-container {
    display: -webkit-box !important;
    -webkit-box-orient: horizontal !important;
    -webkit-box-pack: start !important;
    -webkit-box-align: stretch !important;
  }
  
  .division-selector-unique-class .division-selector .cascade-section .level-container .level-panel {
    -webkit-box-flex: 1 !important;
    min-width: 120px !important;
  }
}

/* Chrome 87强制样式修复 - 使用最高优先级 */
.division-selector-unique-class[style] .division-selector .cascade-section .level-container[style] {
  display: table !important;
  table-layout: fixed !important;
  width: 100% !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 6px !important;
  min-height: 300px !important;
  background: white !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
}

.division-selector-unique-class[style] .division-selector .cascade-section .level-container[style] .level-panel[style] {
  display: table-cell !important;
  vertical-align: top !important;
  width: 20% !important;
  border-right: 1px solid #e4e7ed !important;
  background: white !important;
  box-sizing: border-box !important;
  position: relative !important;
}

.division-selector-unique-class[style] .division-selector .cascade-section .level-container[style] .level-panel[style]:last-child {
  border-right: none !important;
}

/* 强制选中状态样式 */
.division-selector-unique-class[style] .division-selector .cascade-section .level-container[style] .level-panel[style] .level-content[style] .division-item[style].active,
.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel .level-content .division-item.active {
  background: #409eff !important;
  color: white !important;
  font-weight: 500 !important;
  border-left: 3px solid #1890ff !important;
}

.division-selector-unique-class[style] .division-selector .cascade-section .level-container[style] .level-panel[style] .level-content[style] .division-item[style]:not(.active),
.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel .level-content .division-item:not(.active) {
  background: white !important;
  color: #606266 !important;
  font-weight: normal !important;
  border-left: none !important;
}

.division-selector-unique-class[style] .division-selector .cascade-section .level-container[style] .level-panel[style] .level-content[style] .division-item[style]:not(.active):hover,
.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel .level-content .division-item:not(.active):hover {
  background: #f5f7fa !important;
  color: #409eff !important;
}

/* 有数据的面板标题高亮 */
.division-selector-unique-class[style] .division-selector .cascade-section .level-container[style] .level-panel[style]:has(.division-item) .level-header[style],
.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel:has(.division-item) .level-header {
  background: #409eff !important;
  color: white !important;
  text-align: center !important;
}

.division-selector-unique-class[style] .division-selector .cascade-section .level-container[style] .level-panel[style]:not(:has(.division-item)) .level-header[style],
.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel:not(:has(.division-item)) .level-header {
  background: #f5f7fa !important;
  color: #606266 !important;
  text-align: center !important;
}

/* 有数据的面板背景 */
.division-selector-unique-class[style] .division-selector .cascade-section .level-container[style] .level-panel[style]:has(.division-item),
.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel:has(.division-item) {
  background: #fafbfc !important;
}

.division-selector-unique-class[style] .division-selector .cascade-section .level-container[style] .level-panel[style]:not(:has(.division-item)),
.division-selector-unique-class .division-selector .cascade-section .level-container .level-panel:not(:has(.division-item)) {
  background: white !important;
}
</style>