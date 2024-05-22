const questions = [
    {
        question: "What is the capital of France?",
        answers: ["Paris", "London", "Berlin", "Madrid"],
        correct: "Paris"
    },
    {
        question: "What is the largest planet in our solar system?",
        answers: ["Mars", "Earth", "Jupiter", "Saturn"],
        correct: "Jupiter"
    },
    {
        question: "In what year did the Titanic sink?",
        answers: ["1912", "1905", "1898", "1923"],
        correct: "1912"
    },
    {
        question: "Who wrote 'To Kill a Mockingbird'?",
        answers: ["Harper Lee", "Mark Twain", "Ernest Hemingway", "F. Scott Fitzgerald"],
        correct: "Harper Lee"
    },
    {
        question: "What is the chemical symbol for gold?",
        answers: ["Ag", "Au", "Pb", "Fe"],
        correct: "Au"
    },
    {
        question: "Who painted the Mona Lisa?",
        answers: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
        correct: "Leonardo da Vinci"
    },
    {
        question: "What is the hardest natural substance on Earth?",
        answers: ["Gold", "Iron", "Diamond", "Platinum"],
        correct: "Diamond"
    },
    {
        question: "What is the longest river in the world?",
        answers: ["Amazon", "Nile", "Yangtze", "Mississippi"],
        correct: "Nile"
    },
    {
        question: "Who developed the theory of relativity?",
        answers: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Marie Curie"],
        correct: "Albert Einstein"
    },
    {
        question: "What is the smallest country in the world?",
        answers: ["Monaco", "Nauru", "Vatican City", "San Marino"],
        correct: "Vatican City"
    },
    {
        question: "In what year did World War II end?",
        answers: ["1945", "1939", "1942", "1946"],
        correct: "1945"
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: ["Mars", "Venus", "Saturn", "Mercury"],
        correct: "Mars"
    },
    {
        question: "Who is the author of the Harry Potter series?",
        answers: ["J.K. Rowling", "J.R.R. Tolkien", "George R.R. Martin", "Stephen King"],
        correct: "J.K. Rowling"
    },
    {
        question: "What is the main ingredient in traditional Japanese miso soup?",
        answers: ["Tofu", "Miso paste", "Seaweed", "Soy sauce"],
        correct: "Miso paste"
    },
    {
        question: "Which element has the chemical symbol 'O'?",
        answers: ["Oxygen", "Osmium", "Oganesson", "Osmate"],
        correct: "Oxygen"
    }
];

const prizeAmounts = [
    100, 200, 300, 500, 1000,
    2000, 4000, 8000, 16000, 32000,
    64000, 125000, 250000, 500000, 1000000
];

let currentQuestionIndex = 0;
let currentPrize = 0;
let fiftyFiftyUsed = false;
let askTheAudienceUsed = false;
let phoneAFriendUsed = false;
let confettiInterval;

function startGame() {
    currentQuestionIndex = 0;
    currentPrize = 0;
    fiftyFiftyUsed = false;
    askTheAudienceUsed = false;
    phoneAFriendUsed = false;
    friendSuggestionElement.textContent = ''; 
   
}

function showQuestion(question) {
    questionElement.textContent = question.question;
    answerButtons.forEach((button, index) => {
        button.style.display = "block";
        button.textContent = question.answers[index];
        button.setAttribute('data-answer', question.answers[index]);
        button.onclick = () => {
            selectAnswer(button.getAttribute('data-answer'), question.correct);
            friendSuggestionElement.textContent = ''; 
        };
        const percentageSpan = button.querySelector('.percentage');
        if (percentageSpan) {
            percentageSpan.remove();
        }
    });
}

function selectAnswer(selected, correct) {
    if (selected === correct) {
        correctAnswerSound.play(); 
        currentPrize = prizeAmounts[currentQuestionIndex];
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion(questions[currentQuestionIndex]);
            highlightCurrentPrize();
        } else {
            showWinOverlay();
        }
    } else {
        wrongAnswerSound.play(); 
        showOverlay();
        finalPrizeElement.textContent = currentPrize;
        backgroundMusic.pause();
    }
}

function highlightCurrentPrize() {
    prizeListItems.forEach((item, index) => {
        item.classList.remove('highlight');
        if (index === 14 - currentQuestionIndex) {
            item.classList.add('highlight');
        }
    });
}

function useFiftyFifty() {
    if (fiftyFiftyUsed) return;
    fiftyFiftyUsed = true;

    const question = questions[currentQuestionIndex];
    const correctAnswer = question.correct;
    const wrongAnswers = question.answers.filter(answer => answer !== correctAnswer);
    
    // Randomly select two wrong answers to hide
    const answersToHide = wrongAnswers.sort(() => 0.5 - Math.random()).slice(0, 2);
    
    answerButtons.forEach(button => {
        if (answersToHide.includes(button.getAttribute('data-answer'))) {
            button.style.display = "none";
        }
    });
}

function askTheAudience() {
    if (askTheAudienceUsed) return;
    askTheAudienceUsed = true;

    const question = questions[currentQuestionIndex];
    const correctAnswer = question.correct;
    const answerPercentages = generatePercentages(question.answers, correctAnswer);

    answerButtons.forEach(button => {
        const percentage = answerPercentages[button.getAttribute('data-answer')];
        const percentageSpan = document.createElement('span');
        percentageSpan.className = 'percentage';
        percentageSpan.textContent = ` (${percentage}%)`;
        button.appendChild(percentageSpan);
    });
}

function generatePercentages(answers, correctAnswer) {
    let percentages = [];
    let remainingPercentage = 100;

    // Assign a random high percentage to the correct answer (between 50 and 80)
    const correctPercentage = Math.floor(Math.random() * 31) + 50;
    percentages.push({ answer: correctAnswer, percentage: correctPercentage });
    remainingPercentage -= correctPercentage;

    // Assign random percentages to the other answers
    for (let i = 0; i < answers.length; i++) {
        if (answers[i] !== correctAnswer) {
            const percentage = Math.floor(Math.random() * remainingPercentage);
            percentages.push({ answer: answers[i], percentage });
            remainingPercentage -= percentage;
        }
    }

    // Ensure all percentages add up to 100
    percentages.sort((a, b) => b.percentage - a.percentage);
    percentages[percentages.length - 1].percentage += remainingPercentage;

    // Convert to a map for easy access
    const percentageMap = {};
    percentages.forEach(p => percentageMap[p.answer] = p.percentage);

    return percentageMap;
}

function phoneAFriend() {
    if (phoneAFriendUsed) return;
    phoneAFriendUsed = true;

    const question = questions[currentQuestionIndex];
    const correctAnswer = question.correct;
    const friendSuggestion = generateFriendSuggestion(question.answers, correctAnswer);

    friendSuggestionElement.textContent = `Your friend suggests: ${friendSuggestion}`;
}

function generateFriendSuggestion(answers, correctAnswer) {
    const probabilityOfCorrect = 0.75; // 75% chance the friend suggests the correct answer

    if (Math.random() < probabilityOfCorrect) {
        return correctAnswer;
    } else {
        const wrongAnswers = answers.filter(answer => answer !== correctAnswer);
        return wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    }
}
