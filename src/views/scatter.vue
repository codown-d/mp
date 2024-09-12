<template>
  <div >
    <svg ref="scatterPlot"></svg>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  mounted() {
    this.drawChart();
  },
  methods: {
    drawChart() {
      // 设置散点图的数据
      const scatter1 = [{x: 50, y: 50}, {x: 80, y: 100}, {x: 30, y: 88}];
      const scatter2 = [{x: 101, y: 120}, {x: 100, y: 55}, {x: 10, y: 50}];

      // 创建SVG绘图区域的尺寸
      const width = 300;
      const height = 225;
      const margin = {top: 20, right: 20, bottom: 40, left: 40};
      const svgWidth = width * 2 + margin.left * 2 + margin.right * 2;
      const svgHeight = height * 2 + margin.top + margin.bottom;

      // 创建SVG元素
      const svg = d3.select(this.$refs.scatterPlot)
          .attr("width", svgWidth)
          .attr("height", svgHeight);

      // 创建散点图1的分组
      const scatter1Group = svg.append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // 创建散点图2的分组
      const scatter2Group = svg.append("g")
          .attr("transform", `translate(${margin.left + width + margin.right}, ${margin.top})`);

      // 创建x轴的比例尺（散点图1）
      const xScale1 = d3.scaleLinear()
          .domain([0, d3.max(scatter1, d => d.x)])
          .range([0, width]);

      // 创建y轴的比例尺（散点图1）
      const yScale1 = d3.scaleLinear()
          .domain([0, d3.max(scatter1, d => d.y)])
          .range([height, 0]);

      // 创建x轴（散点图1）
      scatter1Group.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(xScale1));

      // 创建y轴（散点图1）
      scatter1Group.append("g")
          .call(d3.axisLeft(yScale1));

      // 绘制散点图1
      scatter1Group.selectAll("circle.scatter1")
          .data(scatter1)
          .enter()
          .append("circle")
          .attr("class", "scatter1")
          .attr("cx", d => xScale1(d.x))
          .attr("cy", d => yScale1(d.y))
          .attr("r", 5)
          .style("fill", "red");

      // 创建x轴的比例尺（散点图2）
      const xScale2 = d3.scaleLinear()
          .domain([0, d3.max(scatter2, d => d.x)])
          .range([0, width]);

      // 创建y轴的比例尺（散点图2）
      const yScale2 = d3.scaleLinear()
          .domain([0, d3.max(scatter2, d => d.y)])
          .range([height, 0]);

      // 创建x轴（散点图2）
      scatter2Group.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(xScale2));

      // 创建y轴（散点图2）
      scatter2Group.append("g")
          .call(d3.axisLeft(yScale2));

      // 绘制散点图2
      scatter2Group.selectAll("circle.scatter2")
          .data(scatter2)
          .enter()
          .append("circle")
          .attr("class", "scatter2")
          .attr("cx", d => xScale2(d.x))
          .attr("cy", d => yScale2(d.y))
          .attr("r", 5)
          .style("fill", "blue");

      // 连线（散点图1和散点图2）
      for (let i = 0; i < scatter1.length; i++) {
        const node1X = xScale1(scatter1[i].x);
        const node1Y = yScale1(scatter1[i].y);

        const node2X = xScale2(scatter2[i].x);
        const node2Y = yScale2(scatter2[i].y);


        // 绘制线条
        svg.append("line")
            .attr("x1", node1X + margin.left)
            .attr("y1", node1Y + margin.top)
            .attr("x2", node2X + margin.left + width + margin.right)
            .attr("y2", node2Y + margin.top)
            .style("stroke", "gray")
            .style("stroke-width", 1);
      }

    }
  }
}
</script>