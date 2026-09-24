<template>
    <div>
        <el-table v-loading="loading" :data="data"  stripe height="700">
            <el-table-column label="网点" prop="assessOrg">
                <template #default="scope">
                    <dict-tag :options="sys_org_name" :value="scope.row.assessOrg" />
                </template>
            </el-table-column>
            <el-table-column label="柜员号" prop="managerId">
                <template #default="scope">
                    <el-link type="primary" underline @Click="handleStaffClick(scope.row.managerId,'visit')">{{scope.row.managerId}}</el-link>
                </template>
            </el-table-column>
            <el-table-column label="姓名" prop="managerId">
                <template #default="scope">
                    <dict-tag :options="sys_user_name" :value="scope.row.managerId" />
                </template>
            </el-table-column>
            <el-table-column label="万家行得分" prop="score">
                <template #default="scope">
                    {{(parseFloat(scope.row.score)).toFixed(2)}}
                </template>
            </el-table-column>
            <el-table-column label="排名" >
                <template #default="scope">
                    {{scope.row.pm}}
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>
export default {
    name: "VisitSort",
    props:{ data: Array, loading: Boolean, workDate: String },
    setup(props){
        //获取代理对象
        const { proxy } = getCurrentInstance();
        const { data, loading, workDate } = toRefs(props);
         //报表类型数据字典
         const { sys_org_name, sys_user_name } = proxy.useDict("sys_org_name", "sys_user_name");
         const handleStaffClick = (managerId,activeName) =>{
            proxy.$router.push({path: "/manager/performance",query: {workDate: workDate.value, managerId: managerId, activeName: activeName}});
        }
        return { data, loading,sys_org_name, sys_user_name, handleStaffClick }
    }
}
</script>