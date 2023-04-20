<template>
    <div class="cmd-history-wrapper">
        <div class="cmd-history-list" ref="cmdHistoryListRef">
            <cmd-item v-for="(cmd,index) in cmdList" :cmd="cmd"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import CmdItem from "@/components/CmdItem.vue";
import {ref, onMounted, defineExpose, nextTick} from "vue";

const cmdHistoryListRef = ref(null);

onMounted(() => {
    console.log("CmdHistory mounted");
});
defineProps({
    cmdList: {
        type: Array,
        required: true,
    }
})

const scrollToBottom = () => {
    nextTick(() => {
        cmdHistoryListRef.value.scrollTo({top: cmdHistoryListRef.value.scrollHeight, behavior: 'smooth'});
    })
}

defineExpose({
    scrollToBottom,
})

</script>

<style scoped>
.cmd-history-wrapper {
    display: flex;
    flex-direction: column;
    width: 38vw;
    padding: 40px 0 0 0;
    height: calc(100vh - 200px);
    overflow-x: hidden;
    overflow-y: hidden;
}

.cmd-history-list {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 240px);
    overflow-y: auto;
}

.cmd-history-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 38vw;
    height: 40px;
    background-color: #FFFAFA;
    border-bottom: 1px solid #FFFFFF;
}

</style>
