export const GameState = {
    score: 0,
    lives: 3,
    questionsPassed: 0,
    currentQuestion: null
};

export const resetGame = () => {
    GameState.score = 0;
    GameState.lives = 3;
    GameState.questionsPassed = 0;
};

// Calculates timer duration scaling from 10 seconds down to 2 seconds over ~25 questions
export const getTimerDuration = () => {
    const maxTime = 10;
    const minTime = 2;
    const time = maxTime - (GameState.questionsPassed * 0.3);
    return Math.max(minTime, time);
};

// Generates plausible wrong choices sharing parity and unit digit properties
const generateSmartDistractor = (correctAnswer, op, x, y) => {
    let wrongAnswer;
    
    if (op === '*') {
        // Keeps the correct unit digit (e.g., multiples of 5 always end in 0 or 5)
        const multOffset = (Math.floor(Math.random() * 3) + 1) * 2;
        wrongAnswer = correctAnswer + (Math.random() > 0.5 ? multOffset * 5 : -multOffset * 5);
        if (wrongAnswer === correctAnswer || wrongAnswer < 0) wrongAnswer = correctAnswer + 10;
    } else if (op === '%') {
        const offset = Math.floor(Math.random() * (y - 1)) + 1;
        wrongAnswer = (correctAnswer + offset) % y;
        if (wrongAnswer === correctAnswer) wrongAnswer = (correctAnswer + 1) % y;
    } else if (op === '/') {
        wrongAnswer = correctAnswer + (Math.floor(Math.random() * 3) + 1) * (Math.random() > 0.5 ? 1 : -1);
        if (wrongAnswer === correctAnswer || wrongAnswer < 0) wrongAnswer = correctAnswer + 2;
    } else {
        // Addition & Subtraction: maintain odd/even parity so parity rules can't be used to cheat
        const parityOffset = (Math.floor(Math.random() * 3) + 1) * 2;
        wrongAnswer = correctAnswer + (Math.random() > 0.5 ? parityOffset : -parityOffset);
        if (wrongAnswer === correctAnswer || wrongAnswer < 0) wrongAnswer = correctAnswer + 2;
    }

    return wrongAnswer;
};

export const generateQuestion = () => {
    const level = GameState.questionsPassed;
    const ops = ['+', '-', '*', '/', '%'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let x, y, answer;

    if (op === '/') {
        y = Math.floor(Math.random() * (6 + Math.floor(level / 2))) + 2;
        answer = Math.floor(Math.random() * (10 + level * 2)) + 1;
        x = y * answer;
    } else if (op === '%') {
        y = Math.floor(Math.random() * (5 + Math.floor(level / 2))) + 3;
        x = Math.floor(Math.random() * (30 + level * 10)) + y + 1;
        answer = x % y;
    } else if (op === '*') {
        x = Math.floor(Math.random() * (10 + level)) + 2;
        y = Math.floor(Math.random() * (8 + Math.floor(level / 2))) + 2;
        answer = x * y;
    } else if (op === '+') {
        x = Math.floor(Math.random() * (20 + level * 8)) + 5;
        y = Math.floor(Math.random() * (20 + level * 8)) + 5;
        answer = x + y;
    } else { // '-'
        x = Math.floor(Math.random() * (30 + level * 10)) + 10;
        y = Math.floor(Math.random() * (20 + level * 8)) + 1;
        if (x < y) [x, y] = [y, x];
        answer = x - y;
    }

    const wrongAnswer = generateSmartDistractor(answer, op, x, y);
    const choices = Math.random() > 0.5 ? [answer, wrongAnswer] : [wrongAnswer, answer];

    GameState.currentQuestion = {
        text: `${x} ${op} ${y}`,
        answerIndex: choices.indexOf(answer),
        choices: choices
    };

    return GameState.currentQuestion;
};

export const checkAnswer = (selectedIndex) => {
    GameState.questionsPassed += 1;
    const isCorrect = selectedIndex === GameState.currentQuestion.answerIndex;
    if (isCorrect) {
        GameState.score += 10;
    } else {
        GameState.lives -= 1;
    }
    return isCorrect;
};

export const handleTimeout = () => {
    GameState.questionsPassed += 1;
    GameState.lives -= 1;
};