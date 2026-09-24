document.addEventListener("DOMContentLoaded", () => {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const dropzone = document.getElementById("dropzone");
  const pdfInput = document.getElementById("pdf-file");
  const fileNameDisplay = document.getElementById("file-name");
  const quizForm = document.getElementById("quiz-form");

  const inputSection = document.getElementById("input-section");
  const loadingSection = document.getElementById("loading-section");
  const quizSection = document.getElementById("quiz-section");
  const resultsSection = document.getElementById("results-section");

  const questionProgress = document.getElementById("quiz-progress-text");
  const progressFill = document.getElementById("progress-fill");
  const questionTitle = document.getElementById("question-title");
  const optionsContainer = document.getElementById("options-container");
  const nextBtn = document.getElementById("next-btn");

  let currentQuiz = [];
  let currentQuestionIdx = 0;
  let userAnswers = {};
  let timerInterval = null;
  let secondsElapsed = 0;

  // Tabs handling
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const tabId = btn.dataset.tab + "-tab-content";
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Dropzone handling
  dropzone.addEventListener("click", () => pdfInput.click());

  pdfInput.addEventListener("change", () => {
    if (pdfInput.files.length > 0) {
      fileNameDisplay.textContent = `Selected: ${pdfInput.files[0].name}`;
    }
  });

  // Form Submit
  quizForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const activeTab = document.querySelector(".tab-btn.active").dataset.tab;
    const formData = new FormData();

    if (activeTab === "text") {
      const text = document.getElementById("study-content").value.trim();
      if (!text || text.length < 50) {
        alert("Please enter at least 50 characters of study text.");
        return;
      }
      formData.append("content", text);
    } else {
      if (pdfInput.files.length === 0) {
        alert("Please select a PDF file first.");
        return;
      }
      formData.append("file", pdfInput.files[0]);
    }

    formData.append("difficulty", document.getElementById("difficulty").value);
    formData.append("count", document.getElementById("question-count").value);

    // Show loading
    inputSection.classList.add("hidden");
    loadingSection.classList.remove("hidden");

    try {
      const resp = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData
      });

      const data = await resp.json();
      if (!resp.ok || !data.quiz) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      currentQuiz = data.quiz;
      startQuiz();

    } catch (err) {
      alert("Error: " + err.message);
      loadingSection.classList.add("hidden");
      inputSection.classList.remove("hidden");
    }
  });

  function startQuiz() {
    loadingSection.classList.add("hidden");
    quizSection.classList.remove("hidden");

    currentQuestionIdx = 0;
    userAnswers = {};
    secondsElapsed = 0;

    startTimer();
    renderQuestion();
  }

  function startTimer() {
    clearInterval(timerInterval);
    const timerDisplay = document.getElementById("quiz-timer");
    timerInterval = setInterval(() => {
      secondsElapsed++;
      const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
      const secs = String(secondsElapsed % 60).padStart(2, "0");
      timerDisplay.textContent = `⏱️ ${mins}:${secs}`;
    }, 1000);
  }

  function renderQuestion() {
    const q = currentQuiz[currentQuestionIdx];
    questionProgress.textContent = `Question ${currentQuestionIdx + 1} of ${currentQuiz.length}`;
    progressFill.style.width = `${((currentQuestionIdx + 1) / currentQuiz.length) * 100}%`;

    questionTitle.textContent = q.question;
    optionsContainer.innerHTML = "";

    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;

      if (userAnswers[currentQuestionIdx] === opt) {
        btn.classList.add("selected");
      }

      btn.addEventListener("click", () => {
        document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        userAnswers[currentQuestionIdx] = opt;
      });

      optionsContainer.appendChild(btn);
    });

    if (currentQuestionIdx === currentQuiz.length - 1) {
      nextBtn.textContent = "Finish & Submit Quiz ✨";
    } else {
      nextBtn.textContent = "Next Question ➔";
    }
  }

  nextBtn.addEventListener("click", async () => {
    if (!userAnswers[currentQuestionIdx]) {
      alert("Please select an answer option before proceeding.");
      return;
    }

    if (currentQuestionIdx < currentQuiz.length - 1) {
      currentQuestionIdx++;
      renderQuestion();
    } else {
      clearInterval(timerInterval);
      await submitEvaluation();
    }
  });

  async function submitEvaluation() {
    quizSection.classList.add("hidden");
    loadingSection.classList.remove("hidden");

    try {
      const resp = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: userAnswers, quiz: currentQuiz })
      });

      const evalData = await resp.json();
      loadingSection.classList.add("hidden");
      resultsSection.classList.remove("hidden");

      document.getElementById("score-percentage").textContent = `${evalData.percentage}%`;
      document.getElementById("score-fraction").textContent = `${evalData.score} / ${evalData.total} Correct`;

      const breakdownContainer = document.getElementById("breakdown-container");
      breakdownContainer.innerHTML = "";

      evalData.breakdown.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = `breakdown-item ${item.isCorrect ? "correct" : "incorrect"}`;
        div.innerHTML = `
          <strong>Q${idx + 1}: ${item.question}</strong>
          <p style="margin-top:0.4rem; font-size:0.9rem; color: ${item.isCorrect ? '#22c55e' : '#ef4444'};">
            ${item.isCorrect ? "✅ Correct" : "❌ Incorrect"} - Your choice: <em>${item.userAnswer}</em>
          </p>
          ${!item.isCorrect ? `<p style="font-size:0.85rem; color:#38bdf8;">Correct Answer: <strong>${item.correctAnswer}</strong></p>` : ""}
          ${item.explanation ? `<p style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">💡 ${item.explanation}</p>` : ""}
        `;
        breakdownContainer.appendChild(div);
      });

    } catch (err) {
      alert("Evaluation failed: " + err.message);
    }
  }

  document.getElementById("restart-btn").addEventListener("click", () => {
    resultsSection.classList.add("hidden");
    inputSection.classList.remove("hidden");
  });
});