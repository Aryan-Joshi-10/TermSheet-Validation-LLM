# 🧾 Term Sheet Validation using LLM (Mistral + LlamaIndex)

A powerful LLM-based pipeline to **extract** and **validate** term sheets (e.g., Investment Agreements, M&A, Loan Agreements) using **Mistral model via Ollama** and **LlamaIndex**. The system parses PDF documents, identifies relevant clauses, and checks compliance with standard term sheet structures — ideal for automating due diligence, investment analysis, or legal document review.


---

## 🚀 Features

- **PDF Parsing with LlamaParse** – Converts raw PDF term sheets into clean, structured markdown text.
- 🤖 **LLM Reasoning (Mistral via Ollama)** – Uses a locally hosted Mistral model for text understanding and completion.
- 🔍 **Semantic Search & Extraction** – Employs vector embeddings for context-aware keyword and clause retrieval.
- ✅ **Validation Tooling** – Cross-checks extracted data against standard legal structures and predefined compliance rules.


---

## 🧠 Tech Stack

- **Python**
- **Mistral Model** (hosted via [Ollama](https://ollama.com))
- **LlamaIndex**
- **LlamaParse**

---