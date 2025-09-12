// Supabase Configuration - Secure Version
// Environment variables should be set in deployment environment

// Environment variable kontrolü
function getEnvVar(name, defaultValue = '') {
    if (typeof window !== 'undefined') {
        // Browser environment - sadece PUBLIC değişkenler
        return window[name] || defaultValue;
    }
    // Node.js environment 
    return process.env[name] || defaultValue;
}

// Supabase konfigürasyonu
const SUPABASE_CONFIG = {
    url: getEnvVar('SUPABASE_URL') || 'https://mempftwiiwfiqdmhrxwq.supabase.co',
    anonKey: getEnvVar('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lbXBmdHdpaXdmaXFkbWhyeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNzQ1MTcsImV4cCI6MjA2OTg1MDUxN30.f7xuSIxHwkdEGU2lwEc9bLl-1QHGzkUn6LR48Z_LsHw',
    
    // reCAPTCHA konfigürasyonu
    recaptcha: {
        siteKey: getEnvVar('RECAPTCHA_SITE_KEY') || '6Lfqu7wrAAAAALeL2VSbkNnZ7z7tE1NfJ2ccRvIx'
    },
    
    // Google Analytics
    gaTrackingId: getEnvVar('GA_TRACKING_ID') || ''
};

// API endpoint konfigürasyonu
const API_CONFIG = {
    contact: `${SUPABASE_CONFIG.url}/functions/v1/contact-form`,
    careers: `${SUPABASE_CONFIG.url}/functions/v1/career-form`
};

// Environment detection
const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('vercel.app'));

// Form konfigürasyonu
const FORM_CONFIG = {
    contact: {
        endpoint: API_CONFIG.contact,
        table: 'contact_submissions',
        isDevelopment,
        maxLength: {
            name: 100,
            email: 255,
            subject: 200,
            message: 500
        }
    },
    careers: {
        endpoint: API_CONFIG.careers,
        table: 'job_applications', 
        isDevelopment,
        maxLength: {
            name: 100,
            email: 255,
            phone: 20,
            experience: 1000,
            whyJoin: 1000
        }
    }
};

// Rate limiting konfigürasyonu
const RATE_LIMIT_CONFIG = {
    formSubmission: 30000, // 30 saniye
    maxAttemptsPerHour: 5,
    blockDuration: 3600000 // 1 saat
};

// Security headers for fetch requests
const SECURITY_HEADERS = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json'
};

// Güvenli form gönderimi
async function submitFormSecurely(formType, formData, recaptchaToken) {
    const config = FORM_CONFIG[formType];
    if (!config) {
        throw new Error('Invalid form type');
    }
    
    // Rate limiting kontrolü
    if (isRateLimited(formType)) {
        throw new Error('Too many requests. Please wait before trying again.');
    }
    
    // Honeypot kontrolü
    const honeypotFields = ['website', 'email_confirm'];
    for (const field of honeypotFields) {
        if (formData.get(field)) {
            // Honeypot triggered - sessizce başarılı görün
            return { 
                success: true, 
                message: 'Thank you for your submission!' 
            };
        }
    }
    
    // Form data'ya güvenlik bilgileri ekle
    const secureFormData = new FormData();
    
    // Orijinal form verilerini kopyala
    for (const [key, value] of formData.entries()) {
        if (!honeypotFields.includes(key)) {
            secureFormData.append(key, value);
        }
    }
    
    // Güvenlik bilgileri ekle
    secureFormData.append('recaptcha_token', recaptchaToken || '');
    secureFormData.append('timestamp', Date.now().toString());
    secureFormData.append('form_origin', window.location.origin);
    secureFormData.append('user_agent_hash', hashString(navigator.userAgent || ''));
    
    try {
        const response = await fetch(config.endpoint, {
            method: 'POST',
            body: secureFormData,
            headers: {
                'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                'apikey': SUPABASE_CONFIG.anonKey,
                ...SECURITY_HEADERS
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Request failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Başarılı gönderim kaydı
        recordSubmission(formType);
        
        return result;
        
    } catch (error) {
        console.error('Form submission error:', error);
        throw error;
    }
}

// Rate limiting fonksiyonları
function isRateLimited(formType) {
    const key = `form_${formType}_attempts`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now();
    
    // Eski girişimleri temizle (1 saat öncesi)
    const recentAttempts = attempts.filter(time => 
        now - time < RATE_LIMIT_CONFIG.blockDuration
    );
    
    // Güncelle
    localStorage.setItem(key, JSON.stringify(recentAttempts));
    
    // Limit kontrolü
    return recentAttempts.length >= RATE_LIMIT_CONFIG.maxAttemptsPerHour;
}

function recordSubmission(formType) {
    const key = `form_${formType}_attempts`;
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    attempts.push(Date.now());
    localStorage.setItem(key, JSON.stringify(attempts));
    
    // Son gönderim zamanını kaydet
    localStorage.setItem(`last_${formType}_submission`, Date.now().toString());
}

// Simple hash function for user agent
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32-bit integer'a çevir
    }
    return Math.abs(hash).toString(16);
}

// reCAPTCHA yükleme ve doğrulama
function loadRecaptcha() {
    if (typeof grecaptcha !== 'undefined') {
        return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// reCAPTCHA callback fonksiyonu
window.onSubmit = function(token) {
    console.log('reCAPTCHA verified');
    
    // Form bulma ve gönderme
    const recaptchaElements = document.querySelectorAll('.g-recaptcha');
    for (const element of recaptchaElements) {
        const form = element.closest('form');
        if (form && !form.hasAttribute('data-recaptcha-processed')) {
            form.setAttribute('data-recaptcha-processed', 'true');
            
            // Form tipini belirle
            const formType = form.id.includes('contact') ? 'contact' : 'careers';
            
            // Form gönderimi başlat
            handleFormSubmissionWithRecaptcha(form, formType, token);
            break;
        }
    }
};

// reCAPTCHA ile form gönderimi
async function handleFormSubmissionWithRecaptcha(form, formType, token) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    try {
        // Loading state
        submitButton.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Sending...';
        submitButton.disabled = true;
        
        // Form verilerini al
        const formData = new FormData(form);
        
        // Form gönder
        const result = await submitFormSecurely(formType, formData, token);
        
        // Başarı mesajı
        showSuccessMessage(form, result.message || 'Thank you for your submission!');
        form.reset();
        
        // Character counter reset
        const charCounter = form.querySelector('[id$="-chars"]');
        if (charCounter) {
            const maxLength = formType === 'contact' ? 500 : 1000;
            charCounter.textContent = maxLength.toString();
        }
        
    } catch (error) {
        console.error('Submission error:', error);
        showErrorMessage(form, error.message || 'Something went wrong. Please try again later.');
    } finally {
        // Button state reset
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        form.removeAttribute('data-recaptcha-processed');
        
        // reCAPTCHA reset
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
        }
    }
}

// Mesaj gösterme fonksiyonları
function showSuccessMessage(form, message) {
    const sanitizedMessage = sanitizeHTML(message);
    const messageDiv = createMessageDiv('success', sanitizedMessage);
    displayMessage(form, messageDiv);
}

function showErrorMessage(form, message) {
    const sanitizedMessage = sanitizeHTML(message);
    const messageDiv = createMessageDiv('error', sanitizedMessage);
    displayMessage(form, messageDiv);
}

function createMessageDiv(type, message) {
    const div = document.createElement('div');
    const isError = type === 'error';
    
    div.className = `form-message ${isError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'} px-4 py-3 rounded-lg mb-4 border`;
    div.innerHTML = `
        <div class="flex items-center">
            <i class="ri-${isError ? 'error-warning' : 'check-circle'}-line mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    return div;
}

function displayMessage(form, messageDiv) {
    // Eski mesajları kaldır
    const existingMessages = form.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Yeni mesaj ekle
    form.insertBefore(messageDiv, form.firstChild);
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto remove
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 8000);
}

// HTML sanitization
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Google Analytics initialization
function initializeGoogleAnalytics() {
    const trackingId = SUPABASE_CONFIG.gaTrackingId;
    if (trackingId && trackingId !== 'G-XXXXXXXXXX' && !isDevelopment) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', trackingId, {
            anonymize_ip: true,
            cookie_flags: 'SameSite=Strict;Secure'
        });
    }
}

// CSP violation reporting
window.addEventListener('securitypolicyviolation', (event) => {
    console.warn('CSP violation:', {
        directive: event.violatedDirective,
        blockedURI: event.blockedURI,
        lineNumber: event.lineNumber
    });
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Google Analytics başlat
    initializeGoogleAnalytics();
    
    // reCAPTCHA yükle
    if (!isDevelopment) {
        loadRecaptcha().catch(error => {
            console.warn('reCAPTCHA loading failed:', error);
        });
    }
});

// Global exports
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.API_CONFIG = API_CONFIG;
window.FORM_CONFIG = FORM_CONFIG;
window.submitFormSecurely = submitFormSecurely;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;

console.log('✅ Supabase config loaded securely');