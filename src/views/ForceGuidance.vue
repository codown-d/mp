<template>
  <div>
    <svg ref="forceGuidance"></svg>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  props: {
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
    }
  },
  data() {
    return {
      nodes: [],
      links: [],
      width: 1400,
      height: 600,
      svg: null
    }
  },
  mounted() {
    this.init()
  },

  watch: {
    result_edge: {
      handler(newValue) {
        this.links = [...newValue]
        console.log(this.links)
        this.drawChart()
      }
    },
    result_nodes: {
      handler(newValue) {
        console.log(123,newValue)
        this.nodes = Object.keys(newValue).reduce((pre, item) => {
          pre.push(
            newValue[item].map((ite) => ({
              id: ite
            }))
          )
          return pre
        }, [])
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
    init() {
      this.svg = d3
        .select(this.$refs.forceGuidance)
        .attr('width', this.width)
        .attr('height', this.height)
    },
    drawChart() {
      this.svg.selectAll('*').remove()
      console.log(this.nodes)
      if (this.nodes.length == 0) return
      let rects = [
        {
          width: 200,
          height: 500,
          x: 50,
          y: 50
        },
        {
          width: 250,
          height: 500,
          x: 300,
          y: 50
        },
        {
          width: 750,
          height: 500,
          x: 600,
          y: 50
        }
      ]
      this.svg
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
        this.svg.append('g').attr('class', 'links')
      const links = this.links
      let drawForceSimulation = async () => {
        let allNodes = JSON.parse(JSON.stringify(this.nodes)) 
        let promise = Promise.all(
          allNodes.map((nodes, index) => {
            return new Promise((resolve, reject) => {
              const rect = rects[index]
              const simulation = d3
                .forceSimulation(nodes)
                .force('charge', d3.forceManyBody().strength(-10))
                .force('center', d3.forceCenter(rect.x + rect.width / 2, rect.y + rect.height / 2)) // 将第一组布局放在左侧
                .force(
                  'collision',
                  d3.forceCollide().radius((d) => d.r + 5)
                )
                .alphaMin(0.1)
              const node = this.svg
                .append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(nodes)
                .enter()
                .append('circle')
                .attr('r', (d) => 6)
                .attr('data-index', (d) => {
                  return d.id
                })
                .attr('fill', (d) => {
                  return this.brushNode.includes(d.id) ? 'green' : 'gray'
                })
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
      let drawLinks = () => {
        let nodeObj = {}
        this.svg.select('g.links').selectAll("*").remove()
        this.svg.selectAll('circle').each(function () {
          const cx = d3.select(this).attr('cx')
          const cy = d3.select(this).attr('cy')
          nodeObj[d3.select(this).attr('data-index')] = { x: cx, y: cy }
        })
        let linesData = links.map((link) => {
          let node1 = nodeObj[link.source]
          let node2 = nodeObj[link.target]
          return { ...link, x1: node1.x, y1: node1.y, x2: node2.x, y2: node2.y }
        })
        this.svg.select('g.links')
          .selectAll("line")
          .data(linesData)
          .enter()
          .append("line")
          .attr("x1", d => d.x1)
          .attr("y1", d => d.y1)
          .attr("x2", d => d.x2)
          .attr("y2", d => d.y2)
          .attr("stroke", "gray")
          .attr("stroke-width", 1);
      }
      drawForceSimulation().then(drawLinks)
      function dragStarted(simulation) {
        return (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        }
      }

      function dragged(event, d) {
        d.fx = event.x
        d.fy = event.y
      }

      function dragEnded(simulation) {
        setTimeout(drawLinks, 0)
        return (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }
      }
    }
  }
}
</script>
<style>
svg {
  background-color: #f0f0f0;
}

line {
  stroke: #999;
  stroke-width: 2;
}

circle {
  cursor: pointer;
}
</style>
