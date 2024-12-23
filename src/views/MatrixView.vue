<template>
  <div>ID: {{ id }}</div>
  <svg style="width: 1400; height: 600" ref="matrixView">
    <defs>
      <!-- 定义一个线性渐变 -->
      <linearGradient
        :id="'halfMV_' + item.id"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
        v-for="item in guidanceColors"
      >
        <stop offset="50%" :style="'stop-color: ' + item.colors[0] + '; stop-opacity: 1'" />
        <stop offset="50%" :style="'stop-color: ' + item.colors[1] + '; stop-opacity: 1'" />
      </linearGradient>
    </defs>
    <g class="gContentMatrixView">
    <g style="transform: translate(0px, 50px)">
      <rect
        x="20"
        y="0"
        width="380"
        height="500"
        fill="transparent"
        stroke="black"
        stroke-width="1"
      />
      <circle
        v-for="item in start"
        :r="4"
        :cx="item.x"
        :cy="item.y"
        :fill="`url(#halfMV_${item.index})`"
        @click="handleClick(item.index)"
      ></circle>
    </g>
    <g style="transform: translate(400px, 50px)">
      <rect
        x="20"
        y="0"
        width="400"
        height="500"
        fill="transparent"
        stroke="black"
        stroke-width="1"
      />
      <circle
        v-for="item in matrix_1_0"
        :r="4"
        :cx="item.x"
        :cy="item.y"
        :fill="`url(#halfMV_${item.index})`"
        @click="handleClick(item.index)"
      ></circle>
    </g>
    <g style="transform: translate(900px, 50px)">
      <rect
        x="0"
        y="0"
        width="400"
        height="225"
        fill="transparent"
        stroke="black"
        stroke-width="1"
      />
      <circle v-for="item in matrix_2_0" :r="4" :cx="item.x" :cy="item.y" :fill="'#000'" 
      @click="handleClick(item.index)"></circle>
    </g>
    <g style="transform: translate(900px, 350px)">
      <rect
        x="0"
        y="0"
        width="400"
        height="225"
        fill="transparent"
        stroke="black"
        stroke-width="1"
      />
      <circle v-for="item in matrix_2_1" :r="4" :cx="item.x" :cy="item.y" :fill="'#000'" 
      @click="handleClick(item.index)"></circle>
    </g>
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3'
import { findIndex, isEqual, isNumber, keys, find, min, max } from 'lodash'

export default {
  props: {
    dataList: {
      type: Object,
      default: {}
    },
    result_edge: {
      type: Array,
      default: []
    },
    result_nodes: {
      type: Object,
      default: {
        matrix_1_0: [],
        matrix_2_0: [],
        matrix_2_1: []
      }
    },
    brushNode: {
      type: Array,
      default: []
    },
    guidanceColors: {
      type: Object,
      default: []
    },
    brush: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      nodes: [],
      nodesRect: [],
      links: [],
      width: 1200,
      height: 600,
      svg: null,
      actNode: '',
      id: '',
      content: null,
      obj: {},
      hierarchyNodes: [],
      myChart: null,
      id:''
    }
  },
  mounted() {
    this.initHierarchy()
  },
  watch: {},
  computed: {
    start() {
      if(!this.$props.result_nodes['start'])return;
      let plotNodes = this.$props.result_nodes['start'].map((item) => {
        return [item.x, item.y]
      })
      const xScale_0 = d3
        .scaleLinear()
        .domain([50, (this.width / 3) * 0.8])
        .range([50, (this.width / 3) * 0.8]) 
      const yScale_0 = d3
        .scaleLinear()
        .domain([50, (this.height - 100) * 0.8])
        .range([50, (this.height - 100) * 0.8])
      return this.$props.result_nodes['start'].map((item) => {
        return {
          index: item,
          x: ((Math.random() * this.width) / 4) * 0.7 + 50,
          y: Math.random() * this.height * 0.7 + 50
        }
      })
    },
    matrix_1_0() {
      if(!this.$props.result_nodes['matrix_1_0'])return;
      let plotNodes = this.$props.result_nodes['matrix_1_0'].map((item) => {
        return [item.x, item.y]
      })
      const xScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[0])), max(plotNodes.map((d) => d[0]))])
        .range([50, (this.width / 3) * 0.8]) //this.width/3
      const yScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[1])), max(plotNodes.map((d) => d[1]))])
        .range([50, (this.height - 100) * 0.8])
      return this.$props.result_nodes['matrix_1_0'].map((item) => {
        item.x = xScale_0(item.x)
        item.y = yScale_0(item.y)
        return item
      })
    },
    matrix_2_0() {
      if(!this.$props.result_nodes['matrix_2_0'])return;
      let plotNodes = this.$props.result_nodes['matrix_2_0'].map((item) => {
        return [item.x, item.y]
      })
      const xScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[0])), max(plotNodes.map((d) => d[0]))])
        .range([50, (this.width / 3) * 0.8]) //this.width/3
      const yScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[1])), max(plotNodes.map((d) => d[1]))])
        .range([50, (this.height / 2 - 75) * 0.8])
      return this.$props.result_nodes['matrix_2_0'].map((item) => {
        item.x = xScale_0(item.x)
        item.y = yScale_0(item.y)
        return item
      })
    },
    matrix_2_1() {
      if(!this.$props.result_nodes['matrix_2_1'])return;
      let plotNodes = this.$props.result_nodes['matrix_2_1'].map((item) => {
        return [item.x, item.y]
      })
      const xScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[0])), max(plotNodes.map((d) => d[0]))])
        .range([50, (this.width / 3) * 0.8]) //this.width/3
      const yScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[1])), max(plotNodes.map((d) => d[1]))])
        .range([50, (this.height / 2 - 75) * 0.8])
      return this.$props.result_nodes['matrix_2_1'].map((item) => {
        item.x = xScale_0(item.x)
        item.y = yScale_0(item.y)
        return item
      })
    }
  },
  methods: {
    initHierarchy() {
      this.svg = d3
        .select(this.$refs.matrixView)
      this.svg.call(
        d3
          .zoom()
          .scaleExtent([0.1, 4])
          .on('zoom', (event) => {
            let { transform } = event
            d3.select('.gContentMatrixView').transition().duration(10).attr('transform', transform)
          })
      )
    },
    handleClick(id){this.id = id},
  }
}
</script>
<style>
svg {
  background-color: #f0f0f0;
}
</style>
