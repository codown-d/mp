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
    <g class="gContentMatrixView0">
      <g>
        <line
          v-for="item in link"
          :x1="item.x1"
          :y1="item.y1"
          :x2="item.x2"
          :y2="item.y2"
          stroke="#ddd"
          stroke-width="0.3"
        ></line>
      </g>
      <rect
        v-for="item in rectList"
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :height="item.height"
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
        @click="handleClick(item, 0)"
        :stroke="getStrokeColor(item.id)"
        stroke-width="0.5"
      ></circle>
      <circle
        v-for="item in matrix_1_0_data"
        :r="item.r || 4"
        :cx="item.x"
        :cy="item.y"
        :fill="`url(#halfMV_${item.id})`"
        @click="handleClick(item, 1)"
        :stroke="getStrokeColor(item.id)"
        stroke-width="0.5"
      ></circle>
      <circle
        v-for="item in matrix_2_0_data"
        :r="item.r || 4"
        :cx="item.x"
        :cy="item.y"
        :fill="`url(#halfMV_${item.id})`"
        @click="handleClick(item, 2)"
        :stroke="getStrokeColor(item.id)"
        stroke-width="0.5"
      ></circle>
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
      link: [],
      resultNodes: {
        start: [],
        matrix_1_0: [],
        matrix_2_0: [],
        matrix_2_1: []
      },
      start: [],
      matrix_1_0: [],
      matrix_2_0: [],
      matrix_2_1: [],
      rectList: [
      {
          x: 10,
          y: 20,
          width: 180,
          height: 560
        },
        {
          x: 200,
          y: 20,
          width: 490,
          height: 560
        },
        {
          x: 700,
          y: 20,
          width: 880,
          height: 560
        },
      ]
    }
  },
  mounted() {
    this.initHierarchy()
  },
  watch: {
    actKey: {
      handler(newVal, oldVal) {
        if (newVal == 6 || newVal == 5) {
          this.initHierarchy()
        }
      },
      deep: true
    },
    result_nodes: {
      async handler(newVal, oldVal) {
        let { start = [], matrix_1_0 = [], matrix_2_0 = [], matrix_2_1 = [] } = newVal
        this.resultNodes = {
          start,
          matrix_1_0,
          matrix_2_0,
          matrix_2_1
        }
      },
      deep: true
    },
    resultNodes: {
      async handler(newVal, oldVal) {
        this.culResultNodes(newVal)
      },
      deep: true
    },
    id: {
      handler(newVal, oldVal) {
        let arr = [...this.$props.result_edge].sort((a,b)=>a.source-b.source)
        let { start = [], matrix_1_0 = [], matrix_2_1 = [] } = this.$props.result_nodes
        let node_0 = start
        let node_1 = matrix_1_0.sort((a,b)=>a.index-b.index).map((item) => item.index)
        let node_2 = matrix_2_1.sort((a,b)=>a.index-b.index).map((item) => item.index)
        let result = []
        if (this.type === 0) {
          let list_1 = arr.filter((item) => {
            return item.source === newVal && node_1.includes(item.target)
          })
          let list_1_arr = list_1.map((item) => item.target)
          let list_2 = arr.filter((item) => {
            return list_1_arr.includes(item.source) && node_2.includes(item.target)
          })
          result = [...list_1, ...list_2]
        }else if (this.type === 1) {
          let list_1 = arr.filter((item) => {
            return (
              (item.source === newVal && node_2.includes(item.target)) || item.target === newVal && node_0.includes(item.source)
            )
          })
          result = [...list_1]
        } else if (this.type === 2) {
          let list_1 = arr.filter((item) => {
            return item.target === newVal && node_1.includes(item.source)
          })
          let list_1_arr = list_1.map((item) => item.source)
          let list_2 = arr.filter((item) => {
            return list_1_arr.includes(item.target) && node_0.includes(item.source)
          })
          result = [...list_1, ...list_2]
        }
        let newResult= result.map(item=>{
          let { target, source } = item
          let targetNode =  find([...this.start_data,...this.matrix_1_0_data,...this.matrix_2_0_data], { id: target })
          let sourceNode =  find([...this.start_data,...this.matrix_1_0_data,...this.matrix_2_0_data], { id: source })
          return {
              x1: sourceNode?sourceNode.x:-100,
              y1: sourceNode?sourceNode.y:-100,
              x2: targetNode?targetNode.x:-100,
              y2: targetNode?targetNode.y:-100, 
            }
        }).filter(item=>item.x1!=-100&&item.x2!=-100)
        this.link = newResult
      },
      deep: true
    }
  },
  computed: {
    start_data() {
      return this.start.map((item) => {
        return {
          index: item,
          id:item,
          x: this.rectList[0].x + Math.random() * this.rectList[0].width,
          y: this.rectList[0].y + Math.random() * this.rectList[0].height
        }
      }).map((item) => {
        return { ...item }
      })
    },
    matrix_1_0_data() {
      let rect = this.rectList[1],
        matrixData = this.matrix_1_0
      return this.culMatrixData(rect, matrixData)
    },
    matrix_2_0_data() {
      let rect = this.rectList[2],
        matrixData = this.matrix_2_0
      return this.culMatrixData(rect, matrixData)
    },
  },
  methods: {
    culMatrixData(rect, matrixData) {
      let matrix_2_0 = cloneDeep(matrixData)
      let plotNodes = matrix_2_0.map((item) => {
        return [item.x, item.y]
      })
      const xScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[0])), max(plotNodes.map((d) => d[0]))])
        .range([rect.x + 10, rect.width + rect.x - 10])

      const yScale_0 = d3
        .scaleLinear()
        .domain([min(plotNodes.map((d) => d[1])), max(plotNodes.map((d) => d[1]))])
        .range([rect.y + 10, rect.height + rect.y - 10])
      let kx =
        (rect.width - rect.x) / (max(plotNodes.map((d) => d[0])) - min(plotNodes.map((d) => d[0])))
      let ky =
        (rect.height - rect.y) / (max(plotNodes.map((d) => d[1])) - min(plotNodes.map((d) => d[1])))

      let result = matrix_2_0.map((item) => {
        item.x = xScale_0(item.x)
        item.y = yScale_0(item.y)
        item.r = 4
        return item
      })
      return result
    },
    culResultNodes(newVal) {
      let { start = [], matrix_1_0 = [], matrix_2_0 = [], matrix_2_1 = [] } = newVal
    
      this.start = start
      this.culForceData(matrix_1_0).then((res) => {
        this.matrix_1_0 = flatten(res)
      })
      this.culForceData(matrix_2_0).then((res) => {
        this.matrix_2_0 = flatten(res)
      })
    },
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
        start,
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
            d3.select('.gContentMatrixView0').transition().duration(10).attr('transform', transform)
          })
      )
    },
    handleClick(item, type) {
      this.id = item.id
      this.type = type
    },
    culForceData(list) {
      let sf = this
      return new Promise((resolve, reject) => {
        let nodes = cloneDeep(list.map((item) => ({ ...item, id: item.index })))
        const simulation = d3
          .forceSimulation(nodes)
          .velocityDecay(0.9) // low friction
          .force(
            'collide',
            d3
              .forceCollide()
              .radius((d) => 20)
              .iterations(1)
          )
          .force(
            'charge',
            d3.forceManyBody().strength((d, i) => (i ? 0 : -0.001))
          )
          .on('tick', ticked)
        function ticked() {}
        simulation.on('end', () => {
          simulation.stop()
          resolve(nodes)
        })
      })
    }
  }
}
</script>
<style>
svg {
  background-color: #f0f0f0;
}
</style>
