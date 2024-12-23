<template>
  <div style="width: 100%; height: 100%">
    <div>点击的id：{{ actNode }}</div>
    <svg ref="forceGuidance" style="background: #f0f0f0" >
      <defs>
        <!-- 定义一个线性渐变 -->
        <linearGradient
          :id="'halfCHY_' + item.id"
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
      <g class="gContent">
        <line
          v-for="item in link"
          :x1="item.x1"
          :y1="item.y1"
          :x2="item.x2"
          :y2="item.y2"
          stroke="#ddd"
          stroke-width="1"
        ></line>
        <circle
          v-for="item in hierarchyNodes.filter(item=>item.depth!=4)"
          :r="item.depth == 4  ? 6 : item.r"
          :cx="item.x"
          :cy="item.y"
          :fill="item.data.id ? `url(#halfCHY_${item.data.id})` : '#fff'"
          :stroke="item.data.colors ? item.data.colors[2] : '#aaa'"
          :stroke-width="item.children.length<=1&&item.depth!=3?0:1"
          @click="handleClick(item.data.id)"
        ></circle>
       
        <line
          v-for="item in link.filter((item) => item.source !== actNode && item.target !== actNode)"
          :x1="item.x1"
          :y1="item.y1"
          :x2="item.x2"
          :y2="item.y2"
          stroke="#aaa"
          :stroke-width="0.5"
        ></line>
        <line
          v-for="item in link.filter((item) => item.source == actNode || item.target == actNode)"
          :x1="item.x1"
          :y1="item.y1"
          :x2="item.x2"
          :y2="item.y2"
          stroke="#f00"
          :stroke-width="0.5"
        ></line>
        <circle
          v-for="item in hierarchyNodes.filter(item=>item.depth==4)"
          :r="item.depth == 4  ? 4 : item.r"
          :cx="item.x"
          :cy="item.y"
          :fill="item.data.id ? `url(#halfCHY_${item.data.id})` : '#fff'"
          :stroke="item.data.colors ? item.data.colors[2] : '#aaa'"
          :stroke-width="2"
          @click="handleClick(item.data.id)"
        ></circle>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { findIndex, isEqual, isNumber, keys, find } from 'lodash'

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
      hierarchyNodes: []
    }
  },
  mounted() {
    this.initHierarchy()
  },
  computed: {
    link() {
      console.log(this.hierarchyNodes)
      if (this.hierarchyNodes.length == 0) return []
      return this.result_edge.map((item) => {
        let { source, target } = item
        let sourceNode = find(this.hierarchyNodes, (ite) => {
          return ite.data.id == source
        })
        let targetNode = find(this.hierarchyNodes, (ite) => {
          return ite.data.id == target
        })
        return {
          source,
          target,
          x1: sourceNode.x,
          y1: sourceNode.y,
          x2: targetNode.x,
          y2: targetNode.y
        }
      })
    }
  },
  watch: {
    dataList: {
      handler(newValue) {
        console.log(newValue)
        this.initHierarchy()
      }
    },
    guidanceColors: {
      handler(newValue) {
        this.drawChart()
        console.log(newValue)
      }
    },
    result_edge: {
      handler(newValue) {
        this.links = [...newValue]
        this.drawChart()
      }
    },
    result_nodes: {
      handler(newValue) {
        this.culNodes(newValue)
        this.drawChart()
      }
    },
    brushNode: {
      handler(newValue) {
        this.drawChart()
      }
    }
  },
  methods: {
    initHierarchy() {
      if (!this.dataList) return
      const colors = d3.scaleOrdinal(d3.schemeAccent)
      console.log(this.dataList, this.guidanceColors)
      this.svg = d3
        .select(this.$refs.forceGuidance)
        .attr('width', this.width)
        .attr('height', this.height)

      this.svg.call(
        d3
          .zoom()
          .scaleExtent([0.1, 4])
          .on('zoom', (event) => {
            let { transform } = event
            d3.select('.gContent').transition().duration(10).attr('transform', transform)
          })
      )
      let root = d3
        .hierarchy(this.dataList)
        .sum((d) => d.value) // 用 `value` 决定节点大小
        .sort((a, b) => b.value - a.value) // 按值排序
      const pack = d3
        .pack()
        .size([this.width - 50, this.height - 50]) // 设置布局范围
        .padding((d) => {
          // 根据节点的值动态计算填充
          return d.depth == 0 ? 10 : d.depth == 1 ? 70 : 60
        })
      this.hierarchyNodes = pack(root).descendants().slice(1).map(item=>{
        return {
          ...item,
          x:item.y,
          y:item.x
        }
      })
      console.log(this.hierarchyNodes)
      let first = find(this.hierarchyNodes, (item) => {
        return item.data.type == 'first'
      })
      let first_order = {
        x: 200 - first.x,
        y: 300 - first.y
      }
      let second = find(this.hierarchyNodes, (item) => {
        return item.data.type == 'second'
      })
      let second_order = {
        x: 650 - second.x,
        y: 300 - second.y
      }
      let third = find(this.hierarchyNodes, (item) => {
        return item.data.type == 'third'
      })
      let third_order = {
        x: 1100 - third.x,
        y: 300 - third.y
      }
      this.hierarchyNodes.map((item) => {
        if (item.data['type'] && item.data.type.indexOf('first') != -1) {
          item['x'] = item['x'] + first_order.x
          item['y'] = item['y'] + first_order.y
        }
        if (item.data['type'] && item.data.type.indexOf('second') != -1) {
          item['x'] = item['x'] + second_order.x
          item['y'] = item['y'] + second_order.y
        }
        if (item.data['type'] && item.data.type.indexOf('third') != -1) {
          item['x'] = item['x'] + third_order.x
          item['y'] = item['y'] + third_order.y
        }
        return item
      })
      console.log(this.hierarchyNodes)
    },
    culNodes(newValue) {
      return
      let obj = { 1: {}, 2: {} }
      if (!newValue['start']) return
      let objArr = [newValue['start'].map((item) => ({ id: item }))]
      if (!newValue['first order']) return
      let result_edge = this.$props.result_edge
      newValue['first order'].forEach((item) => {
        newValue['start'].forEach((ite) => {
          let obj1 = { target: item, source: ite }
          let obj2 = { target: ite, source: item }
          if (findIndex(result_edge, (item) => isEqual(item, obj1) || isEqual(item, obj2)) != -1) {
            obj[1][item] = isNumber(obj[1][item]) ? obj[1][item] + 1 : 1
          }
        })
      })
      newValue['second order'].forEach((item) => {
        newValue['first order'].forEach((ite) => {
          let obj1 = { target: item, source: ite }
          let obj2 = { target: ite, source: item }
          if (findIndex(result_edge, (item) => isEqual(item, obj1) || isEqual(item, obj2)) != -1) {
            obj[2][item] = isNumber(obj[2][item]) ? obj[2][item] + 1 : 1
          }
        })
      })
      let res = keys(obj[1]).reduce(
        (pre, item) => {
          if (obj[1][item] == 1) {
            pre[0].push({ id: item })
          } else {
            pre[1].push({ id: item })
          }
          return pre
        },
        [[], []]
      )
      objArr.push(res)
      res = keys(obj[2]).reduce(
        (pre, item) => {
          if (obj[2][item] == 1) {
            pre[0].push({ id: item })
          } else {
            pre[1].push({ id: item })
          }
          return pre
        },
        [[], []]
      )
      objArr.push(res)
      this.nodesRect = objArr
      this.obj = obj
    },
    init() {
      return
      this.svg = d3
        .select(this.$refs.forceGuidance)
        .attr('width', this.width)
        .attr('height', this.height)
      this.svg.call(
        d3
          .zoom()
          .scaleExtent([0.1, 4])
          .on('zoom', (event) => {
            let { transform } = event
            this.content.transition().duration(10).attr('transform', transform)
          })
      )
      this.content = this.svg.append('g')
    },
    drawChart() {
      return
      this.actNode = ''
      this.content.selectAll('g.links').remove()
      this.content.selectAll('g.nodes').remove()
      if (this.nodesRect.length == 0) return
      let height = 550
      let width = 330
      let arr = []
      let nodes = []
      this.nodesRect.forEach((item, index) => {
        if (index == 0) {
          arr.push({
            width: width - 130,
            height: height,
            x: 50,
            y: 25
          })
          nodes.push(item)
        } else if (index == 1) {
          let len = item.reduce((pre, item) => {
            return pre + item.length
          }, 0)
          item.reduce((pre, ite) => {
            arr.push({
              width: width,
              height: height * (ite.length / len),
              x: 260,
              y: pre
            })

            nodes.push(ite)
            return pre + height * (ite.length / len)
          }, 25)
        } else if (index == 2) {
          let len = item.reduce((pre, item) => {
            return pre + item.length
          }, 0)
          item.reduce((pre, ite) => {
            arr.push({
              width: width * 2,
              height: height * (ite.length / len),
              x: 600,
              y: pre
            })
            nodes.push(ite)
            return pre + height * (ite.length / len)
          }, 25)
        }
      })
      console.log(arr, nodes, this.nodesRect)
      let rects = arr
      this.content
        .selectAll('rect')
        .data(rects)
        .enter()
        .append('rect')
        .attr('x', (d) => d.x) // 矩形的 x 坐标
        .attr('y', (d) => d.y) // 矩形的 y 坐标
        .attr('width', (d) => d.width) // 矩形的宽度
        .attr('height', (d) => d.height) // 矩形的高度
        .attr('stroke', 'black') // 边框颜色
        .attr('fill', 'transparent') // 填充颜色
      this.content.append('g').attr('class', 'links')
      let drawForceSimulation = async () => {
        let allNodes = JSON.parse(JSON.stringify(nodes))
        let promise = Promise.all(
          allNodes.map((nodes, index) => {
            return new Promise((resolve, reject) => {
              const rect = rects[index]
              const simulation = d3
                .forceSimulation(nodes)
                .force('charge', d3.forceManyBody().strength(-2))
                .force('center', d3.forceCenter(rect.x + rect.width / 2, rect.y + rect.height / 2)) // 将第一组布局放在左侧
                .force(
                  'collision',
                  d3.forceCollide().radius((d) => d.r + 5)
                )
                .alphaMin(0.1)
              const node = this.content
                .append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(nodes)
                .enter()
                .append('circle')
                .attr('r', (d) => 4)
                .attr('data-index', (d) => {
                  return d.id
                })
                .attr('stroke-width', 2)
                .attr('stroke', (d, i) => {
                  let node = this.guidanceColors.filter((item) => item.id == d.id)[0]
                  if (!node) return
                  let color = node.colors.length > 2 ? node.colors[2] : ''
                  return this.brush ? '' : color
                })
                .attr('fill', (d, index) => {
                  return this.brush
                    ? this.brushNode.includes(d.id)
                      ? 'green'
                      : 'gray'
                    : `url(#halfCHY_${d.id})`
                })
                .on('click', (event, d) => this.handleClick(d))
              simulation.on('tick', () => {
                node
                  .attr('cx', (d) => {
                    d.x = Math.max(rect.x, Math.min(rect.x + rect.width, d.x))
                    return d.x
                  })
                  .attr('cy', (d) => {
                    d.y = Math.max(rect.y, Math.min(rect.y + rect.height, d.y))
                    return d.y
                  })
              })
              simulation.on('end', resolve)
            })
          })
        )
        return promise
      }
      drawForceSimulation().then(this.drawLinks)
    },

    drawLinks() {
      return
      let nodeObj = {}
      this.content.select('g.links').selectAll('*').remove()
      this.content.selectAll('circle').each(function () {
        const cx = d3.select(this).attr('cx')
        const cy = d3.select(this).attr('cy')
        nodeObj[d3.select(this).attr('data-index')] = { x: cx, y: cy }
      })
      let linesData = this.links.map((link) => {
        let node1 = nodeObj[link.source]
        let node2 = nodeObj[link.target]
        return { ...link, x1: node1.x, y1: node1.y, x2: node2.x, y2: node2.y }
      })
      this.content
        .select('g.links')
        .selectAll('line')
        .data(linesData)
        .enter()
        .append('line')
        .attr('x1', (d) => d.x1)
        .attr('y1', (d) => d.y1)
        .attr('x2', (d) => d.x2)
        .attr('y2', (d) => d.y2)
        .attr('stroke', (d) => {
          if ([d.source, d.target, d.source + '', d.target + ''].includes(this.actNode)) {
            return '#ff0000'
          } else {
            return '#aaa'
          }
        })
        .attr('stroke-width', 1)
    },
    handleClick(id) {
      this.actNode = id
    }
  }
}
</script>
<style>
svg {
  background-color: #f0f0f0;
}

circle {
  cursor: pointer;
}
</style>
