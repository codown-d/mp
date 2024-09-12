<template>
  <div>
    <svg :width="width" :height="height">
      <template v-for="(row, rowIndex) in data" :key="rowIndex">
        <template v-for="(value, colIndex) in row" :key="colIndex">
          <rect
              :x="colIndex * cellSize"
              :y="rowIndex * cellSize"
              :width="cellSize"
              :height="cellSize"
              :fill="colorScale(value)"
              @mouseover="highlightCell(rowIndex, colIndex)"
              @mouseout="unhighlightCell(rowIndex, colIndex)"
          ></rect>
        </template>
      </template>
    </svg>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';

export default {
  name: 'Heatmap',
  setup() {
    const width = 600;
    const height = 600;
    const data = [
      [10, 20, 30, 40, 50, 60],
      [70, 80, 90, 100, 110, 120],
      [130, 140, 150, 160, 170, 180],
      [190, 200, 210, 220, 230, 240],
      [250, 260, 270, 280, 290, 300],
      [310, 320, 330, 340 ,350, 360]
    ];
    const cellSize = 60;
    const colorScale = d3.scaleSequential()
        .domain([d3.min(data.flat()), d3.max(data.flat())])
        .interpolator(d3.interpolateBlues);
    const highlightedCell = ref(null);

    const highlightCell = (rowIndex, colIndex) => {
      highlightedCell.value = { rowIndex, colIndex };
    };

    const unhighlightCell = (rowIndex, colIndex) => {
      highlightedCell.value = null;
    };

    onMounted(() => {
      // 在组件挂载后执行的代码
    });

    return {
      width,
      height,
      data,
      cellSize,
      colorScale,
      highlightedCell,
      highlightCell,
      unhighlightCell
    };
  }
};
</script>