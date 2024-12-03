import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card } from "antd";
import "./App.css";

function App() {
  const [selectedElement, setSelectedElement] = useState(null);
  const [graphData, setGraphData] = useState(null); // 用于存储加载的 JSON 数据 + 存储原始完整的图数据
  const leftRef = useRef(null); // 创建 ref，用于选择 .left 的 div

  // 加载 JSON 数据
  useEffect(() => {
    fetch("./nodeData.json") // 相对路径加载 JSON 文件
      .then((response) => response.json())
      .then((data) => {
        setGraphData(data); // 将数据存储到 state 中
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  useEffect(() => {
    if (!graphData) return; // 如果数据尚未加载，不执行渲染逻辑
    const { nodes, links } = graphData;

    const width = 840,
    height = 600;

    // 清空之前的内容（避免重复渲染）
    d3.select(leftRef.current).selectAll("*").remove();

    // 创建 SVG
    const svg = d3
      .select(leftRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // 创建力导向图
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => d.id)
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    // 绘制连线
    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value))
      .on("click", (event, d) => {
        setSelectedElement({ type: "link", data: d }); // 设置选中边的信息
        console.log("边被点击:", d);
      });



    // 绘制节点
    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", (d) => color(d.group))
      .on("click", (event, d) => {
        setSelectedElement({ type: "node", data: d }); // 设置选中节点的信息
        console.log("节点被点击:", d);
      })
      .call(
        d3
          .drag()
          .on("start", (event) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          })
          .on("drag", (event) => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          })
          .on("end", (event) => {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          })
          // .on("click", (event, d) => {
          //   console.log("节点被点击:", d);
          // })
      );

    node.append("title").text((d) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    });
  }, [graphData]); // 在 graphData 变化时重新渲染

  return (
    <div id="container">
      <div className="left" ref={leftRef}>
        {/* D3 图表会被插入到这里 */}
      </div>
      <div className="right">
        <Card
          title={selectedElement ? `类型: ${selectedElement.type}` : "请选择节点或边"}
          style={{ width: 280, height:180, backgroundColor: '#ececec'}}
        >
          {selectedElement ? (
            selectedElement.type === "node" ? (
              // 如果是节点，显示节点信息
              <>
                <p><strong>ID:</strong> {selectedElement.data.id || "N/A"}</p>
                <p><strong>Index:</strong> {selectedElement.data.index || "N/A"}</p>
                <p><strong>Group:</strong> {selectedElement.data.group || "N/A"}</p>
              </>
            ) : selectedElement.type === "link" ? (
              // 如果是边，显示边的信息
              <>
                <p><strong>Source:</strong> {selectedElement.data.source.id || "N/A"}</p>
                <p><strong>Target:</strong> {selectedElement.data.target.id || "N/A"}</p>
                <p><strong>Value:</strong> {selectedElement.data.value || "N/A"}</p>
              </>
            ) : null
          ) : (
            // 如果未选中任何元素，显示提示信息
            <p>点击节点或边以查看详细信息</p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default App;
