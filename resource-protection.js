// Resource Protection System
// This script prevents tools from functioning when downloaded or accessed outside the authenticated environment

(function() {
    'use strict';
    
    // Protection Configuration
    const PROTECTION_CONFIG = {
        ALLOWED_DOMAINS: [
            'localhost',
            '127.0.0.1',
            'https://muhammadzeshanlatif.github.io/',
            // Add your domain here when deployed
            // 'yourdomain.com',
            // 'www.yourdomain.com'
        ],
        STORAGE_KEY: 'seo_tools_auth',
        CHECK_INTERVAL: 30000, // Check every 30 seconds
        OBFUSCATION_KEY: 'SEO_TOOLS_HUB_2025'
    };

    class ResourceProtection {
        constructor() {
            this.isProtected = false;
            this.protectionActive = false;
            this.checkInterval = null;
            this.init();
        }

        init() {
            // Immediate protection check
            this.checkProtection();
            
            // Set up periodic checks
            this.startPeriodicChecks();
            
            // Protect against common bypass attempts
            this.setupAntiBypass();
            
            // Obfuscate critical functions
            this.obfuscateFunctions();
        }

        checkProtection() {
            const domainCheck = this.checkDomain();
            const authCheck = this.checkAuthentication();
            const integrityCheck = this.checkIntegrity();
            
            if (!domainCheck || !authCheck || !integrityCheck) {
                this.activateProtection();
                return false;
            }
            
            return true;
        }

        checkDomain() {
            const currentDomain = window.location.hostname;
            const isAllowed = PROTECTION_CONFIG.ALLOWED_DOMAINS.some(domain => 
                currentDomain === domain || currentDomain.endsWith('.' + domain)
            );
            
            // Also check for file:// protocol (local file access)
            const isFileProtocol = window.location.protocol === 'file:';
            
            if (isFileProtocol || !isAllowed) {
                console.warn('Unauthorized domain access detected');
                return false;
            }
            
            return true;
        }

        checkAuthentication() {
            try {
                const sessionData = localStorage.getItem(PROTECTION_CONFIG.STORAGE_KEY);
                if (!sessionData) {
                    return false;
                }

                const parsed = JSON.parse(sessionData);
                
                // Check if session is expired
                if (Date.now() > parsed.expiresAt) {
                    return false;
                }

                return true;
            } catch (error) {
                return false;
            }
        }

        checkIntegrity() {
            // Check if critical elements exist
            const hasAuthGuard = typeof window.authGuard !== 'undefined' || 
                                 document.querySelector('script[src*="auth-guard"]');
            
            if (!hasAuthGuard) {
                console.warn('Security components missing');
                return false;
            }
            
            return true;
        }

        activateProtection() {
            if (this.protectionActive) return;
            
            this.protectionActive = true;
            
            // Disable all interactive elements
            this.disableInteractivity();
            
            // Show protection message
            this.showProtectionMessage();
            
            // Disable critical functions
            this.disableFunctions();
            
            // Clear sensitive data
            this.clearSensitiveData();
        }

        disableInteractivity() {
            // Disable all buttons
            const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
            buttons.forEach(button => {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
            });

            // Disable all form inputs
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.disabled = true;
                input.style.opacity = '0.5';
            });

            // Disable file uploads
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => {
                input.disabled = true;
                input.removeEventListener = function() {};
            });

            // Disable drag and drop
            document.addEventListener('dragover', this.preventEvent, true);
            document.addEventListener('drop', this.preventEvent, true);
        }

        preventEvent(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        showProtectionMessage() {
            // Remove any existing protection message
            const existingMessage = document.getElementById('protection-overlay');
            if (existingMessage) {
                existingMessage.remove();
            }

            const overlay = document.createElement('div');
            overlay.id = 'protection-overlay';
            overlay.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999999;
                    color: white;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                ">
                    <div style="
                        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                        color: white;
                        padding: 4rem;
                        border-radius: 20px;
                        text-align: center;
                        max-width: 500px;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                        border: 2px solid #3b82f6;
                    ">
                        <div style="
                            width: 100px;
                            height: 100px;
                            background: linear-gradient(45deg, #ef4444, #dc2626);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 2rem;
                            font-size: 3rem;
                            animation: pulse 2s infinite;
                        ">
                            🔒
                        </div>
                        <h2 style="margin-bottom: 1.5rem; font-size: 2rem; color: #ef4444;">Access Restricted</h2>
                        <p style="margin-bottom: 1.5rem; line-height: 1.6; font-size: 1.1rem;">
                            This tool is protected and can only be accessed through the official SEO Tools Hub platform with proper authentication.
                        </p>
                        <p style="margin-bottom: 2rem; color: #9ca3af; font-size: 0.9rem;">
                            Unauthorized access or distribution is prohibited.
                        </p>
                        <a href="/" style="
                            display: inline-block;
                            background: linear-gradient(45deg, #3b82f6, #1d4ed8);
                            color: white;
                            padding: 1rem 2rem;
                            border-radius: 50px;
                            text-decoration: none;
                            font-weight: 600;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-2px)'" 
                           onmouseout="this.style.transform='translateY(0)'">
                            Return to SEO Tools Hub
                        </a>
                        <style>
                            @keyframes pulse {
                                0% { transform: scale(1); }
                                50% { transform: scale(1.1); }
                                100% { transform: scale(1); }
                            }
                        </style>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
        }

        disableFunctions() {
            // Override critical functions
            window.fetch = function() {
                console.warn('Network requests disabled in protected mode');
                return Promise.reject(new Error('Access denied'));
            };

            window.XMLHttpRequest = function() {
                throw new Error('XMLHttpRequest disabled in protected mode');
            };

            // Disable local storage access
            const originalSetItem = localStorage.setItem;
            const originalGetItem = localStorage.getItem;
            
            localStorage.setItem = function(key, value) {
                if (key !== PROTECTION_CONFIG.STORAGE_KEY) {
                    console.warn('Local storage access restricted');
                    return;
                }
                return originalSetItem.call(this, key, value);
            };

            localStorage.getItem = function(key) {
                if (key !== PROTECTION_CONFIG.STORAGE_KEY) {
                    console.warn('Local storage access restricted');
                    return null;
                }
                return originalGetItem.call(this, key);
            };

            // Disable console access
            if (typeof console !== 'undefined') {
                console.log = console.warn = console.error = function() {};
            }
        }

        clearSensitiveData() {
            // Clear any sensitive data from the page
            const sensitiveSelectors = [
                'input[type="password"]',
                'input[type="email"]',
                '.sensitive-data',
                '.user-data'
            ];

            sensitiveSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el.tagName === 'INPUT') {
                        el.value = '';
                    } else {
                        el.textContent = '';
                    }
                });
            });
        }

        startPeriodicChecks() {
            this.checkInterval = setInterval(() => {
                if (!this.checkProtection()) {
                    this.activateProtection();
                }
            }, PROTECTION_CONFIG.CHECK_INTERVAL);
        }

        setupAntiBypass() {
            // Prevent developer tools
            document.addEventListener('keydown', (e) => {
                // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                    (e.ctrlKey && e.key === 'U')) {
                    e.preventDefault();
                    this.activateProtection();
                }
            });

            // Detect developer tools
            let devtools = {
                open: false,
                orientation: null
            };

            const threshold = 160;

            setInterval(() => {
                if (window.outerHeight - window.innerHeight > threshold || 
                    window.outerWidth - window.innerWidth > threshold) {
                    if (!devtools.open) {
                        devtools.open = true;
                        this.activateProtection();
                    }
                } else {
                    devtools.open = false;
                }
            }, 500);

            // Prevent right-click context menu
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });

            // Prevent text selection
            document.addEventListener('selectstart', (e) => {
                e.preventDefault();
                return false;
            });

            // Prevent drag
            document.addEventListener('dragstart', (e) => {
                e.preventDefault();
                return false;
            });
        }

        obfuscateFunctions() {
            // Obfuscate critical function names
            const criticalFunctions = [
                'eval',
                'Function',
                'setTimeout',
                'setInterval'
            ];

            criticalFunctions.forEach(funcName => {
                if (window[funcName]) {
                    const original = window[funcName];
                    window[funcName] = function(...args) {
                        if (!this.checkProtection()) {
                            throw new Error('Function access denied');
                        }
                        return original.apply(this, args);
                    }.bind(this);
                }
            });
        }

        destroy() {
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
            }
        }
    }

    // Initialize protection when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.resourceProtection = new ResourceProtection();
        });
    } else {
        window.resourceProtection = new ResourceProtection();
    }

    // Export for global use
    window.ResourceProtection = ResourceProtection;

})();

