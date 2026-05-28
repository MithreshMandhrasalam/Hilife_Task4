

'use strict';


const USERS_KEY    = 'hilife_users';
const SESSIONS_KEY = 'hilife_sessions';


function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    } catch {
        return {};
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}


function getSessions() {
    try {
        return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveSessions(sessions) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function addSession(username, displayName) {
    const sessions = getSessions();

    const exists = sessions.find(s => s.username === username);
    if (!exists) {
        sessions.push({
            username,
            displayName,
            loginAt: Date.now()
        });
        saveSessions(sessions);
    }
    renderSessions();
}

function renderSessions() {
    const sessions = getSessions();
    const panel    = document.getElementById('sessions-panel');
    const list     = document.getElementById('sessions-list');

    if (sessions.length === 0) {
        panel.hidden = true;
        return;
    }

    list.innerHTML = '';
    sessions.forEach(s => {
        const initials = s.displayName
            .split(' ')
            .map(w => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

        const li = document.createElement('li');
        li.className = 'session-item';
        li.innerHTML = `
            <div class="session-avatar">${initials}</div>
            <span>${s.displayName}</span>
            <div class="session-dot" title="Online"></div>
        `;
        list.appendChild(li);
    });

    panel.hidden = false;
}


function getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return { label: 'Good Morning',   emoji: '🌅', bg: 'morning'   };
    } else if (hour >= 12 && hour < 17) {
        return { label: 'Good Afternoon', emoji: '☀️', bg: 'afternoon' };
    } else if (hour >= 17 && hour < 21) {
        return { label: 'Good Evening',   emoji: '🌇', bg: 'evening'   };
    } else {
        return { label: 'Good Night',     emoji: '🌙', bg: 'night'     };
    }
}

function formatCurrentTime() {
    return new Date().toLocaleTimeString('en-IN', {
        hour:   '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}


function showGreeting(displayName) {
    const greeting = getGreeting();

    document.getElementById('greeting-emoji').textContent = greeting.emoji;
    document.getElementById('greeting-label').textContent = greeting.label;
    document.getElementById('greeting-name').textContent  = displayName;
    document.getElementById('greeting-time').textContent  = formatCurrentTime();

    const overlay = document.getElementById('greeting-overlay');
    overlay.hidden = false;


    const clockInterval = setInterval(() => {
        const timeEl = document.getElementById('greeting-time');
        if (timeEl) {
            timeEl.textContent = formatCurrentTime();
        } else {
            clearInterval(clockInterval);
        }
    }, 1000);

    overlay.dataset.clockInterval = clockInterval;
}

function closeGreeting() {
    const overlay = document.getElementById('greeting-overlay');
    clearInterval(Number(overlay.dataset.clockInterval));
    overlay.hidden = true;
}


function switchTab(tab) {
    const signinTab  = document.getElementById('tab-signin');
    const signupTab  = document.getElementById('tab-signup');
    const signinPanel = document.getElementById('panel-signin');
    const signupPanel = document.getElementById('panel-signup');
    const indicator   = document.getElementById('tabIndicator');

    if (tab === 'signin') {
        signinTab.classList.add('active');
        signupTab.classList.remove('active');
        signinTab.setAttribute('aria-selected', 'true');
        signupTab.setAttribute('aria-selected', 'false');
        signinPanel.classList.add('active');
        signupPanel.classList.remove('active');
        indicator.classList.remove('right');
    } else {
        signupTab.classList.add('active');
        signinTab.classList.remove('active');
        signupTab.setAttribute('aria-selected', 'true');
        signinTab.setAttribute('aria-selected', 'false');
        signupPanel.classList.add('active');
        signinPanel.classList.remove('active');
        indicator.classList.add('right');
    }

    clearErrors();
}


function setError(inputId, errId, message) {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(errId);
    input.classList.add('error');
    input.classList.remove('valid');
    err.textContent = message;
}

function setValid(inputId) {
    const input = document.getElementById(inputId);
    input.classList.remove('error');
    input.classList.add('valid');
}

function clearErrors() {
    document.querySelectorAll('.input-field').forEach(el => {
        el.classList.remove('error', 'valid');
    });
    document.querySelectorAll('.field-error').forEach(el => {
        el.textContent = '';
    });
}


function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}


function checkPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8)                   score++;
    if (password.length >= 12)                  score++;
    if (/[A-Z]/.test(password))                score++;
    if (/[0-9]/.test(password))                score++;
    if (/[^A-Za-z0-9]/.test(password))         score++;

    const bar   = document.getElementById('strength-bar');
    const label = document.getElementById('strength-label');

    if (!bar || !label) return;

    const levels = [
        { pct: '0%',   color: 'transparent',   text: '' },
        { pct: '25%',  color: '#f43f5e',        text: 'Weak' },
        { pct: '50%',  color: '#f59e0b',        text: 'Fair' },
        { pct: '75%',  color: '#22d3a5',        text: 'Strong' },
        { pct: '100%', color: '#7c5cfc',        text: 'Very Strong' },
    ];

    const level = levels[Math.min(score, 4)];
    bar.style.width      = password.length ? level.pct : '0%';
    bar.style.background = level.color;
    label.textContent    = password.length ? level.text : '';
    label.style.color    = level.color;
}


document.addEventListener('DOMContentLoaded', () => {
    const pwInput = document.getElementById('signup-password');
    if (pwInput) {
        pwInput.addEventListener('input', () => checkPasswordStrength(pwInput.value));
    }


    renderSessions();
});


function handleSignIn(event) {
    event.preventDefault();
    clearErrors();

    const username = document.getElementById('signin-username').value.trim();
    const password = document.getElementById('signin-password').value;

    let valid = true;

    if (!username) {
        setError('signin-username', 'signin-username-err', 'Username is required.');
        valid = false;
    }

    if (!password) {
        setError('signin-password', 'signin-password-err', 'Password is required.');
        valid = false;
    }

    if (!valid) return;

    const users = getUsers();

    if (!users[username]) {
        setError('signin-username', 'signin-username-err', 'No account found with this username.');
        return;
    }

    if (users[username].password !== password) {
        setError('signin-password', 'signin-password-err', 'Incorrect password. Please try again.');
        return;
    }


    setValid('signin-username');
    setValid('signin-password');

    simulateLoading('signin-btn', 'Signing In…', () => {
        const displayName = users[username].firstName + ' ' + users[username].lastName;
        addSession(username, displayName);
        showGreeting(displayName);
    });
}


function handleSignUp(event) {
    event.preventDefault();
    clearErrors();

    const firstName = document.getElementById('signup-firstname').value.trim();
    const lastName  = document.getElementById('signup-lastname').value.trim();
    const username  = document.getElementById('signup-username').value.trim();
    const email     = document.getElementById('signup-email').value.trim();
    const password  = document.getElementById('signup-password').value;
    const confirm   = document.getElementById('signup-confirm').value;

    let valid = true;

    if (!firstName) {
        setError('signup-firstname', 'signup-firstname-err', 'First name is required.');
        valid = false;
    }

    if (!lastName) {
        setError('signup-lastname', 'signup-lastname-err', 'Last name is required.');
        valid = false;
    }

    if (!username) {
        setError('signup-username', 'signup-username-err', 'Username is required.');
        valid = false;
    } else if (username.length < 3) {
        setError('signup-username', 'signup-username-err', 'Username must be at least 3 characters.');
        valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        setError('signup-email', 'signup-email-err', 'Email is required.');
        valid = false;
    } else if (!emailRegex.test(email)) {
        setError('signup-email', 'signup-email-err', 'Enter a valid email address.');
        valid = false;
    }

    if (!password) {
        setError('signup-password', 'signup-password-err', 'Password is required.');
        valid = false;
    } else if (password.length < 6) {
        setError('signup-password', 'signup-password-err', 'Password must be at least 6 characters.');
        valid = false;
    }

    if (!confirm) {
        setError('signup-confirm', 'signup-confirm-err', 'Please confirm your password.');
        valid = false;
    } else if (password !== confirm) {
        setError('signup-confirm', 'signup-confirm-err', 'Passwords do not match.');
        valid = false;
    }

    if (!valid) return;

    const users = getUsers();

    if (users[username]) {
        setError('signup-username', 'signup-username-err', 'This username is already taken.');
        return;
    }


    users[username] = { firstName, lastName, email, password };
    saveUsers(users);

    simulateLoading('signup-btn', 'Creating Account…', () => {
        const displayName = firstName + ' ' + lastName;
        addSession(username, displayName);
        showGreeting(displayName);
    });
}


function simulateLoading(btnId, loadingText, callback) {
    const btn      = document.getElementById(btnId);
    const textSpan = btn.querySelector('.btn-text');
    const loader   = btn.querySelector('.btn-loader');

    btn.disabled          = true;
    textSpan.textContent  = loadingText;
    loader.hidden         = false;

    setTimeout(() => {
        btn.disabled         = false;
        loader.hidden        = true;
        textSpan.textContent = btnId === 'signin-btn' ? 'Sign In' : 'Create Account';
        callback();
    }, 1200);
}


function forgotPassword() {
    const username = document.getElementById('signin-username').value.trim();
    if (!username) {
        alert('Please enter your username first, then click "Forgot password?"');
        return;
    }

    const users = getUsers();
    if (!users[username]) {
        alert('No account found with the username "' + username + '".');
        return;
    }

    alert('Password reset link has been sent to: ' + users[username].email + '\n\n(This is a demo — no actual email is sent.)');
}
