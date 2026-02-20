import express from "express";
import multer from "multer";
import { extractTextFromPDF } from "../services/fileService.js";
import { generateQuiz } from "../services/aiService.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/generate-quiz", upload.single("file"), async (req, res) => {
  try {
    let content = req.body.content || "";

    if (req.file) {
      content = await extractTextFromPDF(req.file.path);
    }

    const { difficulty, count } = req.body;

    if (!content) {
      return res.status(400).json({ error: "No content provided" });
    }

    const quiz = await generateQuiz(content, difficulty, count);

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Quiz generation failed" });
  }
});

router.post("/evaluate", (req, res) => {
  const { answers, quiz } = req.body;

  let score = 0;

  quiz.forEach((q, index) => {
    if (answers[index] === q.correctAnswer) {
      score++;
    }
  });

  res.json({
    score,
    total: quiz.length
  });
});

export default router;