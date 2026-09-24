<template>
    <el-select placeholder="请选择" clearable filterable @change="change">
                        <el-option
                           v-for="item in userList"
                           :key="item.userName"
                           :label="item.nickName + '('+ item.userName +')'"
                           :value="item.userName"
                        >
                        <span style="float: left">{{item.nickName}}({{item.userName}})</span>
                        <!-- <span style="float:right;">{{item.userName}}</span> -->
                        </el-option>
                     </el-select>
</template>
<script>
import {ref, getCurrentInstance} from 'vue'
import { userListByUserName } from "@/api/system/user";
const userList = ref([]);
export default {
    setup() {
        const { proxy } = getCurrentInstance();
        userListByUserName().then(res => {
            userList.value = res.data;
        });
        const change = (val) =>{
            const users = userList.value.filter(u=>u.userName === val);
            proxy.$emit('deptName',users[0]?.dept?.deptName);
            proxy.$emit('deptId',users[0]?.dept?.deptId);
        };
        return { userList,change }
    }
}
</script>