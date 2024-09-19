<template>
  <svg
    ref="scatterPlot0"
    :style="'width: ' + width + 'px;height: ' + height + 'px'"
    class="scatterPlot0"
  ></svg>
</template>

<script>
import * as d3 from 'd3'
import { watch } from 'vue'
import UploadFile from '@/views/UploadFile.vue'
import { Slider } from 'ant-design-vue'
import Papa from 'papaparse'
import dataList from '@/views/data.js'

export default {
  props: {
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 600
    },
    dataList: {
      type: Object,
      default: () => {
        return {
          nodes: [],
          edges: []
        }
      }
    },
    brushList: {
      type: Object,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      forceSvg: null,
      allNodes: [],
      allEdges: [],
      nodesStorage: JSON.parse(window.localStorage.getItem('nodesStorage') || '{}'),
      selectActNode: [],
      type: [[], []]
    }
  },
  mounted() {
    this.allNodes = this.dataList.nodes
    this.allEdges = this.dataList.edges
    this.initForceSvg()
  },
  methods: {
    renderHistoricalDataset() {
      const colors0 = d3.scaleOrdinal(d3.schemeAccent)
      let { links, nodes } = this.nodesStorage
      const nodeMap = nodes.reduce((pre, item) => {
        pre[item.id] = item
        return pre
      }, {})
      // 去除所有节点和边
      this.forceSvg.selectAll('*').remove()
      let link = this.forceSvg
        .append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('x1', (d) => nodeMap[d.source.id].x)
        .attr('x2', (d) => nodeMap[d.target.id].x)
        .attr('y1', (d) => nodeMap[d.source.id].y)
        .attr('y2', (d) => nodeMap[d.target.id].y)
        .attr('stroke', (d, i) => {
          return this.selectActNode.includes(Number(d.source.id)) ||
            this.selectActNode.includes(Number(d.target.id))
            ? '#f00'
            : '#999'
        })
        .attr('stroke-width', (d, i) => {
          return this.selectActNode.includes(Number(d.source.id)) ||
            this.selectActNode.includes(Number(d.target.id))
            ? 3
            : 1
        })
        .attr('stroke-opacity', 1)
        .attr('stroke-linecap', 'round')
        .attr('data-index', (_, i) => `${_.source.id}_${_.target.id}`)
      let node = this.forceSvg
        .append('g')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('transform', (d) => `translate(0,0)`)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', (d) => 10)
          .attr('fill', (d, i) => {
          if (this.type[0].includes(Number(i))) {
            console.log(this.type)
            return '#ff000'
          } else if (this.type[1].includes(Number(i))) {
            console.log(this.type)
            return '#00ff00'
          } else {
            
          return colors0(i)
          }
        })
        .attr('stroke', (d, i) => (this.selectActNode.includes(Number(d.id)) ? '#f00' : '#fff'))
        .attr('fill-opacity', (d, i) => {
          return this.selectActNode.length == 0
            ? 1
            : this.selectActNode.includes(Number(d.id))
              ? 1
              : 0.1
        })
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1.5)
        .attr('data-index', (d) => d.id)
        .on('click', this.handleSimGraphMouseClick)
    },
    initForceSvg() {
      const width = this.width
      const height = this.height
      let svg = d3
        .select(this.$refs.scatterPlot0)
        .attr('viewBox', [-width, -height, width * 4, height * 4]) //看的区域更大
        .attr('width', width)
        .attr('height', height)
        .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
        .call(
          d3
            .zoom()
            .scaleExtent([0.1, 4]) //放大缩小倍数
            .on('zoom', (event) => {
              //处理放大缩小，监听zoom，所有操作记录在event中
              let { transform } = event
              this.forceSvg.transition().duration(10).attr('transform', transform)
            })
        )
      this.forceSvg = svg.append('g')
    },
    handleSimGraphMouseClick(event, d) {
      const nodeId = event.target.dataset.index
      this.forceSvg
        .selectAll('line')
        .style('stroke', '#999')
        .style('stroke-width', 1)
        .style('stroke-opacity', 0.5)
        .style('stroke-linecap', 'round')

      // 高亮与该节点相关的边
      this.forceSvg
        .selectAll('line')
        .filter(function (d) {
          return d.source.id == nodeId || d.target.id == nodeId
        })
        .style('stroke', 'red')
        .style('stroke-width', 3)
        .style('stroke-opacity', 1)
        .style('stroke-linecap', 'round')
      this.$emit('click-node', {
        svgIns: this.forceSvg,
        ref: this.$refs.scatterPlot0,
        nodeId: nodeId
      })
    },

    renderForceSvg() {
      this.forceSvg.selectAll('*').remove()
      const width = 600
      const height = 600
      const colors0 = d3.scaleOrdinal(d3.schemeAccent)
      const nodes = this.allNodes.map((item) => {
        return { ...item, x: Math.random() * 1800, y: Math.random() * 1800 }
      }) //节点坐标随机初始化
      const links = JSON.parse(JSON.stringify(this.allEdges))
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          'link',
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(30)
            .strength(0.2)
        )
        .force('center', d3.forceCenter(width, height))
        .force('collide', d3.forceCollide().radius(20).strength(1)) //碰撞力
        .force('charge', d3.forceManyBody().strength(-20))
        .alphaMin(0.1) //计算结束条件
      const nodeMap = nodes.reduce((pre, item) => {
        pre[item.id] = item
        return pre
      }, {})
      let link = this.forceSvg
        .append('g') //画线
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('x1', (d) => nodeMap[d.source.id].x)
        .attr('y1', (d) => nodeMap[d.source.id].y)
        .attr('x2', (d) => nodeMap[d.target.id].x)
        .attr('y2', (d) => nodeMap[d.target.id].y)
        .attr('stroke', '#999')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 1)
        .attr('stroke-linecap', 'round')
        .attr('data-index', (_, i) => `${_.source.id}_${_.target.id}`)
      let node = this.forceSvg
        .append('g') //画节点
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('transform', (d) => `translate(0,0)`)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .attr('r', (d) => 10)
        //   .attr('fill', (d, i) => colors0(i))
          .attr('fill', (d, i) => {
            console.log(123)
          if (this.type[0].includes(Number(i))) {
            return '#F00'
          } else if (this.type[1].includes(Number(i))) {
            return '#0F0'
          } else {
            
          return colors0(i)
          }
        })
        .attr('stroke', '#fff')
        .attr('fill-opacity', 1)
        .attr('stroke-width', 1.5)
        .attr('data-index', (d) => d.id)
        .on('click', this.handleSimGraphMouseClick)
      simulation
        .on('tick', () => {
          //监听，每次迭代计算更新坐标，动态展示
          node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
          link
            .attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y)
        })
        .on('end', () => {
          //计算结束后，存为localStorage临时文件
          window.localStorage.setItem(
            'nodesStorage',
            JSON.stringify({
              nodes,
              links
            })
          )
        })
    }
  },
  watch: {
    brushList: {
      handler(newVal, oldVal) {
        console.log(newVal)
        this.selectActNode = newVal.reduce((pre, item, index) => {
          this.type[index] = item.dataIndex
          return pre.concat(item.dataIndex)
        }, [])
      },
      deep: true
    },
    dataList(newVal, oldVal) {
      this.allNodes = newVal.nodes
      this.allEdges = newVal.edges
      this.renderForceSvg()
    },
      selectActNode(newVal, oldVal) {
        console.log(123)
      this.renderHistoricalDataset()
    }
  }
}
</script>

<style scoped>
svg {
  transform: translate3d(0, 0, 0);
  /* 强制使用GPU加速 */
}
</style>
