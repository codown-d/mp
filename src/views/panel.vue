<template>
  <div style="display: flex; margin: 0; padding: 0; width: 100%; height: 100%">
    <div
      style="
        display: block;
        width: 300px;
        position: fixed;
        z-index: 9;
        background: #fff;
        top: 0;
        padding-top: 20px;
        overflow: hidden;
        overflow-y: auto;
        height: 100%;
      "
    >
      <div style="width: 100%">
        <UploadFile></UploadFile>
        <input
          type="file"
          @change="(event) => handleFileChange(event, 'file1')"
          style="width: 270px"
        />
        <input
          type="file"
          @change="(event) => handleFileChange(event, 'file2')"
          style="width: 270px"
        />
        <div style="display: flex; width: 270px">
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

        <div style="margin-bottom: 5px; width: 270px">
          <v-col class="py-1" cols="12">
            <h3 style="margin-bottom: 5px">Distance:</h3>

            <v-btn-toggle v-model="toggle" divided>
              <v-btn @click="this.distance = 0">Euclidean</v-btn>
              <v-btn @click="this.distance = 1">cosine</v-btn>
            </v-btn-toggle>
          </v-col>
        </div>
        <div style="margin-bottom: 10px; width: 270px">
          <h3 style="margin-bottom: 10px">K(k-nearset neighbours)：{{ value }}</h3>
          <v-slider v-model="value" min="1" max="500" step="1" style="width: 250px"></v-slider>
        </div>

        <div style="width: 265px">
          <h3 style="margin-bottom: 10px">LNS Range：{{ sliderValues }}</h3>
          <v-range-slider
            v-model="sliderValues"
            strict
            min="0"
            max="1"
            step="0.01"
          ></v-range-slider>
        </div>

        <div style="width: 270px; margin-top: 10px">
          <v-btn @click="get_lns" style="width: 250px">确定</v-btn>
        </div>

        <div style="width: 270px; margin-top: 10px">
          <!--        <v-btn @click="get_lns">确定</v-btn>-->
          <v-btn @click="requestForceGraphData" style="margin-right: 10px; width: 120px"
            >更新数据集</v-btn
          >
          <v-btn @click="renderHistoricalDataset" v-if="nodesStorage['nodes']" style="width: 120px"
            >历史数据集</v-btn
          >
        </div>
        <div style="margin-top: 10px">
          <v-btn @click="brushInit" style="margin-right: 10px; width: 120px">清除brush</v-btn>
        </div>

        <v-card style="width: 270px; height: 200px; margin-top: 10px">
          <p style="margin-top: 5px; margin-left: 15px">LNS Distribution:</p>

          <svg
            ref="chartContainer"
            width="250"
            height="160"
            style="margin-left: 10px"
            class="chartContainer"
          ></svg>
        </v-card>
        <v-card style="width: 270px; height: 170px; margin-top: 10px">
          <p style="margin-top: 5px; margin-left: 15px">Average Density:</p>
          <svg ref="rect" width="250" height="160" style="padding: 0; margin-left: 10px"></svg>
        </v-card>
      </div>
    </div>
    <div class="container" style="width: 0; flex: 1; padding-left: 310px">
      <div
        style="
          position: fixed;
          z-index: 9;
          top: 0;
          padding-top: 20px;
          background: #fff;
          width: 100%;
          display: flex;
          align-items: center;
        "
      >
        <v-btn-toggle v-model="text" color="deep-purple-accent-3" rounded="0" group>
          <v-btn @click="drawFn(0)" style="margin-bottom: 4px">position</v-btn>
          <v-btn @click="drawFn(1)" style="margin-left: 8px">true label</v-btn>
          <v-btn @click="drawFn(2)">predicted label</v-btn>
        </v-btn-toggle>
        <v-btn @click="clickDraw" style="margin-left: 10px; margin-right: 20px">reset</v-btn>
        <v-switch
          style="height: 44px; margin-top: -10px"
          label="brush"
          v-model="brush"
          @click="brushInit"
        ></v-switch>
      </div>

      <div style="padding-top: 68px">
        <div style="width: 100%">
          <chart-plot
            ref="childComponent1"
            :brushList="brushList"
            :dataList="dataList"
            :width="scatterPlotW"
            :height="0.5 * scatterPlotW"
            @click-node="(data) => clickNode(data)"
          ></chart-plot>
        </div>
      </div>
      <a-tabs>
        <a-tab-pane key="1" tab="策略1">
          <force-guidance
            :result_edge="forceData.result_edge"
            :result_nodes="forceData.result_nodes"
            :brushNode="brushNode"
            :guidanceColors="guidanceColors"
          ></force-guidance>
        </a-tab-pane>
        <a-tab-pane key="2" tab="策略2">
          <hierarchy-guidance
            :dataList="hierarchyData"
            :result_edge="forceData.result_edge"
            :result_nodes="forceData.result_nodes"
            :brushNode="brushNode"
            :guidanceColors="guidanceColors"
          ></hierarchy-guidance>
        </a-tab-pane>
      </a-tabs>

      <div>
        <a-input v-model:value="inputVal" placeholder="点击id" style="width: 200px" />
        <span v-if="click_id != -1">节点id：{{ click_id }}</span>
        <a-switch v-model:checked="compareVal" />
      </div>

      <svg ref="scatterPlot" style="height: 450px" class="scatterPlot"></svg>
      <div style="display: flex">
        <v-card style="height: 190px; width: 300px; margin-right: 150px; margin-left: 150px">
          <p style="margin-left: 15px; margin-top: 5px">All Scatters:</p>
          <svg ref="features1" width="300" height="200" style="margin-left: 30px"></svg>
        </v-card>

        <v-card style="height: 190px; width: 300px; margin-left: 120px">
          <p style="margin-left: 15px; margin-top: 5px">All Scatters:</p>
          <svg ref="features2" width="300" height="200" style="margin-left: 30px"></svg>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import UploadFile from '@/views/UploadFile.vue'
import { Slider } from 'ant-design-vue'
import Papa from 'papaparse'
import dataList from '@/views/data.js'
import forceData from '@/views/data1.js'
import data3 from '@/views/data3.js'

import ChartPlot from './ChartPlot.vue'
import ForceGuidance from './ForceGuidance.vue'
import HierarchyGuidance from './HierarchyGuidance.vue'
import { find, groupBy, values, keys } from 'lodash'
let scale = 1
const scaleFactor = 1.1 // 每次滚动放大的比例
export default {
  components: {
    'a-slider': Slider,
    UploadFile,
    'chart-plot': ChartPlot,
    'hierarchy-guidance': HierarchyGuidance,
    'force-guidance': ForceGuidance
  },
  data() {
    return {
      inputVal: '',
      forceChart: null,
      forceSvg: null,
      text: 0,
      toggle: 0,
      epoch1: 20,
      epoch2: 200,
      layer1: 1,
      layer2: 1,
      value: 50,
      distance: 1, //1为eu 2为cos
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
      Label1: [], //predicted1
      Label2: [], //predicted2
      labelIndex: 0, //1为true,2为predicted
      collected: [], //选中的节点
      selectActNode1: [],
      selectActNode2: [],
      brush: false, //true为开启brush
      brushgroup: '',
      dataList: { nodes: [], edges: [] },
      graph0Initialized: false,
      nodesStorage: JSON.parse(window.localStorage.getItem('nodesStorage') || '{}'),
      scatterPlotW: document.body.clientWidth - 350,
      brushList: [],
      brushSvg: null,
      xScale1: null,
      yScale1: null,
      xScale2: null,
      yScale2: null,
      margin: {},
      forceData: {
        result_edge: [],
        result_nodes: {}
      },
      guidanceColors: [],
      colors: [],
      scatter1colors: {},
      scatter2colors: {},
      transform: null,
      fileData: {
        file1: [],
        file2: []
      },
      compareVal: false
    }
  },
  mounted() {
    // this.forceData = forceData
  },

  methods: {
    brushInit() {
      setTimeout(() => {
        this.brushList = []
        this.forceData = {
          result_edge: [],
          result_nodes: {}
        }
        this.click_id = -1
        this.brushSvg.selectAll('*').remove()
        this.drawChart()
      }, 0)
    },
    renderHistoricalDataset() {
      this.$refs.childComponent1.renderHistoricalDataset()
    },
    get_lns() {
      // let response = dataList
      this.$axios
        .post('/userapi/get_lns/', {
          k: this.value,
          distance: this.distance,
          from: this.sliderValues[0],
          to: this.sliderValues[1],
          epoch1: this.epoch1,
          epoch2: this.epoch2,
          layer1: this.layer1,
          layer2: this.layer2
        })
        .then((response) => {
      d3.select(this.$refs.scatterPlot).selectAll('*').remove()
      d3.select(this.$refs.chartContainer).selectAll('*').remove()
      d3.select(this.$refs.features1).selectAll('*').remove()
      d3.select(this.$refs.features2).selectAll('*').remove()
      this.scatter1 = response.data.matrix1
      this.scatter2 = response.data.matrix2
      this.lns = response.data.lns
      this.features1 = response.data.features1
      this.features2 = response.data.features2
      this.density1 = response.data.density1
      this.density2 = response.data.density2
      this.click_id = -1

      this.dataList = response.data

      this.drawChart()
      this.drawHistogram()
      })
    },
    clickNode(data) {
      this.click_id = data.nodeId
      this.click_node()
    },
    click_dimensionalFn(res) {
      let nodes = [
        ...res.result_nodes.start,
        ...res.result_nodes['first order'],
        ...res.result_nodes['second order']
      ]
      if (this.labelIndex == 2) {
        this.guidanceColors = nodes.reduce((pre, item) => {
          pre.push({
            id: item,
            colors: [
              this.colors(this.Label1[item]),
              this.colors(this.Label2[item]),
              this.colors(this.trueLabel[item])
            ]
          })
          return pre
        }, [])
      }
    },
    //点击单个节点，淡化其它节点
    click_node() {
      this.click_dimensional([this.click_id]).then((res) => this.click_dimensionalFn(res))
      // let response = data3
      this.$axios
        .post('/userapi/click_node/', {
          id: this.click_id,
          epoch1: this.epoch1,
          epoch2: this.epoch1,
          layer1: this.layer1,
          layer2: this.layer2
        })
        .then((response) => {
      this.links = response.data.link
      this.nodes = response.data.node
      this.showMatrixChart()
      })
    },
    showMatrixChart() {
      let nodeObj = this.nodes.reduce((pre, item) => {
        pre[item.id] = item
        return pre
      }, {})
      let nodeIds = Object.keys(nodeObj).map((item) => Number(item))
      let scatterSvg = this.brushSvg
      scatterSvg.selectAll('circle').each(function (item) {
        const element = d3.select(this)
        let i = element.attr('data-index')
        if (nodeIds.includes(Number(i))) {
          element.classed('highlight', true).classed('un-highlight', false)
        } else {
          element.classed('un-highlight', true).classed('highlight', false)
        }
      })

      let nodeArrObj = [
        scatterSvg.selectAll('.scatter1.highlight'),
        scatterSvg.selectAll('.scatter2.highlight')
      ].map((nodes) => {
        let nodeObj = {}
        nodes.each(function (d, i) {
          const cx = d3.select(this).attr('cx')
          const cy = d3.select(this).attr('cy')
          const index = d3.select(this).attr('data-index')
          nodeObj[index] = { x: Number(cx), y: Number(cy) }
        })
        return nodeObj
      })
      scatterSvg.selectAll('.connecting-line').remove()
      Object.keys(nodeArrObj[0]).forEach((nodes, ite) => {
        let sourceNode = nodeArrObj[0][nodes]
        let targetNode = nodeArrObj[1][nodes]
        if (sourceNode && targetNode) {
          scatterSvg
            .append('line')
            .attr('class', 'connecting-line')
            .attr('x1', sourceNode.x + this.margin.left)
            .attr('y1', sourceNode.y + this.margin.top)
            .attr('x2', targetNode.x + this.margin.left * 2 + 500)
            .attr('y2', targetNode.y + this.margin.top)
            .attr('fill', 'none')
            .style('stroke', '#aaa')
            .style('stroke-width', 1)
        }
      })
      nodeArrObj.forEach((nodes, ite) => {
        this.links.forEach((link) => {
          let sourceNode = nodes[link.source]
          let targetNode = nodes[link.target]
          if (sourceNode && targetNode) {
            let node1X = sourceNode.x + this.margin.left
            let node1Y = sourceNode.y
            let node2X = targetNode.x + this.margin.left
            let node2Y = targetNode.y
            if (ite == 1) {
              node1X = sourceNode.x + this.margin.left * 2 + 500
              node1Y = sourceNode.y
              node2X = targetNode.x + this.margin.left * 2 + 500
              node2Y = targetNode.y
            }
            scatterSvg
              .append('line')
              .attr('class', 'connecting-line')
              .attr('x1', node1X)
              .attr('y1', node1Y + this.margin.top)
              .attr('x2', node2X)
              .attr('y2', node2Y + this.margin.top)
              .attr('fill', 'none')
              .style('stroke', 'red')
              .style('stroke-width', 1)
          }
        })
      })
    },
    click_dimensional(id) {
      this.guidanceColors=[]
      return new Promise((resolve) => {
        // this.forceData = forceData
        this.$axios
          .post('/userapi/k_hop/', {
            id: id
          })
          .then((response) => {
        this.forceData = response.data
        resolve(this.forceData)
        })
      })
    },
    handleFileChange(event, type) {
      const file = event.target.files[0]
      Papa.parse(file, {
        complete: (results) => {
          this.fileData[type] = results.data
          if (type == 'file1') {
            this.Label1 = this.fileData['file1'][this.epoch1]
            this.trueLabel = this.fileData['file1'][0]
          } else if (type == 'file2') {
            this.Label2 = this.fileData['file2'][this.epoch2]
          }
        }
      })
    },
    drawFn(index) {
      this.labelIndex = index
      this.drawChart()
    },
    clickDraw() {
      this.brush = false
      this.brushInit()
    },
    requestForceGraphData() {
      this.$axios.post('/userapi/get_db_graph/', {}).then((response) => {
        this.dataList = response.data
      })
    },
    renderEmbeddingAndDensityGraph() {
      this.$axios
        .post('/userapi/get_embedding_and_density_data/', {
          k: this.value,
          distance: this.distance,
          from: this.sliderValues[0],
          to: this.sliderValues[1],
          epoch1: this.epoch1,
          epoch2: this.epoch2,
          layer1: this.layer1,
          layer2: this.layer2
        })
        .then((response) => {
          d3.select(this.$refs.scatterPlot).selectAll('*').remove()
          d3.select(this.$refs.chartContainer).selectAll('*').remove()
          d3.select(this.$refs.features1).selectAll('*').remove()
          d3.select(this.$refs.features2).selectAll('*').remove()
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
    // 散点图
    drawChart() {
      const sf = this
      const colors =(index)=>{
        let arr = ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17']
        return arr[index]
      } //d3.scaleOrdinal(d3.schemeAccent)
      console.log(colors['0'],sf.Label2,d3.schemeAccent)
      let scatterK1 = this.scatter1.reduce((pre, item) => {
        pre[item.index] = colors(sf.Label1[item.index])
        return pre
      }, {})
      let scatterK2 = this.scatter2.reduce((pre, item) => {
        pre[item.index] = colors(sf.Label2[item.index])
        return pre
      }, {})
      let arr = keys(scatterK1)
        .filter((item) => {
          return !this.compareVal || scatterK2[item] !== scatterK1[item]
        })
        .map((item) => Number(item))
      const scatter1 = this.scatter1
      // .filter((item) => {
      //   return arr.includes(Number(item.index))
      // })
      const scatter2 = this.scatter2
      // .filter((item) => {
      //   return arr.includes(Number(item.index))
      // })
      // const scatter2 = this.scatter2

      // const density1 = this.density1
      // const density2 = this.density2

      // 创建SVG绘图区域的尺寸
      const width = 500
      const height = 400
      const margin = { top: 20, right: 40, bottom: 20, left: 40 }
      this.margin = margin
      const svgWidth = (width + margin.left) * 2 + margin.right
      const svgHeight = height
      const max = Math.max(
        Math.max(...scatter1.map((item) => item.x)),
        Math.max(...scatter1.map((item) => item.y))
      )
      const min = Math.min(
        Math.min(...scatter1.map((item) => item.x)),
        Math.min(...scatter1.map((item) => item.y))
      )
      // 创建颜色比例尺
      const labScale = d3.scaleLinear().domain([min, max]).range([-160, 160])
      // 创建SVG元素
      d3.select(this.$refs.scatterPlot).selectAll('*').remove()
      let svgScatter = d3
        .select(this.$refs.scatterPlot)
        .attr('width', svgWidth)
        .attr('height', svgHeight)
      if (!sf.brush) {
        svgScatter.on('wheel', null)
        svgScatter.call(
          d3
            .zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
              if (sf.brush) return
              let { transform } = event
              this.brushSvg.transition().duration(10).attr('transform', transform)
            })
        )
      } else {
        svgScatter
          .on('wheel.zoom', null) // 移除 wheel 事件的 zoom 行为
          .on('mousedown.zoom', null) // 移除鼠标按下的 zoom 行为
          .on('mousemove.zoom', null) // 移除鼠标移动的 zoom 行为
          .on('mouseup.zoom', null)
        svgScatter.on('wheel', (event) => {
          event.preventDefault()
          const delta = event.deltaY
          const mousePos = d3.pointer(event) // 获取鼠标的相对坐标
          if (delta < 0) {
            scale *= scaleFactor // 放大
          } else {
            scale /= scaleFactor // 缩小
          }
          scale = Math.max(0.1, Math.min(scale, 10))
          const transform = d3.zoomIdentity
            .translate(mousePos[0], mousePos[1])
            .scale(scale)
            .translate(-mousePos[0], -mousePos[1])
          this.brushSvg.attr('transform', transform)
        })
      }
      this.brushSvg = svgScatter.append('g')
      this.colors = colors
      // 创建散点图1的分组
      const scatter1Group = this.brushSvg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      // 创建散点图2的分组
      const scatter2Group = this.brushSvg
        .append('g')
        .attr('transform', `translate(${width + margin.left * 2}, ${margin.top})`)

      // 创建x轴的比例尺（散点图1）
      const xScale1 = d3
        .scaleLinear()
        .domain(d3.extent(scatter1, (d) => d.x))
        .range([0, width])

      this.xScale1 = xScale1
      const xScale2 = d3
        .scaleLinear()
        .domain(d3.extent(scatter2, (d) => d.x))
        .range([0, width])

      this.xScale2 = xScale2
      // 创建y轴的比例尺（散点图1）
      const yScale1 = d3
        .scaleLinear()
        .domain(d3.extent(scatter1, (d) => d.y))
        .range([height, 0])
      this.yScale1 = yScale1
      const yScale2 = d3
        .scaleLinear()
        .domain(d3.extent(scatter2, (d) => d.y))
        .range([height, 0])
      this.yScale2 = yScale2

      // 创建x轴（散点图1）
      scatter1Group
        .append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale1))
      scatter2Group
        .append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale2))

      // 创建y轴（散点图1）
      scatter1Group.append('g').call(d3.axisLeft(yScale1))
      scatter2Group.append('g').call(d3.axisRight(yScale2))

      let sg1 = scatter1Group
        .selectAll('circle.scatter1')
        .data(scatter1)
        .enter()
        .append('circle')
        .attr('class', 'scatter1')
        .attr('cx', (d) => xScale1(d.x))
        .attr('cy', (d) => yScale1(d.y))
        .attr('r', 3)
        .attr('data-index', (_, i) => i) // 将索引作为自定义属性绑定到元素上
        .style('stroke', (d) => {
          if (sf.labelIndex === 2) {
            return colors(sf.trueLabel[d.index])
          } else {
            return 'none'
          }
        })
        .style('opacity',d=>arr.includes(Number(d.index))?1:0)
        .style('stroke-width', 1)
        .style('fill', (d, i) => {
          let originalColor = ''
          if (sf.labelIndex === 0) {
            originalColor = getPointColor(d, i)
            this.scatter1colors[d.index] = originalColor
          } else if (sf.labelIndex === 1) {
            originalColor = colors(sf.trueLabel[d.index])
          } else {
            originalColor = sf.Label1[d.index] ? colors(sf.Label1[d.index]) : 'transparent'
          }
          if (sf.click_id === -1) {
            return originalColor
          } else {
            for (let j = 0; j < sf.nodes.length; j++) {
              if (d.index === sf.nodes[j].id) {
                return originalColor
              }
            }
            return d3.color(originalColor).copy({ opacity: 1 })
          }
        })

      let sg2 = scatter2Group
        .selectAll('circle.scatter2')
        .data(scatter2)
        .enter()
        .append('circle')
        .attr('class', 'scatter2')
        .attr('cx', (d) => xScale2(d.x))
        .attr('cy', (d) => yScale2(d.y))
        .attr('r', 3)
        .attr('data-index', (_, i) => i) // 将索引作为自定义属性绑定到元素上
        .style('stroke', (d) => {
          if (sf.labelIndex === 2) {
            return colors(sf.trueLabel[d.index])
          } else {
            return 'none'
          }
        })
        .style('opacity',d=>arr.includes(Number(d.index))?1:0)
        .style('stroke-width', 1)
        .style('fill', (d, i) => {
          let originalColor = ''
          if (sf.labelIndex === 0) {
            originalColor = getPointColor(d, i)
            this.scatter2colors[d.index] = originalColor
          } else if (sf.labelIndex === 1) {
            originalColor = colors(sf.trueLabel[d.index])
          } else {
            // console.log(sf.Label2,colors(sf.Label2[d.index]),d.index,sf.Label2[d.index])
            originalColor = sf.Label2[d.index] ? colors(sf.Label2[d.index]) : 'transparent'
          }

          if (sf.click_id === -1) {
            return originalColor
          } else {
            for (let j = 0; j < sf.nodes.length; j++) {
              if (d.index === sf.nodes[j].id) {
                return originalColor
              }
            }
            return d3.color(originalColor).copy({ opacity: 1 })
          }
        })
      if (sf.brush === false) {
        sg1.on('mouseover', handleMouseOver).on('mouseout', handleMouseOut).on('click', handleClick)
        sg2.on('mouseover', handleMouseOver).on('mouseout', handleMouseOut).on('click', handleClick)
      } else {
        sg1.on('mouseover', null).on('mouseout', null).on('click', null)
        // sg2.on('mouseover', null).on('mouseout', null).on('click', null)
      }
      function getPointColor(d, i) {
        const a = labScale(scatter1[i].x)
        const b = labScale(scatter1[i].y)
        const l = 60
        return d3.lab(l, a, b).formatHex()
      }

      function handleMouseOver() {
        const i = d3.select(this).attr('data-index')
        const node1X = xScale1(scatter1[i].x)
        const node1Y = yScale1(scatter1[i].y)

        const node2X = xScale2(scatter2[i].x)
        const node2Y = yScale2(scatter2[i].y)
        // 绘制线条
        sf.brushSvg
          .append('line')
          .attr('class', 'connecting-line')
          .attr('x1', node1X + margin.left)
          .attr('y1', node1Y + margin.top)
          .attr('x2', node2X + margin.left + width + margin.right)
          .attr('y2', node2Y + margin.top)
          .style('stroke', 'gray')
          .style('stroke-width', 1)

        // 选择对应的点元素并设置边界样式
        sf.brushSvg
          .append('circle')
          .attr('class', 'connecting-c')
          .attr('cx', node1X + margin.left)
          .attr('cy', node1Y + margin.top)
          .attr('r', 5)
          .attr('fill', 'none')
          .attr('stroke', 'red')
          .attr('stroke-width', 2)

        sf.brushSvg
          .append('circle')
          .attr('class', 'connecting-c')
          .attr('cx', node2X + margin.left + width + margin.right)
          .attr('cy', node2Y + margin.top)
          .attr('r', 5)
          .attr('fill', 'none')
          .attr('stroke', 'red')
          .attr('stroke-width', 2)
      }
      function handleMouseOut() {
        d3.selectAll('.connecting-line').remove() // 移除线条元素
        d3.selectAll('.connecting-c').remove() // 移除线条元素
      }
      function handleClick() {
        const i = d3.select(this).attr('data-index')
        sf.click_id = scatter1[i].index
        sf.click_node()
      }

      if (sf.brush === true) {
        let brushIns = d3
          .brush()
          .extent([
            [0, 0],
            [width + margin.left + width + margin.right, height + margin.bottom]
          ])
          .on('start', () => {
            // if (this.brushList.length == 2) {
            //   this.brushList.shift()
            // }
          })
          .on('end', (event) => {
            const selection = event.selection
            if (!selection) return
            const [[x0, y0], [x1, y1]] = selection
            let result = [scatter1Group.selectAll('circle'), scatter2Group.selectAll('circle')].map(
              (items, index) => {
                return items.filter(function (d, i) {
                  const dot = d3.select(this)
                  const cx = +dot.attr('cx') + (index == 1 ? width + margin.left : 0) // 获取cx属性值
                  const cy = +dot.attr('cy') // 获取cy属性值
                  return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1
                })
              }
            )
            result.forEach((item, index) => {
              let nodes = item.nodes()
              if (nodes.length > 0) {
                let arr = nodes
                  .map((item) => d3.select(item).attr('data-index'))
                  .map((item) => Number(item))
                this.brushList = [
                  {
                    type: index,
                    dataIndex: arr,
                    nodes: nodes
                  }
                ]
              }
            })
            this.renderBrush()
          })
        scatter1Group.append('g').call(brushIns)
      }
    },
    renderBrush() {
      let dataIndex = this.brushList.reduce((pre, item) => {
        return pre.concat(item.dataIndex)
      }, [])
      d3.select(this.$refs.scatterPlot)
        .selectAll('circle')
        .nodes()
        .map((item) => {
          const i = Number(d3.select(item).attr('data-index'))
          d3.select(item)
            .classed('un-highlight', true)
            .classed('highlight', (d) => {
              return dataIndex.length == 0 ? true : dataIndex.includes(i)
            })
        })
      d3.select(this.$refs.scatterPlot).selectAll('g.path-line').remove()
      this.brushList.forEach((item) => {
        let gPath = this.brushSvg.append('g').attr('class', 'path-line')
        item.dataIndex.forEach((ite) => {
          const node1X = this.xScale1(this.scatter1[ite].x)
          const node1Y = this.yScale1(this.scatter1[ite].y)
          const node2X = this.xScale2(this.scatter2[ite].x)
          const node2Y = this.yScale2(this.scatter2[ite].y)
          gPath
            .append('line')
            .attr('class', 'connecting-line')
            .attr('x1', node1X + this.margin.left)
            .attr('y1', node1Y + this.margin.top)
            .attr('x2', node2X + this.margin.left + 500 + this.margin.right)
            .attr('y2', node2Y + this.margin.top)
            .style('stroke', 'gray')
            .style('stroke-width', 1)
        })
      })
    },
    // 分布图
    drawHistogram() {
      return
      const data = this.lns
      const features1 = this.features1
      const features2 = this.features2

      const svg = d3.select(this.$refs.chartContainer)
      const svg1 = d3.select(this.$refs.features1)
      const svg2 = d3.select(this.$refs.features2)

      const margin = { top: 20, right: 20, bottom: 50, left: 50 }
      const width = 300 - margin.left - margin.right
      const height = 200 - margin.top - margin.bottom

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(this.countDataInIntervals(data))])
        .range([height, 0])

      const xScale = d3
        .scaleBand()
        .domain(['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'])
        .range([0, width])
        .padding(0.2)

      const histogram = d3
        .histogram()
        .domain(yScale.domain())
        .thresholds([0, 0.2, 0.4, 0.6, 0.8, 1.0])

      const bins = histogram(data)

      const colorScale = d3
        .scaleOrdinal()
        .domain(['0', '1', '2', '3', '4'])
        .range(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#eff3ff'])

      svg
        .selectAll('rect')
        .data(bins)
        .enter()
        .append('rect')
        .attr('x', (d, i) => xScale(xScale.domain()[i]))
        .attr('y', (d) => yScale(d.length))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => height - yScale(d.length))
        .attr('fill', (d, i) => colorScale(i))

      const xAxis = d3.axisBottom(xScale)
      const yAxis = d3.axisLeft(yScale)

      svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)

      svg.append('g').attr('class', 'y-axis').call(yAxis)

      const xScale1 = d3
        .scaleLinear()
        .domain([d3.min(features1, (d) => d[0]), d3.max(features1, (d) => d[0])])
        .range([0, width])

      const yScale1 = d3
        .scaleLinear()
        .domain([d3.min(features1, (d) => d[1]), d3.max(features1, (d) => d[1])])
        .range([height, 0])

      svg1
        .selectAll('body')
        .data(features1)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale1(d[0]))
        .attr('cy', (d) => yScale1(d[1]))
        .attr('r', 2.5)
        .attr('fill', (d, i) => colorScale(this.searchColor(data[i])))

      const xScale2 = d3
        .scaleLinear()
        .domain([d3.min(features2, (d) => d[0]), d3.max(features2, (d) => d[0])])
        .range([0, width + 10])

      const yScale2 = d3
        .scaleLinear()
        .domain([d3.min(features2, (d) => d[1]), d3.max(features2, (d) => d[1])])
        .range([height + 10, 0])

      svg2
        .selectAll('circle')
        .data(features2)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale2(d[0]))
        .attr('cy', (d) => yScale2(d[1]))
        .attr('r', 2.5)
        .attr('fill', (d, i) => colorScale(this.searchColor(data[i])))
    },
    // 直方图高度
    countDataInIntervals(data) {
      const intervals = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
      const counts = [0, 0, 0, 0, 0, 0]

      // data.forEach((value) => {
      //   for (let i = 0; i < intervals.length; i++) {
      //     if (value * 100 <= intervals[i] * 100) {
      //       counts[i]++
      //       break
      //     }
      //   }
      // })

      return counts
    },
    // 直方图对应颜色
    searchColor(val) {
      if (val >= 0 && val <= 0.2) return 0
      else if (val > 0.2 && val <= 0.4) return 1
      else if (val > 0.4 && val <= 0.6) return 2
      else if (val > 0.6 && val <= 0.8) return 3
      else return 4
    },

    //
    calDensity(data) {
      let d1 = 0
      let d2 = 0
      for (let i = 0; i < data.length; i++) {
        d1 += this.density1[data[i]]
        d2 += this.density2[data[i]]
      }
      return [d1 / data.length, d2 / data.length]
    },
    // 拓扑子图
    draw() {
      const svg = d3.select('#topology')
      const width = svg.attr('width')
      const height = svg.attr('height')

      const labScale = d3.scaleLinear().domain([0, 1]).range([-160, 160])

      const simulation = d3
        .forceSimulation(this.nodes)
        .force(
          'link',
          d3
            .forceLink(this.links)
            .id((d) => d.id)
            .distance(200)
        )
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))

      const link = svg
        .selectAll('line')
        .data(this.links)
        .enter()
        .append('line')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)

      const gradient = svg
        .append('defs')
        .selectAll('linearGradient')
        .data(this.nodes)
        .enter()
        .append('linearGradient')
        .attr('id', (d) => `half-circle-${d.id}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')

      gradient.append('stop').attr('offset', '0%').attr('stop-color', getPointColor1)

      gradient.append('stop').attr('offset', '50%').attr('stop-color', getPointColor1)

      gradient.append('stop').attr('offset', '50%').attr('stop-color', getPointColor1)

      gradient.append('stop').attr('offset', '100%').attr('stop-color', getPointColor1)

      const node = svg
        .selectAll('circle')
        .data(this.nodes)
        .enter()
        .append('circle')
        .attr('r', 8)
        .attr('fill', (d) => `url(#half-circle-${d.id})`)

      node.append('title').text((d) => d.name)

      function getPointColor1(d) {
        const a = labScale(d.x1)
        const b = labScale(d.y1)
        const l = 60
        return d3.lab(l, a, b).formatHex()
      }

      simulation.on('tick', () => {
        link
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y)

        node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
      })
    }
  },
  computed: {
    brushNode() {
      return []
    },
    hierarchyData() {
      if (!this.forceData.result_nodes['start'] || this.guidanceColors.length == 0) return null
      let start = this.forceData.result_nodes['start'].map((item) => {
        let node = find(this.guidanceColors, (ite) => ite.id == item)
        return {
          id: item,
          colors: node.colors,
          parentKey: node.colors[2],
          key: node.colors.join('/')
        }
      })
      let first = this.forceData.result_nodes['first order'].map((item) => {
        let node = find(this.guidanceColors, (ite) => ite.id == item)
        return {
          id: item,
          colors: node.colors,
          parentKey: node.colors[2],
          key: node.colors.join('/')
        }
      })
      let second = this.forceData.result_nodes['second order'].map((item) => {
        let node = find(this.guidanceColors, (ite) => ite.id == item)
        return {
          id: item,
          colors: node.colors,
          parentKey: node.colors[2],
          key: node.colors.join('/')
        }
      })

      const groupedStart = groupBy(start, 'parentKey')

      console.log(groupedStart)
      // const groupedStart = groupBy(start, 'key')
      const groupedFirst = groupBy(first, 'parentKey')
      const groupedSecond = groupBy(second, 'parentKey')
      let d = {
        name: 'Root',
        children: [
          {
            type: 'first',
            children: values(groupedStart).map((item, index) => {
              return {
                type: 'first/' + index,
                children: values(groupBy(item, 'key')).map((ite, idx) => ({
                  type: `first/${index}/${idx}`,
                  children: ite.map((it, i) => {
                    return {
                      ...it,
                      type: `first/${index}/${idx}/${i}`,
                      value: 1
                    }
                  })
                }))
              }
            })
          },
          {
            type: 'second',
            children: values(groupedFirst).map((item, index) => {
              return {
                type: 'second/' + index,
                children: values(groupBy(item, 'key')).map((ite, idx) => ({
                  type: `second/${index}/${idx}`,
                  children: ite.map((it, i) => {
                    return {
                      ...it,
                      type: `second/${index}/${idx}/${i}`,
                      value: 1
                    }
                  })
                }))
              }
            })
          },
          {
            type: 'third',
            children: values(groupedSecond).map((item, index) => {
              return {
                type: 'third/' + index,
                children: values(groupBy(item, 'key')).map((ite, idx) => ({
                  type: `third/${index}/${idx}`,
                  children: ite.map((it, i) => {
                    return {
                      ...it,
                      type: `third/${index}/${idx}/${i}`,
                      value: 1
                    }
                  })
                }))
              }
            })
          }
        ]
      }
      console.log(d)
      return d
    }
  },
  watch: {
    inputVal(newValue) {
      let numArr =
        newValue === ''
          ? []
          : newValue.split(',').map((item) => {
              return Number(item)
            })
      d3.select(this.$refs.scatterPlot)
        .selectAll('circle')
        .nodes()
        .map((item) => {
          const dataIndex = d3.select(item).attr('data-index')
          let i = this.scatter1[dataIndex].index
          d3.select(item)
            .attr('r', (d) => {
              return numArr.includes(i) ? 5 : 2
            })
            .classed('circle-blink', (d) => {
              return numArr.includes(i) ? true : false
            })
        })
    },
    brushList(newValue, oldValue) {
      newValue.length &&
        this.click_dimensional(newValue[0].dataIndex).then((res) => this.click_dimensionalFn(res))
    },

    epoch1(newValue, oldValue) {
      this.Label1 = this.fileData['file1'][newValue]
      this.trueLabel = this.fileData['file1'][0]
      this.drawChart()
    },
    epoch2(newValue, oldValue) {
      console.log(newValue)
      this.Label2 = this.fileData['file2'][newValue]
      // this.trueLabel=this.fileData['file1'][0]
      this.drawChart()
    },
    compareVal() {
      this.drawChart()
    }
  }
}
</script>

<style>
svg {
  transform: translate3d(0, 0, 0);
  /* 强制使用GPU加速 */
}

.un-highlight {
  fill-opacity: 1;
}

.highlight {
  fill-opacity: 1;
}

@keyframes blink {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.circle-blink {
  animation: blink 1s infinite;
}
</style>
