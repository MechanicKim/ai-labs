# MCP with Ollama

### Ollama 설치
- [설치](https://github.com/ollama/ollama?tab=readme-ov-file#macos)
- [빠른 시작](https://github.com/ollama/ollama?tab=readme-ov-file#quickstart)
- [REST API](https://github.com/ollama/ollama?tab=readme-ov-file#rest-api)
  - [POST /api/chat](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion)

### 각 파일의 역할
- app.js - 시작 파일
- ollama.js - Ollama API와 상호작용하는 함수가 있는 파일
- tools.js - 사용 가능한 도구 정의

### 이 예제에서 사용한 모델
- llama3.2 -> 한글을 잘 못함
- gemma3:4b -> tools 미지원
- PetrosStav/gemma3-tools:4b -> tools 지원

### 시작
```
node app.js
```
- 파일 쓰기: ./example.txt 파일을 만들어줘. 내용은 "안녕 example!"
- 파일 읽기: ./example.txt 파일을 읽어줘.