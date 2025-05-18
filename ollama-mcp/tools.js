const fs = require("fs/promises");

const TOOL_TYPE = {
  FUNCTION: "function",
};

const FIELD_TYPE = {
  OBJECT: "object",
  STRING: "string",
};

const TOOL = {
  READ_FILE: "readFile",
  WRITE_FILE: "writeFile",
};

// --- 사용할 수 있는 도구 정의 ---
// Ollama API에 전달할 도구 스키마입니다.
const tools = [
  {
    type: TOOL_TYPE.FUNCTION,
    function: {
      name: TOOL.READ_FILE,
      description: "주어진 경로의 텍스트 파일 내용을 읽습니다.",
      parameters: {
        type: FIELD_TYPE.OBJECT,
        properties: {
          filePath: {
            type: FIELD_TYPE.STRING,
            description: "읽을 파일의 경로",
          },
        },
        required: ["filePath"],
      },
    },
  },
  {
    type: TOOL_TYPE.FUNCTION,
    function: {
      name: TOOL.WRITE_FILE,
      description: "주어진 경로에 텍스트 파일을 만듭니다.",
      parameters: {
        type: FIELD_TYPE.OBJECT,
        properties: {
          filePath: {
            type: FIELD_TYPE.STRING,
            description: "새로 만들 파일의 경로",
          },
          content: {
            type: FIELD_TYPE.STRING,
            description: "파일에 쓸 내용",
          },
        },
        required: ["filePath", "content"],
      },
    },
  },
];

// --- 도구에 해당하는 실제 Node.js 함수 구현 ---
// 이 함수들은 LLM의 지시에 따라 애플리케이션이 실행합니다.
const availableTools = {
  [TOOL.READ_FILE]: async ({ filePath }) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      console.log("-> Tool: readFile 성공");
      return content; // 파일 내용 반환
    } catch (error) {
      console.error(`-> Tool: readFile 실패 - ${error.message}`);
      return `Error reading file '${filePath}': ${error.message}`; // 에러 메시지 반환
    }
  },
  // 여기에 다른 도구 함수들을 구현합니다.
  [TOOL.WRITE_FILE]: async ({ filePath, content }) => {
    try {
      await fs.access(filePath); // 파일 존재 확인
      console.log(`-> Tool: writeFile - ${filePath} 파일이 이미 존재`);
    } catch (error) {
      // 파일이 없으면 생성
      if (error.code === "ENOENT") {
        try {
          await fs.writeFile(filePath, content, "utf-8");
          console.log(`-> Tool: writeFile 성공 - ${filePath}`);
        } catch (writeError) {
          console.log(`-> Tool: writeFile 실패 - ${writeError.message}`);
        }
      } else {
        console.log(`-> Tool: writeFile 실패 - ${error.message}`);
      }
    }
  },
};

exports.tools = tools;
exports.availableTools = availableTools;
