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