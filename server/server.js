// 引入 express、dotenv、node-fetch
import express from "express";           // 用于创建 HTTP 服务
import dotenv from "dotenv";             // 用于加载 .env 文件中的环境变量
import fetch from "node-fetch";          // Node.js 版 fetch 方法

dotenv.config();                         // 读取并解析 .env 文件

const app = express();                   // 创建 Express 应用实例

// 静态资源托管，public 文件夹下的文件可以直接在浏览器访问
app.use(express.static("public"));

// 定义 /session 接口，用于向 OpenAI 请求一个实时通信所需的临时 Session 密钥
app.get("/session", async (req, res) => {
  console.log(process.env.OPENAI_API_KEY);
  try {
    // 调用 OpenAI Realtime API 的 /v1/realtime/sessions 接口，创建一个新的 session
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",                             // 使用 POST 请求
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,  // 服务器端使用标准 OpenAI API key
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17", // 指定用于 WebRTC 的模型
        voice: "verse",                              // 设置返回语音的类型
      }),
    });

    // 将结果转成 JSON
    const data = await response.json();

    // 将 OpenAI 返回的 JSON 直接返回给前端
    res.send(data);
  } catch (error) {
    // 如果发生错误，返回错误信息
    res.status(500).send({ error: error.message });
  }
});

// 启动服务器，监听 3000 端口
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
