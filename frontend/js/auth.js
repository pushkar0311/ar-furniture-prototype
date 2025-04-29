document.addEventListener('DOMContentLoaded', function() {
    const TOKEN_KEY = 'arFurnitureToken';
    const MODEL_URL_KEY = 'arModelUrl';
    const USERS_KEY = 'arFurnitureUsers';

    // Initialize UI
    updateNavVisibility(localStorage.getItem(TOKEN_KEY));
    
    // Form handlers
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
    // Logout
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });

    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const messageElement = document.getElementById('login-message');
        
        try {
            if (!email || !password) throw new Error('Please fill in all fields');
            
            const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) throw new Error('Invalid email or password');
            
            localStorage.setItem(TOKEN_KEY, 'mock-token-' + Date.now());
            showMessage(messageElement, 'Login successful!', 'success');
            setTimeout(() => window.location.href = 'products.html', 1000);
            
        } catch (error) {
            showMessage(messageElement, error.message, 'error');
        }
    }

    function handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const messageElement = document.getElementById('register-message');
        
        try {
            if (!email || !password) throw new Error('Please fill in all fields');
            if (password.length < 6) throw new Error('Password must be at least 6 characters');
            
            const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
            
            if (users.some(u => u.email === email)) {
                throw new Error('Email already registered');
            }
            
            users.push({ email, password });
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            
            showMessage(messageElement, 'Registration successful!', 'success');
            setTimeout(() => window.location.href = 'login.html', 1500);
            
        } catch (error) {
            showMessage(messageElement, error.message, 'error');
        }
    }

    function handleLogout() {
        localStorage.removeItem(TOKEN_KEY);
        updateNavVisibility(null);
        window.location.href = 'login.html';
    }

    // Helper functions
    function updateNavVisibility(token) {
        const elements = {
            '.login-link': !token,
            '.register-link': !token,
            '.products-link': !!token,
            '.logout-btn': !!token
        };
        
        Object.entries(elements).forEach(([selector, shouldShow]) => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = shouldShow ? '' : 'none';
            });
        });
    }

    function showMessage(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
    }
});