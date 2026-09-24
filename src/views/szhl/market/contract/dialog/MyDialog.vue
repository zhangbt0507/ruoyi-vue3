<template>
    <el-dialog :title="title" v-model="open"  append-to-body>
        <slot></slot>
      
    </el-dialog>
</template>
<script>
import { ref } from "vue";
const openEffect = ()=>{
    const open = ref(false);
    const title = ref('');
    const openDialog = (o,t)=>{
        open.value = o;
        title.value = t;
    }
    return { openDialog,open,title }
}

export default{
    setup() {
        const {openDialog,open,title} = openEffect();
        return {openDialog,open,title }
    }
    
}

</script>
