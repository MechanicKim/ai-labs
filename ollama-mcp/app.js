const readline = require("readline");
const { availableTools } = require("./tools.js");
const { chatWithOllama, callFunction } = require("./ollama.js");

// --- 메인 대화 루프 ---
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages = []; // 대화 기록 저장

  console.log('대화를 종료하려면 "exit" 또는 "quit" 입력.');
  console.log("--------------------------------------------");

  while (true) {
    const userInput = await new Promise((resolve) =>
      rl.question("You: ", resolve)
    );

    if (["exit", "quit"].includes(userInput.toLowerCase())) {
      break;
    }

    // 1. 사용자 메시지 추가
    messages.push({ role: "user", content: userInput });

    // 2. Ollama에게 메시지와 도구 정보 전달
    const ollamaResponse = await chatWithOllama(messages);

    if (!ollamaResponse || !ollamaResponse.message) {
      const error = "모델 응답을 받지 못했거나 구조가 올바르지 않습니다.";
      console.log(error);
      if (messages[messages.length - 1].role !== "assistant") {
        messages.push({ role: "assistant", content: error });
      }
      continue;
    }

    const message = ollamaResponse.message;
    const { tool_calls } = message;

    // 3. 응답에 도구 호출이 있는지 확인
    if (tool_calls && tool_calls.length > 0) {
      const tool = tool_calls[tool_calls.length - 1];
      const functionName = tool.function.name;
      const functionArgs = tool.function.arguments;

      console.log(`-> 도구 이름: ${functionName}`);
      console.log(`-> 도구 인자: ${JSON.stringify(functionArgs, null, 2)}`);

      // 4. 정의된 도구 함수 실행
      const toolResult = await callFunction(functionName, functionArgs);
      // 5. 도구 실행 결과를 다시 Ollama에게 전달(이전 대화 내용 + LLM의 도구 호출 요청 + 도구 실행 결과)
      messages.push(message);
      messages.push({
        role: "tool",
        content: toolResult,
        // tool_calls,
      });
      // 6. 도구 결과를 바탕으로 최종 응답 다시 요청
      const finalResponse = await chatWithOllama(messages);
      if (finalResponse && finalResponse.message) {
        // console.log(finalResponse.message.content);
        messages.push(finalResponse.message);
      } else {
        console.log("모델 최종 응답을 받지 못했습니다.");
      }
    } else {
      // 3b. 도구 호출이 없으면 일반 응답
      console.log(message.content);
      messages.push(message); // LLM의 일반 응답 메시지 추가
    }

    console.log("--------------------------------------------");
  }

  rl.close();
  console.log("대화 종료.");
}

// 애플리케이션 시작
// availableTools.writeFile({
//   filePath: "./example.txt",
//   content:
//     "이 파일은 Llama 모델이 읽도록 만들어진 예제 파일입니다.\n파일 시스템 연동 도구 테스트를 위해 사용됩니다.",
// });

main();
