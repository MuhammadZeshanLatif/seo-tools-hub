// Authentication Guard for SEO Tools
// This script should be included in all tool pages to restrict access

(function() {
    'use strict';
    
    // Configuration
    const AUTH_CONFIG = {
        STORAGE_KEY: 'seo_tools_auth',
        LOGIN_URL: './login.html',
        HOME_URL: './index.html',
        SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
        CHECK_INTERVAL: 5 * 60 * 1000 // Check every 5 minutes
    };

    // Authentication Guard Class
    class AuthGuard {
        constructor() {
            this.currentUser = null;
            this.sessionCheckInterval = null;
            this.init();
        }

        init() {
            // Check authentication immediately
            if (!this.checkAuthentication()) {
                this.redirectToLogin();
                return;
            }

            // Set up periodic session checks
            this.startSessionMonitoring();
            
            // Set up UI updates
            this.updateToolPageUI();
            
            // Set up logout handlers
            this.setupLogoutHandlers();
            
            // Set up beforeunload handler to save session
            this.setupBeforeUnloadHandler();
        }

        checkAuthentication() {
            try {
                const sessionData = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
                if (!sessionData) {
                    console.log('No session data found');
                    return false;
                }

                const parsed = JSON.parse(sessionData);
                
                // Check if session is expired
                if (Date.now() > parsed.expiresAt) {
                    console.log('Session expired');
                    this.clearSession();
                    return false;
                }

                this.currentUser = parsed.user;
                console.log('User authenticated:', this.currentUser.email);
                return true;
            } catch (error) {
                console.error('Error checking authentication:', error);
                this.clearSession();
                return false;
            }
        }

        redirectToLogin() {
            // Store the current page URL to redirect back after login
            const currentUrl = window.location.href;
            const returnUrl = encodeURIComponent(currentUrl);
            
            // Show a brief message before redirecting
            this.showAuthenticationMessage();
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = `${AUTH_CONFIG.LOGIN_URL}?return=${returnUrl}`;
            }, 2000);
        }

        showAuthenticationMessage() {
            // Create and show authentication required message
            const messageDiv = document.createElement('div');
            messageDiv.id = 'auth-message';
            messageDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    color: white;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                ">
                    <div style="
                        background: white;
                        color: #333;
                        padding: 3rem;
                        border-radius: 20px;
                        text-align: center;
                        max-width: 400px;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    ">
                        <div style="
                            width: 80px;
                            height: 80px;
                            background: linear-gradient(45deg, #3b82f6, #1d4ed8);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 1.5rem;
                            font-size: 2rem;
                        ">
                            🔒
                        </div>
                        <h2 style="margin-bottom: 1rem; font-size: 1.5rem;">Authentication Required</h2>
                        <p style="margin-bottom: 1.5rem; color: #666; line-height: 1.6;">
                            This tool requires authentication. You will be redirected to the login page.
                        </p>
                        <div style="
                            width: 30px;
                            height: 30px;
                            border: 3px solid #f3f3f3;
                            border-top: 3px solid #3b82f6;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto;
                        "></div>
                        <style>
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        </style>
                    </div>
                </div>
            `;
            
            document.body.appendChild(messageDiv);
        }

        startSessionMonitoring() {
            this.sessionCheckInterval = setInterval(() => {
                if (!this.checkAuthentication()) {
                    this.redirectToLogin();
                }
            }, AUTH_CONFIG.CHECK_INTERVAL);
        }

        stopSessionMonitoring() {
            if (this.sessionCheckInterval) {
                clearInterval(this.sessionCheckInterval);
                this.sessionCheckInterval = null;
            }
        }

        updateToolPageUI() {
            if (!this.currentUser) return;

            // Add user info to the page
            this.addUserInfoToPage();
            
            // Add logout functionality
            this.addLogoutButton();
            
            // Update any existing user name elements
            const userNameElements = document.querySelectorAll('.user-name');
            userNameElements.forEach(el => {
                el.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim() || this.currentUser.email;
            });
        }

        addUserInfoToPage() {
            // Check if user info already exists
            if (document.getElementById('user-info-bar')) return;

            const userInfoBar = document.createElement('div');
            userInfoBar.id = 'user-info-bar';
            userInfoBar.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: rgba(59, 130, 246, 0.95);
                    color: white;
                    padding: 0.75rem 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 0.9rem;
                ">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <a href="${AUTH_CONFIG.HOME_URL}" style="
                            color: white;
                            text-decoration: none;
                            font-weight: 600;
                            padding: 0.5rem 1rem;
                            background: rgba(255, 255, 255, 0.2);
                            border-radius: 25px;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" 
                           onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                            ← SEO Tools Hub
                        </a>
                        <span>Welcome, <strong>${this.currentUser.firstName || this.currentUser.email}</strong></span>
                    </div>
                    <button id="logout-btn" style="
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        padding: 0.5rem 1rem;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" 
                       onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                        Logout
                    </button>
                </div>
            `;
            
            document.body.insertBefore(userInfoBar, document.body.firstChild);
            
            // Adjust body padding to account for the fixed bar
            document.body.style.paddingTop = '60px';
        }

        addLogoutButton() {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    this.logout();
                });
            }
        }

        setupLogoutHandlers() {
            // Handle existing logout buttons
            const logoutButtons = document.querySelectorAll('.logout-button, [data-action="logout"]');
            logoutButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            });
        }

        setupBeforeUnloadHandler() {
            window.addEventListener('beforeunload', () => {
                // Update session timestamp before leaving
                this.updateSessionTimestamp();
            });
        }

        updateSessionTimestamp() {
            try {
                const sessionData = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
                if (sessionData) {
                    const parsed = JSON.parse(sessionData);
                    parsed.timestamp = Date.now();
                    localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(parsed));
                }
            } catch (error) {
                console.error('Error updating session timestamp:', error);
            }
        }

        logout() {
            this.clearSession();
            this.stopSessionMonitoring();
            
            // Show logout message
            this.showLogoutMessage();
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = AUTH_CONFIG.HOME_URL;
            }, 1500);
        }

        showLogoutMessage() {
            const messageDiv = document.createElement('div');
            messageDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    color: white;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                ">
                    <div style="
                        background: white;
                        color: #333;
                        padding: 3rem;
                        border-radius: 20px;
                        text-align: center;
                        max-width: 400px;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    ">
                        <div style="
                            width: 80px;
                            height: 80px;
                            background: linear-gradient(45deg, #10b981, #059669);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 1.5rem;
                            font-size: 2rem;
                        ">
                            ✓
                        </div>
                        <h2 style="margin-bottom: 1rem; font-size: 1.5rem;">Logged Out Successfully</h2>
                        <p style="color: #666;">Redirecting to homepage...</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(messageDiv);
        }

        clearSession() {
            localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
            this.currentUser = null;
        }

        getCurrentUser() {
            return this.currentUser;
        }

        isAuthenticated() {
            return this.currentUser !== null;
        }
    }

    // Initialize Auth Guard when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.authGuard = new AuthGuard();
        });
    } else {
        window.authGuard = new AuthGuard();
    }

    // Export for global use
    window.AuthGuard = AuthGuard;

})();

