<template>
  <div>ID: {{ id }}</div>
  <svg style="width: 1600; height: 600" ref="matrixView">
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
    <g class="gContentMatrixViewN">
      <g style="transform: translate(0px, 50px)">
        <rect
          x="10"
          y="0"
          width="380"
          height="500"
          fill="transparent"
          stroke="black"
          stroke-width="1"
        />
        <circle
          v-for="item in matrix_2_0_data"
          :r="item.r || 4"
          :cx="item.x"
          :cy="item.y"
          :fill="getFillColor(item)"
          @click="handleClick(item, 1)"
          :stroke="getStrokeColor(item.id)"
          stroke-width="1"
        ></circle>
      </g>
      <g style="transform: translate(400px, 50px)">
        <rect
          x="10"
          y="0"
          width="380"
          height="500"
          fill="transparent"
          stroke="black"
          stroke-width="1"
        />
        <circle
          v-for="item in start_data"
          :r="4"
          :cx="item.x"
          :cy="item.y"
          :fill="`url(#halfMV_${item.id})`"
          @click="handleClick(item, 1)"
          :stroke="getStrokeColor(item.id)"
          stroke-width="1"
        ></circle>
      </g>
      <g style="transform: translate(800px, 50px)">
        <rect
          x="10"
          y="0"
          width="380"
          height="500"
          fill="transparent"
          stroke="black"
          stroke-width="0.5"
        />
        <circle
          v-for="item in matrix_1_0_data"
          :r="item.r || 4"
          :cx="item.x"
          :cy="item.y"
          :fill="`url(#halfMV_${item.id})`"
          @click="handleClick(item, 2)"
          :stroke="getStrokeColor(item.id)"
          stroke-width="0.5"
        ></circle>
      </g>
      <g style="transform: translate(1200px, 50px)">
        <rect
          x="10"
          y="0"
          width="380"
          height="500"
          fill="transparent"
          stroke="black"
          stroke-width="0.5"
        />
        <circle
          v-for="item in matrix_2_1_data"
          :r="item.r || 4"
          :cx="item.x"
          :cy="item.y"
          :fill="getFillColor(item)"
          @click="handleClick(item, 2)"
          :stroke="getStrokeColor(item.id)"
          stroke-width="0.5"
        ></circle>
      </g>
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3'
import {
  findIndex,
  isEqual,
  isNumber,
  keys,
  find,
  min,
  max,
  cloneDeep,
  pow,
  add,
  subtract,
  groupBy,
  flatten
} from 'lodash'

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
    result_edges_2_0: {
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
    },
    actKey: {
      type: String,
      default: '0'
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
      content: null,
      obj: {},
      hierarchyNodes: [],
      myChart: null,
      id: '',
      dec: {},
      type: 0,
      resultNodes: {
        start: [],
        matrix_1_0: [],
        matrix_2_0: [],
        matrix_2_1: []
      }
    }
  },
  mounted() {
    this.initHierarchy()
  },
  watch: {
    actKey: {
      handler(newVal, oldVal) {
        if (newVal == 4) {
          this.initHierarchy()
        }
      },
      deep: true
    },
    result_nodes: {
      handler(newVal, oldVal) {
        let { start = [], matrix_1_0 = [], matrix_2_0 = [], matrix_2_1 = [] } = newVal
        this.resultNodes = {
          start: start.map((item) => {
            return {
              index: item,
              x: ((Math.random() * this.width) / 4) * 0.7 + 50,
              y: Math.random() * this.height * 0.7 + 50
            }
          }),
          matrix_1_0,
          matrix_2_0,
          matrix_2_1
        }
      },
      deep: true
    }
  },
  computed: {
    start_data() {
      return this.resultNodes.start.map((item) => {
        return { ...item }
      })
    },
    matrix_1_0_data() {
      let matrix_1_0 = cloneDeep(this.resultNodes.matrix_1_0)
      let plotNodes = matrix_1_0.map((item) => {
        return [item.x, item.y]
      })
      const xScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[0])), max(plotNodes.map((d) => d[0]))])
        .range([50, (this.width / 3) * 0.95])

      const yScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[1])), max(plotNodes.map((d) => d[1]))])
        .range([50, (this.height - 100) * 0.95])

      let kx =
        ((this.width / 3) * 0.95 - 50) /
        (max(plotNodes.map((d) => d[0])) - min(plotNodes.map((d) => d[0])))
      let ky =
        ((this.height - 100) * 0.95 - 50) /
        (max(plotNodes.map((d) => d[1])) - min(plotNodes.map((d) => d[1])))
      return matrix_1_0.map((item) => {
        item.x = xScale_0(item.x)
        item.y = yScale_0(item.y)
        item.r = (item.r || 4) * min([kx, ky])
        return item
      })
    },
    matrix_2_0_data() {
      let matrix_2_0 = cloneDeep(this.resultNodes.matrix_2_0)
      let plotNodes =matrix_2_0.map((item) => {
        return [item.x, item.y]
      })
      const xScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[0])), max(plotNodes.map((d) => d[0]))])
        .range([50, (this.width / 3) * 0.95])

      const yScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[1])), max(plotNodes.map((d) => d[1]))])
        .range([50, (this.height / 2 - 75) * 0.95])
      let kx =
        ((this.width / 3) * 0.95 - 50) /
        (max(plotNodes.map((d) => d[0])) - min(plotNodes.map((d) => d[0])))
      let ky =
        ((this.height / 2 - 75) * 0.95 - 50) /
        (max(plotNodes.map((d) => d[1])) - min(plotNodes.map((d) => d[1])))

      let result = matrix_2_0.map((item) => {
        item.x = xScale_0(item.x)
        item.y = yScale_0(item.y)
        item.r = (item.r || 4) * min([kx, ky])
        return item
      })
      return result
    },
    matrix_2_1_data() {
      let matrix_2_1 = cloneDeep(this.resultNodes.matrix_2_1)
      let plotNodes = matrix_2_1.map((item) => {
        return [item.x, item.y]
      })
      const xScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[0])), max(plotNodes.map((d) => d[0]))])
        .range([50, (this.width / 3) * 0.95])
      const yScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[1])), max(plotNodes.map((d) => d[1]))])
        .range([50, (this.height / 2 - 75) * 0.95])

      let kx =
        ((this.width / 3) * 0.95 - 50) /
        (max(plotNodes.map((d) => d[0])) - min(plotNodes.map((d) => d[0])))
      let ky =
        ((this.height / 2 - 75) * 0.95 - 50) /
        (max(plotNodes.map((d) => d[1])) - min(plotNodes.map((d) => d[1])))

      let result =matrix_2_1.map((item) => {
        item.x = xScale_0(item.x)
        item.y = yScale_0(item.y)
        item.r = (item.r || 4) * min([kx, ky])
        return item
      })
      return result
    }
  },
  methods: {
    getFillColor(item) {
      return item.vx ? '#f00' : `url(#halfMV_${item.id})`
      return `url(#halfMV_${item.id})`
    },
    getStrokeColor(id) {
      let node = find(this.guidanceColors, (item) => item.item === id)
      let cr = node ? node.colors[2] : 'black'
      return cr
    },
    calculateDistance(point1, point2 = { x: 0, y: 0 }) {
      if (!point1.x) return 1
      const dx = point2.x - point1.x
      const dy = point2.y - point1.y
      return Math.sqrt(dx * dx + dy * dy) / 10
    },
    initHierarchy() {
      let {
        start = [],
        matrix_1_0 = [],
        matrix_2_0 = [],
        matrix_2_1 = []
      } = this.$props.result_nodes
      this.resultNodes = {
        start: start.map((item) => {
          return {
            index: item,
            x: ((Math.random() * this.width) / 4) * 0.7 + 50,
            y: Math.random() * this.height * 0.7 + 50
          }
        }),
        matrix_1_0,
        matrix_2_0,
        matrix_2_1
      }
      this.svg = d3.select(this.$refs.matrixView)
      this.svg.call(
        d3
          .zoom()
          .scaleExtent([0.1, 4])
          .on('zoom', (event) => {
            let { transform } = event
            d3.select('.gContentMatrixViewN').transition().duration(10).attr('transform', transform)
          })
      )
    },
    handleClick(item) {
      this.id = item.id
    },
  }
}
</script>
<style>
svg {
  background-color: #f0f0f0;
}
</style>
