// Hero Background Slideshow
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    if (slides.length > 0) {
        // Initialize first slide as active
        slides[currentSlide].classList.add('active');

        // Function to switch slides
        function nextSlide() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        // Auto-rotate every 3 seconds
        setInterval(nextSlide, 3000);
    }
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Moving service options with pricing
const movingOptions = {
    'premium-service': {
        name: 'Premium Service',
        rating: 4.8,
        baseRate: 1.2,
        features: ['White Glove Service', 'Premium Packing', 'Full Insurance'],
        specialty: 'Luxury Moving Experience'
    },
    'standard-service': {
        name: 'Standard Service',
        rating: 4.7,
        baseRate: 1.0,
        features: ['Professional Movers', 'Basic Insurance', 'Reliable Service'],
        specialty: 'Quality Moving Service'
    },
    'economy-service': {
        name: 'Economy Service',
        rating: 4.5,
        baseRate: 0.85,
        features: ['Budget Friendly', 'Basic Service', 'Licensed Movers'],
        specialty: 'Affordable Moving'
    },
    'full-service': {
        name: 'Full Service Package',
        rating: 4.6,
        baseRate: 1.15,
        features: ['Packing & Unpacking', 'Storage Options', 'Tracking'],
        specialty: 'Complete Moving Solution'
    },
    'express-service': {
        name: 'Express Service',
        rating: 4.4,
        baseRate: 1.3,
        features: ['Fast Delivery', 'Priority Handling', 'Expedited Service'],
        specialty: 'Quick Moving Service'
    }
};

// Distance calculator (simplified)
const cityCoordinates = {
    'new-york': { lat: 40.7128, lng: -74.0060 },
    'los-angeles': { lat: 34.0522, lng: -118.2437 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'houston': { lat: 29.7604, lng: -95.3698 },
    'phoenix': { lat: 33.4484, lng: -112.0740 },
    'philadelphia': { lat: 39.9526, lng: -75.1652 },
    'san-antonio': { lat: 29.4241, lng: -98.4936 },
    'san-diego': { lat: 32.7157, lng: -117.1611 },
    'dallas': { lat: 32.7767, lng: -96.7970 },
    'san-jose': { lat: 37.3382, lng: -121.8863 }
};

// Home size multipliers
const homeSizeMultipliers = {
    'studio': 0.5,
    '1-bedroom': 0.7,
    '2-bedroom': 0.7,
    '3-bedroom': 1.4,
    '4-bedroom': 1.8,
    'house': 2.2
};

// Additional services pricing
const additionalServices = {
    'packing': 300,
    'storage': 150,
    'insurance': 100
};

// Calculate distance between two cities (simplified)
function calculateDistance(city1, city2) {
    if (!cityCoordinates[city1] || !cityCoordinates[city2]) {
        return 500; // Default distance
    }
    
    const coord1 = cityCoordinates[city1];
    const coord2 = cityCoordinates[city2];
    
    const R = 3959; // Earth's radius in miles
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance);
}

// Calculate base price
function calculateBasePrice(distance, homeSize) {
    const basePricePerMile = 2.5;
    const homeSizeMultiplier = homeSizeMultipliers[homeSize] || 1.0;
    
    let basePrice = distance * basePricePerMile * homeSizeMultiplier;
    
    // Minimum price
    if (basePrice < 500) basePrice = 500;
    
    return Math.round(basePrice);
}

// Generate quotes
function generateQuotes(formData) {
    const distance = calculateDistance(formData.fromCity, formData.toCity);
    const basePrice = calculateBasePrice(distance, formData.homeSize);
    
    // Calculate additional services cost
    let additionalCost = 0;
    formData.services.forEach(service => {
        if (additionalServices[service]) {
            additionalCost += additionalServices[service];
        }
    });
    
    const quotes = [];
    
    // Generate quotes for each service option
    Object.keys(movingOptions).forEach(serviceKey => {
        const service = movingOptions[serviceKey];
        const servicePrice = Math.round(basePrice * service.baseRate) + additionalCost;
        
        // Add some randomness to make it more realistic
        const variation = Math.random() * 0.2 - 0.1; // ±10%
        const finalPrice = Math.round(servicePrice * (1 + variation));
        
        quotes.push({
            serviceName: service.name,
            price: finalPrice,
            rating: service.rating,
            features: service.features,
            specialty: service.specialty,
            distance: distance,
            estimatedDays: Math.ceil(distance / 500) + 1,
            serviceId: serviceKey
        });
    });
    
    // Sort by price
    quotes.sort((a, b) => a.price - b.price);
    
    return quotes;
}

// Display quotes
function displayQuotes(quotes) {
    const quotesResults = document.getElementById('quotesResults');
    const quotesList = document.getElementById('quotesList');
    
    if (!quotesResults || !quotesList) return;
    
    // Add contact confirmation message
    const email = document.getElementById('email')?.value;
    const phone = document.getElementById('phone')?.value;
    
    quotesList.innerHTML = `
        <div class="contact-confirmation">
            <div class="confirmation-icon">✅</div>
            <div class="confirmation-text">
                <h4>Contact Information Received</h4>
                <p>We'll send quotes to <strong>${email}</strong> and contact you at <strong>${phone}</strong></p>
            </div>
        </div>
    `;
    
    quotes.forEach((quote, index) => {
        const quoteCard = document.createElement('div');
        quoteCard.className = 'quote-card';
        
        const stars = '★'.repeat(Math.floor(quote.rating)) + (quote.rating % 1 >= 0.5 ? '☆' : '');
        
        quoteCard.innerHTML = `
            <div class="quote-header">
                <div>
                    <div class="company-name">${quote.serviceName}</div>
                    <div class="company-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-text">${quote.rating}/5</span>
                    </div>
                </div>
                <div class="quote-price">$${quote.price.toLocaleString()}</div>
            </div>
            <div class="quote-details">
                ${quote.specialty} • ${quote.distance} miles • ${quote.estimatedDays} days estimated
            </div>
            <div class="quote-features">
                ${quote.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
            </div>
            <button class="btn btn-primary" onclick="selectQuote('${quote.serviceName}', ${quote.price}, '${quote.serviceId}')">
                ${index === 0 ? 'Best Deal - ' : ''}Get This Quote
            </button>
        `;
        
        quotesList.appendChild(quoteCard);
    });
    
    quotesResults.style.display = 'block';
    quotesResults.scrollIntoView({ behavior: 'smooth' });
}

// Handle quote selection
function selectQuote(serviceName, price, serviceId) {
    // Store selected quote data
    window.selectedQuote = {
        service: serviceName,
        price: price,
        serviceId: serviceId
    };
    
    // Show contact form modal
    showContactModal(serviceName, price);
}

// Show contact form modal
function showContactModal(serviceName, price) {
    // Create modal HTML
    const modalHTML = `
        <div id="contactModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Get Your ${serviceName} Quote</h3>
                    <span class="modal-close" onclick="closeContactModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="quote-summary">
                        <p><strong>Selected Service:</strong> ${serviceName}</p>
                        <p><strong>Estimated Cost:</strong> $${price.toLocaleString()}</p>
                        <p class="note">Final price will be confirmed after we review your specific requirements.</p>
                    </div>
                    <form id="leadCaptureForm" class="lead-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">First Name *</label>
                                <input type="text" id="firstName" name="firstName" required>
                            </div>
                            <div class="form-group">
                                <label for="lastName">Last Name *</label>
                                <input type="text" id="lastName" name="lastName" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="email">Email Address *</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number *</label>
                                <input type="tel" id="phone" name="phone" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="preferredContact">Preferred Contact Method</label>
                            <select id="preferredContact" name="preferredContact">
                                <option value="phone">Phone Call</option>
                                <option value="email">Email</option>
                                <option value="text">Text Message</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="bestTime">Best Time to Contact</label>
                            <select id="bestTime" name="bestTime">
                                <option value="morning">Morning (9 AM - 12 PM)</option>
                                <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                                <option value="evening">Evening (5 PM - 8 PM)</option>
                                <option value="anytime">Anytime</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="additionalInfo">Additional Information (Optional)</label>
                            <textarea id="additionalInfo" name="additionalInfo" rows="3" placeholder="Any special requirements, questions, or details about your move..."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-large">Get My Quote</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listener for form submission
    document.getElementById('leadCaptureForm').addEventListener('submit', handleLeadSubmission);
}

// Close contact modal
function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.remove();
    }
}

// Handle lead form submission
async function handleLeadSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const leadData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        preferredContact: formData.get('preferredContact'),
        bestTime: formData.get('bestTime'),
        additionalInfo: formData.get('additionalInfo'),
        selectedService: window.selectedQuote.service,
        estimatedPrice: window.selectedQuote.price,
        serviceId: window.selectedQuote.serviceId,
        timestamp: new Date().toISOString()
    };
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.innerHTML = '<span class="loading"></span> Submitting...';
    submitButton.disabled = true;
    
    try {
        // Send lead data to API
        const response = await fetch('http://localhost:4001/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leadData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit lead');
        }
        
        const result = await response.json();
        
        if (result.ok) {
            // Show success message
            alert(`Thank you ${leadData.firstName}! We've received your request for ${leadData.selectedService}. Our team will contact you via ${leadData.preferredContact} within 2 hours to provide your personalized quote and discuss your moving needs.`);
            
            // Close modal
            closeContactModal();
        } else {
            throw new Error('Server returned error');
        }
        
    } catch (error) {
        console.error('Error submitting lead:', error);
        
        // Show error message but still close modal
        alert(`Thank you ${leadData.firstName}! We've received your request. If you don't hear from us within 2 hours, please call us directly.`);
        closeContactModal();
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Calculate moving cost using API
async function calculateCost() {
    const fromCity = document.getElementById('fromCity').value;
    const toCity = document.getElementById('toCity').value;
    const homeSize = document.getElementById('homeSize').value;
    const moveDate = document.getElementById('moveDate').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    
    // Validate all required fields
    if (!fromCity || !toCity || !homeSize || !moveDate) {
        alert('Please fill in all moving details');
        return;
    }
    
    if (!email || !phone || !address) {
        alert('Please provide your contact information to receive quotes');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\(\)\-\+]{10,}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        alert('Please enter a valid phone number');
        return;
    }
    
    // Show loading state
    const resultsDiv = document.getElementById('quotesResults');
    if (resultsDiv) {
        resultsDiv.innerHTML = '<div class="loading-quotes"><div class="loading-spinner"></div><p>Getting your personalized quotes...</p></div>';
        resultsDiv.style.display = 'block';
    }
    
    try {
        // Calculate distance (simplified)
        const distance = calculateDistance(fromCity, toCity);
        
        // Call API to get quotes
        const response = await fetch('http://localhost:4001/api/quotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pickup: fromCity,
                dropoff: toCity,
                distance_miles: distance,
                size: homeSize,
                contact: {
                    email: email,
                    phone: phone,
                    address: address
                },
                extras: {
                    packing: document.getElementById('packing')?.checked || false,
                    storage: document.getElementById('storage')?.checked || false,
                    insurance: document.getElementById('insurance')?.checked || false
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get quotes');
        }
        
        const data = await response.json();
        
        if (data.ok && data.quotes) {
            displayQuotes(data.quotes);
        } else {
            throw new Error('Invalid response from server');
        }
        
    } catch (error) {
        console.error('Error getting quotes:', error);
        // Fallback to local calculation
        const formData = {
            fromCity: fromCity,
            toCity: toCity,
            homeSize: homeSize,
            moveDate: moveDate,
            contact: {
                email: email,
                phone: phone,
                address: address
            },
            services: []
        };
        
        // Get selected services for fallback
        const serviceCheckboxes = ['packing', 'storage', 'insurance'];
        serviceCheckboxes.forEach(service => {
            const checkbox = document.getElementById(service);
            if (checkbox && checkbox.checked) {
                formData.services.push(service);
            }
        });
        
        const quotes = generateQuotes(formData);
        displayQuotes(quotes);
    }
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const movingForm = document.getElementById('movingForm');
    
    if (movingForm) {
        movingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                fromCity: document.getElementById('fromCity').value,
                toCity: document.getElementById('toCity').value,
                homeSize: document.getElementById('homeSize').value,
                moveDate: document.getElementById('moveDate').value,
                services: []
            };
            
            // Get selected services
            const serviceCheckboxes = ['packing', 'storage', 'insurance'];
            serviceCheckboxes.forEach(service => {
                const checkbox = document.getElementById(service);
                if (checkbox && checkbox.checked) {
                    formData.services.push(service);
                }
            });
            
            // Validate form
            if (!formData.fromCity || !formData.toCity || !formData.homeSize || !formData.moveDate) {
                alert('Please fill in all required fields.');
                return;
            }
            
            if (formData.fromCity === formData.toCity) {
                alert('Origin and destination cities must be different.');
                return;
            }
            
            // Show loading state
            const submitButton = movingForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.innerHTML = '<span class="loading"></span> Calculating Quotes...';
            submitButton.disabled = true;
            
            // Call the new calculateCost function
            calculateCost().finally(() => {
                // Reset button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }
    
    // Contact form handler
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                alert('Thank you for your message! We\'ll get back to you within 24 hours.');
                contactForm.reset();
                
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1500);
        });
    }
    
    // Set minimum date to today
    const moveDate = document.getElementById('moveDate');
    if (moveDate) {
        const today = new Date().toISOString().split('T')[0];
        moveDate.min = today;
    }
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = '#ffffff';
            header.style.backdropFilter = 'none';
        }
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.service-card, .company-card, .calculator-container');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add mobile menu styles dynamically
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    }
`;
document.head.appendChild(style);

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click effect to cards
    const cards = document.querySelectorAll('.service-card, .company-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
});

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Add real-time form validation
document.addEventListener('DOMContentLoaded', function() {
    const formInputs = document.querySelectorAll('input, select');
    
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value) {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#e5e7eb';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#3b82f6';
        });
    });
    
    // Initialize additional features
    initializeNewsletter();
    initializeNotifications();
});

// Newsletter functionality
function initializeNewsletter() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
}

async function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    const nameField = document.getElementById('newsletterName');
    const name = nameField ? nameField.value : '';
    
    if (!email || !isValidEmail(email)) {
        showNewsletterMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // Show loading message
    showNewsletterMessage('Subscribing...', 'loading');
    
    try {
        const response = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.trim(),
                name: name.trim()
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showNewsletterMessage('Successfully subscribed! Thank you.', 'success');
            document.getElementById('newsletterEmail').value = '';
            if (nameField) nameField.value = '';
            
            // Track subscription event for analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'newsletter_subscribe', {
                    'event_category': 'engagement',
                    'event_label': 'newsletter'
                });
            }
        } else {
            if (response.status === 409) {
                showNewsletterMessage('You are already subscribed!', 'error');
            } else {
                showNewsletterMessage(data.error || 'Subscription failed. Please try again.', 'error');
            }
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        showNewsletterMessage('Network error. Please check your connection and try again.', 'error');
    }
}

function showNewsletterMessage(message, type) {
    const messageDiv = document.getElementById('newsletterMessage');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = 'newsletter-message ' + type;
    
    // Auto-hide success and error messages after 5 seconds
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'newsletter-message';
        }, 5000);
    }
    
    // For loading state, add a spinner if available
    if (type === 'loading') {
        messageDiv.innerHTML = '<span class="spinner"></span> ' + message;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification System
function initializeNotifications() {
    createNotificationContainer();
    // Show welcome notification after 3 seconds
    setTimeout(() => {
        showNotification('Welcome to Lugvia! Get your free moving quote today.', 'info', 5000);
    }, 3000);
}

function createNotificationContainer() {
    if (!document.getElementById('notificationContainer')) {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
}

function showNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="closeNotification(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => closeNotification(notification.querySelector('.notification-close')), duration);
    }
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.classList.add('hide');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Authentication and Referral System
let currentUser = null;
let userReferralCode = null;

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    initializeUserMenu();
});

async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const userData = await response.json();
            currentUser = userData.user;
            userReferralCode = userData.user.referral_code;
            updateUIForLoggedInUser(userData.user);
        } else {
            updateUIForGuest();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        updateUIForGuest();
    }
}

function updateUIForLoggedInUser(user) {
    const guestMenu = document.getElementById('guestMenu');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    
    if (guestMenu) guestMenu.style.display = 'none';
    if (userMenu) userMenu.style.display = 'block';
    if (userName) userName.textContent = user.first_name || 'User';
    
    // Add referral tracking to forms
    addReferralTrackingToForms();
}

function updateUIForGuest() {
    const guestMenu = document.getElementById('guestMenu');
    const userMenu = document.getElementById('userMenu');
    
    if (guestMenu) guestMenu.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
}

function initializeUserMenu() {
    const userBtn = document.getElementById('userBtn');
    const dropdown = document.querySelector('.user-dropdown');
    
    if (userBtn && dropdown) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdown.classList.remove('active');
        });
    }
}

function showRegisterForm(event) {
    event.preventDefault();
    window.location.href = '/login?register=true';
}

async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            currentUser = null;
            userReferralCode = null;
            updateUIForGuest();
            showNotification('Logged out successfully', 'success');
            
            // Redirect to home if on dashboard
            if (window.location.pathname.includes('dashboard')) {
                window.location.href = '/';
            }
        }
    } catch (error) {
        console.error('Logout failed:', error);
        showNotification('Logout failed', 'error');
    }
}

async function copyReferralLink() {
    if (!userReferralCode) {
        showNotification('Please log in to get your referral link', 'error');
        return;
    }
    
    const referralLink = `${window.location.origin}/login?ref=${userReferralCode}`;
    
    try {
        await navigator.clipboard.writeText(referralLink);
        showNotification('Referral link copied to clipboard!', 'success');
        
        // Track referral link generation
        fetch('/api/auth/referral-link-generated', {
            method: 'POST',
            credentials: 'include'
        }).catch(err => console.error('Failed to track referral link generation:', err));
        
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Referral link copied to clipboard!', 'success');
    }
}

function addReferralTrackingToForms() {
    // Add referral tracking to quote and ticket forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.id === 'quoteForm' || form.id === 'ticketForm' || form.classList.contains('contact-form')) {
            // Add hidden input for user tracking
            let userIdInput = form.querySelector('input[name="user_id"]');
            if (!userIdInput && currentUser) {
                userIdInput = document.createElement('input');
                userIdInput.type = 'hidden';
                userIdInput.name = 'user_id';
                userIdInput.value = currentUser.id;
                form.appendChild(userIdInput);
            }
        }
    });
}

// Track referral clicks
function trackReferralClick(referralCode) {
    if (referralCode) {
        fetch('/api/auth/track-referral-click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ referral_code: referralCode })
        }).catch(err => console.error('Failed to track referral click:', err));
    }
}

// Check for referral code in URL on page load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode) {
        trackReferralClick(referralCode);
        
        // Store referral code in session storage for later use
        sessionStorage.setItem('referralCode', referralCode);
        
        // Show referral notification
        showNotification('🎉 You\'ve been referred! Sign up to help your friend earn rewards.', 'info', 8000);
    }
});

// Enhanced form submission with referral tracking
function enhanceFormWithReferral(form) {
    const originalSubmit = form.onsubmit;
    
    form.onsubmit = function(e) {
        // Add referral code if available
        const referralCode = sessionStorage.getItem('referralCode');
        if (referralCode && !currentUser) {
            let referralInput = form.querySelector('input[name="referral_code"]');
            if (!referralInput) {
                referralInput = document.createElement('input');
                referralInput.type = 'hidden';
                referralInput.name = 'referral_code';
                referralInput.value = referralCode;
                form.appendChild(referralInput);
            }
        }
        
        // Call original submit handler if it exists
        if (originalSubmit) {
            return originalSubmit.call(this, e);
        }
    };
}

// Apply referral enhancement to relevant forms
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.id === 'quoteForm' || form.id === 'ticketForm' || form.classList.contains('contact-form')) {
            enhanceFormWithReferral(form);
        }
    });
});

// Firebase Web App Config (public)
// Note: This config is public and enables Firebase initialization for ID token usage.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAryw0NphsWNa2tHzhvGk8XRbcqmpQ0xuM",
  authDomain: "lugvia-61bf1.firebaseapp.com",
  databaseURL: "https://lugvia-61bf1-default-rtdb.firebaseio.com",
  projectId: "lugvia-61bf1",
  storageBucket: "lugvia-61bf1.firebasestorage.app",
  messagingSenderId: "222766334803",
  appId: "1:222766334803:web:9f45cc48dc67de0c2857a6",
  measurementId: "G-2SCD27K2XH"
};

// Firebase Auth-aware fetch wrapper
(function() {
  const API_PREFIXES = ['/api', 'http://localhost:4001/api'];
  const originalFetch = window.fetch.bind(window);

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function ensureFirebaseInitialized() {
    try {
      if (window.firebaseAuth) return true;
      if (!window.FIREBASE_CONFIG) return false; // No config provided yet
      if (!window.firebase || !window.firebase.initializeApp) {
        // Load Firebase SDK (compat builds for non-module usage)
        await loadScript('https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/9.6.11/firebase-auth-compat.js');
      }
      if (!window.firebaseApp) {
        window.firebaseApp = window.firebase.initializeApp(window.FIREBASE_CONFIG);
        window.firebaseAuth = window.firebase.auth();
      }
      return true;
    } catch (e) {
      console.warn('Firebase initialization error:', e);
      return false;
    }
  }

  async function getIdToken() {
    try {
      const ok = await ensureFirebaseInitialized();
      if (!ok) return null;
      const user = window.firebaseAuth?.currentUser;
      if (!user) return null;
      return await user.getIdToken();
    } catch (e) {
      console.warn('Failed to get Firebase ID token:', e);
      return null;
    }
  }

  window.fetch = async function(input, init = {}) {
    const url = typeof input === 'string' ? input : input.url;
    const isApi = typeof url === 'string' && API_PREFIXES.some(prefix => url.startsWith(prefix));
    if (!isApi) {
      return originalFetch(input, init);
    }

    const headers = new Headers(init && init.headers ? init.headers : {});
    const token = await getIdToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const newInit = { ...init, headers };
    if (newInit.credentials == null) newInit.credentials = 'include';

    return originalFetch(input, newInit);
  };
})();