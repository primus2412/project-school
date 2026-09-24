import test from 'node:test';
import assert from 'node:assert';
import { generateQuiz } from '../services/aiService.js';

test('Offline Quiz Generator extracts questions from text', async () => {
  const sampleText = `
    Artificial Intelligence is transforming modern software engineering. 
    Machine learning algorithms optimize data pipelines and real-time prediction engines.
    Neural networks are designed to simulate biological synaptic connections in deep learning tasks.
    Natural language processing enables autonomous agent communication and text analysis.
  `;

  const quiz = await generateQuiz(sampleText, "Medium", 3);
  assert.ok(Array.isArray(quiz));
  assert.strictEqual(quiz.length, 3);
  
  quiz.forEach(item => {
    assert.ok(item.question);
    assert.ok(Array.isArray(item.options));
    assert.strictEqual(item.options.length, 4);
    assert.ok(item.correctAnswer);
  });
});
