<template>
  <div>
    <svg ref="forceGuidance"></svg>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  data() {
    return {
      nodes: [
        [{ id: 'node0' }],
        [{ id: 'node1' }, { id: 'node2' }, { id: 'node3' }, { id: 'node4' }, { id: 'node5' }],
        [{ id: 'nodeA' }, { id: 'nodeB' }, { id: 'nodeC' }]
      ],
      links: [
        [],
        [
          { source: 'node1', target: 'node2' },
          { source: 'node2', target: 'node3' }
        ],
        [
          { source: 'nodeA', target: 'nodeB' },
          { source: 'nodeB', target: 'nodeC' }
        ]
      ],
      width: 900,
      height: 600,
      svg: null
    }
  },
  mounted() {
    this.init()
    this.drawChart()
  },
  methods: {
    init() {
      this.svg = d3
        .select(this.$refs.forceGuidance)
        .attr('width', this.width)
        .attr('height', this.height)
      console.log(this.svg)
    },
    drawChart() {
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
      this.nodes.forEach((item, index) => {
        const rect = rects[index]
        const nodes = this.nodes[index]
        const links = this.links[index]
        const simulation = d3
          .forceSimulation(nodes)
          .force(
            'link',
            d3.forceLink(links).id((d) => d.id)
          )
          .force('charge', d3.forceManyBody().strength(-10))
          .force('center', d3.forceCenter(rect.x + rect.width / 2, rect.y + rect.height / 2)) // 将第一组布局放在左侧
          .force(
            'collision',
            d3.forceCollide().radius((d) => d.r + 5)
          )
        const link = this.svg
          .append('g')
          .attr('class', 'links' + index)
          .selectAll('line')
          .data(links)
          .enter()
          .append('line')

        const node = this.svg
          .append('g')
          .attr('class', 'nodes' + index)
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
              d.x = Math.max(rect.x, Math.min(rect.x + rect.width, d.x))
              return d.x
            })
            .attr('cy', (d) => {
              d.y = Math.max(rect.y, Math.min(rect.y + rect.height, d.y))
              return d.y
            })
          link
            .attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y)
        })
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
