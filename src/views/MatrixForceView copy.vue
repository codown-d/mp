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
      <g style="transform: translate(0px, 50px)" v-if="false">
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
          v-for="item in start_data"
          :r="4"
          :cx="item.x"
          :cy="item.y"
          :fill="`url(#halfMV_${item.id})`"
          @click="handleClick(item.id)"
          :stroke="getStrokeColor(item.id)"
          stroke-width="1"
        ></circle>
      </g>
      <g style="transform: translate(400px, 50px)"  v-if="false">
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
          v-for="item in matrix_1_0_data"
          :r="4"
          :cx="item.x"
          :cy="item.y"
          :fill="`url(#halfMV_${item.id})`"
          @click="handleClick(item.id)"
          :stroke="getStrokeColor(item.id)"
          stroke-width="1"
        ></circle>
      </g>
      <g style="transform: translate(900px, 50px)" >
        <rect
          x="0"
          y="0"
          width="400"
          height="225"
          fill="transparent"
          stroke="black"
          stroke-width="1" v-if="false"
        />
        <circle
          v-for="item in matrix_2_0_data"
          :r="4"
          :cx="item.x"
          :cy="item.y"
          :fill="getFillColor(item)"
          @click="handleClick(item.id)"
          :stroke="getStrokeColor(item.id)"
          stroke-width="1"
        ></circle>
      </g>
      <g style="transform: translate(900px, 350px)"  v-if="false">
        <rect
          x="0"
          y="0"
          width="400"
          height="225"
          fill="transparent"
          stroke="black"
          stroke-width="1"
        />
        <circle
          v-for="item in matrix_2_1_data"
          :r="4"
          :cx="item.x"
          :cy="item.y"
          :fill="getFillColor(item)"
          @click="handleClick(item.id)"
          :stroke="getStrokeColor(item.id)"
          stroke-width="1"
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
      id: '',
      start: [],
      matrix_1_0: [],
      matrix_2_0: [],
      matrix_2_1: [],
      dec: {}
    }
  },
  mounted() {
    console.log(this.$props)
    this.initHierarchy()
  },
  watch: {
    result_nodes: {
      handler(newVal, oldVal) {
        console.log(newVal)
        let start = newVal['start'] ? newVal['start'] : []
        let matrix_1_0 = newVal['matrix_1_0'] ? newVal['matrix_1_0'] : []
        let matrix_2_0 = newVal['matrix_2_0'] ? newVal['matrix_2_0'] : []
        let matrix_2_1 = newVal['matrix_2_1'] ? newVal['matrix_2_1'] : []
        this.culForceData(
          start.map((item) => {
            return {
              index: item,
              x: ((Math.random() * this.width) / 4) * 0.7 + 50,
              y: Math.random() * this.height * 0.7 + 50
            }
          })
        ).then((res) => {
          this.start = flatten(res)
        })
        this.culForceData(matrix_1_0).then((res) => {
          this.matrix_1_0 = flatten(res)
        })
        this.culForceData(matrix_2_0).then((res) => {
          this.matrix_2_0 = flatten(res)
        })
        console.log(matrix_2_1)
        this.culForceData(matrix_2_1).then((res) => {
          this.matrix_2_1 = flatten(res)
        })
      },
      deep: true
    }
  },
  computed: {
    start_data() {
      let plotNodes = this.start.map((item) => {
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
      return this.start.map((item) => {
        return { ...item }
      })
    },
    matrix_1_0_data() {
      let plotNodes = this.matrix_1_0.map((item) => {
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
      return this.matrix_1_0.map((item) => {
        item.x = xScale_0(item.x)
        item.y = yScale_0(item.y)
        return item
      })
    },
    matrix_2_0_data() {
      let plotNodes = this.matrix_2_0.map((item) => {
        return [item.x, item.y]
      })
      const xScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[0])), max(plotNodes.map((d) => d[0]))])
        .range([50, (this.width / 3) * 0.8])
      const yScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[1])), max(plotNodes.map((d) => d[1]))])
        .range([50, (this.height / 2 - 75) * 0.8])
      console.log(this.matrix_2_0)
      return this.matrix_2_0.map((item) => {
        // item.x = xScale_0(item.x)
        // item.y = yScale_0(item.y)
        return item
      })
    },
    matrix_2_1_data() {
      let plotNodes = this.matrix_2_1.map((item) => {
        return [item.x, item.y]
      })
      const xScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[0])), max(plotNodes.map((d) => d[0]))])
        .range([50, (this.width / 3) * 0.8])
      const yScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[1])), max(plotNodes.map((d) => d[1]))])
        .range([50, (this.height / 2 - 75) * 0.8])
      return this.matrix_2_1.map((item) => {
        item.x = xScale_0(item.x)
        item.y = yScale_0(item.y)
        return item
      })
    }
  },
  methods: {
    getFillColor(item) {
      return item.vx ? '#f00' : `url(#halfMV_${item.id})`
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
      this.svg = d3.select(this.$refs.matrixView)
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
    handleClick(id) {
      this.id = id
    },
    culForceData(list) {
      let sf = this
      let result = groupBy(
        cloneDeep(list).map((item) => ({ ...item, id: item.index })),
        (item) => {
          return `${item.x}_${item.y}`
        }
      )
      console.log(result)
      return Promise.all(
        keys(result).map((item) => {
          let [width, height] = item.split('_')
          if (result[item].length == 0) {
            return Promise.resolve(result[item])
          } else {
            return new Promise((resolve, reject) => {
              let nodes = result[item]
              const simulation = d3
                .forceSimulation(nodes)
                // .force('charge', d3.forceManyBody().strength(7))
                // .force('center', d3.forceCenter(width, height))
                // .force('x', d3.forceX().strength(0.06)) // 吸引到 X 中心
                // .force('y', d3.forceY().strength(0.06)) // 吸引到 Y 中心 
                .force('collide', d3.forceCollide().radius(d=>{
                  console.log(d)
                  return 10 //d.r+1
                }))
                .on('tick', ticked)
              function ticked() {
                console.log(123)
                //         node
                // .attr("cx", d => d.x)
                // .attr("cy", d => d.y);
              }
              simulation.on('end', () => {
                simulation.stop()
                resolve(nodes)
              })
            })
          }
        })
      )
    }
  }
}
</script>
<style>
svg {
  background-color: #f0f0f0;
}
</style>
