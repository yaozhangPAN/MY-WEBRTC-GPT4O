# WebRTC + GPT Real-time Voice

## 简介

本项目演示了如何使用 OpenAI 的 Realtime API，通过 WebRTC 方式与 GPT 模型（如 `gpt-4o-realtime-preview-2024-12-17`）进行实时语音通话。浏览器端会播放 GPT 返回的语音流，开发者也可以在数据通道上与 GPT 进行事件交互，实现语音与文本的综合对话体验。

## 功能

1. **实时语音通话**：浏览器端麦克风音频轨道发送给 GPT，GPT 返回生成的语音流并自动播放。  
2. **数据通道事件**：可以向 GPT 发送指令（如 `response.create`，让 GPT 生成文本或语音），也能监听 GPT 返回的事件。  
3. **静音功能**：可以随时关闭/开启本地麦克风发送给 GPT 的音频数据。  

## 使用方法

1. **安装依赖**  
   在项目根目录下执行：
   ```bash
   npm install

2. 运行项目命令：
   npm start