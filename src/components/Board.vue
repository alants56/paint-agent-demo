<template>
    <div class="board-wrapper" id="container">
    </div>
</template>

<script lang="ts" setup>
import {defineExpose, onMounted} from "vue";
import Konva from "konva";
import type {DrawParams} from "@/agent/DrawParams";

let layer: Konva.Layer;


onMounted(() => {
    let width = window.innerWidth - 600;
    let height = window.innerHeight;

    const stage = new Konva.Stage({
        container: 'container',
        width: width,
        height: height,
    });

    //画板层，（0，0）坐标设置为窗口中心位置
    layer = new Konva.Layer();
    layer.x(width / 2);
    layer.y(height / 2);
    stage.add(layer);
})


const drawCircle = (params: DrawParams[]) => {
    params.forEach((data) => {
        const {x, y, radius} = data;
        let $circle = new Konva.Circle({
            x, y, radius, fill: 'transparent', stroke: 'black', strokeWidth: 1,
        });
        layer.add($circle);
    })
}

const drawLine = (params: DrawParams[]) => {
    params.forEach((data) => {
        const {x1, y1, x2, y2} = data;
        let $line = new Konva.Line({
            points: [x1, y1, x2, y2], stroke: 'black', strokeWidth: 1
        });
        layer.add($line);
    })

}

const drawRect = (params: DrawParams[]) => {
    params.forEach((data) => {
        const {x, y, width, height} = data;
        let $rect = new Konva.Rect({
            x, y, width, height, fill: 'transparent', stroke: 'black', strokeWidth: 1,
        });
        layer.add($rect);
    })

}

const drawEllipse = (params: DrawParams[]) => {
    params.forEach((data) => {
        const {x, y, radiusX, radiusY} = data;
        let $ellipse = new Konva.Ellipse({
            x, y, radiusX, radiusY, fill: 'transparent', stroke: 'black', strokeWidth: 1,
        });
        layer.add($ellipse);
    })
}


const clearAll = () => {
    layer.removeChildren();
}


defineExpose({
    drawCircle,
    drawLine,
    drawRect,
    drawEllipse,
    clearAll,
})

</script>

<style scoped>
.board-wrapper {
    width: 62vw;
    height: 100vh;
    overflow-x: hidden;
    overflow-y: hidden;
    background-color: #FFFFE0;
}
</style>
