# React + Vite


# 在我点击【显示所有】的按钮之后，为什么节点重合了？(没解决)
力导向图的布局没有重新启动模拟器，或者在恢复完整图时，节点的位置信息（x, y, fx, fy）被固定，导致力导向图无法正常布局。

```
const handleResetGraph = () => {
  if (!graphData) return;

  // 恢复完整图数据
  setFilteredData(graphData);

  // 触发重新布局
  d3.select(leftRef.current).selectAll("*").remove(); // 清空图表
};

```

# 我双击节点的过程中总是会触发单击节点的逻辑怎么办？
浏览器在判断是否是 dblclick 时，往往会先触发 click 事件，再触发 dblclick 事件。

方法 1: 使用定时器区分单击和双击
略
方法 2: 使用 mousedown 和 mouseup 组合（失败 因为mouseup失效）
通过监听 mousedown 和 mouseup，可以避免 click 和 dblclick 的冲突。
```
  const nodeGroup = svg
  .append("g")
  .selectAll("g")
  .data(nodes)
  .join("g")
  .attr("class", "node-group")
  .on("mousedown", (event, d) => {
    isDoubleClick = false;
  })
  .on("mouseup", (event, d) => {
    if (isDoubleClick) return; // 如果是双击，忽略单击逻辑
    nodeClick(d); // 单击逻辑
    setSelectedElement({ type: "node", data: d });
  })
  .on("dblclick", (event, d) => {
    isDoubleClick = true; // 标记为双击
    handleNodeDoubleClick(d); // 执行双击逻辑
  })
```

mouseup失效