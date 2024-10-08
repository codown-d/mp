<template>
  <div style="display: flex; margin: 0; padding: 0">
    <div style="display: block; width: 300px">
      <UploadFile></UploadFile>
      <input type="file" @change="handleFileChange" style="width: 270px" />
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
        <v-range-slider v-model="sliderValues" strict min="0" max="1" step="0.01"></v-range-slider>
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
        <v-btn @click="clearBrush(0)" style="margin-right: 10px; width: 120px">清除brush1</v-btn>
        <v-btn @click="clearBrush(1)" style="margin-right: 10px; width: 120px">清除brush2</v-btn>
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
    <div class="container" style="width: 0; flex: 1">
      <div style="margin-bottom: 0">
        <v-col class="py-2" cols="12">
          <h3 style="margin-bottom: 5px">Color:</h3>

          <v-btn-toggle v-model="text" color="deep-purple-accent-3" rounded="0" group>
            <v-btn @click="this.defaultDraw" style="margin-bottom: 4px">position</v-btn>
            <v-btn @click="this.trueDraw" style="margin-left: 8px">true label</v-btn>
            <v-btn @click="this.predictedDraw">predicted label</v-btn>
          </v-btn-toggle>
        </v-col>
        <div style="display: flex">
          <v-btn
            @click="this.clickDraw"
            style="margin-left: 10px; margin-right: 20px; margin-top: 10px"
            >reset</v-btn
          >
          <v-switch
            label="brush"
            v-model="brush"
            style="margin: 0; padding: 0"
            @click="brushInit"
          ></v-switch>
        </div>
      </div>

      <div>
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
        <div style="width: 50%" v-if="false">
          <chart-plot
            ref="childComponent2"
            v-if="false"
            :selectActNode="selectActNode2"
            :dataList="dataList"
            @click-node="(data) => clickNode(data)"
          ></chart-plot>
        </div>
      </div>
      <force-guidance
        :result_edge="forceData.result_edge"
        :result_nodes="forceData.result_nodes"
        :brushNode="brushNode"
      ></force-guidance>
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
import ChartPlot from './ChartPlot.vue'
import ForceGuidance from './ForceGuidance.vue'

export default {
  components: {
    'a-slider': Slider,
    UploadFile,
    'chart-plot': ChartPlot,
    'force-guidance': ForceGuidance
  },
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
      Label: null, //all
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
      }
    }
  },
  mounted() {
    this.forceData = forceData
  },

  methods: {
    brushInit() {
      this.brushList = []
      this.brushDraw()
    },
    clearBrush(n) {
      if (n == 0) {
        this.brushList.shift()
      } else {
        this.brushList.pop()
      }

      this.renderBrush()
    },
    renderHistoricalDataset() {
      this.$refs.childComponent1.renderHistoricalDataset()
      //   this.$refs.childComponent2.renderHistoricalDataset()
    },
    get_lns() {
      // this.$axios
      //   .post('/userapi/get_lns/', {
      //     k: this.value,
      //     distance: this.distance,
      //     from: this.sliderValues[0],
      //     to: this.sliderValues[1],
      //     epoch1: this.epoch1,
      //     epoch2: this.epoch2,
      //     layer1: this.layer1,
      //     layer2: this.layer2
      //   })
      //   .then((response) => {
      let response = dataList
      d3.select(this.$refs.scatterPlot).selectAll('*').remove()
      d3.select(this.$refs.chartContainer).selectAll('*').remove()
      d3.select(this.$refs.features1).selectAll('*').remove()
      d3.select(this.$refs.features2).selectAll('*').remove()
      this.collected = []
      this.scatter1 = response.data.matrix1
      this.scatter2 = response.data.matrix2
      this.lns = response.data.lns
      this.features1 = response.data.features1
      this.features2 = response.data.features2
      this.density1 = response.data.density1
      this.density2 = response.data.density2
      this.click_id = -1

      // this.dataList = response.data

      this.drawChart()
      this.drawHistogram()
      // })
    },
    //点击单个节点，淡化其它节点
    click_node() {
      this.$axios
        .post('/userapi/click_node/', {
          id: this.click_id,
          epoch1: this.epoch1,
          epoch2: this.epoch1,
          layer1: this.layer1,
          layer2: this.layer2
        })
        .then((response) => {
          const svg = d3.select('#topology')
          svg.selectAll('*').remove()
          this.links = response.data.link
          this.nodes = response.data.node
          d3.select(this.$refs.scatterPlot).selectAll('*').remove()
          this.drawChart()
        })
    },
    click_dimensional(id) {
      this.$axios
        .post('/userapi/k_hop/', {
          id: id
        })
        .then((response) => {
          this.forceData = response.data
          console.log('/userapi/k_hop/', response)
        })
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      this.Label = file
      Papa.parse(file, {
        complete: (results) => {
          this.trueLabel = results.data[0]
          this.Label1 = results.data[this.epoch1]
          this.Label2 = results.data[this.epoch2]
        }
      })
    },
    defaultDraw() {
      this.labelIndex = 0
      d3.select(this.$refs.scatterPlot).selectAll('*').remove()
      this.drawChart()
    },
    trueDraw() {
      this.labelIndex = 1
      d3.select(this.$refs.scatterPlot).selectAll('*').remove()
      this.drawChart()
    },
    predictedDraw() {
      this.labelIndex = 2
      d3.select(this.$refs.scatterPlot).selectAll('*').remove()
      this.drawChart()
    },
    clickDraw() {
      this.brush = false
      this.click_id = -1
      d3.select(this.$refs.scatterPlot).selectAll('*').remove()
      this.collected = []
      this.drawChart()
    },
    brushDraw() {
      this.brush = !this.brush
      let el = this.$refs.scatterPlot
      d3.select(el).selectAll('.brush').on('start', null).on('brush', null).on('end', null)
      d3.select(el).selectAll('.brush').remove()
      d3.select(el).selectAll('*').remove()
      this.collected = []
      this.drawChart()
    },

    // 画原图
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
    // 散点图
    drawChart() {
      const sf = this
      const scatter1 = this.scatter1
      const scatter2 = this.scatter2
      const density1 = this.density1
      const density2 = this.density2

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
      let svg = d3.select(this.$refs.scatterPlot).attr('width', svgWidth).attr('height', svgHeight)
      this.brushSvg = svg
      const colors = d3.scaleOrdinal(d3.schemeAccent)
      // 创建散点图1的分组
      const scatter1Group = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      // 创建散点图2的分组
      const scatter2Group = svg
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
        .attr('r', 5)
        .attr('data-index', (_, i) => i) // 将索引作为自定义属性绑定到元素上
        .style('fill', (d, i) => {
          let originalColor = ''
          if (sf.labelIndex === 0) originalColor = getPointColor(d, i)
          else if (sf.labelIndex === 1) originalColor = colors(sf.trueLabel[d.index])
          else originalColor = colors(sf.Label1[d.index])

          if (sf.click_id === -1) {
            return originalColor
          } else {
            for (let j = 0; j < sf.nodes.length; j++) {
              if (d.index === sf.nodes[j].id) {
                return originalColor
              }
            }
            return d3.color(originalColor).copy({ opacity: 0.1 })
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
        .attr('r', 5)
        .attr('data-index', (_, i) => i) // 将索引作为自定义属性绑定到元素上
        .style('fill', (d, i) => {
          let originalColor = ''
          if (sf.labelIndex === 0) originalColor = getPointColor(d, i)
          else if (sf.labelIndex === 1) originalColor = colors(sf.trueLabel[d.index])
          else originalColor = colors(sf.Label1[d.index])
          if (sf.click_id === -1) {
            return originalColor
          } else {
            for (let j = 0; j < sf.nodes.length; j++) {
              if (d.index === sf.nodes[j].id) {
                return originalColor
              }
            }
            return d3.color(originalColor).copy({ opacity: 0.1 })
          }
        })
      if (sf.brush === false) {
        sg1.on('mouseover', handleMouseOver).on('mouseout', handleMouseOut).on('click', handleClick)
        sg2.on('mouseover', handleMouseOver).on('mouseout', handleMouseOut).on('click', handleClick)
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
        svg
          .append('line')
          .attr('class', 'connecting-line')
          .attr('x1', node1X + margin.left)
          .attr('y1', node1Y + margin.top)
          .attr('x2', node2X + margin.left + width + margin.right)
          .attr('y2', node2Y + margin.top)
          .style('stroke', 'gray')
          .style('stroke-width', 1)

        // 选择对应的点元素并设置边界样式
        svg
          .append('circle')
          .attr('class', 'connecting-c')
          .attr('cx', node1X + margin.left)
          .attr('cy', node1Y + margin.top)
          .attr('r', 5)
          .attr('fill', 'none')
          .attr('stroke', 'red')
          .attr('stroke-width', 2)

        svg
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
        // sf.click_dimensional(sf.click_id)
      }

      if (sf.brush === true) {
        let brushIns = d3
          .brush()
          .extent([
            [0, 0],
            [width + margin.left + width + margin.right, height + margin.bottom]
          ])
          .on('start', () => {
            if (this.brushList.length == 2) {
              this.brushList.shift()
            }
          })
          .on('end', (event) => {
            const selection = event.selection
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
            //[[],[]]
            result.forEach((item, index) => {
              let nodes = item.nodes()
              if (nodes.length > 0) {
                let arr = nodes
                  .map((item) => d3.select(item).attr('data-index'))
                  .map((item) => Number(item))
                this.brushList.push({
                  type: index,
                  dataIndex: arr,
                  nodes: nodes
                })
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

      data.forEach((value) => {
        for (let i = 0; i < intervals.length; i++) {
          if (value * 100 <= intervals[i] * 100) {
            counts[i]++
            break
          }
        }
      })

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
      if (this.brushList.length > 0) {
        this.click_dimensional(this.brushList[0].dataIndex)
      }
      if (this.brushList.length > 1) {
        console.log(this.brushList[1].dataIndex)
        return this.brushList[1].dataIndex
      } else {
        return []
      }
    }
  },
  watch: {
    epoch1(newValue, oldValue) {
      if (this.Label != null) {
        Papa.parse(this.Label, {
          complete: (results) => {
            this.Label1 = results.data[newValue]
          }
        })
      }
    },
    epoch2(newValue, oldValue) {
      if (this.Label != null) {
        Papa.parse(this.Label, {
          complete: (results) => {
            this.Label2 = results.data[newValue]
          }
        })
      }
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
  fill-opacity: 0.1;
}

.highlight {
  fill-opacity: 1;
}
</style>
