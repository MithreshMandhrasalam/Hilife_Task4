// Simple storage helpers
function getUsers() {
    var data = localStorage.getItem('hilife_users');
    if (data) {
        return JSON.parse(data);
    }
    return {};
}

function saveUsers(users) {
    localStorage.setItem('hilife_users', JSON.stringify(users));
}

function getClockData() {
    var data = localStorage.getItem('hilife_clock');
    if (data) {
        return JSON.parse(data);
    }
    return {};
}

function saveClockData(data) {
    localStorage.setItem('hilife_clock', JSON.stringify(data));
}

// Show greeting overlay with clock status
function showGreeting(username, displayName) {
    var hour = new Date().getHours();
    var greetingText = "Good Night";
    if (hour >= 5 && hour < 12) {
        greetingText = "Good Morning";
    } else if (hour >= 12 && hour < 17) {
        greetingText = "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
        greetingText = "Good Evening";
    }

    document.getElementById('greeting-label').textContent = greetingText + ",";
    document.getElementById('greeting-name').textContent = displayName;
    
    // Live clock
    var timeEl = document.getElementById('greeting-time');
    function updateClock() {
        timeEl.textContent = new Date().toLocaleTimeString('en-IN');
    }
    updateClock();
    window.clockTimer = setInterval(updateClock, 1000);

    // Save active user info on overlay element
    var overlay = document.getElementById('greeting-overlay');
    if (overlay) {
        overlay.hidden = false;
        overlay.setAttribute('data-username', username);
    }

    // Render current clock status
    var clockData = getClockData();
    var userClock = clockData[username];
    var statusEl = document.getElementById('clock-status');
    var toggleBtn = document.getElementById('clock-toggle-btn');

    if (userClock) {
        statusEl.textContent = "Clocked " + userClock.status + " at " + userClock.time;
        if (userClock.status === 'In') {
            statusEl.style.color = 'green';
            toggleBtn.textContent = 'Clock Out';
            toggleBtn.className = 'btn-primary btn-clock-out';
        } else {
            statusEl.style.color = 'red';
            toggleBtn.textContent = 'Clock In';
            toggleBtn.className = 'btn-primary btn-clock-in';
        }
    } else {
        statusEl.textContent = "Not clocked in yet";
        statusEl.style.color = 'gray';
        toggleBtn.textContent = 'Clock In';
        toggleBtn.className = 'btn-primary btn-clock-in';
    }
}

function closeGreeting() {
    var overlay = document.getElementById('greeting-overlay');
    if (overlay) {
        overlay.hidden = true;
    }
    clearInterval(window.clockTimer);
}

// Clock toggle handler
function handleClockToggle() {
    var overlay = document.getElementById('greeting-overlay');
    var username = overlay.getAttribute('data-username');
    var statusEl = document.getElementById('clock-status');
    var toggleBtn = document.getElementById('clock-toggle-btn');
    
    var time = new Date().toLocaleTimeString('en-IN');
    var clockData = getClockData();
    var userClock = clockData[username];
    var isClockedIn = userClock && userClock.status === 'In';

    if (isClockedIn) {
        // Clock Out
        clockData[username] = { status: 'Out', time: time };
        statusEl.textContent = "Clocked Out at " + time;
        statusEl.style.color = 'red';
        toggleBtn.textContent = 'Clock In';
        toggleBtn.className = 'btn-primary btn-clock-in';
    } else {
        // Clock In
        clockData[username] = { status: 'In', time: time };
        statusEl.textContent = "Clocked In at " + time;
        statusEl.style.color = 'green';
        toggleBtn.textContent = 'Clock Out';
        toggleBtn.className = 'btn-primary btn-clock-out';
    }
    saveClockData(clockData);
}

// Switch between Sign In and Sign Up tabs
function switchTab(tab) {
    if (tab === 'signin') {
        document.getElementById('tab-signin').classList.add('active');
        document.getElementById('tab-signup').classList.remove('active');
        document.getElementById('panel-signin').classList.add('active');
        document.getElementById('panel-signup').classList.remove('active');
    } else {
        document.getElementById('tab-signin').classList.remove('active');
        document.getElementById('tab-signup').classList.add('active');
        document.getElementById('panel-signin').classList.remove('active');
        document.getElementById('panel-signup').classList.add('active');
    }
    // Clear all errors
    var errorFields = document.getElementsByClassName('err');
    for (var i = 0; i < errorFields.length; i++) {
        errorFields[i].textContent = "";
    }
    var inputs = document.getElementsByTagName('input');
    for (var j = 0; j < inputs.length; j++) {
        inputs[j].classList.remove('error', 'valid');
    }
}

// Toggle password visibility
function togglePassword(inputId, btn) {
    var input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
    } else {
        input.type = 'password';
        btn.textContent = 'Show';
    }
}

// Check password strength (simple length check)
function checkPasswordStrength(password) {
    var bar = document.getElementById('strength-bar');
    var label = document.getElementById('strength-label');
    
    if (password.length === 0) {
        bar.style.width = '0%';
        label.textContent = '';
        return;
    }

    if (password.length < 6) {
        bar.style.width = '33%';
        bar.style.background = 'red';
        label.textContent = 'Weak';
        label.style.color = 'red';
    } else if (password.length < 10) {
        bar.style.width = '66%';
        bar.style.background = 'orange';
        label.textContent = 'Medium';
        label.style.color = 'orange';
    } else {
        bar.style.width = '100%';
        bar.style.background = 'green';
        label.textContent = 'Strong';
        label.style.color = 'green';
    }
}

// Simple event listener for password strength input
document.addEventListener('DOMContentLoaded', function() {
    var pw = document.getElementById('signup-password');
    if (pw) {
        pw.addEventListener('input', function() {
            checkPasswordStrength(pw.value);
        });
    }
});

// Sign In Logic
function handleSignIn(event) {
    event.preventDefault();
    
    var usernameEl = document.getElementById('signin-username');
    var passwordEl = document.getElementById('signin-password');
    var usernameErr = document.getElementById('signin-username-err');
    var passwordErr = document.getElementById('signin-password-err');

    // Reset error display
    usernameErr.textContent = "";
    passwordErr.textContent = "";
    usernameEl.classList.remove('error', 'valid');
    passwordEl.classList.remove('error', 'valid');

    var username = usernameEl.value.trim();
    var password = passwordEl.value;
    var hasError = false;

    if (username === "") {
        usernameErr.textContent = "Username is required.";
        usernameEl.classList.add('error');
        hasError = true;
    } else {
        usernameEl.classList.add('valid');
    }

    if (password === "") {
        passwordErr.textContent = "Password is required.";
        passwordEl.classList.add('error');
        hasError = true;
    } else {
        passwordEl.classList.add('valid');
    }

    if (hasError) return;

    var users = getUsers();
    var user = users[username];

    if (!user) {
        usernameErr.textContent = "No account found with this username.";
        usernameEl.classList.add('error');
        usernameEl.classList.remove('valid');
        return;
    }

    if (user.password !== password) {
        passwordErr.textContent = "Incorrect password. Please try again.";
        passwordEl.classList.add('error');
        passwordEl.classList.remove('valid');
        return;
    }

    // Loading Animation
    var btn = document.getElementById('signin-btn');
    var btnText = btn.querySelector('.btn-text');
    var loader = btn.querySelector('.btn-loader');
    btn.disabled = true;
    btnText.textContent = "Signing In...";
    loader.hidden = false;

    setTimeout(function() {
        btn.disabled = false;
        btnText.textContent = "Sign In";
        loader.hidden = true;
        
        var fullName = user.firstName + " " + user.lastName;
        showGreeting(username, fullName);
    }, 1200);
}

// Sign Up Logic
function handleSignUp(event) {
    event.preventDefault();

    var fields = ['firstname', 'lastname', 'username', 'email', 'password', 'confirm'];
    var hasError = false;
    
    // Clear previous highlights
    for (var i = 0; i < fields.length; i++) {
        var input = document.getElementById('signup-' + fields[i]);
        var err = document.getElementById('signup-' + fields[i] + '-err');
        input.classList.remove('error', 'valid');
        err.textContent = "";
    }

    var firstName = document.getElementById('signup-firstname').value.trim();
    var lastName = document.getElementById('signup-lastname').value.trim();
    var username = document.getElementById('signup-username').value.trim();
    var email = document.getElementById('signup-email').value.trim();
    var password = document.getElementById('signup-password').value;
    var confirm = document.getElementById('signup-confirm').value;

    if (firstName === "") {
        document.getElementById('signup-firstname-err').textContent = "First name is required.";
        document.getElementById('signup-firstname').classList.add('error');
        hasError = true;
    } else {
        document.getElementById('signup-firstname').classList.add('valid');
    }

    if (lastName === "") {
        document.getElementById('signup-lastname-err').textContent = "Last name is required.";
        document.getElementById('signup-lastname').classList.add('error');
        hasError = true;
    } else {
        document.getElementById('signup-lastname').classList.add('valid');
    }

    if (username === "") {
        document.getElementById('signup-username-err').textContent = "Username is required.";
        document.getElementById('signup-username').classList.add('error');
        hasError = true;
    } else if (username.length < 3) {
        document.getElementById('signup-username-err').textContent = "Username must be at least 3 characters.";
        document.getElementById('signup-username').classList.add('error');
        hasError = true;
    } else {
        document.getElementById('signup-username').classList.add('valid');
    }

    if (email === "") {
        document.getElementById('signup-email-err').textContent = "Email is required.";
        document.getElementById('signup-email').classList.add('error');
        hasError = true;
    } else if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
        document.getElementById('signup-email-err').textContent = "Enter a valid email address.";
        document.getElementById('signup-email').classList.add('error');
        hasError = true;
    } else {
        document.getElementById('signup-email').classList.add('valid');
    }

    if (password === "") {
        document.getElementById('signup-password-err').textContent = "Password is required.";
        document.getElementById('signup-password').classList.add('error');
        hasError = true;
    } else if (password.length < 6) {
        document.getElementById('signup-password-err').textContent = "Password must be at least 6 characters.";
        document.getElementById('signup-password').classList.add('error');
        hasError = true;
    } else {
        document.getElementById('signup-password').classList.add('valid');
    }

    if (confirm === "") {
        document.getElementById('signup-confirm-err').textContent = "Please confirm your password.";
        document.getElementById('signup-confirm').classList.add('error');
        hasError = true;
    } else if (password !== confirm) {
        document.getElementById('signup-confirm-err').textContent = "Passwords do not match.";
        document.getElementById('signup-confirm').classList.add('error');
        hasError = true;
    } else {
        document.getElementById('signup-confirm').classList.add('valid');
    }

    if (hasError) return;

    var users = getUsers();
    if (users[username]) {
        document.getElementById('signup-username-err').textContent = "This username is already taken.";
        document.getElementById('signup-username').classList.add('error');
        document.getElementById('signup-username').classList.remove('valid');
        return;
    }

    // Save user
    users[username] = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
    };
    saveUsers(users);

    // Loading Animation
    var btn = document.getElementById('signup-btn');
    var btnText = btn.querySelector('.btn-text');
    var loader = btn.querySelector('.btn-loader');
    btn.disabled = true;
    btnText.textContent = "Creating Account...";
    loader.hidden = false;

    setTimeout(function() {
        btn.disabled = false;
        btnText.textContent = "Create Account";
        loader.hidden = true;
        
        var fullName = firstName + " " + lastName;
        showGreeting(username, fullName);
    }, 1200);
}

// Forgot Password
function forgotPassword() {
    var username = document.getElementById('signin-username').value.trim();
    if (username === "") {
        alert("Please enter your username first, then click \"Forgot password?\"");
        return;
    }

    var users = getUsers();
    var user = users[username];
    if (!user) {
        alert("No account found with the username \"" + username + "\".");
        return;
    }

    alert("Password reset link has been sent to: " + user.email + "\n\n(This is a demo — no actual email is sent.)");
}
