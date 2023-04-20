<template>
    <div class="cmd-input-wrapper"
         contenteditable ref="cmdInput">
    </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, onBeforeUnmount} from "vue";

const emit = defineEmits(["sendCmd"]);
const cmd = ref("");
const cmdInput = ref(null);

const hotkey = (e: KeyboardEvent) => {
    if (e.keyCode == 13 && !e.shiftKey) {
        console.log("e === ", e)
        e.stopPropagation();
        e.preventDefault();
        emit('sendCmd', cmdInput.value.innerText);
        cmdInput.value.innerText = "";
    }
}

onMounted(() => {
    cmdInput?.value?.addEventListener('keydown', (e: KeyboardEvent) => {
        hotkey(e)
    })
})


onBeforeUnmount(() => {
    cmdInput?.value?.removeEventListener('keydown', (e: KeyboardEvent) => {
        hotkey(e)
    })
})

</script>

<style scoped>
.cmd-input-wrapper {
    display: flex;
    flex-direction: row;
    padding: 30px;
    width: 38vw;
    height: 200px;
    border-top: 1px solid #D3D3D3;
}

.cmd-input-wrapper:empty:before {
    content: "请输入内容，Enter发送";
    color: #999;
}

.cmd-input-wrapper:focus:before {
    display: none;
}

.cmd-input-wrapper:focus {
    outline: none;
}

</style>
