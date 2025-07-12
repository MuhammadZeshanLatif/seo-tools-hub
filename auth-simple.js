// Simplified Authentication system using Google Apps Script
// SEO Tools Hub - User Authentication

// Configuration
const CONFIG = {
    // Google Apps Script Web App URL - REPLACE WITH YOUR DEPLOYED SCRIPT URL
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxV3KwSQQFFeCpw0i7Z6EULi3cD0U8rsLIPQL79nSh7Xv_Iv881-DnZBa3xDguTbStL9w/exec',
    
    // Authentication settings
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    STORAGE_KEY: 'seo_tools_auth'
};

// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadUserFromStorage();
    }

    // Save user session to localStorage
    saveUserToStorage(user) {
        const sessionData = {
            user: user,
            timestamp: Date.now(),
            expiresAt: Date.now() + CONFIG.SESSION_DURATION
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
        this.currentUser = user;
    }

    // Load user session from localStorage
    loadUserFromStorage() {
        try {
            const sessionData = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (!sessionData) return null;

            const parsed = JSON.parse(sessionData);
            
            // Check if session is expired
            if (Date.now() > parsed.expiresAt) {
                this.logout();
                return null;
            }

            this.currentUser = parsed.user;
            return parsed.user;
        } catch (error) {
            console.error('Error loading user from storage:', error);
            return null;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Logout user
    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        this.currentUser = null;
    }
}

// Initialize Auth Manager
const authManager = new AuthManager();

// Authentication API functions
async function signupUser(userData) {
    try {
        const { firstName, lastName, email, password } = userData;
        
        const response = await fetch(CONFIG.WEB_APP_URL, {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'signup',
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName
            })
        });

        const result = await response.json();
        
        if (result.success) {
            return { success: true, message: 'Account created successfully' };
        } else {
            return { success: false, message: result.error || 'Failed to create account' };
        }
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, message: 'Failed to create account. Please check your internet connection.' };
    }
}

async function loginUser(email, password) {
    try {
        const response = await fetch(CONFIG.WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Save user session
            authManager.saveUserToStorage(result.user);
            return { success: true, user: result.user };
        } else {
            return { success: false, message: result.error || 'Invalid email or password' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Login failed. Please check your internet connection.' };
    }
}




// Export functions for global use
window.authManager = authManager;
window.loginUser = loginUser;
window.signupUser = signupUser;
