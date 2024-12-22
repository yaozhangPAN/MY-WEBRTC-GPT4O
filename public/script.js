// 预先定义一些全局变量
let pc;               // RTCPeerConnection 对象
let dc;               // DataChannel 对象
let localTrack;       // 本地音频轨道
let isMuted = false;  // 是否静音（默认否）

// 获取页面元素
const startCallBtn = document.getElementById("startCallBtn"); // "Start Call" 按钮
const muteBtn = document.getElementById("muteBtn");           // "mute" 按钮
const audioEl = document.getElementById("gpt-audio");         // 播放 GPT 音频的 audio 标签

// 给 "Start Call" 按钮添加点击事件监听
startCallBtn.addEventListener("click", async () => {
  // 调用 init 函数，发起与 GPT 的实时通话
  await init();
});

// 给 "mute" 按钮添加点击事件监听
muteBtn.addEventListener("click", () => {
  // 切换麦克风的 enabled 状态
  if (localTrack) {
    isMuted = !isMuted;              // 取反静音状态
    localTrack.enabled = !isMuted;   // 根据 isMuted 来设置轨道的 enabled
    muteBtn.textContent = isMuted ? "unmute" : "mute"; // 改变按钮文字
  }
});

// init 函数：初始化 WebRTC 连接并与 OpenAI Realtime API 完成 SDP 协商
async function init() {
  try {
    // 1. 从服务器获取临时令牌 (ephemeral key)
    const tokenResponse = await fetch("/session");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value; // 从返回数据中提取 client_secret

    // 2. 创建 RTCPeerConnection 对象
    pc = new RTCPeerConnection();

    // 3. 当远端（GPT）通过 track 事件发送音频时，设置 audio 标签的播放源
    pc.ontrack = (event) => {
      audioEl.srcObject = event.streams[0]; 
    };

    // 4. 获取本地音频轨道（麦克风），并将其添加到 RTCPeerConnection
    const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
    localTrack = ms.getTracks()[0];
    pc.addTrack(localTrack);

    // 5. 创建数据通道，用于发送和接收实时事件
    dc = pc.createDataChannel("oai-events");
    dc.addEventListener("message", (e) => {
      // 服务器发送的 Realtime 事件会在这里收到，需要手动 JSON.parse
      const realtimeEvent = JSON.parse(e.data);
      console.log("Received event from GPT:", realtimeEvent);
    });

    // 6. 创建本地 SDP offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // 7. 将本地 SDP (offer.sdp) 发送给 OpenAI Realtime API 并获取 answer
    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,  // 使用临时令牌
        "Content-Type": "application/sdp"
      },
    });

    // 8. 将服务器返回的 SDP answer 设置为远端描述
    const answer = {
      type: "answer",
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    console.log("WebRTC connection with GPT established.");

    // （可选）示例：演示如何往数据通道发送事件
    // 这里举例发送一个“response.create”类型的事件，让 GPT 输出一段文字
    const responseCreate = {
      type: "response.create",
      response: {
        modalities: ["text"],            // 让 GPT 同时输出文字
        instructions: "Write a haiku about code", // 让 GPT 写一句与代码相关的俳句
      },
    };
    // 通过数据通道发送
    dc.send(JSON.stringify(responseCreate));

  } catch (err) {
    console.error("Error during init:", err);
  }
}
