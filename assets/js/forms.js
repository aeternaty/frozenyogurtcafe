// Forms JavaScript - Handle all form functionality
// Contact Form, job application form, and newsletter signup

// Store reCAPTCHA widget IDs globally
window.recaptchaWidgets = {
    contact: null,
    careers: null
};

// Initialize reCAPTCHA when ready
window.initializeRecaptcha = function() {
    console.log('🔑 Initializing reCAPTCHA...');
    
    // Initialize contact form reCAPTCHA
    const contactElement = document.getElementById('contact-recaptcha');
    if (contactElement && !contactElement.hasChildNodes()) {
        try {
            window.recaptchaWidgets.contact = grecaptcha.render('contact-recaptcha', {
                'sitekey': '6Lfqu7wrAAAAALeL2VSbkNnZ7z7tE1NfJ2ccRvIx'
            });
            console.log('✅ Contact reCAPTCHA initialized');
        } catch (e) {
            console.error('Contact reCAPTCHA error:', e);
        }
    }
    
    // Initialize careers form reCAPTCHA
    const careersElement = document.getElementById('careers-recaptcha');
    if (careersElement && !careersElement.hasChildNodes()) {
        try {
            window.recaptchaWidgets.careers = grecaptcha.render('careers-recaptcha', {
                'sitekey': '6Lfqu7wrAAAAALeL2VSbkNnZ7z7tE1NfJ2ccRvIx'
            });
            console.log('✅ Careers reCAPTCHA initialized');
        } catch (e) {
            console.error('Careers reCAPTCHA error:', e);
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeForms();
        // Try to initialize reCAPTCHA if already loaded
        if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
            window.initializeRecaptcha();
        }
    }, 2000);
});

function initializeForms() {
    console.log('📋 Initializing forms...');
    
    initializeContactForm();
    initializeJobApplicationForm();
    initializeNewsletterForm();
    initializeFormValidation();
    initializeCharacterCounters();
    
    console.log('✅ Forms initialized');
}

// Contact Form - Updated with real API call
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    console.log('📧 Contact Form found, setting up...');
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');
        
        // Validate form
        if (!validateContactForm(formData)) {
            return;
        }
        
        // Check if reCAPTCHA is completed
        let recaptchaResponse = null;
        try {
            if (window.recaptchaWidgets.contact !== null) {
                recaptchaResponse = grecaptcha.getResponse(window.recaptchaWidgets.contact);
            }
        } catch (e) {
            console.error('reCAPTCHA check error:', e);
        }
        
        if (!recaptchaResponse) {
            showErrorMessage(this, 'Please complete the reCAPTCHA verification.');
            return;
        }
        
        // Add reCAPTCHA token to form data
        formData.append('recaptcha_token', recaptchaResponse);
        
        try {
            showLoadingState(submitButton);
            
            // Real API call to Supabase function
            const response = await fetch('/supabase/functions/v1/contact-form', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit form');
            }
            
            // Show success message
            showSuccessMessage(this, result.message || 'Thank you for your message! We will get back to you soon.');
            
            // Reset form
            this.reset();
            updateCharacterCounter('message', 500);
            
            // Reset reCAPTCHA
            if (window.recaptchaWidgets.contact !== null) {
                grecaptcha.reset(window.recaptchaWidgets.contact);
            }
            
            // Track successful submission
            if (typeof trackEvent === 'function') {
                trackEvent('form_submit', 'contact', 'success');
            }
            
        } catch (error) {
            console.error('Contact Form error:', error);
            showErrorMessage(this, error.message || 'Something went wrong. Please try again later.');
            if (typeof trackEvent === 'function') {
                trackEvent('form_submit', 'contact', 'error');
            }
        } finally {
            restoreButtonState(submitButton);
        }
    });
}

// Job Application Form - Updated with real API call
function initializeJobApplicationForm() {
    const jobForm = document.getElementById('job-application-form');
    if (!jobForm) return;
    
    console.log('💼 Job application form found, setting up...');
    
    // Initialize consent checkbox functionality
    setTimeout(() => initializeConsentCheckbox(), 100);
    
    jobForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');
        
        // Validate form
        if (!validateJobApplicationForm(formData)) {
            return;
        }
        
        // Check if reCAPTCHA is completed
        let recaptchaResponse = null;
        try {
            if (window.recaptchaWidgets.careers !== null) {
                recaptchaResponse = grecaptcha.getResponse(window.recaptchaWidgets.careers);
            }
        } catch (e) {
            console.error('reCAPTCHA check error:', e);
        }
        
        if (!recaptchaResponse) {
            showErrorMessage(this, 'Please complete the reCAPTCHA verification.');
            return;
        }
        
        // Add reCAPTCHA token to form data
        formData.append('recaptcha_token', recaptchaResponse);
        
        try {
            showLoadingState(submitButton);
            
            // Real API call to Supabase function
            const response = await fetch('/supabase/functions/v1/career-form', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit application');
            }
            
            // Show success message
            showSuccessMessage(this, result.message || 'Thank you for your application! We will review it and contact you soon.');
            
            // Reset form
            this.reset();
            resetConsentCheckbox();
            
            // Reset reCAPTCHA
            if (window.recaptchaWidgets.careers !== null) {
                grecaptcha.reset(window.recaptchaWidgets.careers);
            }
            
            // Track successful submission
            if (typeof trackEvent === 'function') {
                trackEvent('form_submit', 'careers', 'success');
            }
            
        } catch (error) {
            console.error('Job application error:', error);
            showErrorMessage(this, error.message || 'Something went wrong. Please try again later.');
            if (typeof trackEvent === 'function') {
                trackEvent('form_submit', 'careers', 'error');
            }
        } finally {
            restoreButtonState(submitButton);
        }
    });
}

// Newsletter Form
function initializeNewsletterForm() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitButton = this.querySelector('button[type="submit"]');
            const email = emailInput.value.trim();
            
            if (!email || !isValidEmail(email)) {
                showNewsletterMessage(this, 'Please enter a valid email address.', 'error');
                return;
            }
            
            try {
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Subscribing...';
                submitButton.disabled = true;
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                submitButton.innerHTML = '<i class="ri-check-line mr-2"></i>Subscribed!';
                submitButton.classList.remove('bg-primary');
                submitButton.classList.add('bg-green-500');
                
                showNewsletterMessage(this, 'Thank you for subscribing! You\'ll receive updates about new flavors and special offers.', 'success');
                
                // Reset after delay
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.classList.remove('bg-green-500');
                    submitButton.classList.add('bg-primary');
                    submitButton.disabled = false;
                    emailInput.value = '';
                }, 3000);
                
                if (typeof trackEvent === 'function') {
                    trackEvent('newsletter_signup', 'engagement', email);
                }
                
            } catch (error) {
                console.error('Newsletter error:', error);
                showNewsletterMessage(this, 'Something went wrong. Please try again.', 'error');
                submitButton.disabled = false;
            }
        });
    });
}

// Form Validation
function initializeFormValidation() {
    // Real-time validation for all inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Character Counters
function initializeCharacterCounters() {
    const messageTextarea = document.getElementById('message');
    const messageChars = document.getElementById('message-chars');
    
    if (messageTextarea && messageChars) {
        messageTextarea.addEventListener('input', function() {
            updateCharacterCounter('message', 500);
        });
    }
    
    // Add character counters to other text areas if needed
    const textareas = document.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('maxlength'));
        if (maxLength && textarea.id !== 'message') {
            addCharacterCounter(textarea, maxLength);
        }
    });
}

// Consent Checkbox Functionality
function initializeConsentCheckbox() {
    const consentCheckbox = document.getElementById('consent-checkbox');
    const consentLabel = consentCheckbox?.closest('label');
    const consentText = consentLabel?.querySelector('span.ml-6');
    
    if (!consentCheckbox || !consentText) return;
    
    // Click handler for text
    consentText.style.cursor = 'pointer';
    consentText.addEventListener('click', function(e) {
        e.preventDefault();
        toggleConsent();
    });
    
    // Keyboard accessibility
    consentText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleConsent();
        }
    });
    
    // Make it focusable and accessible
    consentText.setAttribute('tabindex', '0');
    consentText.setAttribute('role', 'checkbox');
    consentText.setAttribute('aria-checked', 'false');
}

function toggleConsent() {
    const consentCheckbox = document.getElementById('consent-checkbox');
    const consentText = document.querySelector('label[for="consent-checkbox"] span.ml-6') || 
                      consentCheckbox?.closest('label')?.querySelector('span.ml-6');
    
    if (consentCheckbox) {
        consentCheckbox.checked = !consentCheckbox.checked;
        
        // Update visual state
        updateConsentVisual();
        
        // Update accessibility
        if (consentText) {
            consentText.setAttribute('aria-checked', consentCheckbox.checked);
        }
    }
}

function updateConsentVisual() {
    const consentCheckbox = document.getElementById('consent-checkbox');
    const checkmark = consentCheckbox?.parentElement.querySelector('.checkmark');
    
    if (checkmark && consentCheckbox) {
        if (consentCheckbox.checked) {
            checkmark.style.backgroundColor = '#FF8A3D';
            checkmark.style.borderColor = '#FF8A3D';
        } else {
            checkmark.style.backgroundColor = '#fff';
            checkmark.style.borderColor = '#ddd';
        }
    }
}

function resetConsentCheckbox() {
    const consentCheckbox = document.getElementById('consent-checkbox');
    if (consentCheckbox) {
        consentCheckbox.checked = false;
        updateConsentVisual();
    }
}

// Loading and Button State Functions
function showLoadingState(button) {
    if (!button) return;
    
    button.disabled = true;
    button.classList.add('opacity-50', 'cursor-not-allowed');
    
    // Store original content
    if (!button.dataset.originalText) {
        button.dataset.originalText = button.innerHTML;
    }
    
    // Show loading
    button.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Submitting...';
}

function restoreButtonState(button) {
    if (!button) return;
    
    setTimeout(() => {
        button.disabled = false;
        button.classList.remove('opacity-50', 'cursor-not-allowed');
        
        // Restore original text or set default based on form type
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        } else {
            const form = button.closest('form');
            if (form?.id === 'contact-form') {
                button.innerHTML = '<i class="ri-send-plane-line mr-2"></i>Send Message';
            } else if (form?.id === 'job-application-form') {
                button.innerHTML = '<i class="ri-send-plane-line mr-2"></i>Submit Application';
            }
        }
    }, 100);
}

// Validation Functions
function validateContactForm(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    const errors = [];
    
    if (!name || name.trim().length < 2) {
        errors.push('Please enter a valid name');
    }
    
    if (!email || !isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!subject || subject.trim().length < 3) {
        errors.push('Please enter a subject');
    }
    
    if (!message || message.trim().length < 10) {
        errors.push('Please enter a message (at least 10 characters)');
    }
    
    if (message && message.length > 500) {
        errors.push('Message cannot exceed 500 characters');
    }
    
    if (errors.length > 0) {
        const form = document.getElementById('contact-form');
        showErrorMessage(form, errors.join('. '));
        return false;
    }
    
    return true;
}

function validateJobApplicationForm(formData) {
    const name = formData.get('applicant-name');
    const age = formData.get('applicant-age');
    const email = formData.get('applicant-email');
    const phone = formData.get('applicant-phone');
    const location = formData.get('preferred-location');
    const position = formData.get('position-type');
    const availability = formData.get('availability');
    const whyJoin = formData.get('why-join');
    const terms = formData.get('terms');
    
    const errors = [];
    
    if (!name || name.trim().length < 2) {
        errors.push('Please enter a valid name');
    }
    
    if (!age || age < 16 || age > 99) {
        errors.push('Please enter a valid age (16-99)');
    }
    
    if (!email || !isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!phone || phone.trim().length < 10) {
        errors.push('Please enter a valid phone number');
    }
    
    if (!location) {
        errors.push('Please select a preferred location');
    }
    
    if (!position) {
        errors.push('Please select a position type');
    }
    
    if (!availability) {
        errors.push('Please select your availability');
    }
    
    if (!whyJoin || whyJoin.trim().length < 20) {
        errors.push('Please tell us why you want to join (at least 20 characters)');
    }
    
    if (!terms) {
        errors.push('Please accept the terms and conditions');
    }
    
    if (errors.length > 0) {
        const form = document.getElementById('job-application-form');
        showErrorMessage(form, errors.join('. '));
        return false;
    }
    
    return true;
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.required;
    
    clearFieldError(field);
    
    if (required && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    if (type === 'tel' && value && value.length < 10) {
        showFieldError(field, 'Please enter a valid phone number');
        return false;
    }
    
    if (field.hasAttribute('pattern') && value) {
        const pattern = new RegExp(field.getAttribute('pattern'));
        if (!pattern.test(value)) {
            showFieldError(field, 'Please enter a valid value');
            return false;
        }
    }
    
    if (field.hasAttribute('maxlength')) {
        const maxLength = parseInt(field.getAttribute('maxlength'));
        if (value.length > maxLength) {
            showFieldError(field, `Maximum ${maxLength} characters allowed`);
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#ef4444';
    field.style.backgroundColor = '#fef2f2';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-red-600 text-sm mt-1';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = '';
    field.style.backgroundColor = '';
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Character Counter Functions
function updateCharacterCounter(textareaId, maxLength) {
    const textarea = document.getElementById(textareaId);
    const counter = document.getElementById(`${textareaId}-chars`);
    
    if (textarea && counter) {
        const remaining = maxLength - textarea.value.length;
        counter.textContent = remaining;
        
        if (remaining < 50) {
            counter.style.color = '#ef4444';
        } else if (remaining < 100) {
            counter.style.color = '#f59e0b';
        } else {
            counter.style.color = '#6b7280';
        }
    }
}

function addCharacterCounter(textarea, maxLength) {
    const counter = document.createElement('div');
    counter.className = 'text-sm text-gray-500 mt-1';
    counter.id = `${textarea.id}-chars-counter`;
    counter.innerHTML = `Characters remaining: <span id="${textarea.id}-chars">${maxLength}</span>`;
    
    textarea.parentNode.appendChild(counter);
    
    textarea.addEventListener('input', function() {
        updateCharacterCounter(textarea.id, maxLength);
    });
}

// Message Display Functions
function showSuccessMessage(container, message) {
    // Remove existing messages
    const existingMessages = container.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    const successDiv = document.createElement('div');
    successDiv.className = 'form-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mt-4 animate-fade-in';
    successDiv.innerHTML = `
        <div class="flex items-center">
            <i class="ri-check-circle-line mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to the end of form
    container.appendChild(successDiv);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.classList.add('animate-fade-out');
            setTimeout(() => successDiv.remove(), 300);
        }
    }, 8000);
}

function showErrorMessage(container, message) {
    // Remove existing messages
    const existingMessages = container.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4 animate-fade-in';
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <i class="ri-error-warning-line mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to the end of form
    container.appendChild(errorDiv);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.classList.add('animate-fade-out');
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 8000);
}

// Newsletter Message Display
function showNewsletterMessage(form, message, type) {
    const existingMessage = form.parentNode.querySelector('.newsletter-message');
    if (existingMessage) existingMessage.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `newsletter-message mt-3 p-3 rounded-lg text-sm ${
        type === 'error' 
            ? 'bg-red-100 text-red-700 border border-red-200' 
            : 'bg-green-100 text-green-700 border border-green-200'
    }`;
    messageDiv.innerHTML = `
        <div class="flex items-center">
            <i class="ri-${type === 'error' ? 'error-warning' : 'check-circle'}-line mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    form.parentNode.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Export functions for global use
window.toggleConsent = toggleConsent;
window.initializeForms = initializeForms;
window.validateContactForm = validateContactForm;
window.validateJobApplicationForm = validateJobApplicationForm;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;
window.isValidEmail = isValidEmail;

console.log('📋 Forms.js loaded successfully');