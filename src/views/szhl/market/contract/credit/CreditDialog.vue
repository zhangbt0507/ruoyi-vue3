<template>
    <MyDialog  ref="myDialogRef">
        <Credit ref="creditRef"></Credit>
    </MyDialog>
</template>

<script >
import  { unref } from 'vue';
import MyDialog from '../dialog/MyDialog';
import Credit,{initData} from './Credit';
    const initEffect = (myDialogRef,openCreditDialog) => {
        const openFn = (custId)=>{
                unref(myDialogRef).openDialog(true,'征信历史数据TOP10');
                openCreditDialog(custId);
        }
        return { openFn }
    }
    
    export default {
        name: 'CreditDialog',
        components:{ MyDialog, Credit },
        setup() {
            const myDialogRef = ref(null);
            const creditRef = ref(null);
            const {openCredit,creditList,openCreditDialog} = initData();
            const { open, title, openFn} = initEffect(myDialogRef,openCreditDialog );
            return { open, title, openFn, myDialogRef,creditRef,openCredit,creditList,openCreditDialog }
        }
    }


</script>