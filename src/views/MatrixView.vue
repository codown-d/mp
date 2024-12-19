<template>
  <svg style="display: none">
    <defs>
      <!-- 定义一个线性渐变 -->
      <linearGradient
        :id="'half_' + item.id"
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
  <div ref="chartContainer" style="height: 100%; width: 100%"></div>
</template>

<script>
import * as d3 from 'd3'
import { findIndex, isEqual, isNumber, keys, find, min, max } from 'lodash'
import * as echarts from 'echarts'

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
      default: {}
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
      width: 1400,
      height: 600,
      svg: null,
      actNode: '',
      id: '',
      content: null,
      obj: {},
      hierarchyNodes: [],
      myChart: null
    }
  },
  mounted() {
    this.initHierarchy()
  },
  watch: {
    plotNodes(newVal, oldVal) {
      this.initHierarchy()
    }
  },
  computed: {
    plotNodes() {
      console.log(this.$props)
      if (!this.$props || this.$props.result_nodes.length == 0) return []
      let arr = [
        this.$props.result_nodes['matrix_1_0'].map((item) => {
          return [item.x, item.y]
        }),
        this.$props.result_nodes['matrix_2_0'].map((item) => {
          return [item.x, item.y]
        }),
        this.$props.result_nodes['matrix_2_1'].map((item) => {
          return [item.x, item.y]
        })
      ]
      return arr
    }
  },
  methods: {
    initHierarchy() {
      this.myChart && this.myChart.dispose()
      console.log(this.plotNodes)
      let option = {
        grid: [
          { left: '7%', top: '7%', width: '38%', height: '86%' },
          { right: '7%', top: '7%', width: '38%', height: '38%' },
          { right: '7%', bottom: '7%', width: '38%', height: '38%' }
        ],
        xAxis: [
          {
            gridIndex: 0,
            min: min(this.plotNodes[0].flat().map((d) => d[0])),
            max: max(this.plotNodes[0].flat().map((d) => d[0]))
          },
          {
            gridIndex: 1,
            min: min(this.plotNodes[1].flat().map((d) => d[0])),
            max: max(this.plotNodes[1].flat().map((d) => d[0]))
          },
          {
            gridIndex: 2,
            min: min(this.plotNodes[2].flat().map((d) => d[0])),
            max: max(this.plotNodes[2].flat().map((d) => d[0]))
          }
        ],
        yAxis: [
          {
            gridIndex: 0,
            min: min(this.plotNodes[0].flat().map((d) => d[1])),
            max: max(this.plotNodes[0].flat().map((d) => d[1]))
          },
          {
            gridIndex: 1,
            min: min(this.plotNodes[1].flat().map((d) => d[1])),
            max: max(this.plotNodes[1].flat().map((d) => d[1]))
          },
          {
            gridIndex: 2,
            min: min(this.plotNodes[2].flat().map((d) => d[1])),
            max: max(this.plotNodes[2].flat().map((d) => d[1]))
          }
        ],
        series: [
          {
            type: 'scatter',
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: this.plotNodes[0]
          },
          {
            type: 'scatter',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.plotNodes[1],
            itemStyle: {
              color: function (params) {
                return `url(#half_${params.data.id})`
              }
            }
          },
          {
            type: 'scatter',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: this.plotNodes[2]
          }
        ]
      }
      var myChart = echarts.init(this.$refs.chartContainer)
      this.myChart = myChart
      option && myChart.setOption(option)
      myChart.resize({
        width: this.width,
        height: this.height
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
