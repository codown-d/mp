// worker.js
self.onmessage = function(event) {
    const data = event.data;
  
    // 在这里执行力导向图的计算任务，例如布局算法等
    // 计算完成后将结果通过 postMessage 发送回主线程
    const result = processData(data);
    self.postMessage(result);
  };
  
  function processData(data) {
    // 处理数据的逻辑
    return processedData;
  }
  