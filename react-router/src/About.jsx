import  { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Input,Button } from "antd";
import "./About.css";
import axios from "axios";

const About = () => {
  const leftRef = useRef(); // 左侧容器引用
  const [data, setData] = useState(null); // 原始数据
  const [filteredData, setFilteredData] = useState(null); // 筛选后的数据
  const [searchTag, setSearchTag] = useState(""); // 用户输入的 tag


  const [selectedInfo, setSelectedInfo] = useState(null); // 存储选中节点或边的信息


  useEffect(() => {
    // 加载 JSON 数据
    fetch("./project_graph.json")
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData); // 设置数据状态
        setFilteredData(jsonData); // 初始显示完整数据
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  useEffect(() => {
    if (!filteredData || !leftRef.current) return;

    const width = 800;
    const height = 600;

    const container = d3.select(leftRef.current);
    container.selectAll("*").remove(); // 清空之前的内容

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // 创建力导向布局
    const simulation = d3
      .forceSimulation(filteredData.nodes)
      .force(
        "link",
        d3
          .forceLink(filteredData.link)
          .id((d) => d.id)
          .distance(70)
      )
      .force("charge", d3.forceManyBody().strength(-30)) // 节点的排斥力
      .force("center", d3.forceCenter(width / 2, height / 2));

    // 绘制连线
    const link = svg
      .append("g")
      .selectAll("line")
      .data(filteredData.link)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2)
      .on("click", (event, d) => {
        // setSelectedInfo({ type: "link", data: d }); // 设置选中边的信息
        // 提取 source 和 target 的 id
        const sourceId = typeof d.source === "object" ? d.source.id : d.source;
        const targetId = typeof d.target === "object" ? d.target.id : d.target;

        setSelectedInfo({
          type: "link",
          data: { ...d, source: sourceId, target: targetId },
        });
      });

    // 绘制节点
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(filteredData.nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d) =>
        d.Tag.includes("Digital Currency") ? "#69b3a2" : "#ff6347"
      )
      .on("click", (event, d) => {
        nodeClick(d);
        setSelectedInfo({ type: "node", data: d }); // 设置选中节点的信息
      })
      .call(drag(simulation));

    // 添加节点标签
    const label = svg
      .append("g")
      .selectAll("text")
      .data(filteredData.nodes)
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
  }, [filteredData]);

  // 搜索函数
  const handleSearch = () => {
    if (!data || !searchTag.trim()) {
      setFilteredData(data);
      return;
    }
  
    const tag = searchTag.trim().toLowerCase(); // 转换为小写
    const filteredNodes = data.nodes.filter((node) =>
      node.Tag.split("、").some((t) => t.toLowerCase() === tag) // 分割并比较小写
    );
  
    const nodeIds = new Set(filteredNodes.map((node) => node.id));
    const filteredLinks = data.link.filter(
      (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
    );
  
    setFilteredData({ nodes: filteredNodes, link: filteredLinks });
  };

  const resetGraph = () => {
    setFilteredData(data); // 恢复初始数据
    setSearchTag(""); // 清空搜索框内容
  };
  
 /* *********************************************网络请求************************************ */
  const apiKey = import.meta.env.VITE_API_KEY; 
  const baseURL = import.meta.env.VITE_BASE_URL;
  const fetchData = async (nodeName) => {
    try {
      const response = await axios.post(
        baseURL,
        {
          model: "qwen-plus", 
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `50字左右简短介绍一下${nodeName},并提供两个基于该节点信息的推荐问题,
                                    注意返回数据格式为：{ nodeInfo: "节点介绍", recommendations: ["推荐问题1", "推荐问题2"] }` }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          }
        }
      );
      console.log('我是response:' ,response);
      console.log('我是response:' ,response.data.choices[0].message.content);
      console.log('我是response:' ,typeof response.data.choices[0].message.content);
      // const parsedData = JSON.parse(response.data.choices[0].message.content); // 转为对象 当且仅当返回值是对象有用

      
      // 假设返回数据格式为：{ nodeInfo: "节点介绍", recommendations: ["推荐问题1", "推荐问题2"] }
      // 返回数据处理
      const responseString = response.data.choices[0].message.content;
      // 尝试解析为 JSON 对象
      let parsedData;
      try {
        parsedData = JSON.parse(responseString);
      } catch (error) {
        console.warn("JSON.parse 解析失败，尝试使用正则解析:", error);

        // 使用正则提取 nodeInfo 和 recommendations
        const nodeInfoMatch = responseString.match(/nodeInfo:\s*"(.*?)"/);
        const recommendationsMatch = responseString.match(/recommendations:\s*\[([^\]]+)\]/);

        parsedData = {
          nodeInfo: nodeInfoMatch ? nodeInfoMatch[1] : "未能提取到节点信息",
          recommendations: recommendationsMatch
            ? recommendationsMatch[1].split(",").map(item => item.trim().replace(/(^"|"$)/g, ""))
            : []
        };
      }

      // 提取字段
      const { nodeInfo, recommendations } = parsedData;
      return { nodeInfo, recommendations };

    } catch (error) {
      console.error('Error fetching data:', error);
      return {
        nodeInfo: '查询失败，请稍后再试。',
        recommendations: []
      };
    }
  };

  const nodeClick = async (nodeDetail) => {
    const chatMessages = document.getElementById('chatMessages');
  
    // 显示查询提示信息
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'message';
    loadingMessage.textContent = `机器人: 正在为你查询节点【${nodeDetail. Name}】的信息，请稍后...`;
    chatMessages.appendChild(loadingMessage);
    scrollToBottom();
  
    console.log(nodeDetail.Name);
    // 查询节点数据
    
    const { nodeInfo, recommendations } = await fetchData(nodeDetail.Name);

    // 显示节点详细信息
    const nodeInfoMessage = document.createElement('div');
    nodeInfoMessage.className = 'message';
    nodeInfoMessage.textContent = `机器人: ${nodeInfo}`;
    chatMessages.appendChild(nodeInfoMessage);
    scrollToBottom();

    // 显示推荐问题1
    // 使用定时器延迟显示推荐问题
    if (recommendations.length > 0) {
      setTimeout(() => {
        const question1Message = document.createElement('div');
        question1Message.className = 'message';
        question1Message.textContent = `你或许想问: ${recommendations[0]}`;
        chatMessages.appendChild(question1Message);
        scrollToBottom();
      }, 1000); // 延迟 1 秒
    }

    // 显示推荐问题2
    if (recommendations.length > 1) {
      setTimeout(() => {
        const question2Message = document.createElement('div');
        question2Message.className = 'message';
        question2Message.textContent = `你或许想问: ${recommendations[1]}`;
        chatMessages.appendChild(question2Message);
        scrollToBottom();
      }, 2000); // 延迟 2 秒
    }
    
  };
  
  let message = ''
  function handleSendMessage() {
    const input = document.getElementById('chatInput');
    message = input.value.trim();
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

  // 无效
  const chatMessagesRef = useRef(null);
  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [message]); // 每当 messages 更新时滚动到底部

  return (
    <div id="container">
      <div className="left" ref={leftRef}>
        {/* D3 图表会被插入到这里 */}
      </div>
      <div className="right">
        {/* 可扩展：其他内容 */}
        <div className="infoDetails">
          <h3>详情信息</h3>
          {selectedInfo ? (
            selectedInfo.type === "node" ? (
              <div>
                <h5>节点信息</h5>
                <p><strong>ID:</strong> {selectedInfo.data.id}</p>
                <p><strong>Name:</strong> {selectedInfo.data.Name}</p>
                <p><strong>Tag:</strong> {selectedInfo.data.Tag}</p>
                <p><strong>Description:</strong> {selectedInfo.data.Description}</p>
                <p><strong>Price:</strong> {selectedInfo.data.Price}</p>
                <p><strong>Hyperlink:</strong>{selectedInfo.data.Hyperlink}</p>
                <p><strong>Price:</strong> {selectedInfo.data.Price}</p>
                <p>
                  <strong>Similar Projects:</strong>{" "}
                  {selectedInfo.data["Similar Projects"]
                    ? selectedInfo.data["Similar Projects"].replace(/#/g, "") // 去掉所有的 #
                    : "N/A"}
                </p>

                <p><strong>Price:</strong> {selectedInfo.data.Price}</p>
              </div>
            ) : (
              <div>
                <h5>边信息</h5>
                <p><strong>Source:</strong> {selectedInfo.data.source}</p>
                <p><strong>Target:</strong> {selectedInfo.data.target}</p>
                <p><strong>Relationship:</strong> {selectedInfo.data.relationship}</p>
              </div>
            )
          ) : (
            <p>点击节点或边查看详细信息</p>
          )}
          
        </div>

        {/* tag分类 */}
        <div className="controls" >
          <Input
            type="text"
            placeholder="输入Tag (例如 POW) 获取子图"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
          />
          <Button onClick={handleSearch}>搜索</Button>
          <Button onClick={resetGraph} style={{ marginLeft: "5px" }}>重置图</Button>
        </div>

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
};

export default About;
