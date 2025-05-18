const { tools, availableTools } = require("./tools.js");

const MODEL_NAME = "PetrosStav/gemma3-tools:4b"; // 사용하려는 모델 이름 (예: llama2, llama3)
const OLLAMA_API_URL = "http://127.0.0.1:11434/api/chat";

// --- Ollama API와 상호작용하는 함수 ---
async function chatWithOllama(messages) {
  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages,
        tools, // 정의된 도구 정보 전달
        stream: false, // 스트리밍 대신 한 번에 응답 받기 (예제 단순화)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Ollama 통신 중 오류 발생:", error);
    return null;
  }
}

async function callFunction(name, args) {
  const toolFunction = availableTools[name];
  if (!toolFunction) {
    console.warn(`-> 경고: 알 수 없는 도구 "${functionName}"`);
    return `Error: Tool "${name}" not found.`
  }

  try {
    const result = await toolFunction(args);
    if (result) {
      console.log(`-> 결과:`, result);
      return String(result);
    }
    return "no result";
  } catch (error) {
    console.error(`-> 에러: ${error.message}`);
    return `Error executing tool ${name}: ${error.message}`;
  }
}

exports.MODEL_NAME = MODEL_NAME;
exports.chatWithOllama = chatWithOllama;
exports.callFunction = callFunction;
