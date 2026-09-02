let timerInterval = null;

export const showScreen = (screenId) => {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
};

export const updateLivesDisplay = (lives) => {
    document.getElementById('lives').innerText = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
};

export const updateScoreDisplay = (score) => {
    document.getElementById('score').innerText = score;
};

export const renderQuestion = (question) => {
    document.getElementById('question-text').innerText = question.text;
    document.getElementById('choice-0').innerText = question.choices[0];
    document.getElementById('choice-1').innerText = question.choices[1];
};

export const startTimerBar = (durationSeconds, onTimeout) => {
    stopTimerBar();
    const timerBar = document.getElementById('timer-bar');
    const startTime = Date.now();
    const durationMs = durationSeconds * 1000;

    timerBar.style.width = '100%';
    timerBar.style.backgroundColor = 'var(--green)';

    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remainingFraction = Math.max(0, (durationMs - elapsed) / durationMs);

        timerBar.style.width = `${remainingFraction * 100}%`;

        if (remainingFraction < 0.3) {
            timerBar.style.backgroundColor = 'var(--red)';
        } else if (remainingFraction < 0.6) {
            timerBar.style.backgroundColor = 'var(--yellow)';
        }

        if (remainingFraction <= 0) {
            stopTimerBar();
            onTimeout();
        }
    }, 50);
};

export const stopTimerBar = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
};

export const renderLeaderboard = (scores, currentUserId) => {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    
    if (!scores || scores.length === 0) {
        list.innerHTML = '<li>No scores recorded yet!</li>';
        return;
    }

    scores.forEach((s, index) => {
        const li = document.createElement('li');
        if (s.userId === currentUserId) {
            li.classList.add('highlight-user');
        }
        
        const isSelf = s.userId === currentUserId ? ' (You)' : '';
        li.innerHTML = `<span>#${index + 1} ${s.username}${isSelf}</span> <strong>${s.score}</strong>`;
        list.appendChild(li);
    });
};