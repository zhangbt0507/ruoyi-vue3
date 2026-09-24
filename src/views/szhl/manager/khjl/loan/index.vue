<template>
    <div class="app-container">
                <div  style="height:1000px">
                    <iframe  :src="url1"  width="100%" height="100%" scrolling = "no" />
                </div>
    </div>
</template>
<script>
import useUserStore from '@/store/modules/user';
export default {
    //name: 'DepositDetail',
    setup() {
        const url1 = ref('');
        const url2 = ref('');
        const name = useUserStore().name;
        url1.value = "http://154.126.31.204:8059/WebReport/decision/view/report?viewlet=szhl/jxkh/客户经理/客户经理贷款打折明细表.cpt&managerCode="+name; 
        return { url1, url2 }
    },
}
</script>
<style lang="scss" scoped>
iframe {
    border: none;
    margin: 0;
    padding: 0;
}
</style>