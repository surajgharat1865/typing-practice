// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// 🔹 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBXHpBQ0i63wJ-Kwc0N7WZItld1qsbzI3c",
  authDomain: "typing-app-4d8c4.firebaseapp.com",
  projectId: "typing-app-4d8c4",
};

// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ================= LOGIN =================
window.login = async function () {
    try {
        const result = await signInWithPopup(auth, provider);
        document.getElementById("userName").innerText =
            "Welcome " + result.user.displayName;
    } catch (err) {
        alert("Login failed");
        console.log(err);
    }
};

// ================= SAVE SCORE =================
async function saveScore(wpm, accuracy) {

    let user = auth.currentUser;

    if (!user) {
        alert("Login first!");
        return;
    }

    await addDoc(collection(db, "scores"), {
        name: user.displayName,
        wpm: wpm,
        accuracy: parseFloat(accuracy),
        createdAt: new Date()
    });
}

// ================= LEADERBOARD =================
window.loadLeaderboard = async function () {

    const q = query(
        collection(db, "scores"),
        orderBy("wpm", "desc"),
        limit(5)
    );

    const snapshot = await getDocs(q);

    let html = "";

    snapshot.forEach(doc => {
        let data = doc.data();
        html += `<p>🏆 ${data.name} - ⚡ ${data.wpm} WPM</p>`;
    });

    document.getElementById("leaderboardList").innerHTML = html;
};

// ================= TYPING LOGIC =================

let words = ["technology","education","health","development","system","people","learning","skills","future","communication"];

let currentParagraph = "";
let time = 0;
let totalTime = 0;
let timer;

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function startSession() {

    let input = document.getElementById("input");
    input.value = "";
    input.disabled = false;

    document.getElementById("resultBox").classList.add("hidden");

    let level = document.getElementById("level").value;

    let wordCount = 100;
    if (level === "medium") wordCount = 200;
    if (level === "hard") wordCount = 350;

    currentParagraph = generateParagraph(wordCount);

    let html = "";
    for (let c of currentParagraph) html += `<span>${c}</span>`;
    document.getElementById("text").innerHTML = html;

    startTimer();
}

function startTimer() {

    let userTime = document.getElementById("customTime").value;

    time = userTime ? parseInt(userTime) : 420;
    totalTime = time;

    clearInterval(timer);

    timer = setInterval(() => {

        time--;

        document.getElementById("timer").innerText =
            "Time: " + formatTime(time);

        let percent = (time / totalTime) * 100;
        document.getElementById("progress").style.width = percent + "%";

        if (time <= 0) {
            clearInterval(timer);
            endSession();
        }

    }, 1000);
}

document.getElementById("input").addEventListener("input", function () {

    let typed = this.value;
    let spans = document.getElementById("text").children;

    for (let i = 0; i < spans.length; i++) {

        if (typed[i] == null) spans[i].className = "";
        else if (typed[i] === currentParagraph[i]) spans[i].className = "correct";
        else spans[i].className = "wrong";
    }
});

function endSession() {

    document.getElementById("endSound").play().catch(()=>{});
    document.getElementById("input").disabled = true;

    showResult();
}

function showResult() {

    let box = document.getElementById("resultBox");
    box.classList.remove("hidden");

    let typed = document.getElementById("input").value;

    let originalWords = currentParagraph.trim().split(/\s+/);
    let typedWords = typed.trim().split(/\s+/);

    // =========================
    // SPELLING MISTAKES
    // =========================
    let spellingMistakes = 0;

    for (let i = 0; i < originalWords.length; i++) {
        if (typedWords[i] !== originalWords[i]) {
            spellingMistakes++;
        }
    }

    // =========================
    // BASIC GRAMMAR CHECK
    // =========================
    let grammarMistakes = 0;

    if (typed.length > 0) {
        if (typed[0] !== typed[0].toUpperCase()) grammarMistakes++; // capital
        if (!typed.trim().endsWith(".")) grammarMistakes++; // full stop
        if (typed.includes("  ")) grammarMistakes++; // double space
    }

    // =========================
    // WPM
    // =========================
    let wordsTyped = typedWords.length;
    let minutes = (totalTime - time) / 60;
    let wpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;

    // =========================
    // ACCURACY
    // =========================
    let correctChars = 0;

    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === currentParagraph[i]) correctChars++;
    }

    let accuracy = ((correctChars / currentParagraph.length) * 100).toFixed(2);

    // =========================
    // SAVE + LEADERBOARD
    // =========================
    saveScore(wpm, accuracy);
    loadLeaderboard();

    // =========================
    // UI OUTPUT
    // =========================
    box.innerHTML = `
        <h2>🎯 Result</h2>

        <p>📝 Spelling Mistakes: ${spellingMistakes}</p>
        <p>📚 Grammar Mistakes: ${grammarMistakes}</p>

        <p>⚡ WPM: ${wpm}</p>
        <p>🎯 Accuracy: ${accuracy}%</p>
       
        <button onclick="nextSession()">Next</button>
       
    `;
     window.nextSession = function () {
    startSession(); 

}
}

function generateParagraph(wordCount) {
    let text = "";
    for (let i = 0; i < wordCount; i++) {
        text += words[Math.floor(Math.random() * words.length)] + " ";
    }
    return text;
}

// START BUTTON
document.querySelector(".start-btn").addEventListener("click", startSession);