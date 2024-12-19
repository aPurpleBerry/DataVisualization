// TODO
// 用户自定义子图步数
// 有向图
 
// export default TxNode;
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, Select, Button } from "antd";
import "./App.css";
import "./TxNode.css";
import axios from "axios";

const { Option } = Select;

function TxNode() {
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
  };

  // 加载 JSON 数据
  useEffect(() => {
    fetch("./txData.json")
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
  
    const width = 720, height = 600;
  
    // 清空之前的内容（避免重复渲染）
    d3.select(leftRef.current).selectAll("*").remove();
  
    // 创建 SVG 容器
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
        d3.forceLink(links)
          .id((d) => d.id)
          .distance(70) // 固定边长度为 200（可根据需要调整）
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

    let clickTimer = null;
    // 绘制节点分组，支持叠加圆形和图标
    const nodeGroup = svg
    .append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", "node-group")
    .on("click", (event, d) => {
      // 如果已经触发双击，则忽略单击
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      // 设置定时器，延迟执行单击逻辑
      clickTimer = setTimeout(() => {
        nodeClick(d); // 单击逻辑
        setSelectedElement({ type: "node", data: d });
        clickTimer = null; // 清空定时器
      }, 200); // 300ms 是浏览器区分单击和双击的常见延迟
    })
    .on("dblclick", (event, d) => {
      // 清空单击定时器
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      // 执行双击逻辑
      handleNodeDoubleClick(d);
    })
    // .on("click", (event, d) => {
    //   nodeClick(d); // 保持你的原有点击逻辑
    //   setSelectedElement({ type: "node", data: d });
    // })
    // .on("dblclick", (event, d) => {
    //   // 双击渲染子图
    //   console.log('我是双击节点事件');
    //   handleNodeDoubleClick(d);
    // })
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

    // 绘制节点的背景圆
    nodeGroup
    .append("circle")
    .attr("r", 16) // 修改为更大的半径以适应图标
    .attr("fill", (d) => groupColorMapping[d.group]) // 使用 groupColorMapping 根据 group 设置颜色
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5);
  
    // 在节点圆中心叠加嵌入的 SVG 图标
  nodeGroup
  .append("foreignObject")
  .attr("x", -12) // 图标位置居中，偏移一半宽度
  .attr("y", -12) // 图标位置居中，偏移一半高度
  .attr("width", 24) // 图标宽度
  .attr("height", 24) // 图标高度
  .html((d) => d.icon || ""); // 从节点数据的 icon 字段插入嵌入的 SVG
  
    nodeGroup.append("title").text((d) => d.id);
  
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
  
      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
  
    // 定义每个组的文字描述
    const groupDescriptions = {
      1: "illicit", // 代表某种数字货币
      2: "licit", // 表示一个区块链项目
      3: "unknown", // 涉及的相关新闻
    };
  
    // 创建图例
    const legendData = Object.entries(groupColorMapping); // 从 groupColorMapping 提取颜色和类别
    const legend = svg
      .append("g")
      .attr("transform", `translate(10, ${height - 250})`); // 图例位置，可调整
  
    legendData.forEach(([group, color], index) => {
      const legendItem = legend.append("g").attr("transform", `translate(0, ${index * 20})`);
  
      // 矩形颜色块
      legendItem
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", color);
  
      // 对应文字
      legendItem
        .append("text")
        .attr("x", 25) // 文本位置
        .attr("y", 14) // 与矩形对齐
        .attr("font-size", "14px")
        .attr("fill", "#000")
        .text(groupDescriptions[group] || "其他节点"); // 从 groupDescriptions 动态获取文字描述
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
    if (!graphData) return;
    // 清除节点固定位置
    graphData.nodes.forEach((node) => {
      node.fx = null;
      node.fy = null;
    });

    // 恢复完整数据
    setFilteredData({ ...graphData });


    // 触发重新布局
    d3.select(leftRef.current).selectAll("*").remove(); // 清空图表
  };

  /* ****************网络请求******************* */
  // 网络请求函数，放在组件内部
  const apiKey = import.meta.env.VITE_API_KEY;
  const baseURL = import.meta.env.VITE_BASE_URL;

  const fetchData = async (d) => {  
    if(d == 'AaveAAVE' || d == 'CardanoADA') {
      console.log('fecth了');
       try {
        console.log('我是fetchData 我拿到了节点信息',d);
        
        // const response = await axios.get('https://api.example.com/data');
        // setData(response.data);
        const response = await axios.post(
          baseURL,
          {
              model: "qwen-plus", 
              messages: [
                  { role: "system", content: "You are a helpful assistant." },
                  { role: "user", content: '50字左右简短介绍一下'+d+',同时推测一下我可能会基于这个节点提什么问题' }
              ]
          },
          {
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${apiKey}`
              }
          }
        )
        // console.log(response.data.choices[0].message.content);
        return response.data.choices[0].message.content
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    
  };

  // 单击节点
  const nodeClick = async (node_detail) => {
    // if(node_detail.name != 'AaveAAVE' || node_detail.name != 'CardanoADA') return
    // console.log(node_detail.name);
    const chatMessages = document.getElementById('chatMessages');
  
    // 第一条消息立即显示
    const botMessageElement = document.createElement('div');
    botMessageElement.className = 'message';
    botMessageElement.textContent = `机器人: 正在为你查询节点【${node_detail.name}】...`;
    chatMessages.appendChild(botMessageElement);
    
    // 滚动到最新消息
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 第二条消息延时显示
    if(node_detail.name == 'AaveAAVE' || node_detail.name == 'CardanoADA') {
      console.log('hahaha');
      let res = await fetchData(node_detail.name)
      console.log(res);
      const botSearch = document.createElement('div');
      botSearch.className = 'message';
      botSearch.textContent = `机器人: ${res}`;
      chatMessages.appendChild(botSearch);
  
      // 滚动到最新消息
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    // setTimeout(() => {
    //   const botSearch = document.createElement('div');
    //   botSearch.className = 'message';
    //   botSearch.textContent = `机器人: 节点【${node_detail.name}】的详细信息已找到！`;
    //   chatMessages.appendChild(botSearch);
  
    //   // 滚动到最新消息
    //   chatMessages.scrollTop = chatMessages.scrollHeight;
    // }, 2000); // 2秒后显示第二条消息
  };

  // 双击节点-得到单步
  // const handleNodeDoubleClick = (clickedNode) => {
  //   if (!graphData) return;
  
  //   // 筛选与双击节点相关的边
  //   const relatedLinks = graphData.links.filter(
  //     (link) =>
  //       (link.source.id || link.source) === clickedNode.id ||
  //       (link.target.id || link.target) === clickedNode.id
  //   );
  
  //   // 获取相关节点 ID
  //   const relatedNodeIds = new Set(
  //     relatedLinks.flatMap((link) => [
  //       link.source.id || link.source,
  //       link.target.id || link.target,
  //     ])
  //   );
  
  //   // 筛选相关节点
  //   const relatedNodes = graphData.nodes.filter((node) =>
  //     relatedNodeIds.has(node.id)
  //   );
  
  //   // 如果相关数据为空，返回错误提示
  //   if (relatedNodes.length === 0 || relatedLinks.length === 0) {
  //     console.warn("未找到与该节点相关的数据:", clickedNode);
  //     alert("该节点无相关子图！");
  //     return;
  //   }
  
  //   // 更新子图数据
  //   setFilteredData({
  //     nodes: relatedNodes,
  //     links: relatedLinks,
  //   });
  
  //   console.log("双击节点渲染子图:", clickedNode);
  // };

  /*******************************两步函数***************************************/
  const handleNodeDoubleClick = (clickedNode) => {
    if (!graphData) return;
  
    // 调用提取两步子图的函数
    const subgraph = extractTwoStepSubgraph(clickedNode, graphData);
  
    // 检查子图数据是否为空
    if (subgraph.nodes.length === 0 || subgraph.links.length === 0) {
      console.warn("未找到与该节点相关的数据:", clickedNode);
      alert("该节点无相关子图！");
      return;
    }
  
    // 更新子图数据
    setFilteredData(subgraph);
  
    console.log("双击节点渲染两步子图:", clickedNode, subgraph);
  };
  

  // 两步函数 
  const extractTwoStepSubgraph = (clickedNode, graphData) => {
    if (!graphData) return { nodes: [], links: [] };
  
    const visitedNodes = new Set();
    const relatedNodes = new Map();
    const relatedLinks = new Set();
  
    const queue = [clickedNode.id];
  
    // BFS 两层深度
    for (let step = 0; step < 2; step++) {
      const currentLevel = [...queue];
      queue.length = 0;
  
      currentLevel.forEach((nodeId) => {
        if (visitedNodes.has(nodeId)) return;
        visitedNodes.add(nodeId);
  
        const links = graphData.links.filter(
          (link) =>
            (link.source.id || link.source) === nodeId ||
            (link.target.id || link.target) === nodeId
        );
  
        links.forEach((link) => {
          relatedLinks.add(link);
  
          const sourceId = link.source.id || link.source;
          const targetId = link.target.id || link.target;
  
          if (!visitedNodes.has(sourceId)) queue.push(sourceId);
          if (!visitedNodes.has(targetId)) queue.push(targetId);
  
          relatedNodes.set(sourceId, graphData.nodes.find((node) => node.id === sourceId));
          relatedNodes.set(targetId, graphData.nodes.find((node) => node.id === targetId));
        });
      });
    }
  
    return {
      nodes: Array.from(relatedNodes.values()),
      links: Array.from(relatedLinks),
    };
  };
  

  function handleSendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value;
    if (message) {
      const chatMessages = document.getElementById('chatMessages');
      // 用户消息
      const userMessageElement = document.createElement('div');
      userMessageElement.className = 'message';
      userMessageElement.textContent = `用户: ${message}`;
      chatMessages.appendChild(userMessageElement);
      
      // 机器人重复用户消息
      const botMessageElement = document.createElement('div');
      botMessageElement.className = 'message';
      botMessageElement.textContent = `机器人: ${message}`;
      chatMessages.appendChild(botMessageElement);

      input.value = '';
      // 滚动到最新消息
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
  

  return (
    <div id="container">
      <div className="left" ref={leftRef}>
        {/* D3 图表会被插入到这里 */}
      </div>
      <div className="right">
        {/* <div className="subGraphStep">
          <Input placeholder="双击选择节点的子图，默认步数2"></Input>
          <Button type="primary" onClick={() => setSteps(steps || 2)}>
            设置子图步数
          </Button>
        </div> */}
        <div className="subgraphselect"> 
          <Select
            placeholder="选择节点类别"
            onChange={handleGroupChange}
            style={{ width: 200 }}
          >
            {Object.entries(groupColorMapping).map(([group, color]) => (
              <Option key={group} value={parseInt(group, 10)}>
                <span style={{ color: color }}>类别 {group}</span>
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
        {/* <div className="subgraphselect">
          <Select
            placeholder="选择节点类别"
            onChange={handleGroupChange}
            style={{ width: 200 }}
          >
            {[...Array(3).keys()].map((group) => (
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
        </div> */}
        <Card
          // title={selectedElement ? `基本信息: ${selectedElement.type}` : "请选择节点或边"}
          style={{ width: 385, backgroundColor: '#ececec' }}
        >
          {selectedElement ? (
            selectedElement.type === "node" ? (
              <div>
                <h4>TX节点 - 基本信息</h4>
                <p><strong>交易的唯一标识符 tx_id:</strong> {selectedElement.data.id || "N/A"}</p>
                <p><strong>本交易的输入比特币金额的平均值 in_BTC_mean:</strong> {selectedElement.data.in_BTC_mean || "N/A"}</p>
                <p><strong>本交易的输入比特币金额总和 in_BTC_total:</strong> {selectedElement.data.in_BTC_total || "N/A"}</p>
                <p><strong>本交易的输出比特币金额的平均值 out_BTC_mean:</strong> {selectedElement.data.out_BTC_mean || "N/A"}</p>
                <p><strong>本交易的输出比特币金额总和 out_BTC_total:</strong> {selectedElement.data.out_BTC_total || "N/A"}</p>
              </div>
            ) : selectedElement.type === "link" ? (
              <div>
                <h4>边 - 基本信息</h4>
                <p><strong>Source:</strong> {selectedElement.data.source.id || "N/A"}</p>
                <p><strong>Target:</strong> {selectedElement.data.target.id || "N/A"}</p>
                <p><strong>Value:</strong> {selectedElement.data.value || "N/A"}</p>
                <p className="addr"><strong>Transaction Hash:</strong> {selectedElement.data.transaction_hash || "N/A"}</p>
              </div>
            ) : null
          ) : (
            <h3>点击节点或边以查看详细信息</h3>
          )}
        </Card>
        <div className="chatbox">
          {/* 聊天框组件插入到这里 */}
          <div className="chat-window">
            <div className="chat-messages" id="chatMessages">
              {/* 消息记录会插入到这里 */}
            </div>
          </div>
          <div className="chat-input">
            <input type="text" id="chatInput" placeholder="请输入消息..." />
            <button onClick={handleSendMessage} >发送</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TxNode;
