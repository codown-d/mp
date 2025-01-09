<template>
  <div>ID: {{ id }}</div>
  <svg ref="matrixView">
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
        // this.culForceData(
        //   start.map((item) => {
        //     return {
        //       index: item,
        //       x: ((Math.random() * this.width) / 4) * 0.7 + 50,
        //       y: Math.random() * this.height * 0.7 + 50
        //     }
        //   })
        // ).then((res) => {
        //   this.start = flatten(res)
        // })
        // this.culForceData(matrix_1_0).then((res) => {
        //   this.matrix_1_0 = flatten(res)
        // })
        this.culForceData([...matrix_2_0]).then((res) => {
          this.matrix_2_0 = flatten(res)
        console.log(this.matrix_2_0)
        })
        // this.culForceData(matrix_2_1).then((res) => {
        //   this.matrix_2_1 = flatten(res)
        // })
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
      let svg = d3
        .select(this.$refs.matrixView)
        .attr('width', this.width)
        .attr('height', this.height)
      this.svg = svg
      this.svg.call(
        d3
          .zoom()
          .scaleExtent([0.1, 4])
          .on('zoom', (event) => {
            let { transform } = event
            d3.select('.gContentMatrixView').transition().duration(10).attr('transform', transform)
          })
      )
      this.content = this.svg.append('g').attr('class', 'gContentMatrixView')
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
      console.log(result, list)

      return Promise.all([
        new Promise((resolve, reject) => {
          let nodes = cloneDeep(list.map((item) => ({ ...item, id: item.index })))
          const simulation = d3
            .forceSimulation(nodes)
            // .force(
            //   'link',
            //   d3.forceLink(links).id((d) => d.id)
            // )
            // .force('charge', d3.forceManyBody())
            .force('x', d3.forceX(this.width / 2).strength(0.01))
            .force('y', d3.forceY(this.height / 2).strength(0.01))
            // .force('collide', d3.forceCollide().radius(d=>{
            //       return d.r?d.r+1:5
            //     }))
          // .force('center', d3.forceCenter(this.width / 2, this.height / 2))

          // const link = svg
          //   .append('g')
          //   .attr('stroke', '#999')
          //   .attr('stroke-opacity', 0.6)
          //   .selectAll()
          //   .data(links)
          //   .join('line')
          //   .attr('stroke-width', (d) => Math.sqrt(d.value))

          const node = this.content
            .append('g')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .selectAll()
            .data(nodes)
            .join('circle')
            .attr('r', 5)
          // .attr('fill', (d) => color(d.group))
          function ticked() {
            node
              .attr('cx', (d) => {
                return d.x
              })
              .attr('cy', (d) => {
                return d.y
              })

            // links
            //   .attr('x1', (d) => d.source.x)
            //   .attr('y1', (d) => d.source.y)
            //   .attr('x2', (d) => d.target.x)
            //   .attr('y2', (d) => d.target.y)
          }

          function simulationEnded() {
            console.log('仿真已结束！')
            resolve(nodes)
          }
          simulation.on('tick', ticked).on('end', simulationEnded)
        })
      ])
    }
  }
}
</script>
<style>
svg {
  background-color: #f0f0f0;
}
</style>
