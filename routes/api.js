import express from "express";
import multer from "multer";
import fs from "fs";
import { extractTextFromPDF } from "../services/fileService.js";
import { generateQuiz } from "../services/aiService.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/generate-quiz", upload.single("file"), async (req, res) => {
  let filePath = null;
  try {
    let content = req.body.content || "";

    if (req.file) {
      filePath = req.file.path;
      content = await extractTextFromPDF(filePath);
    }

    const { difficulty, count } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "No text content or valid PDF provided" });
    }

    const quiz = await generateQuiz(content, difficulty, count);
    res.json({ success: true, count: quiz.length, quiz });

  } catch (error) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: "Failed to generate quiz: " + error.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (_) {}
    }
  }
});

router.post("/evaluate", (req, res) => {
  const { answers, quiz } = req.body;

  if (!quiz || !Array.isArray(quiz) || !answers) {
    return res.status(400).json({ error: "Invalid quiz payload or answers" });
  }

  let score = 0;
  const breakdown = quiz.map((q, index) => {
    const isCorrect = answers[index] === q.correctAnswer;
    if (isCorrect) score++;
    return {
      question: q.question,
      userAnswer: answers[index] || "Unanswered",
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation || ""
    };
  });

  res.json({
    score,
    total: quiz.length,
    percentage: Math.round((score / quiz.length) * 100),
    breakdown
  });
});

export default router;