// --- auth.js ---
// Configuration
const CONFIG = {
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxV3KwSQQFFeCpw0i7Z6EULi3cD0U8rsLIPQL79nSh7Xv_Iv881-DnZBa3xDguTbStL9w/exec',
    SESSION_DURATION: 24 * 60 * 60 * 1000,
    STORAGE_KEY: 'seo_tools_auth'
};

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadUserFromStorage();
    }

    saveUserToStorage(user) {
        const sessionData = {
            user,
            timestamp: Date.now(),
            expiresAt: Date.now() + CONFIG.SESSION_DURATION
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
        this.currentUser = user;
    }

    loadUserFromStorage() {
        try {
            const sessionData = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (!sessionData) return null;

            const parsed = JSON.parse(sessionData);
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

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        this.currentUser = null;
    }
}

const authManager = new AuthManager();


// Form request via iframe
function makeFormRequest(data) {
    return new Promise((resolve, reject) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = CONFIG.WEB_APP_URL;
        form.target = 'response_iframe';
        form.style.display = 'none';

        Object.keys(data).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
            form.appendChild(input);
        });

        const iframe = document.createElement('iframe');
        iframe.name = 'response_iframe';
        iframe.style.display = 'none';

        let responseReceived = false;

        iframe.onload = function () {
            if (!responseReceived) {
                responseReceived = true;
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const responseText = iframeDoc.body.textContent || iframeDoc.body.innerText;
                    if (responseText.trim()) {
                        const result = JSON.parse(responseText);
                        resolve(result);
                    } else {
                        resolve({ success: true, message: 'Request processed' });
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                    resolve({ success: true, message: 'Request sent successfully' });
                }
                setTimeout(() => {
                    form.remove();
                    iframe.remove();
                }, 1000);
            }
        };

        iframe.onerror = function () {
            if (!responseReceived) {
                responseReceived = true;
                reject(new Error('Failed to submit form'));
                form.remove();
                iframe.remove();
            }
        };

        document.body.appendChild(iframe);
        document.body.appendChild(form);
        form.submit();

        setTimeout(() => {
            if (!responseReceived) {
                responseReceived = true;
                resolve({ success: true, message: 'Request sent (timeout)' });
                form.remove();
                iframe.remove();
            }
        }, 10000);
    });
}

// Signup
async function signupUser(userData) {
    try {
        const { firstName, lastName, email, password } = userData;
        const result = await makeFormRequest({
            action: 'signup',
            email: email.trim(),
            password: password.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim()
        });

        return result.success
            ? { success: true, message: 'Account created successfully' }
            : { success: false, message: result.error || 'Signup failed' };
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, message: 'Signup failed. Please try again.' };
    }
}

async function loginUser(email, password) {
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'login');
        formData.append('email', email.trim());
        formData.append('password', password.trim());

        const response = await fetch(CONFIG.WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        const result = await response.json();

        if (result.success && result.user) {
            authManager.saveUserToStorage(result.user);
            return { success: true, user: result.user };
        } else {
            return { success: false, message: result.error || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Login failed. Please try again.' };
    }
}

// Login
// async function loginUser(email, password) {
//     try {
//         const result = await makeFormRequest({
//             action: 'login',
//             email: email.trim(),
//             password: password.trim()
//         });
//
//         if (result.success && result.user) {
//             authManager.saveUserToStorage(result.user);
//             return { success: true, user: result.user };
//         } else {
//             return { success: false, message: result.error || 'Login failed' };
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         return { success: false, message: 'Login failed. Please try again.' };
//     }
// }

function updateUIForAuthenticatedUser() {
    const user = authManager.getCurrentUser();
    if (!user) return;

    // Update any UI elements that show user info
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = `${user.firstName} ${user.lastName}`.trim() || user.email;
    });

    // Show/hide authentication-related elements
    const loginButtons = document.querySelectorAll('.login-button');
    const logoutButtons = document.querySelectorAll('.logout-button');
    const userMenus = document.querySelectorAll('.user-menu');

    loginButtons.forEach(el => el.style.display = 'none');
    logoutButtons.forEach(el => el.style.display = 'block');
    userMenus.forEach(el => el.style.display = 'block');
}

function setupLogoutHandlers() {
    const logoutButtons = document.querySelectorAll('.logout-button, [data-action="logout"]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            authManager.logout();
            window.location.href = 'index.html';
        });
    });
}


async function requestPasswordReset(email) {
    try {
        const response = await fetch(CONFIG.WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'checkUser',
                email: email
            })
        });

        const result = await response.json();

        if (result.exists) {
            return { success: true, message: 'If an account exists with this email, reset instructions have been sent.' };
        } else {
            return { success: true, message: 'If an account exists with this email, reset instructions have been sent.' };
        }
    } catch (error) {
        console.error('Password reset request error:', error);
        return { success: false, message: 'Failed to process request. Please try again.' };
    }
}

async function resetPassword(email, newPassword) {
    try {
        const response = await fetch(CONFIG.WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'resetPassword',
                email: email,
                newPassword: newPassword
            })
        });

        const result = await response.json();

        if (result.success) {
            return { success: true, message: 'Password updated successfully' };
        } else {
            return { success: false, message: result.error || 'Failed to update password' };
        }
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, message: 'Failed to update password. Please try again.' };
    }
}

// Utility functions for UI
function redirectIfNotAuthenticated() {
    if (!authManager.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function redirectIfAuthenticated() {
    if (authManager.isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Update UI if user is authenticated
    if (authManager.isAuthenticated()) {
        updateUIForAuthenticatedUser();
    }

    // Setup logout handlers
    setupLogoutHandlers();
});

window.authManager = authManager;
window.signupUser = signupUser;
window.loginUser = loginUser;
window.updateUIForAuthenticatedUser = updateUIForAuthenticatedUser;
window.requestPasswordReset = requestPasswordReset;
window.resetPassword = resetPassword;
window.redirectIfNotAuthenticated = redirectIfNotAuthenticated;
window.redirectIfAuthenticated = redirectIfAuthenticated;