<template>
  <div style="display: flex; margin: 0; padding: 0">
    <div style="display: block">
      <UploadFile></UploadFile>
      <input type="file" @change="handleFileChange" style="width: 270px;"/>
      <div style="display: flex; width: 270px;">

        <div style="margin-right: 5px">
          <v-responsive class="mx-auto" width="70">
            <v-text-field v-model="this.epoch1" hide-details="auto" label="epoch1"></v-text-field>
          </v-responsive>
        </div>

        <div style="margin-right: 10px">
          <v-responsive class="mx-auto" width="60">
            <v-text-field v-model="this.layer1" hide-details="auto" label="layer1"></v-text-field>
          </v-responsive>
        </div>

        <div style="margin-right: 5px">
          <v-responsive class="mx-auto" width="70">
            <v-text-field v-model="this.epoch2" hide-details="auto" label="epoch2"></v-text-field>
          </v-responsive>
        </div>

        <div>
          <v-responsive class="mx-auto" width="60">
            <v-text-field v-model="this.layer2" hide-details="auto" label="layer2"></v-text-field>
          </v-responsive>
        </div>
      </div>

      <div style="margin-bottom: 5px; width: 270px;">
        <v-col class="py-1" cols="12">
          <h3 style="margin-bottom: 5px">Distance:</h3>

          <v-btn-toggle v-model="toggle" divided>
            <v-btn @click="this.distance = 0">Euclidean</v-btn>
            <v-btn @click="this.distance = 1">cosine</v-btn>

          </v-btn-toggle>
        </v-col>
      </div>
      <div style="margin-bottom: 10px; width: 270px;">
        <h3 style="margin-bottom: 10px">K(k-nearset neighbours)：{{ value }}</h3>
        <v-slider v-model="value" min="1" max="500" step="1" style="width: 250px"></v-slider>

      </div>

      <div style="width: 265px;">
        <h3 style="margin-bottom: 10px">LNS Range：{{ sliderValues }}</h3>
        <v-range-slider v-model="sliderValues" strict min="0" max="1" step="0.01"></v-range-slider>
      </div>

      <div style="width: 270px; margin-top: 10px;">
        <v-btn @click="get_lns" style="width: 250px">确定</v-btn>
      </div>

      <div style="width: 270px; margin-top: 10px;">
        <!--        <v-btn @click="get_lns">确定</v-btn>-->
        <v-btn @click="requestForceGraphData" style="margin-right: 10px; width: 120px">更新数据集</v-btn>
        <v-btn @click="renderHistoricalDataset" v-if="nodesStorage['nodes']" style="width: 120px">历史数据集</v-btn>
      </div>

      <v-card style="width: 270px; height: 200px; margin-top: 10px;">
        <p style="margin-top: 5px; margin-left: 15px;">LNS Distribution:</p>

        <svg ref="chartContainer" width="250" height="160" style="margin-left: 10px" class="chartContainer"></svg>
      </v-card>

      <!-- <svg ref="chartContainer" width="270" height="200" style="margin-top: 10px"></svg> -->
      <v-card style="width: 270px; height: 170px; margin-top: 10px;">
        <p style="margin-top: 5px; margin-left: 15px;">Average Density:</p>
        <svg ref="rect" width="250" height="160" style="padding: 0; margin-left: 10px; "></svg>
      </v-card>
      <!-- <svg ref="rect" width="270" height="160" style="padding: 0; margin-top: 10px; "></svg> -->

    </div>
    <div class="container" style="width: 1100px;">
      <div style="margin-bottom: 0">
        <v-col class="py-2" cols="12">
          <h3 style="margin-bottom: 5px">Color:</h3>

          <v-btn-toggle v-model="text" color="deep-purple-accent-3" rounded="0" group>
            <v-btn @click="this.defaultDraw" style="margin-bottom: 4px;">position</v-btn>
            <v-btn @click="this.trueDraw" style="margin-left: 8px;">true label</v-btn>
            <v-btn @click="this.predictedDraw">predicted label</v-btn>
          </v-btn-toggle>
        </v-col>
        <div style="display: flex;">
          <v-btn @click="this.clickDraw" style="margin-left: 10px; margin-right: 20px; margin-top: 10px;">reset</v-btn>
          <v-switch label="brush" style="margin: 0; padding: 0;" @click="this.brushDraw"></v-switch>
        </div>

      </div>
      <svg ref="scatterPlot0" style="width:100%;height:1000px" class="scatterPlot0"></svg>
      <!--     <svg id="topology" width="400" height="350" style="padding: 0; margin: 0"> </svg>-->


      <svg ref="scatterPlot" style="height: 450px;" class="scatterPlot"></svg>
      <!--     <svg id="topology" width="400" height="350" style="padding: 0; margin: 0"> </svg>-->
      <div style="display: flex">
        <v-card style="height: 190px; width: 300px; margin-right: 150px; margin-left: 150px;">
          <p style="margin-left: 15px; margin-top: 5px;">All Scatters:</p>
          <svg ref="features1" width="300" height="200" style="margin-left: 30px;"></svg>
        </v-card>

        <v-card style="height: 190px; width: 300px; margin-left: 120px;">
          <p style="margin-left: 15px; margin-top: 5px;">All Scatters:</p>
          <svg ref="features2" width="300" height="200" style="margin-left: 30px;"></svg>
        </v-card>
        <!-- <svg ref="features1" width="310" height="210" style="padding: 0; margin-right: 75px; margin-left: 150px;"></svg> -->
        <!-- <svg ref="features2" width="310" height="210" style="padding: 0; margin-left: 150px;"></svg> -->
        <!-- <div>
          <svg ref="rect" width="310" height="210" style="padding: 0; margin-top: 10px; margin-left: 40px"></svg>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import {watch} from "vue";
import UploadFile from "@/views/UploadFile.vue";
import {Slider} from 'ant-design-vue';
import Papa from "papaparse";
import dataList from "@/views/data.js";


export default {
  components: {'a-slider': Slider, UploadFile},
  data() {
    return {
      forceChart: null,
      forceSvg: null,
      text: 0,
      toggle: 0,
      epoch1: 20,
      epoch2: 200,
      layer1: 1,
      layer2: 1,
      value: 50,
      distance: 1,//1为eu 2为cos
      from: 0.1,
      to: 0.3,
      scatter1: [],
      scatter2: [],
      lns: [],
      features1: [],
      features2: [],
      density1: [],
      density2: [],
      click_id: -1,
      nodes: [],
      links: [],
      disabled: false,
      sliderValues: [0.1, 0.3],
      trueLabel: [],
      Label: null,//all
      Label1: [],//predicted1
      Label2: [],//predicted2
      labelIndex: 0,//1为true,2为predicted
      collected: [], //选中的节点
      brush: false, //true为开启brush
      brush1: "",
      brushgroup: "",
      allNodes: [],
      allEdges: [],
      graph0Initialized: false,
      //result: data,
      nodesStorage: JSON.parse(window.localStorage.getItem('nodesStorage') || '{}'),
    }
  },

  mounted() {
    this.initForceSvg()

  },
  methods: {
    renderHistoricalDataset() {
      const colors0 = d3.scaleOrdinal(d3.schemeAccent);
      let {links, nodes} = this.nodesStorage
      console.log(this.nodesStorage)
      const nodeMap = nodes.reduce((pre, item) => {
        pre[item.id] = item
        return pre
      }, {})
      // 去除所有节点和边
      this.forceSvg.selectAll('*').remove();
      let link = this.forceSvg.append("g")
          .selectAll('line')
          .data(links)
          .enter().append("line")
          .attr("x1", (d) => nodeMap[d.source.id].x)
          .attr("x2", (d) => nodeMap[d.target.id].x)
          .attr("y1", (d) => nodeMap[d.source.id].y)
          .attr("y2", (d) => nodeMap[d.target.id].y)
          .attr("stroke", "#999")
          .attr("stroke-width", 1)
          .attr('stroke-opacity', 1)
          .attr('stroke-linecap', 'round')
          .attr('data-index', (_, i) => `${_.source.id}_${_.target.id}`)
      let node = this.forceSvg.append("g").selectAll('circle')
          .data(nodes)
          .enter().append("circle")
          .attr("transform", d => `translate(0,0)`)
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", (d) => 10)
          .attr("fill", (d, i) => colors0(i))
          .attr('stroke', '#fff')
          .attr('stroke-opacity', 1)
          .attr('stroke-width', 1.5)
          .attr('data-index', (d) => d.id)
          .on('click', this.handleSimGraphMouseClick)
    },
    get_lns() {
      // this.$axios.post('/userapi/get_lns/', {
      //   "k": this.value,
      //   "distance": this.distance,
      //   "from": this.sliderValues[0],
      //   "to": this.sliderValues[1],
      //   "epoch1": this.epoch1,
      //   "epoch2": this.epoch2,
      //   "layer1": this.layer1,
      //   "layer2": this.layer2,
      // }).then((response) => {
      let response = dataList                                                                
        d3.select(this.$refs.scatterPlot).selectAll("*").remove();
        d3.select(this.$refs.chartContainer).selectAll("*").remove();
        d3.select(this.$refs.features1).selectAll("*").remove();
        d3.select(this.$refs.features2).selectAll("*").remove();
        this.collected = []
        this.scatter1 = response.data.matrix1
        this.scatter2 = response.data.matrix2
        this.lns = response.data.lns
        this.features1 = response.data.features1
        this.features2 = response.data.features2
        this.density1 = response.data.density1
        this.density2 = response.data.density2
        this.click_id = -1
        this.allNodes = response.data.nodes
        this.allEdges = response.data.edges
        this.drawChart()
        this.drawHistogram()
      // })
    },
    //点击单个节点，淡化其它节点
    click_node() {
      console.log('click_node: ', this.click_id)
      this.$axios.post('/userapi/click_node/', {
        "id": this.click_id,
        "epoch1": this.epoch1,
        "epoch2": this.epoch1,
        "layer1": this.layer1,
        "layer2": this.layer2,
      })
          .then((response) => {
            const svg = d3.select('#topology');
            svg.selectAll("*").remove();
            this.links = response.data.link
            this.nodes = response.data.node
            d3.select(this.$refs.scatterPlot).selectAll("*").remove();
            this.drawChart()
          })
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      this.Label = file
      Papa.parse(file, {
        complete: (results) => {
          this.trueLabel = results.data[0];
          this.Label1 = results.data[this.epoch1];
          this.Label2 = results.data[this.epoch2];
        }
      })
    },
    defaultDraw() {
      this.labelIndex = 0;
      d3.select(this.$refs.scatterPlot).selectAll("*").remove();
      this.drawChart()
    },
    trueDraw() {
      this.labelIndex = 1;
      d3.select(this.$refs.scatterPlot).selectAll("*").remove();
      this.drawChart()
    },
    predictedDraw() {
      this.labelIndex = 2;
      d3.select(this.$refs.scatterPlot).selectAll("*").remove();
      this.drawChart()
    },
    clickDraw() {
      this.click_id = -1;
      d3.select(this.$refs.scatterPlot).selectAll("*").remove();
      this.collected = []
      this.drawChart()
    },
    brushDraw() {
      this.brush = !this.brush;
      d3.select(this.$refs.scatterPlot).selectAll(".brush").on("start", null)
          .on("brush", null)
          .on("end", null);
      d3.select(this.$refs.scatterPlot).selectAll(".brush").remove()
      d3.select(this.$refs.scatterPlot).selectAll("*").remove();
      this.collected = []
      this.drawChart()
    },
    handleSimGraphMouseClick(event, d) {
      const nodeId = event.target.dataset.index
      this.click_id = nodeId
      this.forceSvg.selectAll('line')
          .style("stroke", "#999")
          .style("stroke-width", 1)
          .style('stroke-opacity', 0.5)
          .style('stroke-linecap', 'round')

      // 高亮与该节点相关的边
      this.forceSvg.selectAll('line').filter(function (d) {
        return (d.source.id == nodeId || d.target.id == nodeId)
      })
          .style('stroke', 'red')
          .style('stroke-width', 3)
          .style('stroke-opacity', 1)
          .style('stroke-linecap', 'round')

      this.click_node()
    },

    // 画原图
    requestForceGraphData() {
      this.$axios.post('/userapi/get_db_graph/', {})
          .then((response) => {
            this.allNodes = response.data.nodes
            this.allEdges = response.data.edges
            this.renderForceSvg()
          })
    },
    renderForceSvg() {
      this.forceSvg.selectAll('*').remove();
      const width = 600
      const height = 600
      const colors0 = d3.scaleOrdinal(d3.schemeAccent);
      const nodes = this.allNodes.map(item => {
        return {...item, x: Math.random() * 1800, y: Math.random() * 1800,}
      })    //节点坐标随机初始化
      const links = JSON.parse(JSON.stringify(this.allEdges))
      const simulation = d3.forceSimulation(nodes)
          .force('link', d3.forceLink(links).id(d => d.id).distance(30).strength(0.2))
          .force('center', d3.forceCenter(width, height))
          .force("collide", d3.forceCollide().radius(20).strength(1))   //碰撞力
          .force('charge', d3.forceManyBody().strength(-20))
          .alphaMin(0.1)  //计算结束条件
      const nodeMap = nodes.reduce((pre, item) => {
        pre[item.id] = item
        return pre
      }, {})
      let link = this.forceSvg.append("g")  //画线
          .selectAll('line')
          .data(links)
          .enter().append("line")
          .attr("x1", (d) => nodeMap[d.source.id].x)
          .attr("y1", (d) => nodeMap[d.source.id].y)
          .attr("x2", (d) => nodeMap[d.target.id].x)
          .attr("y2", (d) => nodeMap[d.target.id].y)
          .attr("stroke", "#999")
          .attr("stroke-width", 1)
          .attr('stroke-opacity', 1)
          .attr('stroke-linecap', 'round')
          .attr('data-index', (_, i) => `${_.source.id}_${_.target.id}`)

      let node = this.forceSvg.append("g")  //画节点
          .selectAll('circle')
          .data(nodes)
          .enter().append("circle")
          .attr("transform", d => `translate(0,0)`)
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", (d) => 10)
          .attr("fill", (d, i) => colors0(i))
          .attr('stroke', '#fff')
          .attr('stroke-opacity', 1)
          .attr('stroke-width', 1.5)
          .attr('data-index', (d) => d.id)
          .on('click', this.handleSimGraphMouseClick)
      simulation.on('tick', () => { //监听，每次迭代计算更新坐标，动态展示
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
      }).on('end', () => {    //计算结束后，存为localStorage临时文件
        window.localStorage.setItem('nodesStorage', JSON.stringify({
          nodes,
          links
        }))
      });
    },
    renderEmbeddingAndDensityGraph() {
      this.$axios.post('/userapi/get_embedding_and_density_data/', {
        "k": this.value,
        "distance": this.distance,
        "from": this.sliderValues[0],
        "to": this.sliderValues[1],
        "epoch1": this.epoch1,
        "epoch2": this.epoch2,
        "layer1": this.layer1,
        "layer2": this.layer2,
      }).then((response) => {
        d3.select(this.$refs.scatterPlot).selectAll("*").remove();
        d3.select(this.$refs.chartContainer).selectAll("*").remove();
        d3.select(this.$refs.features1).selectAll("*").remove();
        d3.select(this.$refs.features2).selectAll("*").remove();
        this.collected = []
        this.scatter1 = response.data.matrix1
        this.scatter2 = response.data.matrix2
        this.lns = response.data.lns
        this.features1 = response.data.features1
        this.features2 = response.data.features2
        this.density1 = response.data.density1
        this.density2 = response.data.density2
        this.click_id = -1
        this.drawChart()
        this.drawHistogram()
      })
    },
    initForceSvg() {
      const width = 1000
      const height = 600
      let svg = d3.select(this.$refs.scatterPlot0)
          .attr("viewBox", [-width, -height, width * 4, height * 4])  //看的区域更大
          .attr("width", width)
          .attr("height", height)
          .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
          .call(d3.zoom()
              .scaleExtent([0.1, 4])  //放大缩小倍数
              .on("zoom", (event) => {    //处理放大缩小，监听zoom，所有操作记录在event中
                let {transform} = event;
                this.forceSvg.transition().duration(10).attr('transform', transform);
              }));
      this.forceSvg = svg.append("g")
    },
    // 散点图
    drawChart() {
      const sf = this
      const scatter1 = this.scatter1;
      const scatter2 = this.scatter2;
      const density1 = this.density1;
      const density2 = this.density2;

      // 创建SVG绘图区域的尺寸
      const width = 500;
      const height = 400;
      const margin = {top: 20, right: 20, bottom: 40, left: 40};
      const svgWidth = width * 2 + margin.left * 2 + margin.right * 2;
      const svgHeight = height + margin.top + margin.bottom;
      const max = Math.max(Math.max(...scatter1.map(item => item.x)), Math.max(...scatter1.map(item => item.y)));
      const min = Math.min(Math.min(...scatter1.map(item => item.x)), Math.min(...scatter1.map(item => item.y)));
      // 创建颜色比例尺
      const labScale = d3.scaleLinear()
          .domain([min, max])
          .range([-160, 160]);

      // 创建SVG元素
      const svg = d3.select(this.$refs.scatterPlot)
          .attr("width", svgWidth)
          .attr("height", svgHeight);

      // 创建散点图1的分组
      const scatter1Group = svg.append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // 创建散点图2的分组
      const scatter2Group = svg.append("g")
          .attr("transform", `translate(${margin.left + width + margin.right + 50}, ${margin.top})`);

      const xExtent = d3.extent([...scatter1, ...scatter2], d => d.x);

      // 创建x轴的比例尺（散点图1）
      const xScale1 = d3.scaleLinear()
          .domain(d3.extent(scatter1, d => d.x))
          .range([0, width]);

      // 创建y轴的比例尺（散点图1）
      const yScale1 = d3.scaleLinear()
          .domain(d3.extent(scatter1, d => d.y))
          .range([height, 0]);

      // 创建x轴（散点图1）
      scatter1Group.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(xScale1));

      // 创建y轴（散点图1）
      scatter1Group.append("g")
          .call(d3.axisLeft(yScale1));

      const colors2 = d3.scaleOrdinal(d3.schemeAccent);

      // 绘制散点图1
      if (sf.brush === false) {
        scatter1Group.selectAll("circle.scatter1")
            .data(scatter1)
            .enter()
            .append("circle")
            .attr("class", "scatter1")
            .attr("cx", d => xScale1(d.x))
            .attr("cy", d => yScale1(d.y))
            .attr("r", 5)
            .attr('data-index', (_, i) => i) // 将索引作为自定义属性绑定到元素上
            .style('fill',
                (d, i) => {
                  let originalColor = '';
                  if (sf.labelIndex === 0) originalColor = getPointColor(d, i);
                  else if (sf.labelIndex === 1) originalColor = colors2(sf.trueLabel[d.index]);
                  else originalColor = colors2(sf.Label1[d.index]);

                  if (sf.click_id === -1) {
                    // console.log('click click');
                    return originalColor;
                  } else {
                    for (let j = 0; j < sf.nodes.length; j++) {
                      if (d.index === sf.nodes[j].id) {
                        console.log('click click1: ', sf.nodes[j].id);
                        return originalColor;
                      }
                    }
                    return d3.color(originalColor).copy({opacity: 0.1});
                  }
                })
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut)
            .on('click', handleClick);
      } else {
        scatter1Group.selectAll("circle.scatter1")
            .data(scatter1)
            .enter()
            .append("circle")
            .attr("class", "scatter1")
            .attr("cx", d => xScale1(d.x))
            .attr("cy", d => yScale1(d.y))
            .attr("r", 5)
            .attr('data-index', (_, i) => i) // 将索引作为自定义属性绑定到元素上
            .style('fill',
                (d, i) => {
                  let originalColor = '';
                  if (sf.labelIndex === 0) originalColor = getPointColor(d, i);
                  else if (sf.labelIndex === 1) originalColor = colors2(sf.trueLabel[d.index]);
                  else originalColor = colors2(sf.Label1[d.index]);

                  if (sf.click_id === -1) {
                    // console.log('click click');
                    return originalColor;
                  } else {
                    for (let j = 0; j < sf.nodes.length; j++) {
                      if (d.index === sf.nodes[j].id) {
                        console.log('click click1: ', sf.nodes[j].id);
                        return originalColor;
                      }
                    }
                    return d3.color(originalColor).copy({opacity: 0.1});
                  }
                })
      }
      // 绘制散点图1点的连边 MARK
      if (sf.click_id !== -1) {
        // 将与点击节点相连的边添加到svg中
        const tempEdges = []
        // console.log('sf.click_id: ', sf.click_id)
        for (let j = 0; j < sf.links.length; j++) {
          if (checkScatter(sf.links[j].source) && checkScatter(sf.links[j].target)) {
            tempEdges.push(sf.links[j])
          }
        }

        scatter1Group.selectAll("line").remove()

        for (let j = 0; j < tempEdges.length; j++) {
          const sourceIndex = getIndex(tempEdges[j].source);
          const targetIndex = getIndex(tempEdges[j].target);
          const node1X = xScale1(scatter1[sourceIndex].x);
          const node1Y = yScale1(scatter1[sourceIndex].y);
          const node2X = xScale1(scatter1[targetIndex].x);
          const node2Y = yScale1(scatter1[targetIndex].y);

          scatter1Group.append("line")
              .attr("class", "connecting-line")
              .attr("x1", node1X)
              .attr("y1", node1Y)
              .attr("x2", node2X)
              .attr("y2", node2Y)
              .style("stroke", "red")
              .style("stroke-width", 2);
        }
      }


      // 创建x轴的比例尺（散点图2）
      const xScale2 = d3.scaleLinear()
          .domain(d3.extent(scatter2, d => d.x))
          .range([0, width]);

      // 创建y轴的比例尺（散点图2）
      const yScale2 = d3.scaleLinear()
          .domain(d3.extent(scatter2, d => d.y))
          .range([height, 0]);

      // 创建x轴（散点图2）
      scatter2Group.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(xScale2));

      // 创建y轴（散点图2）
      scatter2Group.append("g")
          .call(d3.axisRight(yScale2));

      // 绘制散点图2
      if (sf.brush === false) {
        scatter2Group.selectAll(".dot")
            .data(scatter2)
            .enter()
            .append("circle")
            .attr("class", "scatter2")
            .attr("cx", d => xScale2(d.x))
            .attr("cy", d => yScale2(d.y))
            .attr("r", 5)
            .attr('data-index', (_, i) => i) // 将索引作为自定义属性绑定到元素上
            .style('fill',
                (d, i) => {
                  let originalColor = '';
                  if (sf.labelIndex === 0) originalColor = getPointColor(d, i);
                  else if (sf.labelIndex === 1) originalColor = colors2(sf.trueLabel[d.index]);
                  else originalColor = colors2(sf.Label1[d.index]);
                  if (sf.click_id === -1) {
                    // console.log('click click');
                    return originalColor;
                  } else {
                    for (let j = 0; j < sf.nodes.length; j++) {
                      if (d.index === sf.nodes[j].id) {
                        console.log('click click2: ', sf.nodes[j].id);
                        return originalColor;
                      }
                    }
                    return d3.color(originalColor).copy({opacity: 0.1});
                  }
                })
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut)
            .on('click', handleClick);
      } else {
        scatter2Group.selectAll(".dot")
            .data(scatter2)
            .enter()
            .append("circle")
            .attr("class", "scatter2")
            .attr("cx", d => xScale2(d.x))
            .attr("cy", d => yScale2(d.y))
            .attr("r", 5)
            .attr('data-index', (_, i) => i) // 将索引作为自定义属性绑定到元素上
            .style('fill',
                (d, i) => {
                  let originalColor = '';
                  if (sf.labelIndex === 0) originalColor = getPointColor(d, i);
                  else if (sf.labelIndex === 1) originalColor = colors2(sf.trueLabel[d.index]);
                  else originalColor = colors2(sf.Label1[d.index]);
                  if (sf.click_id === -1) {
                    // console.log('click click');
                    return originalColor;
                  } else {
                    for (let j = 0; j < sf.nodes.length; j++) {
                      if (d.index === sf.nodes[j].id) {
                        console.log('click click2: ', sf.nodes[j].id);
                        return originalColor;
                      }
                    }
                    return d3.color(originalColor).copy({opacity: 0.1});
                  }
                })
      }
      // 绘制scatter2点的连边
      if (sf.click_id !== -1) {
        // 将与点击节点相连的边添加到svg中
        const tempEdges = []
        for (let j = 0; j < sf.links.length; j++) {
          if (checkScatter(sf.links[j].source) && checkScatter(sf.links[j].target)) {
            tempEdges.push(sf.links[j])
          }
        }

        scatter2Group.selectAll("line").remove()

        for (let j = 0; j < tempEdges.length; j++) {
          const sourceIndex = getIndex(tempEdges[j].source);
          const targetIndex = getIndex(tempEdges[j].target);
          const node1X = xScale2(scatter2[sourceIndex].x);
          const node1Y = yScale2(scatter2[sourceIndex].y);
          const node2X = xScale2(scatter2[targetIndex].x);
          const node2Y = yScale2(scatter2[targetIndex].y);

          scatter2Group.append("line")
              .attr("class", "connecting-line")
              .attr("x1", node1X)
              .attr("y1", node1Y)
              .attr("x2", node2X)
              .attr("y2", node2Y)
              .style("stroke", "red")
              .style("stroke-width", 2);
        }
      }


      if (sf.click_id !== -1) {
        for (let j = 0; j < sf.nodes.length; j++) {
          if (checkScatter(sf.nodes[j].id)) {
            const i = getIndex(sf.nodes[j].id);
            const node1X = xScale1(scatter1[i].x);
            const node1Y = yScale1(scatter1[i].y);
            const node2X = xScale2(scatter2[i].x);
            const node2Y = yScale2(scatter2[i].y);
            svg.append("line")
                .attr("class", "connecting-line")
                .attr("x1", node1X + margin.left)
                .attr("y1", node1Y + margin.top)
                .attr("x2", node2X + margin.left + width + margin.right + 50)
                .attr("y2", node2Y + margin.top)
                .style("stroke", "gray")
                .style("stroke-width", 1);

            // 选择对应的点元素并设置边界样式
            svg.append('circle')
                .attr("class", "connecting-c")
                .attr('cx', node1X + margin.left)
                .attr('cy', node1Y + margin.top)
                .attr('r', 5)
                .attr('fill', 'none')
                .attr('stroke', 'red')
                .attr('stroke-width', 2);

            svg.append('circle')
                .attr("class", "connecting-c")
                .attr('cx', node2X + margin.left + width + margin.right + 50)
                .attr('cy', node2Y + margin.top)
                .attr('r', 5)
                .attr('fill', 'none')
                .attr('stroke', 'red')
                .attr('stroke-width', 2);
          }
        }
      }

      function checkScatter(i) {
        for (let j = 0; j < scatter1.length; j++) {
          if (scatter1[j].index === i) {
            return true;
          }
        }
        return false;
      }

      function getIndex(i) {
        for (let j = 0; j < scatter1.length; j++) {
          if (scatter1[j].index === i) {
            return j;
          }
        }
      }

      function handleMouseOver() {
        const i = d3.select(this).attr('data-index');
        const node1X = xScale1(scatter1[i].x);
        const node1Y = yScale1(scatter1[i].y);

        const node2X = xScale2(scatter2[i].x);
        const node2Y = yScale2(scatter2[i].y);

        // 绘制线条
        svg.append("line")
            .attr("class", "connecting-line")
            .attr("x1", node1X + margin.left)
            .attr("y1", node1Y + margin.top)
            .attr("x2", node2X + margin.left + width + margin.right + 50)
            .attr("y2", node2Y + margin.top)
            .style("stroke", "gray")
            .style("stroke-width", 1);

        // 选择对应的点元素并设置边界样式
        svg.append('circle')
            .attr("class", "connecting-c")
            .attr('cx', node1X + margin.left)
            .attr('cy', node1Y + margin.top)
            .attr('r', 5)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 2);

        svg.append('circle')
            .attr("class", "connecting-c")
            .attr('cx', node2X + margin.left + width + margin.right + 50)
            .attr('cy', node2Y + margin.top)
            .attr('r', 5)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 2);
      }

      // 重染色后恢复连线
      for (let j = 0; j < sf.collected.length; j++) {
        let i = sf.collected[j]
        const node1X = xScale1(scatter1[i].x);
        const node1Y = yScale1(scatter1[i].y);

        const node2X = xScale2(scatter2[i].x);
        const node2Y = yScale2(scatter2[i].y);

        // 绘制线条
        svg.append("line")
            .attr("class", "connecting-line")
            .attr("x1", node1X + margin.left)
            .attr("y1", node1Y + margin.top)
            .attr("x2", node2X + margin.left + width + margin.right + 50)
            .attr("y2", node2Y + margin.top)
            .style("stroke", "gray")
            .style("stroke-width", 0.5);

        svg.append('circle')
            .attr("class", "connecting-c")
            .attr('cx', node1X + margin.left)
            .attr('cy', node1Y + margin.top)
            .attr('r', 5)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 2);

        svg.append('circle')
            .attr("class", "connecting-c")
            .attr('cx', node2X + margin.left + width + margin.right + 50)
            .attr('cy', node2Y + margin.top)
            .attr('r', 5)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 2);
      }

      function handleMouseOut() {
        d3.selectAll('.connecting-line').remove(); // 移除线条元素
        d3.selectAll('.connecting-c').remove(); // 移除线条元素
      }

      function getPointColor(d, i) {
        //const i = d3.select(this).attr('data-index');
        const a = labScale(scatter1[i].x);
        const b = labScale(scatter1[i].y);
        const l = 60;
        return d3.lab(l, a, b).formatHex();
      }

      function handleClick() {
        const i = d3.select(this).attr('data-index');
        sf.click_id = scatter1[i].index
        sf.click_node()
      }

      if (sf.brush === true) {
        sf.brush1 = d3.brush()
            .extent([[0, 0], [width + margin.left + width + margin.right + 100, height + 50]])
            .on('start', brushStarted1)
            .on('end', brushed1)
        //.on('end', brushEnded1);
        sf.brushGroup = svg.call(sf.brush1);
        let collected = []
        let collected1 = []

        function brushStarted1() {
          //brushGroup = svg.call(brush1);
          d3.selectAll('.connecting-line').remove(); // 移除线条元素
          d3.selectAll('.connecting-c').remove(); // 移除线条元素
          d3.select(sf.$refs.rect).selectAll("*").remove();
          collected = []
        }

        function brushed1(event) {
          const selection = event.selection;
          const [x0, y0] = selection[0];
          const [x1, y1] = selection[1];

          const actualX0 = x0 - margin.left
          const actualY0 = y0 - margin.top
          const actualX1 = x1 - margin.left
          const actualY1 = y1 - margin.top
          if (sf.collected.length > 0) collected1 = []

          if (actualX0 <= 569 && actualX1 <= 569) {
            scatter1Group.selectAll("circle").each(function (d, i) {
              const dot = d3.select(this);
              const cx = +dot.attr('cx'); // 获取cx属性值
              const cy = +dot.attr('cy'); // 获取cy属性值

              console.log(actualX0, actualY0, actualX1, actualY1, cx, cy);
              if (cx >= actualX0 && cx <= actualX1 && cy >= actualY0 && cy <= actualY1) {
                collected.push(d.index);
                collected1.push(i)
                // console.log(x0, y0, x1, y1, cx, cy);
                const node1X = xScale1(scatter1[i].x);
                const node1Y = yScale1(scatter1[i].y);

                const node2X = xScale2(scatter2[i].x);
                const node2Y = yScale2(scatter2[i].y);

                // 绘制线条
                svg.append("line")
                    .attr("class", "connecting-line")
                    .attr("x1", node1X + margin.left)
                    .attr("y1", node1Y + margin.top)
                    .attr("x2", node2X + margin.left + width + margin.right + 50)
                    .attr("y2", node2Y + margin.top)
                    .style("stroke", "gray")
                    .style("stroke-width", 0.5);

                svg.append('circle')
                    .attr("class", "connecting-c")
                    .attr('cx', node1X + margin.left)
                    .attr('cy', node1Y + margin.top)
                    .attr('r', 5)
                    .attr('fill', 'none')
                    .attr('stroke', 'red')
                    .attr('stroke-width', 2);

                svg.append('circle')
                    .attr("class", "connecting-c")
                    .attr('cx', node2X + margin.left + width + margin.right + 50)
                    .attr('cy', node2Y + margin.top)
                    .attr('r', 5)
                    .attr('fill', 'none')
                    .attr('stroke', 'red')
                    .attr('stroke-width', 2);

              }
            })
          } else if (actualX0 >= 501 && actualX1 >= 501) {
            console.log("2")
            scatter2Group.selectAll("circle").each(function (d, i) {
              const dot = d3.select(this);
              const cx = +dot.attr('cx'); // 获取cx属性值
              const cy = +dot.attr('cy'); // 获取cy属性值

              console.log(actualX0, actualY0, actualX1, actualY1, cx, cy);
              if (cx + 570 >= actualX0 && cx + 570 <= actualX1 && cy >= actualY0 && cy <= actualY1) {
                collected.push(d.index);
                collected1.push(i)
                // console.log(x0, y0, x1, y1, cx, cy);
                const node1X = xScale1(scatter1[i].x);
                const node1Y = yScale1(scatter1[i].y);

                const node2X = xScale2(scatter2[i].x);
                const node2Y = yScale2(scatter2[i].y);

                // 绘制线条
                svg.append("line")
                    .attr("class", "connecting-line")
                    .attr("x1", node1X + margin.left)
                    .attr("y1", node1Y + margin.top)
                    .attr("x2", node2X + margin.left + width + margin.right + 50)
                    .attr("y2", node2Y + margin.top)
                    .style("stroke", "gray")
                    .style("stroke-width", 0.5);

                svg.append('circle')
                    .attr("class", "connecting-c")
                    .attr('cx', node1X + margin.left)
                    .attr('cy', node1Y + margin.top)
                    .attr('r', 5)
                    .attr('fill', 'none')
                    .attr('stroke', 'red')
                    .attr('stroke-width', 2);

                svg.append('circle')
                    .attr("class", "connecting-c")
                    .attr('cx', node2X + margin.left + width + margin.right + 50)
                    .attr('cy', node2Y + margin.top)
                    .attr('r', 5)
                    .attr('fill', 'none')
                    .attr('stroke', 'red')
                    .attr('stroke-width', 2);

              }
            })
          }


          sf.collected = collected1
          console.log(sf.collected)
          let d1 = 0;
          let d2 = 0;
          for (let i = 0; i < collected.length; i++) {
            d1 += density1[collected[i]];
            d2 += density2[collected[i]];
          }
          let den = [];
          den.push(d1 / collected.length)
          den.push(d2 / collected.length)
          console.log(den)
          const svg3 = d3.select(sf.$refs.rect);
          const yScale3 = d3.scaleLinear()
              .domain([0, d3.max(den)])
              .range([100, 0]);

          const xScale3 = d3.scaleBand()
              .domain(["emb1", "emb2"])
              .range([0, 200])
              .padding(0.3);

          svg3.selectAll("rect")
              .data(den)
              .enter()
              .append("rect")
              .attr("x", (d, i) => xScale3(xScale3.domain()[i]) + 14)
              .attr("y", (d) => yScale3(d))
              .attr("width", xScale3.bandwidth() - 28)
              .attr("height", (d) => 100 - yScale3(d))
              .attr("fill", "blue");

          const xAxis3 = d3.axisBottom(xScale3);
          const yAxis3 = d3.axisLeft(yScale3);

          svg3.append("g")
              .attr("class", "x-axis")
              .attr("transform", `translate(0,${100})`)
              .call(xAxis3);

          svg3.append("g")
              .attr("class", "y-axis")
              .call(yAxis3);
        }
      }
    },

    // 分布图
    drawHistogram() {
      const data = this.lns
      const features1 = this.features1
      const features2 = this.features2

      const svg = d3.select(this.$refs.chartContainer);
      const svg1 = d3.select(this.$refs.features1);
      const svg2 = d3.select(this.$refs.features2);

      const margin = {top: 20, right: 20, bottom: 50, left: 50};
      const width = 300 - margin.left - margin.right;
      const height = 200 - margin.top - margin.bottom;

      const yScale = d3.scaleLinear()
          .domain([0, d3.max(this.countDataInIntervals(data))])
          .range([height, 0]);

      const xScale = d3.scaleBand()
          .domain(["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"])
          .range([0, width])
          .padding(0.2);

      const histogram = d3.histogram()
          .domain(yScale.domain())
          .thresholds([0, 0.2, 0.4, 0.6, 0.8, 1.0]);

      const bins = histogram(data);

      const colorScale = d3.scaleOrdinal()
          .domain(["0", "1", "2", "3", "4"])
          .range(["#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#eff3ff"]);

      svg.selectAll("rect")
          .data(bins)
          .enter()
          .append("rect")
          .attr("x", (d, i) => xScale(xScale.domain()[i]))
          .attr("y", (d) => yScale(d.length))
          .attr("width", xScale.bandwidth())
          .attr("height", (d) => height - yScale(d.length))
          .attr("fill", (d, i) => colorScale(i));

      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis);

      svg.append("g")
          .attr("class", "y-axis")
          .call(yAxis);

      const xScale1 = d3.scaleLinear()
          .domain([d3.min(features1, (d) => d[0]), d3.max(features1, (d) => d[0])])
          .range([0, width]);

      const yScale1 = d3.scaleLinear()
          .domain([d3.min(features1, (d) => d[1]), d3.max(features1, (d) => d[1])])
          .range([height, 0]);

      svg1.selectAll("body")
          .data(features1)
          .enter()
          .append("circle")
          .attr("cx", (d) => xScale1(d[0]))
          .attr("cy", (d) => yScale1(d[1]))
          .attr("r", 2.5)
          .attr("fill", (d, i) => colorScale(this.searchColor(data[i])));

      const xScale2 = d3.scaleLinear()
          .domain([d3.min(features2, (d) => d[0]), d3.max(features2, (d) => d[0])])
          .range([0, width + 10]);

      const yScale2 = d3.scaleLinear()
          .domain([d3.min(features2, (d) => d[1]), d3.max(features2, (d) => d[1])])
          .range([height + 10, 0]);

      svg2.selectAll("circle")
          .data(features2)
          .enter()
          .append("circle")
          .attr("cx", (d) => xScale2(d[0]))
          .attr("cy", (d) => yScale2(d[1]))
          .attr("r", 2.5)
          .attr("fill", (d, i) => colorScale(this.searchColor(data[i])));

    },
    // 直方图高度
    countDataInIntervals(data) {
      const intervals = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
      const counts = [0, 0, 0, 0, 0, 0];

      data.forEach((value) => {
        for (let i = 0; i < intervals.length; i++) {
          if (value * 100 <= intervals[i] * 100) {
            counts[i]++;
            break;
          }
        }
      });

      return counts;
    },
    // 直方图对应颜色
    searchColor(val) {
      if (val >= 0 && val <= 0.2) return 0;
      else if (val > 0.2 && val <= 0.4) return 1;
      else if (val > 0.4 && val <= 0.6) return 2;
      else if (val > 0.6 && val <= 0.8) return 3;
      else return 4;
    },

    //
    calDensity(data) {
      let d1 = 0;
      let d2 = 0;
      for (let i = 0; i < data.length; i++) {
        d1 += this.density1[data[i]];
        d2 += this.density2[data[i]];
      }
      return [d1 / data.length, d2 / data.length];
    },
    // 拓扑子图
    draw() {
      console.log("draw")
      console.log(this.nodes)
      console.log(this.links)
      const svg = d3.select('#topology');
      const width = svg.attr('width');
      const height = svg.attr('height');

      const labScale = d3.scaleLinear()
          .domain([0, 1])
          .range([-160, 160]);

      const simulation = d3.forceSimulation(this.nodes)
          .force('link', d3.forceLink(this.links).id(d => d.id).distance(200))
          .force('charge', d3.forceManyBody())
          .force('center', d3.forceCenter(width / 2, height / 2));


      const link = svg.selectAll('line')
          .data(this.links)
          .enter()
          .append('line')
          .attr('stroke', '#ccc')
          .attr('stroke-width', 1);

      const gradient = svg.append('defs')
          .selectAll('linearGradient')
          .data(this.nodes)
          .enter()
          .append('linearGradient')
          .attr('id', d => `half-circle-${d.id}`)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '0%');

      gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', getPointColor1);

      gradient.append('stop')
          .attr('offset', '50%')
          .attr('stop-color', getPointColor1);

      gradient.append('stop')
          .attr('offset', '50%')
          .attr('stop-color', getPointColor1);

      gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', getPointColor1);

      const node = svg.selectAll('circle')
          .data(this.nodes)
          .enter()
          .append('circle')
          .attr('r', 8)
          .attr('fill', d => `url(#half-circle-${d.id})`);

      node.append('title')
          .text(d => d.name);


      function getPointColor1(d) {
        const a = labScale(d.x1);
        const b = labScale(d.y1);
        const l = 60;
        return d3.lab(l, a, b).formatHex();
      }

      function getPointColor2(d) {
        const a = labScale(d.x2);
        const b = labScale(d.y2);
        const l = 60;
        return d3.lab(l, a, b).formatHex();
      }

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
  watch: {
    epoch1(newValue, oldValue) {
      if (this.Label != null) {
        Papa.parse(this.Label, {
          complete: (results) => {
            this.Label1 = results.data[newValue];
          }
        })
        console.log(this.Label1)
      }
    },
    epoch2(newValue, oldValue) {
      if (this.Label != null) {
        Papa.parse(this.Label, {
          complete: (results) => {
            this.Label2 = results.data[newValue];
          }
        })
        console.log(this.Label2)
      }
    },
  },

}
</script>

<style scoped>
svg {
  transform: translate3d(0, 0, 0);
  /* 强制使用GPU加速 */
}

.link {
}

.node {
}
</style>