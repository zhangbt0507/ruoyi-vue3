<template>
  <template v-if="visible">
    <el-form-item label="组织关系" prop="zzgx">
      <el-select v-model="form.zzgx" placeholder="请选择组织关系" style="width: 100%">
        <el-option v-for="item in ORG_RELATION_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="党员状态" prop="ryzt">
      <el-select v-model="form.ryzt" placeholder="请选择党员状态" style="width: 100%">
        <el-option v-for="item in MEMBER_WORK_STATUS_OPTIONS" :key="item.value" :label="item.label"
          :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="是否有处分" prop="sfycf">
      <el-select v-model="form.sfycf" placeholder="请选择是否有处分" style="width: 100%"
        @change="handleDisciplineChange">
        <el-option v-for="item in HAS_DISCIPLINE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="form.sfycf === '1'" label="处分说明" prop="cfsm">
      <el-input v-model="form.cfsm" type="textarea" :rows="3" placeholder="请填写处分说明" maxlength="500"
        show-word-limit />
    </el-form-item>
  </template>
</template>

<script setup>
/** 党建管理 - 党员档案扩展字段（组织关系、状态、处分） */
import {
  ORG_RELATION_OPTIONS,
  MEMBER_WORK_STATUS_OPTIONS,
  HAS_DISCIPLINE_OPTIONS
} from '@/api/szhl/partyBuilding/partyMember'

const props = defineProps({
  form: { type: Object, required: true },
  visible: { type: Boolean, default: true }
})

/** 无处分时清空处分说明 */
function handleDisciplineChange(value) {
  if (value !== '1') {
    props.form.cfsm = ''
  }
}
</script>
