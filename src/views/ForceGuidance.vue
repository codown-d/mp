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
      default: []
    }
  },
  data() {
    return {
      nodes: [],
      links: [],
      width: 900,
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
        this.drawChart()
      }
    },
    result_nodes: {
      handler(newValue) {
        this.nodes = Object.keys(newValue).reduce((pre, item, index) => {
          return pre.concat(newValue[item].map((ite) => ({ id: ite, category: index })))
        }, [])
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
          width: 250,
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
      const nodes = this.nodes
      const links = this.links
      if (nodes.length == 0) return
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          'link',
          d3
            .forceLink(links)
            .id((d) => {
              return d.id
            })
            .distance(300)
        )
        .force('charge', d3.forceManyBody().strength(-150))
        .force('center', d3.forceCenter(this.width / 2, this.height / 2)) // 将第一组布局放在左侧
        .force(
          'collision',
          d3.forceCollide().radius((d) => d.r + 5)
        )
        .alphaMin(0.1)
      const link = this.svg
        .append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')

      const node = this.svg
        .append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', (d) => 6)
        .attr('fill', 'steelblue')
        .call(
          d3
            .drag()
            .on('start', dragStarted(simulation))
            .on('drag', dragged)
            .on('end', dragEnded(simulation))
        )
      simulation.on('tick', () => {
        node
          .attr('cx', (d) => {
            const rect = rects[d.category]
            d.x = Math.max(rect.x, Math.min(rect.x + rect.width, d.x))
            return d.x
          })
          .attr('cy', (d) => {
            const rect = rects[d.category]
            d.y = Math.max(rect.y, Math.min(rect.y + rect.height, d.y))
            return d.y
          })
        link
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y)
      })
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
