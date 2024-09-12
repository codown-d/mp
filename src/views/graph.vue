<template>
  <div style="width: 100%; height: 100vh">
    <svg id="tp" width="1600" height="1100" style="padding: 0; margin: 0"> </svg>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { watch } from 'vue';

export default {
  name: "topology",
  data() {
    return {
      nodes: [],
      links: [],
    }
  },
  methods: {
    get_link() {
      this.$axios.post('/userapi/get_link/')
          .then((response) => {
            console.log("response:", response)
            this.links = response.data.link
            console.log("this.links", this.links)
          })
    },
    get_node() {
      this.$axios.post('/userapi/get_node/')
          .then((response) => {
            console.log("response:", response)
            this.nodes = response.data.node
          })
    },
    draw() {
      console.log("draw:nodes",this.nodes)
      console.log("draw links",this.links)
      const svg = d3.select('#tp');
      const width = svg.attr('width');
      const height = svg.attr('height');

      const simulation = d3.forceSimulation(this.nodes)
          .force('link', d3.forceLink(this.links).id(d => d.id).distance(300))
         // .force('charge', d3.forceManyBody())
          .force('center', d3.forceCenter(width / 2 - 200 , 550));


      const link = svg.selectAll('line')
          .data(this.links)
          .enter()
          .append('line')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1);

      const node = svg.selectAll('circle')
          .data(this.nodes)
          .enter()
          .append('circle')
          .attr('r', 4)
          .attr('fill', 'red');

      node.append('title')
          .text(d => d.name);

      simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
      });
    },
  },
  created() {
    this.get_node()
   this.get_link()



  },
  mounted() {

    watch(() => this.links + this.nodes, (linkVal, nodeVal) => {

      if (linkVal.length > 0 && nodeVal.length > 0) {

        this.draw();
      }
    }, { immediate: true });

  }
}
</script>