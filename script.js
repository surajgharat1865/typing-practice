let currentParagraph = "";
let words = [
    "technology","education","health","development","system","people","learning","skills",
    "future","communication","internet","environment","management","success","growth",
    "knowledge","experience","culture","society","innovation","performance","activity",
    "balance","energy","productivity","focus","career","improvement","practice","opportunity",
    "challenge","solution","progress","efficiency","teamwork","creativity","design","process"
];
let currentSession = 0;
let time = 420;
let timer;

function getRandomParagraph() {
    return paragraphs[Math.floor(Math.random() * paragraphs.length)];
}

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = seconds % 60;

    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}
function endSession() {
    alert("Time is over!");
    console.log("END SESSION TRIGGERED"); // 👈 check this

    document.getElementById("input").disabled = true;

    showResult(currentParagraph);
}

function showResult(original) {

    let box = document.getElementById("resultBox");
    box.classList.remove("hidden");

    let typed = document.getElementById("input").value;

    // CLEAN TEXT (remove extra spaces)
    let originalWords = original.trim().split(/\s+/);
    let typedWords = typed.trim().split(/\s+/);

    let spellingMistakes = 0;

    for (let i = 0; i < originalWords.length; i++) {
        if (typedWords[i] !== originalWords[i]) {
            spellingMistakes++;
        }
    }

    // Grammar
    let grammarMistakes = 0;

    if (typed.length > 0) {
        if (typed[0] !== typed[0].toUpperCase()) grammarMistakes++;
        if (!typed.trim().endsWith(".")) grammarMistakes++;
        if (typed.includes("  ")) grammarMistakes++;
    }

    // WPM (SAFE)
    let wordsTyped = typedWords.length;
    let minutes = (60 - time) / 60;
    let wpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;

    // Accuracy
    let correctChars = 0;
    for (let i = 0; i < original.length; i++) {
        if (typed[i] === original[i]) correctChars++;
    }

    let accuracy = ((correctChars / original.length) * 100).toFixed(2);

    box.innerHTML = `
        <h2>🎯 Result</h2>

        <p>Spelling Mistakes: ${spellingMistakes}</p>
        <p>Grammar Mistakes: ${grammarMistakes}</p>
        <p>WPM: ${wpm}</p>
        <p>Accuracy: ${accuracy}%</p>

        <button onclick="nextSession()">Next Session</button>
    `;
}
function startSession() {

    let level = document.getElementById("level").value;

    let wordCount;

    if (level === "easy") wordCount = 120;
    else if (level === "medium") wordCount = 200;
    else wordCount = 280; // HARD (not too big)

    currentParagraph = generateParagraph(wordCount);

    document.getElementById("text").innerText = currentParagraph;

    document.getElementById("input").value = "";
    document.getElementById("input").disabled = false;

    startTimer();
}
function generateParagraph(wordCount = 400) {

    let paragraph = "";
    let sentenceLength = 10;

    for (let i = 0; i < wordCount; i++) {

        let randomWord = words[Math.floor(Math.random() * words.length)];

        // Capitalize first word of sentence
        if (i % sentenceLength === 0) {
            randomWord = randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
        }

        paragraph += randomWord + " ";

        // End sentence
        if ((i + 1) % sentenceLength === 0) {
            paragraph = paragraph.trim() + ". ";
        }
    }

    return paragraph.trim();
}
function nextSession() {
    document.getElementById("resultBox").classList.add("hidden"); // hide popup
    startSession(); // start new session
}
document.getElementById("input").addEventListener("input", function () {

    let typed = this.value;
    let original = currentParagraph;

    let resultHTML = "";

    for (let i = 0; i < original.length; i++) {

        if (typed[i] == null) {
            resultHTML += original[i];
        }
        else if (typed[i] === original[i]) {
            resultHTML += `<span class="correct">${original[i]}</span>`;
        }
        else {
            resultHTML += `<span class="wrong">${original[i]}</span>`;
        }
    }

    document.getElementById("text").innerHTML = resultHTML;
});
function startTimer() {

    time = 420; // 👉 CHANGE HERE (for testing use 10)

    let totalTime = time;

    clearInterval(timer);

    timer = setInterval(() => {

        time--;

        document.getElementById("timer").innerText =
            "Time: " + formatTime(time);

        // progress bar (optional)
        let percent = (time / totalTime) * 100;
        let progress = document.getElementById("progress");
        if (progress) {
            progress.style.width = percent + "%";
        }

        if (time <= 0) {
            clearInterval(timer);
            endSession();
        }

    }, 1000);
}