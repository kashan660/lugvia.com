// WhatsApp Floating Widget
class WhatsAppWidget {
    constructor() {
        this.whatsappNumber = '';
        this.isEnabled = false;
        this.defaultMessage = 'Hello! I\'m interested in your moving services.';
        this.init();
    }

    async init() {
        await this.loadSettings();
        if (this.isEnabled && this.whatsappNumber) {
            this.createWidget();
            this.addEventListeners();
        }
    }

    async loadSettings() {
        // Use fallback configuration as primary (API requires authentication)
        // TODO: Replace with your actual WhatsApp Business number (include country code)
        // Example: '+1234567890' for US number or '+447123456789' for UK number
        this.whatsappNumber = '+15551234567'; // CHANGE THIS TO YOUR WHATSAPP NUMBER
        this.isEnabled = true;
        this.defaultMessage = 'Hello! I\'m interested in your moving services. Can you help me?';
        
        // Optionally try to load from API (but don't depend on it)
        try {
            const response = await fetch('/api/admin/whatsapp-settings');
            if (response.ok) {
                const data = await response.json();
                
                // Only override if API has valid settings
                if (data.whatsapp_number && data.is_enabled) {
                    this.whatsappNumber = data.whatsapp_number;
                    this.isEnabled = data.is_enabled;
                    this.defaultMessage = data.default_message || this.defaultMessage;
                }
            }
        } catch (error) {
            // Silently fall back to default configuration
        }
    }

    createWidget() {
        // Remove existing widget if it exists
        const existingWidget = document.getElementById('whatsapp-widget');
        if (existingWidget) {
            existingWidget.remove();
        }
        
        // Create widget container
        const widget = document.createElement('div');
        widget.id = 'whatsapp-widget';
        widget.className = 'whatsapp-widget';
        
        widget.innerHTML = `
            <div class="whatsapp-button" id="whatsapp-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" fill="currentColor"/>
                </svg>
                <span class="whatsapp-text">Chat with us</span>
            </div>
            <div class="whatsapp-tooltip" id="whatsapp-tooltip">
                Need help? Click to chat with us on WhatsApp!
            </div>
        `;

        // Add styles
        this.addStyles();
        
        // Append to body
        document.body.appendChild(widget);
    }

    addStyles() {
        if (document.getElementById('whatsapp-widget-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'whatsapp-widget-styles';
        styles.textContent = `
            .whatsapp-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 99999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .whatsapp-button {
                background: #25D366;
                color: white;
                border-radius: 50px;
                padding: 12px 20px;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
                transition: all 0.3s ease;
                text-decoration: none;
                border: none;
                font-size: 14px;
                font-weight: 500;
                max-width: 200px;
                animation: pulse 2s infinite;
            }

            .whatsapp-button:hover {
                background: #128C7E;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(37, 211, 102, 0.6);
            }

            .whatsapp-button svg {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            }

            .whatsapp-text {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .whatsapp-tooltip {
                position: absolute;
                bottom: 100%;
                right: 0;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transform: translateY(10px);
                transition: all 0.3s ease;
                margin-bottom: 8px;
            }

            .whatsapp-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                right: 20px;
                border: 5px solid transparent;
                border-top-color: #333;
            }

            .whatsapp-widget:hover .whatsapp-tooltip {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            @keyframes pulse {
                0% {
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
                }
                50% {
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.6), 0 0 0 10px rgba(37, 211, 102, 0.1);
                }
                100% {
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
                }
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .whatsapp-widget {
                    bottom: 15px;
                    right: 15px;
                }
                
                .whatsapp-button {
                    padding: 10px 16px;
                    font-size: 13px;
                }
                
                .whatsapp-text {
                    display: none;
                }
                
                .whatsapp-button {
                    border-radius: 50%;
                    padding: 12px;
                }
            }

            /* Accessibility */
            .whatsapp-button:focus {
                outline: 2px solid #fff;
                outline-offset: 2px;
            }

            /* Reduced motion for users who prefer it */
            @media (prefers-reduced-motion: reduce) {
                .whatsapp-button {
                    animation: none;
                }
                
                .whatsapp-button,
                .whatsapp-tooltip {
                    transition: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    addEventListeners() {
        const button = document.getElementById('whatsapp-button');
        if (button) {
            button.addEventListener('click', () => this.openWhatsApp());
            
            // Add keyboard support for accessibility
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openWhatsApp();
                }
            });
            
            // Make button focusable
            button.setAttribute('tabindex', '0');
            button.setAttribute('role', 'button');
            button.setAttribute('aria-label', 'Open WhatsApp chat');
        }
    }

    openWhatsApp() {
        const encodedMessage = encodeURIComponent(this.defaultMessage);
        const whatsappUrl = `https://wa.me/${this.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    // Public methods for dynamic control
    show() {
        const widget = document.getElementById('whatsapp-widget');
        if (widget) {
            widget.style.display = 'block';
        }
    }

    hide() {
        const widget = document.getElementById('whatsapp-widget');
        if (widget) {
            widget.style.display = 'none';
        }
    }

    updateNumber(newNumber) {
        this.whatsappNumber = newNumber;
    }

    updateMessage(newMessage) {
        this.defaultMessage = newMessage;
    }

    destroy() {
        const widget = document.getElementById('whatsapp-widget');
        const styles = document.getElementById('whatsapp-widget-styles');
        
        if (widget) widget.remove();
        if (styles) styles.remove();
    }
}

// Initialize the widget when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.whatsappWidget = new WhatsAppWidget();
    });
} else {
    window.whatsappWidget = new WhatsAppWidget();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WhatsAppWidget;
}