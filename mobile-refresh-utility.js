/**
 * Mobile Refresh Utility - Ctrl+F5 Equivalent for Mobile Devices
 * Provides multiple methods to trigger hard refresh on mobile devices
 */

class MobileRefreshUtility {
    constructor() {
        this.isInitialized = false;
        this.refreshButton = null;
        this.gestureHandler = null;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Only initialize on mobile devices
        if (this.isMobileDevice()) {
            this.createRefreshButton();
            this.setupGestureHandlers();
            this.setupKeyboardShortcuts();
            this.setupShakeDetection();
            this.isInitialized = true;
            console.log('Mobile Refresh Utility initialized');
        }
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    // Method 1: Floating Refresh Button
    createRefreshButton() {
        // Create floating refresh button
        this.refreshButton = document.createElement('div');
        this.refreshButton.id = 'mobile-refresh-btn';
        this.refreshButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.25022 4 6.82447 5.38734 5.38451 7.50024" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M8 7L5.38451 7.50024L5.88475 4.38451" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // Style the button
        this.refreshButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;
            opacity: 0.8;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
        `;

        // Add hover/active effects
        this.refreshButton.addEventListener('mouseenter', () => {
            this.refreshButton.style.transform = 'scale(1.1)';
            this.refreshButton.style.opacity = '1';
        });

        this.refreshButton.addEventListener('mouseleave', () => {
            this.refreshButton.style.transform = 'scale(1)';
            this.refreshButton.style.opacity = '0.8';
        });

        this.refreshButton.addEventListener('touchstart', () => {
            this.refreshButton.style.transform = 'scale(0.95)';
        });

        this.refreshButton.addEventListener('touchend', () => {
            this.refreshButton.style.transform = 'scale(1)';
        });

        // Add click handler
        this.refreshButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.performHardRefresh();
        });

        // Add to page
        document.body.appendChild(this.refreshButton);

        // Auto-hide after 10 seconds, show on scroll
        this.setupAutoHide();
    }

    setupAutoHide() {
        let hideTimeout;
        let isVisible = true;

        const hideButton = () => {
            if (isVisible) {
                this.refreshButton.style.opacity = '0.3';
                this.refreshButton.style.transform = 'scale(0.8)';
                isVisible = false;
            }
        };

        const showButton = () => {
            if (!isVisible) {
                this.refreshButton.style.opacity = '0.8';
                this.refreshButton.style.transform = 'scale(1)';
                isVisible = true;
            }
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(hideButton, 10000);
        };

        // Initial hide timer
        hideTimeout = setTimeout(hideButton, 10000);

        // Show on scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            showButton();
            scrollTimeout = setTimeout(() => {
                hideTimeout = setTimeout(hideButton, 5000);
            }, 1000);
        });

        // Show on touch
        document.addEventListener('touchstart', showButton);
    }

    // Method 2: Gesture Handlers (Double-tap top of screen)
    setupGestureHandlers() {
        let lastTap = 0;
        let tapCount = 0;

        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            // Check if tap is in top 100px of screen
            if (e.changedTouches[0].clientY <= 100) {
                if (tapLength < 500 && tapLength > 0) {
                    tapCount++;
                    if (tapCount === 2) {
                        this.showRefreshConfirmation();
                        tapCount = 0;
                    }
                } else {
                    tapCount = 1;
                }
                lastTap = currentTime;
                
                // Reset tap count after 1 second
                setTimeout(() => {
                    tapCount = 0;
                }, 1000);
            }
        });
    }

    // Method 3: Keyboard Shortcuts (for devices with keyboards)
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+R or Cmd+R or F5
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.performHardRefresh();
            }
            
            // F5
            if (e.key === 'F5') {
                e.preventDefault();
                this.performHardRefresh();
            }
            
            // Ctrl+Shift+R or Cmd+Shift+R (hard refresh)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.performHardRefresh();
            }
        });
    }

    // Method 4: Shake Detection
    setupShakeDetection() {
        if (!window.DeviceMotionEvent) return;

        let lastX, lastY, lastZ;
        let lastUpdate = 0;
        const shakeThreshold = 15;
        let shakeCount = 0;

        window.addEventListener('devicemotion', (e) => {
            const current = Date.now();
            if ((current - lastUpdate) > 100) {
                const diffTime = current - lastUpdate;
                lastUpdate = current;

                const x = e.accelerationIncludingGravity.x;
                const y = e.accelerationIncludingGravity.y;
                const z = e.accelerationIncludingGravity.z;

                if (lastX !== undefined) {
                    const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
                    
                    if (speed > shakeThreshold) {
                        shakeCount++;
                        if (shakeCount >= 3) {
                            this.showRefreshConfirmation();
                            shakeCount = 0;
                        }
                        
                        // Reset shake count after 2 seconds
                        setTimeout(() => {
                            shakeCount = 0;
                        }, 2000);
                    }
                }

                lastX = x;
                lastY = y;
                lastZ = z;
            }
        });
    }

    // Show confirmation dialog
    showRefreshConfirmation() {
        const confirmation = document.createElement('div');
        confirmation.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            text-align: center;
            max-width: 300px;
            width: 90%;
        `;

        confirmation.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #374151;">Hard Refresh Page?</h3>
            <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">This will reload the page and clear cache</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirm-refresh" style="
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                ">Refresh</button>
                <button id="cancel-refresh" style="
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                ">Cancel</button>
            </div>
        `;

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(confirmation);

        // Handle buttons
        document.getElementById('confirm-refresh').addEventListener('click', () => {
            this.performHardRefresh();
        });

        document.getElementById('cancel-refresh').addEventListener('click', () => {
            document.body.removeChild(backdrop);
            document.body.removeChild(confirmation);
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(confirmation)) {
                document.body.removeChild(backdrop);
                document.body.removeChild(confirmation);
            }
        }, 5000);
    }

    // Perform the actual hard refresh
    performHardRefresh() {
        // Show loading indicator
        this.showLoadingIndicator();

        // Clear various caches
        this.clearCaches().then(() => {
            // Force reload with cache bypass
            window.location.reload(true);
        }).catch(() => {
            // Fallback: regular reload with cache busting
            const url = new URL(window.location);
            url.searchParams.set('_refresh', Date.now());
            window.location.href = url.toString();
        });
    }

    // Clear browser caches
    async clearCaches() {
        const promises = [];

        // Clear service worker caches
        if ('caches' in window) {
            promises.push(
                caches.keys().then(names => {
                    return Promise.all(
                        names.map(name => caches.delete(name))
                    );
                })
            );
        }

        // Clear localStorage
        try {
            localStorage.clear();
        } catch (e) {
            console.warn('Could not clear localStorage:', e);
        }

        // Clear sessionStorage
        try {
            sessionStorage.clear();
        } catch (e) {
            console.warn('Could not clear sessionStorage:', e);
        }

        return Promise.all(promises);
    }

    // Show loading indicator
    showLoadingIndicator() {
        const loader = document.createElement('div');
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        `;

        loader.innerHTML = `
            <div style="
                width: 40px;
                height: 40px;
                border: 4px solid #e5e7eb;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 16px;
            "></div>
            <p style="color: #374151; font-weight: 600;">Refreshing page...</p>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        document.body.appendChild(loader);
    }

    // Public method to trigger refresh
    refresh() {
        this.performHardRefresh();
    }

    // Public method to show/hide refresh button
    toggleRefreshButton(show = true) {
        if (this.refreshButton) {
            this.refreshButton.style.display = show ? 'flex' : 'none';
        }
    }

    // Destroy the utility
    destroy() {
        if (this.refreshButton && document.body.contains(this.refreshButton)) {
            document.body.removeChild(this.refreshButton);
        }
        this.isInitialized = false;
    }
}

// Auto-initialize on mobile devices
let mobileRefresh;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        mobileRefresh = new MobileRefreshUtility();
    });
} else {
    mobileRefresh = new MobileRefreshUtility();
}

// Export for manual use
window.MobileRefreshUtility = MobileRefreshUtility;
window.mobileRefresh = mobileRefresh;

// Add global function for easy access
window.hardRefresh = () => {
    if (mobileRefresh) {
        mobileRefresh.refresh();
    } else {
        window.location.reload(true);
    }
};

console.log('Mobile Refresh Utility loaded. Available methods:');
console.log('- Floating refresh button (top-right)');
console.log('- Double-tap top of screen');
console.log('- Shake device (if supported)');
console.log('- Keyboard shortcuts (Ctrl+R, F5, Ctrl+Shift+R)');
console.log('- Call window.hardRefresh() programmatically');