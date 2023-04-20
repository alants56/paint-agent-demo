<template>
    <div class="cmd-item-wrapper" :style="{
    backgroundColor: cmd.type === 'Bot' ? '#FFFAFA': '#FAF0E6'}">
        <div class="avatar-wrapper" :style="{
    backgroundColor: cmd.type === 'Bot' ? '#009933': '#0099CC'}">{{ cmd.name }}
        </div>
        <div class="cmd-content-wrapper">{{ cmd.content }}</div>
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from "vue";

defineProps({
    cmd: {
        type: Object,
        required: true
    }
});

</script>

<style scoped>
.cmd-item-wrapper {
    display: flex;
    flex-direction: row;
    padding: 20px 40px;
    border-bottom: 1px solid #FFF;
}

.avatar-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    margin-top: 8px;
    border-radius: 50%;
    color: #ffffff;
    font-size: 14px;
}

.cmd-content-wrapper {
    display: inline-block;
    padding: 12px;
    white-space: pre-wrap;
    font-size: 14px;
    color: #282828;
}
</style>
