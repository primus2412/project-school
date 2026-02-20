let currentQuiz = [];

async function generateQuiz() {
  const content = document.getElementById("content").value;
  const difficulty = document.getElementById("difficulty").value;
  const count = document.getElementById("count").value;

  const response = await fetch("/api/generate-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, difficulty, count })
  });

  const quiz = await response.json();
  currentQuiz = quiz;
  displayQuiz(quiz);
}

function displayQuiz(quiz) {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  quiz.forEach((q, index) => {
    const div = document.createElement("div");
    div.classList.add("question");

    div.innerHTML = `<h3>${q.question}</h3>`;

    q.options.forEach(option => {
      div.innerHTML += `
        <label>
          <input type="radio" name="q${index}" value="${option}">
          ${option}
        </label><br>
      `;
    });

    container.appendChild(div);
  });

  container.innerHTML += `<button onclick="submitQuiz()">Submit Quiz</button>`;
}

async function submitQuiz() {
  let answers = [];

  currentQuiz.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    answers.push(selected ? selected.value : null);
  });

  const response = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, quiz: currentQuiz })
  });

  const result = await response.json();

  document.getElementById("result").innerHTML =
    `<h2>Score: ${result.score} / ${result.total}</h2>`;
}