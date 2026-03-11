// Main JavaScript File for Get Yo Frozen Yogurt
// This file contains core functionality and initialization

// Global variables
let isMenuOpen = false;
let currentLocation = 'marlboro';
let currentMenuTab = 'flavors';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Get Yo App...');
    
    // Wait for components to load first
    setTimeout(() => {
        initializeApp();
    }, 1000);
});

// Main initialization function
function initializeApp() {
    console.log('🎯 Starting app initialization...');
    
    // Initialize all modules EXCEPT mobile menu (handled in index.html)
    // initializeMobileMenu(); // DISABLED - handled in index.html
    initializeScrollEffects();
    initializeSmoothScrolling();
    initializeLoadingStates();
    initializeErrorHandling();
    
    console.log('✅ App initialization complete');
}

// Mobile Menu Functionality
function initializeMobileMenu() {
    console.log('📱 Initializing mobile menu...');
    
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    
    if (!mobileMenuButton || !mobileMenu) {
        console.warn('⚠️ Mobile menu elements not found');
        return;
    }
    
    // Toggle mobile menu
    mobileMenuButton.addEventListener('click', function() {
        isMenuOpen = !isMenuOpen;
        toggleMobileMenu();
    });
    
    // Close menu when clicking on links
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            isMenuOpen = false;
            toggleMobileMenu();
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
            isMenuOpen = false;
            toggleMobileMenu();
        }
    });
    
    console.log('✅ Mobile menu initialized');
}

// Toggle mobile menu visibility
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    
    if (mobileMenu && menuIcon) {
        if (isMenuOpen) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('mobile-menu-open');
            mobileMenu.classList.remove('mobile-menu-closed');
            menuIcon.classList.remove('ri-menu-line');
            menuIcon.classList.add('ri-close-line');
        } else {
            mobileMenu.classList.add('mobile-menu-closed');
            mobileMenu.classList.remove('mobile-menu-open');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
            menuIcon.classList.remove('ri-close-line');
            menuIcon.classList.add('ri-menu-line');
        }
    }
}

// Scroll Effects
function initializeScrollEffects() {
    console.log('📜 Initializing scroll effects...');
    
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    
    if (!header) {
        console.warn('⚠️ Header not found for scroll effects');
        return;
    }
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow to header when scrolling
        if (scrollTop > 10) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
        
        // Hide/show header based on scroll direction
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    setTimeout(() => {
        const elementsToAnimate = document.querySelectorAll('.flavor-card, .location-card, .contact-form, .contact-info');
        elementsToAnimate.forEach(el => observer.observe(el));
    }, 2000);
    
    console.log('✅ Scroll effects initialized');
}

// Smooth Scrolling for Navigation Links
function initializeSmoothScrolling() {
    console.log('🎯 Initializing smooth scrolling...');
    
    setTimeout(() => {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (isMenuOpen) {
                        isMenuOpen = false;
                        toggleMobileMenu();
                    }
                }
            });
        });
    }, 1500);
    
    console.log('✅ Smooth scrolling initialized');
}

// Loading States
function initializeLoadingStates() {
    console.log('⏳ Initializing loading states...');
    
    // Show loading spinner for forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                showLoadingState(submitButton);
            }
        });
    });
    
    console.log('✅ Loading states initialized');
}

// Show loading state for buttons
function showLoadingState(button) {
    if (!button) return;
    
    const originalText = button.innerHTML;
    const originalDisabled = button.disabled;
    
    button.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Loading...';
    button.disabled = true;
    
    // Store original state for potential restoration
    button.setAttribute('data-original-text', originalText);
    button.setAttribute('data-original-disabled', originalDisabled);
}

// Restore button state
function restoreButtonState(button) {
    if (!button) return;
    
    const originalText = button.getAttribute('data-original-text');
    const originalDisabled = button.getAttribute('data-original-disabled') === 'true';
    
    if (originalText) {
        button.innerHTML = originalText;
        button.disabled = originalDisabled;
        button.removeAttribute('data-original-text');
        button.removeAttribute('data-original-disabled');
    }
}

// Success message display
function showSuccessMessage(container, message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 animate-fade-in';
    successDiv.innerHTML = `
        <div class="flex items-center">
            <i class="ri-check-circle-line mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Remove existing messages
    const existingMessages = container.querySelectorAll('.bg-green-100, .bg-red-100');
    existingMessages.forEach(msg => msg.remove());
    
    // Add new message
    container.insertBefore(successDiv, container.firstChild);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 8000);
    
    // Scroll to message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Error message display
function showErrorMessage(container, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in';
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <i class="ri-error-warning-line mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Remove existing messages
    const existingMessages = container.querySelectorAll('.bg-green-100, .bg-red-100');
    existingMessages.forEach(msg => msg.remove());
    
    // Add new message
    container.insertBefore(errorDiv, container.firstChild);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 8000);
    
    // Scroll to message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Error Handling
function initializeErrorHandling() {
    console.log('🛡️ Initializing error handling...');
    
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        
        // Don't show user error messages for script loading errors
        if (e.filename && e.filename.includes('.js')) {
            return;
        }
        
        showGlobalError('Something went wrong. Please refresh the page and try again.');
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        e.preventDefault(); // Prevent console error
    });
    
    console.log('✅ Error handling initialized');
}

// Show global error message
function showGlobalError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-20 left-4 right-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg animate-slide-in';
    errorDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <i class="ri-error-warning-line mr-2 text-xl"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                <i class="ri-close-line text-xl"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 10000);
}

// Utility Functions

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format phone number
function formatPhoneNumber(phoneNumber) {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phoneNumber;
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Get current date formatted
function getCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
}

// Get day of week (0 = Sunday, 6 = Saturday)
function getCurrentDayOfWeek() {
    return new Date().getDay();
}

// Check if store is currently open
function isStoreOpen(location) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format
    
    if (location === 'marlboro') {
        if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
            return currentTime >= 1500 && currentTime < 2200; // 3:00 PM - 10:00 PM
        } else if (dayOfWeek === 0) { // Sunday
            return currentTime >= 1300 && currentTime < 2200; // 1:00 PM - 10:00 PM
        } else { // Friday and Saturday
            return currentTime >= 1300 && currentTime < 2300; // 1:00 PM - 11:00 PM
        }
    } else if (location === 'newprovidence') {
        if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
            return currentTime >= 1200 && currentTime < 2200; // 12:00 PM - 10:00 PM
        } else { // Friday, Saturday and Sunday
            return currentTime >= 1200 && currentTime < 2300; // 12:00 PM - 11:00 PM
        }
    }
    
    return false;
}

// Analytics tracking
function trackEvent(action, category = 'user_interaction', label = '') {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
    console.log(`📊 Event tracked: ${category} - ${action} - ${label}`);
}

// Local Storage helpers
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.warn('Could not read from localStorage:', e);
        return defaultValue;
    }
}

// Cookie helpers (for preferences)
function setCookie(name, value, days = 30) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Export functions for use in other files
window.initializeApp = initializeApp;
window.initializeMobileMenu = initializeMobileMenu;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;
window.showLoadingState = showLoadingState;
window.restoreButtonState = restoreButtonState;
window.trackEvent = trackEvent;
window.isValidEmail = isValidEmail;
window.formatPhoneNumber = formatPhoneNumber;
window.getCurrentDate = getCurrentDate;
window.getCurrentDayOfWeek = getCurrentDayOfWeek;
window.isStoreOpen = isStoreOpen;
window.debounce = debounce;
window.throttle = throttle;

console.log('📦 Main.js loaded successfully');