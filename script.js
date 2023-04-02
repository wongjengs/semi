const sentenceForm = document.getElementById("sentence-form");
const fileInput = document.getElementById("file-input");
const sentenceInput = document.getElementById("sentence-input");
const scrambledContainer = document.getElementById("scrambled-container");
const scrambledSentence = document.getElementById("scrambled-sentence");
const selectedSentence = document.getElementById("selected-sentence");
const checkOrderButton = document.getElementById("check-order");
const feedback = document.getElementById("feedback");
const sentencesLeftCounter = document.createElement("p");

let sentences = [];
let currentSentenceIndex = 0;

sentenceForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let sentence = sentenceInput.value.trim();
  if (!sentence) return;
  sentences = [sentence];
  currentSentenceIndex = 0;
  startGame();
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    sentences = event.target.result.trim().split("\n");
    currentSentenceIndex = 0;
    startGame();
  };
  reader.readAsText(file);
});

function startGame() {
  if (sentences.length > 0) {
    scrambledContainer.classList.remove("hidden");
    scrambledSentence.innerHTML = "";
    selectedSentence.innerHTML = "";
    feedback.classList.add("hidden");
    scrambleSentence(sentences[currentSentenceIndex]);
    updateSentencesLeftCounter();
    sentenceInput.value = ""; // Clear input text box
  }
}


function updateSentencesLeftCounter() {
  sentencesLeftCounter.textContent = `Sentences left: ${sentences.length - currentSentenceIndex - 1}`;
  scrambledContainer.appendChild(sentencesLeftCounter);
}

function scrambleSentence(sentence) {
  const language = detectLanguage(sentence);
  let words;

  if (language === "Chinese") {
    words = sentence.match(/[\u4e00-\u9FFF]|[\u3000-\u303F]+|[^a-zA-Z0-9\u4e00-\u9FFF\uAC00-\uD7A3\s]/g);
  } else {
    words = sentence.match(/[\uAC00-\uD7AF]+|[\w']+|[.,!?;]/g);
  }

  let shuffledWords = words.slice().sort(() => Math.random() - 0.5);

  while (JSON.stringify(words) === JSON.stringify(shuffledWords)) {
    shuffledWords = words.slice().sort(() => Math.random() - 0.5);
  }

  shuffledWords.forEach((word) => {
    const li = document.createElement("li");
    li.textContent = word;
    li.addEventListener("click", () => {
      if (li.classList.contains("selected")) {
        return; // If the word is already selected, do nothing
      }
      li.classList.add("selected");
      const selectedLi = document.createElement("li");
      selectedLi.textContent = word;
      selectedLi.addEventListener("click", () => {
        li.classList.remove("selected");
        selectedSentence.removeChild(selectedLi);
      });
      selectedSentence.appendChild(selectedLi);
    });
    scrambledSentence.appendChild(li);
  });
}

checkOrderButton.addEventListener("click", () => {
  const selectedWords = Array.from(selectedSentence.children).map(
    (li) => li.textContent
  );

  const language = detectLanguage(sentences[currentSentenceIndex]);

  const selectedSentenceText = joinSelectedWords(language, selectedWords);

  const originalSentence = sentences[currentSentenceIndex];

  const isCorrect = selectedSentenceText === originalSentence;

  feedback.textContent = isCorrect
    ? "Correct! You've unscrambled the sentence!"
    : "Incorrect. Please try again.";
  feedback.classList.remove("hidden");

  if (isCorrect) {
    currentSentenceIndex++;
    if (currentSentenceIndex < sentences.length) {
      setTimeout(() => {
        startGame();
      }, 2000);
    } else {
      setTimeout(() => {
        alert("Congratulations! You've unscrambled all sentences.");
        scrambledContainer.classList.add("hidden");
      }, 2000);
    }
  }
});

function detectLanguage(sentence) {
  if (/[a-zA-Z]/.test(sentence)) {
    return "English";
  } else if (/[\u4e00-\u9FFF]/.test(sentence)) {
    return "Chinese";
  } else if (/[\uAC00-\uD7A3]/.test(sentence)) {
    return "Korean";
  }
  return "Unknown";
}

function joinSelectedWords(language, selectedWords) {
  if (language === "Chinese") {
    return selectedWords.join("");
  } else {
    return selectedWords.join(" ").replace(/\s([.,!?])/g, '$1');
  }
}
