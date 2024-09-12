

self.addEventListener('message', function (event) {
console.log(event)
    const { nodes, links } = event.data;
    // 创建力导向图布局
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d) => d.id).distance(10).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', forceCenter(0, 0)); // 或者根据需要选择中心力
    // 监听每次迭代（tick）的事件
    simulation.on('tick', () => {
        // 发送计算得到的节点位置到主线程
        self.postMessage({ nodes });
    });

    // 开始仿真
    simulation.alpha(1).restart();
});
