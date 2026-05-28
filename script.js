function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
}

function showGreeting(username, name) {
    document.getElementById('greeting-name').textContent = name;
    
    var timeEl = document.getElementById('greeting-time');
    window.clockTimer = setInterval(function() {
        timeEl.textContent = new Date().toLocaleTimeString('en-IN');
    }, 1000);
    timeEl.textContent = new Date().toLocaleTimeString('en-IN');

    var overlay = document.getElementById('greeting-overlay');
    overlay.hidden = false;
    overlay.setAttribute('data-user', username);

    var clock = JSON.parse(localStorage.getItem('clock') || '{}')[username] || { status: 'Out', time: 'None' };
    var statusEl = document.getElementById('clock-status');
    statusEl.textContent = "Clocked " + clock.status + " at " + clock.time;
    statusEl.style.color = clock.status === 'In' ? 'green' : 'red';
    
    var btn = document.getElementById('clock-toggle-btn');
    btn.textContent = clock.status === 'In' ? 'Clock Out' : 'Clock In';
    btn.className = 'btn-primary ' + (clock.status === 'In' ? 'btn-clock-out' : 'btn-clock-in');
}

function handleClockToggle() {
    var overlay = document.getElementById('greeting-overlay');
    var username = overlay.getAttribute('data-user');
    var time = new Date().toLocaleTimeString('en-IN');
    
    var clockData = JSON.parse(localStorage.getItem('clock') || '{}');
    var status = (clockData[username] && clockData[username].status === 'In') ? 'Out' : 'In';
    
    clockData[username] = { status: status, time: time };
    localStorage.setItem('clock', JSON.stringify(clockData));
    showGreeting(username, document.getElementById('greeting-name').textContent);
}

function closeGreeting() {
    document.getElementById('greeting-overlay').hidden = true;
    clearInterval(window.clockTimer);
    localStorage.removeItem('currentUser');
}

function switchTab(tab) {
    var isSign = tab === 'signin';
    document.getElementById('tab-signin').classList.toggle('active', isSign);
    document.getElementById('tab-signup').classList.toggle('active', !isSign);
    document.getElementById('panel-signin').classList.toggle('active', isSign);
    document.getElementById('panel-signup').classList.toggle('active', !isSign);
}

function togglePassword(inputId, btn) {
    var input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? 'Show' : 'Hide';
}

function handleSignIn(e) {
    e.preventDefault();
    var u = document.getElementById('signin-username').value.trim();
    var p = document.getElementById('signin-password').value;

    if (!u || !p) return alert("Fill all fields");

    var users = getUsers();
    if (!users[u] || users[u].password !== p) return alert("Invalid credentials");

    if (document.getElementById('signin-remember').checked) {
        localStorage.setItem('rememberedUsername', u);
    } else {
        localStorage.removeItem('rememberedUsername');
    }
    localStorage.setItem('currentUser', u);

    showGreeting(u, users[u].firstName + " " + users[u].lastName);
}

function handleSignUp(e) {
    e.preventDefault();
    var f = document.getElementById('signup-firstname').value.trim();
    var l = document.getElementById('signup-lastname').value.trim();
    var u = document.getElementById('signup-username').value.trim();
    var em = document.getElementById('signup-email').value.trim();
    var p = document.getElementById('signup-password').value;
    var c = document.getElementById('signup-confirm').value;

    if (!f || !l || !u || !em || !p || !c) return alert("Fill all fields");
    if (p.length < 6) return alert("Password min 6 chars");
    if (p !== c) return alert("Passwords do not match");

    var users = getUsers();
    if (users[u]) return alert("Username taken");

    users[u] = { firstName: f, lastName: l, email: em, password: p };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', u);
    showGreeting(u, f + " " + l);
}

function forgotPassword() {
    var u = document.getElementById('signin-username').value.trim();
    if (!u) return alert("Enter username first");

    var users = getUsers();
    if (!users[u]) return alert("No account found");

    alert("Reset link sent to: " + users[u].email);
}

var rem = localStorage.getItem('rememberedUsername');
if (rem) {
    document.getElementById('signin-username').value = rem;
    document.getElementById('signin-remember').checked = true;
}

var currentUser = localStorage.getItem('currentUser');
if (currentUser) {
    var users = getUsers();
    if (users[currentUser]) {
        showGreeting(currentUser, users[currentUser].firstName + " " + users[currentUser].lastName);
    }
}
