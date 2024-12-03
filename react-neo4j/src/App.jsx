import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, Select, Button } from "antd";
import "./App.css";

const { Option } = Select;

function App() {
  const [selectedElement, setSelectedElement] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const leftRef = useRef(null);
  const [filteredData, setFilteredData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // 固定颜色映射 (每个 group 对应一个颜色)
  const groupColorMapping = {
    1: "#1f77b4", // group 1 - 蓝色
    2: "#ff7f0e", // group 2 - 橙色
    3: "#2ca02c", // group 3 - 绿色
    4: "#d62728", // group 4 - 红色
    5: "#9467bd", // group 5 - 紫色
    6: "#8c564b", // group 6 - 棕色
    7: "#e377c2", // group 7 - 粉色
    8: "#7f7f7f", // group 8 - 灰色
    9: "#bcbd22", // group 9 - 黄绿色
    10: "#17becf", // group 10 - 青色
  };

  // 加载 JSON 数据
  useEffect(() => {
    fetch("./nodeData.json")
      .then((response) => response.json())
      .then((data) => {
        setGraphData(data);
        setFilteredData(data); // 初始显示完整图
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  useEffect(() => {
    if (!graphData || !filteredData) return;

    const { nodes, links } = filteredData;

    const width = 840, height = 600;

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
        setSelectedElement({ type: "link", data: d });
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
      .attr("r", 8)
      .attr("fill", (d) => groupColorMapping[d.group]) // 使用 groupColorMapping 根据 group 设置颜色
      .on("click", (event, d) => {
        setSelectedElement({ type: "node", data: d });
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
  }, [filteredData, graphData]);

  const handleGroupChange = (value) => {
    setSelectedGroup(value); // 设置当前选中的类别
  };

  const handleRenderSubgraph = () => {
    if (!selectedGroup || !graphData) return;

    // 筛选出当前类别的节点
    const filteredNodes = graphData.nodes.filter((node) => node.group === selectedGroup);
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

    // 修复 link 的 source 和 target 引用问题
    const filteredLinks = graphData.links
      .filter(
        (link) =>
          filteredNodeIds.has(typeof link.source === "object" ? link.source.id : link.source) &&
          filteredNodeIds.has(typeof link.target === "object" ? link.target.id : link.target)
      )
      .map((link) => ({
        ...link,
        source: typeof link.source === "object" ? link.source.id : link.source,
        target: typeof link.target === "object" ? link.target.id : link.target,
      }));

    // 设置筛选后的数据
    setFilteredData({ nodes: filteredNodes, links: filteredLinks });
  };

  const handleResetGraph = () => {
    setFilteredData(graphData);
  };

  return (
    <div id="container">
      <div className="left" ref={leftRef}>
        {/* D3 图表会被插入到这里 */}
      </div>
      <div className="right">
        <div className="subgraphselect">
          <Select
            placeholder="选择节点类别"
            onChange={handleGroupChange}
            style={{ width: 200 }}
          >
            {[...Array(10).keys()].map((group) => (
              <Option key={group + 1} value={group + 1}>
                类别 {group + 1}
              </Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleRenderSubgraph}>
            渲染子图
          </Button>
          <Button type="default" onClick={handleResetGraph}>
            显示所有
          </Button>
        </div>
        <Card
          title={selectedElement ? `类型: ${selectedElement.type}` : "请选择节点或边"}
          style={{ width: 280, height: 180, backgroundColor: '#ececec' }}
        >
          {selectedElement ? (
            selectedElement.type === "node" ? (
              <div>
                <p><strong>ID:</strong> {selectedElement.data.id || "N/A"}</p>
                <p><strong>Index:</strong> {selectedElement.data.index || "N/A"}</p>
                <p><strong>Group:</strong> {selectedElement.data.group || "N/A"}</p>
              </div>
            ) : selectedElement.type === "link" ? (
              <div>
                <p><strong>Source:</strong> {selectedElement.data.source.id || "N/A"}</p>
                <p><strong>Target:</strong> {selectedElement.data.target.id || "N/A"}</p>
                <p><strong>Value:</strong> {selectedElement.data.value || "N/A"}</p>
              </div>
            ) : null
          ) : (
            <p>点击节点或边以查看详细信息</p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default App;
