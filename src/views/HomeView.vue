<template>
    <div class="home-wrapper">
        <board ref="boardRef"/>
        <div class="cmd-wrapper">
            <cmd-history :cmd-list="cmdList" ref="cmdHistoryRef"/>
            <cmd-input @sendCmd="sendCmd"/>
        </div>
    </div>
</template>

<script setup lang="ts">

import Board from "@/components/Board.vue";
import CmdHistory from "@/components/CmdHistory.vue";
import CmdInput from "@/components/CmdInput.vue";
import {ref} from "vue";
import {Agent} from "langchain/agents";
import DrawAgent from "@/agent/DrawAgent";
import DrawTool from "@/agent/DrawTool";
import type {DrawParams} from "@/agent/DrawParams";

const cmdList = ref([]);
const cmdHistoryRef = ref(null);
const boardRef = ref(null);

const agent = new DrawAgent({
    tools: [
        new DrawTool({
            name: "drawCircle", description: "draw a circle", draw: (params: DrawParams[]) => {
                return boardRef.value.drawCircle(params)
            }
        }),
        new DrawTool({
            name: "drawLine", description: "draw a line", draw: (params: DrawParams[]) => {
                return boardRef.value.drawLine(params)
            }
        }),
        new DrawTool({
            name: "drawRect", description: "draw a rect", draw: (params: DrawParams[]) => {
                return boardRef.value.drawRect(params)
            }
        }),
        new DrawTool({
            name: "drawEllipse", description: "draw a ellipse", draw: (params: DrawParams[]) => {
                return boardRef.value.drawEllipse(params)
            }
        }),
        new DrawTool({
            name: "clear", description: "clear all", draw: () => {
                return boardRef.value.clearAll()
            }
        }),
    ]
});


const sendCmd = (content: string) => {
    cmdList.value.push({
        name: "用户",
        type: "user",
        content: content,
        time: new Date().toLocaleString(),
    });
    agent.run({input: content}).then((data) => {
        console.log(data.output);
        cmdList.value.push({
            name: "Bot",
            type: "Bot",
            content: `${data.output}`,
            time: new Date().toLocaleString(),
        });
        cmdHistoryRef.value?.scrollToBottom();
    })


    cmdHistoryRef.value?.scrollToBottom();
}


</script>

<style scoped>
.home-wrapper {
    display: flex;
    flex-direction: row;
    overflow-x: hidden;
    overflow-y: hidden;

}


.cmd-wrapper {
    width: 38vw;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: hidden;
    border-left: 1px solid #D3D3D3;
}
</style>
