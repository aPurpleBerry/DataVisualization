import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const About = () => {
  const leftRef = useRef(); // 左侧容器引用
  const [data, setData] = useState(null);

  useEffect(() => {
    // 加载 JSON 数据
    fetch("./project_graph.json")
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData); // 设置数据状态
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  useEffect(() => {
    if (!data || !leftRef.current) return; // 确保数据和容器加载完成

    // const width = 800;
    // const height = 600;
    const width = 720, height = 600;

    const container = d3.select(leftRef.current);
    container.selectAll("*").remove(); // 清空之前的内容

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      // .style("border", "1px solid black");

    // 创建力导向布局
    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.link)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // 绘制连线
    const link = svg
      .append("g")
      .selectAll("line")
      .data(data.link)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2);

    // 绘制节点
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d) =>
        d.Tag.includes("Digital Currency") ? "#69b3a2" : "#ff6347"
      )
      .call(drag(simulation));

    // 添加节点标签
    const label = svg
      .append("g")
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .text((d) => d.Name)
      .attr("x", 6)
      .attr("y", 3)
      .attr("font-size", "12px");

    // 更新位置
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      label.attr("x", (d) => d.x + 10).attr("y", (d) => d.y + 3);
    });

    // 拖拽行为
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }, [data]);

  return (
    <div id="container">
      <div className="left" ref={leftRef}>
        {/* D3 图表会被插入到这里 */}
      </div>
      <div className="right">
        {/* 可扩展：其他内容 */}
      </div>
    </div>
  );
};

export default About;
