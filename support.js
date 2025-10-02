// Support Ticket System JavaScript

// DOM Elements
const ticketForm = document.getElementById('ticketForm');
const ticketSuccess = document.getElementById('ticketSuccess');
const ticketIdElement = document.getElementById('ticketId');

// Form validation patterns
const validationPatterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[1-9][\d]{0,2}[\s\-\.]?[\(]?[\d]{1,3}[\)]?[\s\-\.]?[\d]{1,4}[\s\-\.]?[\d]{1,4}$/
};

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupFormValidation();
    setupMobileMenu();
});

function initializeForm() {
    // Add event listeners
    ticketForm.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const inputs = ticketForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function setupFormValidation() {
    // Custom validation messages
    const requiredFields = ticketForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('invalid', function(e) {
            e.preventDefault();
            showFieldError(field, getValidationMessage(field));
        });
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Clear previous errors
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, `${getFieldLabel(field)} is required`);
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value && !validationPatterns.email.test(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    // Phone validation (optional field)
    if (field.type === 'tel' && value && !validationPatterns.phone.test(value)) {
        showFieldError(field, 'Please enter a valid phone number');
        return false;
    }
    
    // Text length validation
    if (field.name === 'ticketDescription' && value.length < 10) {
        showFieldError(field, 'Please provide more details (minimum 10 characters)');
        return false;
    }
    
    return true;
}

function showFieldError(field, message) {
    // Remove existing error
    clearFieldError(field);
    
    // Add error styling
    field.style.borderColor = '#ef4444';
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        font-weight: 500;
    `;
    
    // Insert error message
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    // Reset border color
    field.style.borderColor = '';
    
    // Remove error message
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function getFieldLabel(field) {
    const label = field.parentNode.querySelector('label');
    return label ? label.textContent.replace('*', '').trim() : field.name;
}

function getValidationMessage(field) {
    switch (field.name) {
        case 'customerName':
            return 'Please enter your full name';
        case 'customerEmail':
            return 'Please enter a valid email address';
        case 'ticketSubject':
            return 'Please enter a subject for your ticket';
        case 'ticketPriority':
            return 'Please select a priority level';
        case 'ticketCategory':
            return 'Please select a category';
        case 'ticketDescription':
            return 'Please provide a detailed description';
        default:
            return 'This field is required';
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    const isValid = validateForm();
    if (!isValid) {
        showNotification('Please correct the errors in the form', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = ticketForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    
    try {
        // Collect form data
        const formData = new FormData(ticketForm);
        const ticketData = {
            customerName: formData.get('customerName'),
            customerEmail: formData.get('customerEmail'),
            ticketSubject: formData.get('ticketSubject'),
            ticketPriority: formData.get('ticketPriority'),
            ticketCategory: formData.get('ticketCategory'),
            ticketDescription: formData.get('ticketDescription'),
            phoneNumber: formData.get('phoneNumber') || null,
            createdAt: new Date().toISOString(),
            status: 'open'
        };
        
        // Submit ticket
        const response = await submitTicket(ticketData);
        
        if (response.success) {
            // Show success message
            showTicketSuccess(response.ticketId);
            
            // Reset form
            ticketForm.reset();
            
            // Send confirmation email
            sendConfirmationEmail(response.ticketId);
            
            // Track analytics
            trackTicketSubmission(response.ticketId, ticketData.ticketCategory);
        } else {
            throw new Error(response.message || 'Failed to submit ticket');
        }
        
    } catch (error) {
        console.error('Error submitting ticket:', error);
        showNotification('Failed to submit ticket. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    }
}

function validateForm() {
    const inputs = ticketForm.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

async function submitTicket(ticketData) {
    try {
        const response = await fetch('/api/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticketData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        // Fallback: Store in localStorage for now
        console.warn('API not available, storing ticket locally:', error);
        return storeTicketLocally(ticketData);
    }
}

function storeTicketLocally(ticketData) {
    try {
        // Generate ticket ID
        const ticketId = 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        // Get existing tickets
        const existingTickets = JSON.parse(localStorage.getItem('lugvia_tickets') || '[]');
        
        // Add new ticket
        const ticket = {
            ...ticketData,
            id: ticketId,
            createdAt: new Date().toISOString()
        };
        
        existingTickets.push(ticket);
        
        // Store updated tickets
        localStorage.setItem('lugvia_tickets', JSON.stringify(existingTickets));
        
        return {
            success: true,
            ticketId: ticketId,
            message: 'Ticket stored locally'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to store ticket'
        };
    }
}

function showTicketSuccess(ticketId) {
    // Hide form
    ticketForm.style.display = 'none';
    
    // Update ticket ID
    ticketIdElement.textContent = ticketId;
    
    // Show success message
    ticketSuccess.style.display = 'block';
    
    // Scroll to success message
    ticketSuccess.scrollIntoView({ behavior: 'smooth' });
    
    // Send confirmation email (if API is available)
    sendConfirmationEmail(ticketId);
}

function resetTicketForm() {
    // Hide success message
    ticketSuccess.style.display = 'none';
    
    // Show form
    ticketForm.style.display = 'flex';
    
    // Clear form
    ticketForm.reset();
    
    // Clear any validation errors
    const errorElements = ticketForm.querySelectorAll('.field-error');
    errorElements.forEach(error => error.remove());
    
    // Reset field styles
    const inputs = ticketForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.style.borderColor = '';
    });
    
    // Scroll to form
    ticketForm.scrollIntoView({ behavior: 'smooth' });
}

async function sendConfirmationEmail(ticketId) {
    try {
        const response = await fetch('/api/tickets/confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticketId })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('Confirmation email sent successfully', 'success');
            }
        }
    } catch (error) {
        console.warn('Could not send confirmation email:', error);
        showNotification('Ticket submitted successfully, but confirmation email could not be sent', 'warning');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 500;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function trackTicketSubmission(ticketId, category) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'ticket_submitted', {
            'ticket_id': ticketId,
            'category': category
        });
    }
    
    console.log('Ticket submitted:', { ticketId, category });
}

function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export functions for global access
window.resetTicketForm = resetTicketForm;