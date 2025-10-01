window.recaptchaWidgets = {
    contact: null,
    careers: null
};

window.initializeRecaptcha = function() {
    const contactElement = document.getElementById('contact-recaptcha');
    if (contactElement && !contactElement.hasChildNodes()) {
        try {
            window.recaptchaWidgets.contact = grecaptcha.render('contact-recaptcha', {
                'sitekey': '6Lfqu7wrAAAAALeL2VSbkNnZ7z7tE1NfJ2ccRvIx'
            });
        } catch (e) {
            console.error('Contact reCAPTCHA initialization error:', e);
        }
    }
    
    const careersElement = document.getElementById('careers-recaptcha');
    if (careersElement && !careersElement.hasChildNodes()) {
        try {
            window.recaptchaWidgets.careers = grecaptcha.render('careers-recaptcha', {
                'sitekey': '6Lfqu7wrAAAAALeL2VSbkNnZ7z7tE1NfJ2ccRvIx'
            });
        } catch (e) {
            console.error('Careers reCAPTCHA initialization error:', e);
        }
    }
};

function initializeForms() {
    initializeContactForm();
    initializeJobApplicationForm();
    initializeNewsletterForm();
    initializeFormValidation();
    initializeCharacterCounters();
}

function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');
        
        if (!validateContactForm(formData)) return;
        
        let recaptchaResponse = null;
        try {
            if (window.recaptchaWidgets.contact !== null) {
                recaptchaResponse = grecaptcha.getResponse(window.recaptchaWidgets.contact);
            }
        } catch (e) {
            console.error('reCAPTCHA validation error:', e);
        }
        
        if (!recaptchaResponse) {
            showErrorMessage(this, 'Please complete the reCAPTCHA verification.');
            return;
        }
        
        formData.append('recaptcha_token', recaptchaResponse);
        
        try {
            showLoadingState(submitButton);
            
            const response = await fetch('https://mempftwiiwfiqdmhrxwq.supabase.co/functions/v1/contact-form', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lbXBmdHdpaXdmaXFkbWhyeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNzQ1MTcsImV4cCI6MjA2OTg1MDUxN30.f7xuSIxHwkdEGU2lwEc9bLl-1QHGzkUn6LR48Z_LsHw'
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit form');
            }
            
            showSuccessMessage(this, result.message || 'Thank you for your message! We will get back to you soon.');
            
            this.reset();
            updateCharacterCounter('message', 500);
            
            if (window.recaptchaWidgets.contact !== null) {
                grecaptcha.reset(window.recaptchaWidgets.contact);
            }
            
            if (typeof trackEvent === 'function') {
                trackEvent('form_submit', 'contact', 'success');
            }
            
        } catch (error) {
            console.error('Contact form submission error:', error);
            showErrorMessage(this, error.message || 'Something went wrong. Please try again later.');
            if (typeof trackEvent === 'function') {
                trackEvent('form_submit', 'contact', 'error');
            }
        } finally {
            restoreButtonState(submitButton);
        }
    });
}

function initializeJobApplicationForm() {
    const jobForm = document.getElementById('job-application-form');
    if (!jobForm) return;
    
    setTimeout(() => initializeConsentCheckbox(), 100);
    
    jobForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitButton = this.querySelector('button[type="submit"]');
        
        if (!validateJobApplicationForm(formData)) return;
        
        let recaptchaResponse = null;
        try {
            if (window.recaptchaWidgets.careers !== null) {
                recaptchaResponse = grecaptcha.getResponse(window.recaptchaWidgets.careers);
            }
        } catch (e) {
            console.error('reCAPTCHA validation error:', e);
        }
        
        if (!recaptchaResponse) {
            showErrorMessage(this, 'Please complete the reCAPTCHA verification.');
            return;
        }
        
        formData.append('recaptcha_token', recaptchaResponse);
        
        try {
            showLoadingState(submitButton);
            
            const response = await fetch('https://mempftwiiwfiqdmhrxwq.supabase.co/functions/v1/career-form', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lbXBmdHdpaXdmaXFkbWhyeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNzQ1MTcsImV4cCI6MjA2OTg1MDUxN30.f7xuSIxHwkdEGU2lwEc9bLl-1QHGzkUn6LR48Z_LsHw'
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit application');
            }
            
            showSuccessMessage(this, result.message || 'Thank you for your application! We will review it and contact you soon.');
            
            this.reset();
            resetConsentCheckbox();
            
            if (window.recaptchaWidgets.careers !== null) {
                grecaptcha.reset(window.recaptchaWidgets.careers);
            }
            
            if (typeof trackEvent === 'function') {
                trackEvent('form_submit', 'careers', 'success');
            }
            
        } catch (error) {
            console.error('Job application submission error:', error);
            showErrorMessage(this, error.message || 'Something went wrong. Please try again later.');
            if (typeof trackEvent === 'function') {
                trackEvent('form_submit', 'careers', 'error');
            }
        } finally {
            restoreButtonState(submitButton);
        }
    });
}

function initializeNewsletterForm() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    
    console.log(`Found ${newsletterForms.length} newsletter forms`);
    
    newsletterForms.forEach((form, index) => {
        if (form.dataset.initialized === 'true') {
            console.log(`Newsletter form ${index} already initialized, skipping`);
            return;
        }
        
        console.log(`Initializing newsletter form ${index}`);
        form.dataset.initialized = 'true';
        
        const submitButton = form.querySelector('button[type="submit"]');
        const emailInput = form.querySelector('input[type="email"]');
        
        if (!submitButton || !emailInput) {
            console.error('Newsletter form elements not found');
            return;
        }
        
        submitButton.disabled = false;
        submitButton.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-green-500');
        submitButton.classList.add('bg-primary');
        submitButton.innerHTML = '<i class="ri-send-plane-line mr-2"></i>Subscribe';
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            
            const email = emailInput.value.trim();
            
            console.log(`Newsletter form ${index} submitted, email: ${email}`);
            
            if (!email || !isValidEmail(email)) {
                showNewsletterMessage(this, 'Please enter a valid email address.', 'error');
                return;
            }
            
            if (submitButton.disabled === true) {
                console.warn('Submit blocked - button already disabled');
                return false;
            }
            
            const originalButtonHTML = submitButton.innerHTML;
            const hasPrimaryClass = submitButton.classList.contains('bg-primary');
            
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Subscribing...';
            submitButton.classList.add('opacity-50', 'cursor-not-allowed');
            
            console.log('Sending newsletter subscription request...');
            
            try {
                const response = await fetch('https://mempftwiiwfiqdmhrxwq.supabase.co/rest/v1/newsletter_subscribers', {
                    method: 'POST',
                    headers: {
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lbXBmdHdpaXdmaXFkbWhyeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNzQ1MTcsImV4cCI6MjA2OTg1MDUxN30.f7xuSIxHwkdEGU2lwEc9bLl-1QHGzkUn6LR48Z_LsHw',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lbXBmdHdpaXdmaXFkbWhyeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNzQ1MTcsImV4cCI6MjA2OTg1MDUxN30.f7xuSIxHwkdEGU2lwEc9bLl-1QHGzkUn6LR48Z_LsHw',
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        email: email,
                        source: 'footer_newsletter'
                    })
                });
                
                console.log('Response status:', response.status);
                
                if (response.status === 201 || response.ok) {
                    submitButton.innerHTML = '<i class="ri-check-line mr-2"></i>Subscribed!';
                    submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
                    if (hasPrimaryClass) {
                        submitButton.classList.remove('bg-primary');
                        submitButton.classList.add('bg-green-500');
                    }
                    
                    showNewsletterMessage(this, 'Thank you for subscribing!', 'success');
                    emailInput.value = '';
                    
                    setTimeout(() => {
                        submitButton.innerHTML = originalButtonHTML;
                        if (hasPrimaryClass) {
                            submitButton.classList.remove('bg-green-500');
                            submitButton.classList.add('bg-primary');
                        }
                        submitButton.disabled = false;
                        submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
                    }, 3000);
                    
                    if (typeof trackEvent === 'function') {
                        trackEvent('newsletter_signup', 'engagement', email);
                    }
                } else {
                    throw new Error('Subscription failed');
                }
                
            } catch (error) {
                console.error('Newsletter submission error:', error);
                
                let errorMessage = 'Something went wrong. Please try again.';
                if (error.message && error.message.includes('duplicate')) {
                    errorMessage = 'This email is already subscribed!';
                }
                
                showNewsletterMessage(this, errorMessage, 'error');
                
                submitButton.innerHTML = originalButtonHTML;
                submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
                if (hasPrimaryClass && submitButton.classList.contains('bg-green-500')) {
                    submitButton.classList.remove('bg-green-500');
                    submitButton.classList.add('bg-primary');
                }
                submitButton.disabled = false;
            }
        });
    });
}

function initializeFormValidation() {
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

function initializeCharacterCounters() {
    const messageTextarea = document.getElementById('message');
    const messageChars = document.getElementById('message-chars');
    
    if (messageTextarea && messageChars) {
        messageTextarea.addEventListener('input', function() {
            updateCharacterCounter('message', 500);
        });
    }
    
    const textareas = document.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('maxlength'));
        if (maxLength && textarea.id !== 'message') {
            addCharacterCounter(textarea, maxLength);
        }
    });
}

function initializeConsentCheckbox() {
    const consentCheckbox = document.getElementById('consent-checkbox');
    const consentLabel = consentCheckbox?.closest('label');
    const consentText = consentLabel?.querySelector('span.ml-6');
    
    if (!consentCheckbox || !consentText) return;
    
    consentText.style.cursor = 'pointer';
    consentText.addEventListener('click', function(e) {
        e.preventDefault();
        toggleConsent();
    });
    
    consentText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleConsent();
        }
    });
    
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
        updateConsentVisual();
        
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

function showLoadingState(button) {
    if (!button) return;
    
    button.disabled = true;
    button.classList.add('opacity-50', 'cursor-not-allowed');
    
    if (!button.dataset.originalText) {
        button.dataset.originalText = button.innerHTML;
    }
    
    button.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Submitting...';
}

function restoreButtonState(button) {
    if (!button) return;
    
    setTimeout(() => {
        button.disabled = false;
        button.classList.remove('opacity-50', 'cursor-not-allowed');
        
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

function showSuccessMessage(container, message) {
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
    
    container.appendChild(successDiv);
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.classList.add('animate-fade-out');
            setTimeout(() => successDiv.remove(), 300);
        }
    }, 8000);
}

function showErrorMessage(container, message) {
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
    
    container.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.classList.add('animate-fade-out');
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 8000);
}

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
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

window.toggleConsent = toggleConsent;
window.initializeForms = initializeForms;
window.initializeNewsletterForm = initializeNewsletterForm;
window.validateContactForm = validateContactForm;
window.validateJobApplicationForm = validateJobApplicationForm;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;
window.isValidEmail = isValidEmail;

let formsInitialized = false;
let newsletterFormsInitialized = false;

function safeInitializeForms() {
    if (formsInitialized) {
        console.log('Forms already initialized, skipping...');
        return;
    }
    
    formsInitialized = true;
    console.log('Initializing forms...');
    
    initializeContactForm();
    initializeJobApplicationForm();
    initializeFormValidation();
    initializeCharacterCounters();
    
    initializeNewsletterForm();
}

function watchForNewsletterForms() {
    const existingForms = document.querySelectorAll('.newsletter-form');
    if (existingForms.length > 0 && !newsletterFormsInitialized) {
        console.log('Newsletter forms found, initializing...');
        newsletterFormsInitialized = true;
        initializeNewsletterForm();
        return;
    }
    
    const observer = new MutationObserver((mutations) => {
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        if (newsletterForms.length > 0 && !newsletterFormsInitialized) {
            console.log('Newsletter forms detected via observer, initializing...');
            newsletterFormsInitialized = true;
            initializeNewsletterForm();
            observer.disconnect();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    setTimeout(() => {
        observer.disconnect();
        console.log('Newsletter form observer stopped');
    }, 10000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        safeInitializeForms();
        watchForNewsletterForms();
    }, { once: true });
} else {
    safeInitializeForms();
    watchForNewsletterForms();
}

window.safeInitializeForms = safeInitializeForms;

console.log('Forms.js loaded successfully');