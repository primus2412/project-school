import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateQuiz(content, difficulty, count) {
  const prompt = `
Generate ${count} multiple choice questions from the text below.
Difficulty: ${difficulty}

Return ONLY JSON in this format:
[
  {
    "question": "",
    "options": ["", "", "", ""],
    "correctAnswer": ""
  }
]

Text:
${content.slice(0, 4000)}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  return JSON.parse(response.choices[0].message.content);
}