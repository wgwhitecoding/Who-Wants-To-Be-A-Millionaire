const prizeAmounts = [
    100, 200, 300, 500, 1000,
    2000, 4000, 8000, 16000, 32000,
    64000, 125000, 250000, 500000, 1000000
];

let questions = [];
let currentQuestionIndex = 0;
let currentPrize = 0;
let fiftyFiftyUsed = false;
let askTheAudienceUsed = false;
let phoneAFriendUsed = false;
let confettiInterval;
let isMusicPlaying = false;
let answerSelected = false;
let gameStarted = false;
let currentDifficulty = "easy"; 

const correctAnswerSound = new Audio('assets/sounds/correctanswer.mp3');
const wrongAnswerSound = new Audio('assets/sounds/wronganswers.mp3');
const backgroundMusic = new Audio('assets/sounds/backgroundmusic.mp3');
const startGameSound = new Audio('assets/sounds/startgame.mp3');
const clappingSound = new Audio('assets/sounds/clapping.mp3');

backgroundMusic.loop = true;

function toggleMusic() {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        correctAnswerSound.muted = true;
        wrongAnswerSound.muted = true;
        clappingSound.muted = true;
        document.getElementById('toggle-music').textContent = "Turn Music On";
    } else {
        backgroundMusic.play().catch(error => {
            console.error("Music play error: ", error);
        });
        correctAnswerSound.muted = false;
        wrongAnswerSound.muted = false;
        clappingSound.muted = false;
        document.getElementById('toggle-music').textContent = "Turn Music Off";
    }
    isMusicPlaying = !isMusicPlaying;
}

const questionElement = document.getElementById('question');
const answerButtons = document.querySelectorAll('.answer-btn');
const prizeListItems = document.querySelectorAll('#prize-list li');
const friendSuggestionElement = document.getElementById('friend-suggestion');
const overlayElement = document.getElementById('overlay');
const winOverlayElement = document.getElementById('win-overlay');
const timeoutOverlayElement = document.getElementById('timeout-overlay');
const rulesOverlayElement = document.getElementById('rules-overlay');
const finalPrizeElement = document.getElementById('final-prize');
const confettiContainer = document.getElementById('confetti-container');
const startButton = document.getElementById('start-button');
const nextQuestionButton = document.getElementById('next-question');
const timerElement = document.getElementById('timer');
const difficultySelect = document.getElementById('difficulty-level');

let timerInterval;
let timeLeft = 30;

async function fetchQuestions() {
    const apiUrl = `https://opentdb.com/api.php?amount=15&difficulty=${currentDifficulty}&type=multiple`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        questions = data.results.map(item => ({
            question: item.question,
            answers: [...item.incorrect_answers, item.correct_answer].sort(() => Math.random() - 0.5),
            correct: item.correct_answer
        }));
    } catch (error) {
        console.error("Error fetching questions: ", error);
        
        questionElement.textContent = 'Failed to load questions. Refresh this page or Please try again later.';
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    timerElement.textContent = timeLeft;
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimeOut();
    }
}

function handleTimeOut() {
    showTimeoutOverlay();
}

function resetTimer() {
    clearInterval(timerInterval);
    timerElement.textContent = "30";
}

function resetGame() {
    currentQuestionIndex = 0;
    currentPrize = 0;
    fiftyFiftyUsed = false;
    askTheAudienceUsed = false;
    phoneAFriendUsed = false;
    friendSuggestionElement.textContent = '';
    hideAllOverlays();
    clearConfetti();
    if (confettiInterval) clearInterval(confettiInterval);
    gameStarted = false;
    answerSelected = false;
    resetAnswerButtonBackgrounds();
    resetLifelineIcons();
    resetTimer();
    clearQuestionAndAnswers();
    nextQuestionButton.style.display = 'none';
    disableAnswerButtons();
    startButton.style.display = 'block';
    difficultySelect.disabled = false;
    fetchQuestions();
    resetPrizeHighlight();
}

function clearQuestionAndAnswers() {
    questionElement.textContent = 'Question will appear here';
    answerButtons.forEach((button, index) => {
        button.textContent = `Answer ${String.fromCharCode(65 + index)}`;
        button.style.display = 'block';
    });
}

function startGame() {
    gameStarted = true;
    startButton.style.display = 'none';
    difficultySelect.disabled = true;
    if (isMusicPlaying) {
        startGameSound.play();
    }
    showQuestion(questions[currentQuestionIndex]);
    enableAnswerButtons();
    enableLifelines();
    startTimer();
}

function resetAnswerButtonBackgrounds() {
    answerButtons.forEach(button => {
        button.classList.remove('correct', 'wrong', 'flash-green', 'flash-red');
        button.style.backgroundColor = '';
    });
}

function adjustQuestionFontSize(text) {
    const questionContainer = document.querySelector('.question-container');
    const maxHeight = questionContainer.clientHeight - 20;
    const maxWidth = questionContainer.clientWidth - 20;
    let fontSize = 32;
    questionElement.style.fontSize = `${fontSize}px`;
    questionElement.innerHTML = text;

    while (questionElement.scrollHeight > maxHeight || questionElement.scrollWidth > maxWidth) {
        fontSize -= 1;
        questionElement.style.fontSize = `${fontSize}px`;
    }
}

function showQuestion(question) {
    resetAnswerButtonBackgrounds();
    resetTimer();
    adjustQuestionFontSize(question.question);

    const answerLabels = ["A.", "B.", "C.", "D."];
    answerButtons.forEach((button, index) => {
        button.style.display = "block";
        button.textContent = answerLabels[index] + " " + question.answers[index];
        button.setAttribute('data-answer', question.answers[index]);
        button.classList.remove('correct', 'wrong');
        button.onclick = () => {
            if (gameStarted && !answerSelected) {
                selectAnswer(button.getAttribute('data-answer'), question.correct, button);
                answerSelected = true;
                disableLifelines();
                friendSuggestionElement.textContent = '';
            }
        };
        const percentageSpan = button.querySelector('.percentage');
        if (percentageSpan) {
            percentageSpan.remove();
        }
        button.tabIndex = 0;
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                button.click();
            }
        });
    });
}

function selectAnswer(selected, correct, button) {
    if (answerSelected) return;
    answerSelected = true;
    clearInterval(timerInterval);
    if (selected === correct) {
        playSound(correctAnswerSound, 5000);
        if (currentQuestionIndex === 14 && isMusicPlaying) {
            clappingSound.play();
        }
        flashCorrectAnswer(button, () => {
            currentPrize = prizeAmounts[currentQuestionIndex];
            highlightCurrentPrize();
            if (currentQuestionIndex < questions.length - 1) {
                setTimeout(() => {
                    nextQuestionButton.style.display = 'block';
                    nextQuestionButton.textContent = 'Next Question';
                }, 1800);
            } else {
                setTimeout(showWinOverlay, 1800);
            }
        });
    } else {
        playSound(wrongAnswerSound);
        flashWrongAnswer(button, correct);
    }
}

function flashCorrectAnswer(button, callback) {
    button.classList.add('flash-green');
    setTimeout(() => {
        button.classList.remove('flash-green');
        button.classList.add('correct');
        setTimeout(callback, 500);
    }, 1500);
}

function flashWrongAnswer(button, correctAnswer) {
    button.classList.add('flash-red');
    setTimeout(() => {
        button.classList.remove('flash-red');
        button.style.backgroundColor = 'red';
        setTimeout(() => {
            const correctButton = Array.from(answerButtons).find(btn => btn.getAttribute('data-answer') === correctAnswer);
            correctButton.classList.add('flash-green');
            setTimeout(() => {
                correctButton.classList.remove('flash-green');
                correctButton.classList.add('correct');
                setTimeout(showOverlay, 2000);
            }, 1500);
        }, 2000);
    }, 1500);
}

function nextQuestion() {
    resetAnswerButtonBackgrounds();
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        nextQuestionButton.style.display = 'none';
        showQuestion(questions[currentQuestionIndex]);
        answerSelected = false;
        enableLifelines();
        startTimer();
    } else {
        showWinOverlay();
    }
}

function resetPrizeHighlight() {
    prizeListItems.forEach((item) => {
        item.classList.remove('highlight', 'flash-orange');
    });
}

function highlightCurrentPrize() {
    prizeListItems.forEach((item, index) => {
        item.classList.remove('highlight', 'flash-orange');
        if (index === 14 - currentQuestionIndex) {
            item.classList.add('flash-orange');
            setTimeout(() => {
                item.classList.remove('flash-orange');
                item.classList.add('highlight');
            }, 1500);
        }
    });
}

function useFiftyFifty() {
    if (!gameStarted || fiftyFiftyUsed) return;
    fiftyFiftyUsed = true;
    showLifelineUsed('fifty-fifty-used');

    const question = questions[currentQuestionIndex];
    const correctAnswer = question.correct;
    const wrongAnswers = question.answers.filter(answer => answer !== correctAnswer);

    const answerToKeep = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];

    answerButtons.forEach(button => {
        const answer = button.getAttribute('data-answer');
        if (answer !== correctAnswer && answer !== answerToKeep) {
            button.textContent = '';
        }
    });
}

function askTheAudience() {
    if (!gameStarted || askTheAudienceUsed) return;
    askTheAudienceUsed = true;
    showLifelineUsed('ask-the-audience-used');

    const question = questions[currentQuestionIndex];
    const correctAnswer = question.correct;
    const answerPercentages = generatePercentages(question.answers, correctAnswer);

    answerButtons.forEach(button => {
        const answer = button.getAttribute('data-answer');
        if (answerPercentages[answer]) {
            button.innerHTML += ` <span class="percentage">(${answerPercentages[answer]}%)</span>`;
        }
    });
}

function generatePercentages(answers, correctAnswer) {
    let percentages = [];
    let remainingPercentage = 100;

    const correctPercentage = Math.floor(Math.random() * 31) + 50;
    percentages.push({ answer: correctAnswer, percentage: correctPercentage });
    remainingPercentage -= correctPercentage;

    for (let i = 0; i < answers.length; i++) {
        if (answers[i] !== correctAnswer) {
            const percentage = Math.floor(Math.random() * remainingPercentage);
            percentages.push({ answer: answers[i], percentage });
            remainingPercentage -= percentage;
        }
    }

    percentages.sort((a, b) => b.percentage - a.percentage);
    percentages[percentages.length - 1].percentage += remainingPercentage;

    const percentageMap = {};
    percentages.forEach(p => percentageMap[p.answer] = p.percentage);

    return percentageMap;
}

function phoneAFriend() {
    if (!gameStarted || phoneAFriendUsed) return;
    phoneAFriendUsed = true;
    showLifelineUsed('phone-a-friend-used');

    const question = questions[currentQuestionIndex];
    const correctAnswer = question.correct;
    const friendSuggestion = generateFriendSuggestion(question.answers, correctAnswer);

    friendSuggestionElement.textContent = `Your friend suggests: ${friendSuggestion}`;
}

function generateFriendSuggestion(answers, correctAnswer) {
    const probabilityOfCorrect = 0.75;

    if (Math.random() < probabilityOfCorrect) {
        return correctAnswer;
    } else {
        const wrongAnswers = answers.filter(answer => answer !== correctAnswer);
        return wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    }
}

function showLifelineUsed(lifelineId) {
    document.getElementById(lifelineId).style.display = 'block';
}

function resetLifelineIcons() {
    const lifelineIds = ['fifty-fifty', 'phone-a-friend', 'ask-the-audience'];
    lifelineIds.forEach(id => {
        document.getElementById(`${id}-used`).style.display = 'none';
        document.getElementById(id).style.pointerEvents = 'auto';
    });
}

function disableLifelines() {
    const lifelineIds = ['fifty-fifty', 'phone-a-friend', 'ask-the-audience'];
    lifelineIds.forEach(id => {
        document.getElementById(id).style.pointerEvents = 'none';
    });
}

function enableLifelines() {
    if (!fiftyFiftyUsed) document.getElementById('fifty-fifty').style.pointerEvents = 'auto';
    if (!phoneAFriendUsed) document.getElementById('phone-a-friend').style.pointerEvents = 'auto';
    if (!askTheAudienceUsed) document.getElementById('ask-the-audience').style.pointerEvents = 'auto';
}

function enableAnswerButtons() {
    answerButtons.forEach(button => {
        button.style.pointerEvents = 'auto';
    });
}

function disableAnswerButtons() {
    answerButtons.forEach(button => {
        button.style.pointerEvents = 'none';
    });
}

function showOverlay() {
    overlayElement.style.display = "flex";
}

function hideOverlay() {
    overlayElement.style.display = "none";
}

function showTimeoutOverlay() {
    timeoutOverlayElement.style.display = "flex";
}

function hideTimeoutOverlay() {
    timeoutOverlayElement.style.display = "none";
}

function showWinOverlay() {
    createConfetti();
    winOverlayElement.style.display = "flex";
    confettiInterval = setInterval(createConfetti, 3000);
}

function hideWinOverlay() {
    winOverlayElement.style.display = "none";
}

function showRules() {
    rulesOverlayElement.style.display = "flex";
}

function hideRules() {
    rulesOverlayElement.style.display = "none";
}

function hideAllOverlays() {
    hideOverlay();
    hideWinOverlay();
    hideTimeoutOverlay();
    hideRules();
}

function createConfetti() {
    clearConfetti();
    const confettiItems = [
        "🎉", "🎊", "💵", "💰", "🎈", "🎁", "👏", "🥳", "😁", "😃", "😄", "🎇", "🎆", "🌟", "✨"
    ];
    for (let i = 0; i < 500; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = `${Math.random() * 100 - 50}px`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        if (Math.random() > 0.5) {
            confetti.style.backgroundColor = getRandomColor();
        } else {
            confetti.textContent = confettiItems[Math.floor(Math.random() * confettiItems.length)];
        }
        confettiContainer.appendChild(confetti);
    }
}

function clearConfetti() {
    confettiContainer.innerHTML = '';
}

function getRandomColor() {
    const colors = [
        '#ff0a54', '#ff477e', '#ff85a1', '#fbb1bd', '#f9bec7', '#f8d9e0', '#f6f0f3',
        '#ff6347', '#ffa07a', '#20b2aa', '#87ceeb', '#ffb6c1', '#ffa500', '#ffd700', '#da70d6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function playSound(sound, duration) {
    if (isMusicPlaying) {
        sound.play().catch(error => {
            console.error("Sound play error: ", error);
        });
        if (duration) {
            setTimeout(() => {
                sound.pause();
                sound.currentTime = 0; 
            }, duration);
        }
    }
}

function changeDifficulty() {
    currentDifficulty = difficultySelect.value;
}


document.addEventListener('DOMContentLoaded', () => {
    fetchQuestions();
});

startButton.onclick = () => {
    startGame();
};

nextQuestionButton.onclick = () => {
    nextQuestion();
};

document.getElementById('rules-button').onclick = () => {
    showRules();
};

document.getElementById('close-rules-button').onclick = () => {
    hideRules();
};

document.querySelectorAll('.overlay button').forEach(button => {
    button.onclick = (event) => {
        if (event.target.closest('#rules-overlay')) {
            hideRules();
        } else {
            resetGame();
        }
    };
});

function hideRules() {
    rulesOverlayElement.style.display = "none";
}