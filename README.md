# ⚡ BrainSpark AI - Intelligent Study & Quiz Platform

[![Build Status](https://github.com/primus2412/project-school/actions/workflows/ci.yml/badge.svg)](https://github.com/primus2412/project-school/actions)
[![Node.js](https://img.shields.io/badge/Node.js-v22.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-cyan.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**BrainSpark AI** is a production-grade full-stack web application designed to convert raw study materials (text or PDF documents) into interactive multiple-choice assessment quizzes. Features hybrid AI architecture: powered by OpenAI GPT-4o-mini with an automated fallback to a smart offline NLP sentence-parsing engine.

---

## ✨ Key Features

- 📄 **PDF & Raw Text Parsing**: Instant text extraction from uploaded study PDFs or raw notes.
- 🤖 **Hybrid AI Quiz Generator Engine**:
  - **Online Mode**: Integrates OpenAI API (`gpt-4o-mini`) for contextually rich questions.
  - **Offline Fallback**: Built-in rule-based NLP engine using keyword extraction and distractor generation when unconfigured.
- ⏱️ **Interactive Quiz UI**: Real-time timer, progress indicator, and glassmorphism interface.
- 📊 **Instant Performance Scorecard**: Detailed answer evaluation, score percentage, and explanation breakdown.
- 🐳 **Containerized & CI Ready**: Dockerfile, `docker-compose`, and GitHub Actions CI workflow included.

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    User[Web Client / UI] -->|PDF / Text Upload| Server[Express Backend API]
    Server -->|PDF Parser| Extractor[fileService - Text Extraction]
    Extractor --> Engine[aiService - Hybrid Generator]
    Engine -->|If API Key Present| OpenAI[OpenAI GPT-4o-mini]
    Engine -->|If No API Key / Offline| NLP[Offline NLP Engine]
    OpenAI --> Evaluator[Evaluation Router]
    NLP --> Evaluator
    Evaluator -->|Score & Explanations| User
```

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/primus2412/project-school.git
cd project-school
npm install
```

### 2. Environment Setup (Optional)
Create a `.env` file in the root directory:
```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
```
*(If no API key is provided, the system seamlessly uses the offline smart NLP engine).*

### 3. Run Locally
```bash
npm start
```
Open your browser at: `http://localhost:5000`

### 4. Run Tests
```bash
npm test
```

### 5. Run with Docker
```bash
docker-compose up --build
```

---

## 📄 License
MIT License. Created by [primus2412](https://github.com/primus2412).