> 在 n8n 里，Agent 节点（比如 OpenAI Agent、Claude Agent、ChatGPT Agent 等）默认的输出很多时候是纯文本，并不保证是严格的 JSON 格       式。要想强制让它输出 JSON，可以有几种方法：

⸻

✅ 方法一：在 Prompt 里强制要求 JSON 格式

在 Agent 节点的 System Prompt 或 User Prompt 里加入类似提示：

请严格输出 JSON 格式，不能包含多余的文字或注释。
只输出如下格式：
```
{
  "title": "...",
  "body": "...",
  "tags": [...]
}

```
这样模型会更倾向于生成符合 JSON 的输出。
⚠️ 但是模型仍可能偶尔“跑偏”，生成非 JSON 的内容。

⸻

✅ 方法二：用 “Code” 节点 或 “Function” 节点 转换

无论 Agent 输出是什么，你可以在后续加一个 Function 节点 来解析/修正 JSON：
```

// Function 节点代码
try {
  return [{ json: JSON.parse($json["data"]) }];
} catch (e) {
  // 如果解析失败，可以尝试用正则抽取大括号内容
  const text = $json["data"];
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    return [{ json: JSON.parse(match[0]) }];
  } else {
    throw new Error("不是合法的 JSON 格式");
  }
}

```
这里假设 Agent 输出存在 data 字段里，你根据实际字段名调整。

⸻

✅ 方法三：用 “JSON Parse” 节点

n8n 内置 JSON Parse 节点，可以把字符串转换成 JSON。
前提是 Agent 输出的确是合法 JSON 字符串，否则依旧会报错。
（如果经常不合法，还是要配合 Function 节点做“清洗”）

⸻

✅ 方法四：用 LLM Output Parser

n8n 里的 AI 工具包有一些 parser，比如 Structured Output，可以指定输出 schema，让模型直接输出符合 JSON 的格式。
路径：AI → Output Parser → Structured Output
这样你定义好 schema（比如 title: string, body: string），n8n 会帮你解析成 JSON。

⸻

👉 建议你：
	1.	在 Agent prompt 里明确要求 JSON 格式输出。
	2.	在流程里紧跟一个 JSON Parse 节点（或者 Function 节点做兜底）。
	3.	如果任务是固定结构，最好用 Structured Output 方式。

