import { listenToAuthChanges, loginUser, registerUser, loginGuest, logoutUser, linkGuestToAccount } from './auth.js';
import { GameState, resetGame, generateQuestion, checkAnswer, getTimerDuration, handleTimeout } from './game.js';
import { saveScore, getLeaderboard, updateLeaderboardUsername } from './leaderboard.js';
import { showScreen, updateLivesDisplay, updateScoreDisplay, renderQuestion, renderLeaderboard, startTimerBar, stopTimerBar } from './ui.js';

let currentUser = null;
let currentLeaderboardTab = 'alltime';

// Initialization
listenToAuthChanges((user) => {
    currentUser = user;
    if (user) {
        const name = user.isAnonymous ? 'Guest' : user.email.split('@')[0];
        document.getElementById('user-display').innerText = name;
        
        // Show upgrade box if current session is anonymous
        const upgradeBox = document.getElementById('guest-upgrade-container');
        upgradeBox.style.display = user.isAnonymous ? 'flex' : 'none';

        showScreen('menu-screen');
    } else {
        showScreen('auth-screen');
    }
});

// Auth & Guest Account Upgrade Listeners
document.getElementById('btn-login').addEventListener('click', async () => {
    document.getElementById('auth-error').innerText = '';
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    const res = await loginUser(e, p);
    if (!res.success) document.getElementById('auth-error').innerText = res.message;
});

document.getElementById('btn-register').addEventListener('click', async () => {
    document.getElementById('auth-error').innerText = '';
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    const res = await registerUser(e, p);
    if (!res.success) document.getElementById('auth-error').innerText = res.message;
});

document.getElementById('btn-guest').addEventListener('click', async () => {
    document.getElementById('auth-error').innerText = '';
    const res = await loginGuest();
    if (!res.success) document.getElementById('auth-error').innerText = res.message;
});

document.getElementById('btn-upgrade-account').addEventListener('click', async () => {
    document.getElementById('upgrade-error').innerText = '';
    const e = document.getElementById('upgrade-email').value;
    const p = document.getElementById('upgrade-password').value;
    
    const res = await linkGuestToAccount(e, p);
    if (res.success) {
        await updateLeaderboardUsername(currentUser);
        document.getElementById('guest-upgrade-container').style.display = 'none';
        document.getElementById('user-display').innerText = currentUser.email.split('@')[0];
    } else {
        document.getElementById('upgrade-error').innerText = res.message;
    }
});

document.getElementById('btn-logout').addEventListener('click', logoutUser);

// Menu Listeners
document.getElementById('btn-start').addEventListener('click', () => {
    resetGame();
    updateScoreDisplay(GameState.score);
    updateLivesDisplay(GameState.lives);
    showScreen('game-screen');
    nextTurn();
});

const loadLeaderboardData = async () => {
    const scores = await getLeaderboard(currentLeaderboardTab);
    renderLeaderboard(scores, currentUser ? currentUser.uid : null);
};

document.getElementById('btn-leaderboard').addEventListener('click', async () => {
    showScreen('leaderboard-screen');
    await loadLeaderboardData();
});

document.getElementById('tab-alltime').addEventListener('click', async (e) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentLeaderboardTab = 'alltime';
    await loadLeaderboardData();
});

document.getElementById('tab-today').addEventListener('click', async (e) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentLeaderboardTab = 'today';
    await loadLeaderboardData();
});

document.getElementById('btn-back-menu').addEventListener('click', () => showScreen('menu-screen'));

// Game Turn Loop
const processGameOver = async () => {
    stopTimerBar();
    document.getElementById('final-score').innerText = GameState.score;
    showScreen('game-over-screen');
    await saveScore(currentUser, GameState.score);
};

const nextTurn = () => {
    if (GameState.lives <= 0) {
        processGameOver();
        return;
    }
    
    const q = generateQuestion();
    renderQuestion(q);
    
    const duration = getTimerDuration();
    startTimerBar(duration, () => {
        handleTimeout();
        updateLivesDisplay(GameState.lives);
        nextTurn();
    });
};

document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        stopTimerBar();
        const index = parseInt(e.target.getAttribute('data-index'));
        checkAnswer(index);
        
        updateScoreDisplay(GameState.score);
        updateLivesDisplay(GameState.lives);

        nextTurn();
    });
});

document.getElementById('btn-restart').addEventListener('click', () => {
    document.getElementById('btn-start').click();
});

document.getElementById('btn-menu').addEventListener('click', () => {
    showScreen('menu-screen');
});