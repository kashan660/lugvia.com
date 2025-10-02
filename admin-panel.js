// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.loadWhatsAppSettings();
        this.loadAnalyticsSettings();
        this.loadWebsiteSettings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // WhatsApp form
        document.getElementById('whatsappForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWhatsAppSettings();
        });

        // Analytics form
        document.getElementById('analyticsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAnalyticsSettings();
        });

        // Website form
        document.getElementById('websiteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWebsiteSettings();
        });
    }

    async loadDashboardData() {
        try {
            const response = await fetch('/api/admin/dashboard-analytics');
            if (response.ok) {
                const data = await response.json();
                this.updateDashboardStats(data);
                this.updateRecentActivities(data.recent_activity);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    updateDashboardStats(data) {
        document.getElementById('totalUsers').textContent = data.users?.total || 0;
        document.getElementById('newUsersToday').textContent = data.users?.new_today || 0;
        document.getElementById('totalReferrals').textContent = data.referrals?.total || 0;
        document.getElementById('totalEarnings').textContent = `$${(data.earnings?.total || 0).toFixed(2)}`;
    }

    updateRecentActivities(activities) {
        const container = document.getElementById('recentActivities');
        
        if (!activities || activities.length === 0) {
            container.innerHTML = '<div class="activity-item"><span>No recent activities</span></div>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div>
                    <strong>${activity.type.replace('_', ' ').toUpperCase()}</strong>
                    <p>${activity.description}</p>
                </div>
                <small>${new Date(activity.timestamp).toLocaleDateString()}</small>
            </div>
        `).join('');
    }

    async loadWhatsAppSettings() {
        try {
            const response = await fetch('/api/admin/whatsapp-settings');
            if (response.ok) {
                const settings = await response.json();
                document.getElementById('whatsappNumber').value = settings.whatsapp_number || '';
                document.getElementById('businessHours').value = settings.business_hours || '';
                document.getElementById('defaultMessage').value = settings.default_message || '';
                document.getElementById('autoReply').value = settings.auto_reply || '';
                document.getElementById('whatsappEnabled').checked = settings.is_enabled || false;
            }
        } catch (error) {
            console.error('Failed to load WhatsApp settings:', error);
        }
    }

    async saveWhatsAppSettings() {
        try {
            const settings = {
                whatsapp_number: document.getElementById('whatsappNumber').value,
                business_hours: document.getElementById('businessHours').value,
                default_message: document.getElementById('defaultMessage').value,
                auto_reply: document.getElementById('autoReply').value,
                is_enabled: document.getElementById('whatsappEnabled').checked
            };

            const response = await fetch('/api/admin/whatsapp-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                this.showAlert('whatsappSuccess', 'WhatsApp settings saved successfully!');
                // Reload WhatsApp widget if it exists
                if (window.whatsappWidget) {
                    window.whatsappWidget.loadSettings();
                }
            } else {
                const error = await response.json();
                this.showAlert('whatsappError', error.error || 'Failed to save WhatsApp settings');
            }
        } catch (error) {
            console.error('Save WhatsApp settings error:', error);
            this.showAlert('whatsappError', 'Failed to save WhatsApp settings');
        }
    }

    async loadAnalyticsSettings() {
        try {
            const response = await fetch('/api/admin/analytics-settings');
            if (response.ok) {
                const settings = await response.json();
                document.getElementById('gaTrackingId').value = settings.ga_tracking_id || '';
                document.getElementById('gtmContainerId').value = settings.gtm_container_id || '';
                document.getElementById('analyticsEnabled').checked = settings.is_enabled || false;
                document.getElementById('trackEvents').checked = settings.track_events !== false;
            }
        } catch (error) {
            console.error('Failed to load analytics settings:', error);
        }
    }

    async saveAnalyticsSettings() {
        try {
            const settings = {
                ga_tracking_id: document.getElementById('gaTrackingId').value,
                gtm_container_id: document.getElementById('gtmContainerId').value,
                is_enabled: document.getElementById('analyticsEnabled').checked,
                track_events: document.getElementById('trackEvents').checked
            };

            const response = await fetch('/api/admin/analytics-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                this.showAlert('analyticsSuccess', 'Analytics settings saved successfully! Please refresh the page to apply changes.');
            } else {
                const error = await response.json();
                this.showAlert('analyticsError', error.error || 'Failed to save analytics settings');
            }
        } catch (error) {
            console.error('Save analytics settings error:', error);
            this.showAlert('analyticsError', 'Failed to save analytics settings');
        }
    }

    async loadWebsiteSettings() {
        try {
            const response = await fetch('/api/admin/website-settings');
            if (response.ok) {
                const settings = await response.json();
                document.getElementById('siteTitle').value = settings.site_title || '';
                document.getElementById('siteDescription').value = settings.site_description || '';
                document.getElementById('contactEmail').value = settings.contact_email || '';
                document.getElementById('contactPhone').value = settings.contact_phone || '';
                document.getElementById('businessAddress').value = settings.business_address || '';
                document.getElementById('maintenanceMode').checked = settings.maintenance_mode || false;
            }
        } catch (error) {
            console.error('Failed to load website settings:', error);
        }
    }

    async saveWebsiteSettings() {
        try {
            const settings = {
                site_title: document.getElementById('siteTitle').value,
                site_description: document.getElementById('siteDescription').value,
                contact_email: document.getElementById('contactEmail').value,
                contact_phone: document.getElementById('contactPhone').value,
                business_address: document.getElementById('businessAddress').value,
                maintenance_mode: document.getElementById('maintenanceMode').checked,
                social_media: {},
                seo_settings: {}
            };

            const response = await fetch('/api/admin/website-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                this.showAlert('websiteSuccess', 'Website settings saved successfully!');
            } else {
                const error = await response.json();
                this.showAlert('websiteError', error.error || 'Failed to save website settings');
            }
        } catch (error) {
            console.error('Save website settings error:', error);
            this.showAlert('websiteError', 'Failed to save website settings');
        }
    }

    showAlert(elementId, message) {
        const alertElement = document.getElementById(elementId);
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        
        // Hide alert after 5 seconds
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Reload dashboard data when dashboard is shown
    if (sectionName === 'dashboard' && window.adminPanel) {
        window.adminPanel.loadDashboardData();
    }
}

// Export functions
async function exportData(type) {
    try {
        const dateFrom = document.getElementById('exportDateFrom').value;
        const dateTo = document.getElementById('exportDateTo').value;
        
        let url = `/api/admin/export/${type}?format=csv`;
        if (dateFrom) url += `&date_from=${dateFrom}`;
        if (dateTo) url += `&date_to=${dateTo}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } else {
            alert('Failed to export data. Please try again.');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export data. Please try again.');
    }
}

// Initialize admin panel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Auto-refresh dashboard every 30 seconds
setInterval(() => {
    if (document.getElementById('dashboard').classList.contains('active') && window.adminPanel) {
        window.adminPanel.loadDashboardData();
    }
}, 30000);

// Set default date range for exports (last 30 days)
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Set date inputs if they exist
    const startDateInput = document.getElementById('exportStartDate');
    const endDateInput = document.getElementById('exportEndDate');
    
    if (startDateInput) {
        startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
    }
    if (endDateInput) {
        endDateInput.value = today.toISOString().split('T')[0];
    }
});

// Firebase Auth-aware fetch wrapper for admin panel
(function() {
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override the global fetch function
    window.fetch = async function(url, options = {}) {
        // Only intercept /api requests
        if (typeof url === 'string' && url.startsWith('/api')) {
            try {
                // Check if Firebase is available and user is signed in
                if (window.FIREBASE_CONFIG && typeof window.firebase !== 'undefined') {
                    // Dynamically load Firebase SDKs if not already loaded
                    if (!window.firebase.apps.length) {
                        // Load Firebase Auth SDK
                        if (!document.querySelector('script[src*="firebase-auth"]')) {
                            await new Promise((resolve, reject) => {
                                const script = document.createElement('script');
                                script.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
                                script.type = 'module';
                                script.onload = resolve;
                                script.onerror = reject;
                                document.head.appendChild(script);
                            });
                        }
                        
                        // Initialize Firebase
                        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
                        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js');
                        
                        const app = initializeApp(window.FIREBASE_CONFIG);
                        const auth = getAuth(app);
                        
                        // Wait for auth state and get ID token if user is signed in
                        const user = await new Promise((resolve) => {
                            const unsubscribe = onAuthStateChanged(auth, (user) => {
                                unsubscribe();
                                resolve(user);
                            });
                        });
                        
                        if (user) {
                            const idToken = await user.getIdToken();
                            
                            // Add Firebase ID token to Authorization header
                            options.headers = {
                                ...options.headers,
                                'Authorization': `Bearer ${idToken}`
                            };
                        }
                    }
                }
            } catch (error) {
                console.warn('Firebase Auth not available, falling back to cookie auth:', error);
                // Continue with original request if Firebase fails
            }
        }
        
        // Call the original fetch function
        return originalFetch.call(this, url, options);
    };
})();