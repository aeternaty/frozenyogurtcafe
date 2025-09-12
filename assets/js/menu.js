// Menu JavaScript - Handle menu functionality
// Location switching, flavor filtering, allergen information

// Global flag to prevent multiple initializations
window.menuInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeMenu();
    }, 2500);
});

function initializeMenu() {
    if (window.menuInitialized) {
        console.log('⚠️ Menu already initialized, skipping...');
        return;
    }
    
    console.log('🍨 Initializing menu functionality...');
    
    initializeLocationTabs();
    initializeMenuTabs();
    initializeFlavorFilters();
    initializeAllergenFilters();
    
    // Set initial state
    window.currentLocation = 'marlboro';
    updateLocationInfo('marlboro');
    filterFlavorCards('all', null);
    
    window.menuInitialized = true;
    console.log('✅ Menu initialized');
}

// Location Tabs
function initializeLocationTabs() {
    const locationTabs = document.querySelectorAll('.location-tab');
    if (locationTabs.length === 0) return;
    
    locationTabs.forEach(tab => {
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        
        newTab.addEventListener('click', function() {
            const location = this.getAttribute('data-location');
            switchLocation(location);
        });
    });
}

function switchLocation(location) {
    const locationTabs = document.querySelectorAll('.location-tab');
    
    locationTabs.forEach(tab => {
        if (tab.getAttribute('data-location') === location) {
            tab.style.backgroundColor = '#FF8A3D';
            tab.style.color = '#FFFFFF';
            tab.classList.remove('text-gray-700');
            tab.classList.add('text-white', 'bg-primary');
        } else {
            tab.style.backgroundColor = '';
            tab.style.color = '';
            tab.classList.remove('text-white', 'bg-primary');
            tab.classList.add('text-gray-700');
        }
    });
    
    window.currentLocation = location;
    resetAllFilters();
    updateLocationInfo(location);
    filterFlavorCards('all', null);
}

function updateLocationInfo(location) {
    const existingInfo = document.querySelector('.location-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    const locationInfo = document.createElement('div');
    locationInfo.className = 'text-center text-gray-600 mb-8 location-info animate-fade-in';
    
    if (location === 'marlboro') {
        locationInfo.innerHTML = `
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h4 class="font-bold text-primary mb-2">Marlboro Location</h4>
                <p>Featuring all 14 delicious frozen yogurt flavors!</p>
                <p class="text-sm text-gray-500 mt-1">Kosher Certified • Full Menu Available</p>
            </div>
        `;
    } else {
        locationInfo.innerHTML = `
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h4 class="font-bold text-primary mb-2">New Providence Location</h4>
                <p>Enjoy our 7 carefully selected premium flavors!</p>
                <p class="text-sm text-gray-500 mt-1">Downtown Location • Customer Favorites</p>
            </div>
        `;
    }
    
    const flavorFilterButtons = document.querySelector('.flex.flex-wrap.gap-4');
    if (flavorFilterButtons) {
        flavorFilterButtons.parentNode.insertBefore(locationInfo, flavorFilterButtons);
    }
}

// Menu Tabs
function initializeMenuTabs() {
    const menuTabs = document.querySelectorAll('.menu-tab');
    if (menuTabs.length === 0) return;
    
    menuTabs.forEach(tab => {
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        
        newTab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchMenuTab(tabId);
        });
    });
}

function switchMenuTab(activeTabId) {
    const menuTabs = document.querySelectorAll('.menu-tab');
    const tabContents = document.querySelectorAll('.menu-content');
    
    menuTabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === activeTabId) {
            tab.style.backgroundColor = '#FF8A3D';
            tab.style.color = '#FFFFFF';
            tab.classList.remove('text-gray-700');
            tab.classList.add('text-white', 'bg-primary');
        } else {
            tab.style.backgroundColor = '';
            tab.style.color = '';
            tab.classList.remove('text-white', 'bg-primary');
            tab.classList.add('text-gray-700');
        }
    });
    
    tabContents.forEach(content => {
        const contentId = content.id.replace('-content', '');
        if (contentId === activeTabId) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}

// Flavor Filters
function initializeFlavorFilters() {
    const flavorFilterBtns = document.querySelectorAll('.flavor-filter-btn');
    if (flavorFilterBtns.length === 0) return;
    
    flavorFilterBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Set initial state for "All Flavors" button
        if (newBtn.getAttribute('data-filter') === 'all') {
            newBtn.style.backgroundColor = '#FF8A3D';
            newBtn.style.color = '#FFFFFF';
        }
        
        newBtn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            switchFlavorFilter(filter);
        });
    });
}

function switchFlavorFilter(activeFilter) {
    const flavorFilterBtns = document.querySelectorAll('.flavor-filter-btn');
    
    flavorFilterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === activeFilter) {
            btn.style.backgroundColor = '#FF8A3D';
            btn.style.color = '#FFFFFF';
            btn.classList.remove('bg-white', 'text-gray-700');
            btn.classList.add('bg-primary', 'text-white');
        } else {
            btn.style.backgroundColor = '#FFFFFF';
            btn.style.color = '#374151';
            btn.classList.remove('bg-primary', 'text-white');
            btn.classList.add('bg-white', 'text-gray-700');
        }
    });
    
    resetAllergenFilters();
    filterFlavorCards(activeFilter, null);
}

// Allergen Filters
function initializeAllergenFilters() {
    const allergenBtns = document.querySelectorAll('.allergen-btn');
    if (allergenBtns.length === 0) return;
    
    allergenBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const allergen = this.getAttribute('data-allergen');
            toggleAllergenFilter(allergen, this);
        });
    });
}

function toggleAllergenFilter(allergen, button) {
    const isActive = button.style.backgroundColor === 'rgb(255, 138, 61)';
    
    if (isActive) {
        resetAllergenFilters();
        const activeCategory = getCurrentActiveFilter();
        filterFlavorCards(activeCategory, null);
        removeAllergenNotification();
    } else {
        resetAllergenFilters();
        
        button.style.backgroundColor = '#FF8A3D';
        button.style.color = '#FFFFFF';
        button.style.borderColor = '#FF8A3D';
        
        showAllergenNotification(allergen);
        const activeCategory = getCurrentActiveFilter();
        filterFlavorCards(activeCategory, allergen);
    }
}

function resetAllergenFilters() {
    const allergenBtns = document.querySelectorAll('.allergen-btn');
    
    allergenBtns.forEach(btn => {
        btn.style.backgroundColor = '#FFFFFF';
        btn.style.color = '#374151';
        btn.style.borderColor = '#E5E7EB';
        btn.classList.remove('bg-primary', 'text-white', 'border-primary');
        btn.classList.add('bg-white', 'border-gray-200', 'text-gray-700');
    });
    
    removeAllergenNotification();
}

function resetAllFilters() {
    // Reset flavor filters to "All Flavors"
    const flavorFilterBtns = document.querySelectorAll('.flavor-filter-btn');
    flavorFilterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === 'all') {
            btn.style.backgroundColor = '#FF8A3D';
            btn.style.color = '#FFFFFF';
            btn.classList.remove('bg-white', 'text-gray-700');
            btn.classList.add('bg-primary', 'text-white');
        } else {
            btn.style.backgroundColor = '#FFFFFF';
            btn.style.color = '#374151';
            btn.classList.remove('bg-primary', 'text-white');
            btn.classList.add('bg-white', 'text-gray-700');
        }
    });
    
    resetAllergenFilters();
}

// Filter flavor cards
function filterFlavorCards(categoryFilter = 'all', allergenFilter = null) {
    const flavorCards = document.querySelectorAll('.flavor-card');
    const currentLocation = window.currentLocation || 'marlboro';
    
    let visibleCount = 0;
    
    flavorCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const allergensAttr = card.getAttribute('data-allergens');
        const locationsAttr = card.getAttribute('data-locations');
        
        let allergens = [];
        if (allergensAttr && allergensAttr.trim()) {
            allergens = allergensAttr.split(',').map(a => a.trim()).filter(a => a);
        }
        
        let locations = [];
        if (locationsAttr && locationsAttr.trim()) {
            locations = locationsAttr.split(',').map(l => l.trim()).filter(l => l);
        }
        
        let shouldShow = true;
        
        if (locations.length > 0 && !locations.includes(currentLocation)) {
            shouldShow = false;
        }
        
if (categoryFilter !== 'all') {
    const categories = category ? category.split(' ') : [];
    if (!categories.includes(categoryFilter)) {
        shouldShow = false;
    }
}
        
        if (allergenFilter && !allergens.includes(allergenFilter)) {
            shouldShow = false;
        }
        
        if (shouldShow) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    updateResultsCount(visibleCount, flavorCards.length);
}

// Helper functions
function getCurrentActiveFilter() {
    const activeBtn = Array.from(document.querySelectorAll('.flavor-filter-btn'))
        .find(btn => btn.style.backgroundColor === 'rgb(255, 138, 61)');
    return activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
}

function showAllergenNotification(allergen) {
    removeAllergenNotification();
    
    const flavorsContent = document.getElementById('flavors-content');
    if (!flavorsContent) return;
    
    const notification = document.createElement('div');
    notification.id = 'allergen-notification';
    notification.className = 'bg-red-50 border-l-4 border-red-400 p-4 mb-6';
    notification.innerHTML = `
        <div class="flex items-start">
            <i class="ri-alert-line text-red-400 mr-3"></i>
            <div>
                <h3 class="text-sm font-medium text-red-800">Allergen Filter Active</h3>
                <p class="text-sm text-red-700 mt-1">
                    Showing only flavors that contain ${allergen}. 
                    <strong>People with ${allergen} allergies should avoid these flavors.</strong>
                </p>
            </div>
        </div>
    `;
    
    const locationInfo = document.querySelector('.location-info');
    if (locationInfo && locationInfo.nextSibling) {
        locationInfo.parentNode.insertBefore(notification, locationInfo.nextSibling);
    } else {
        flavorsContent.insertBefore(notification, flavorsContent.firstChild);
    }
}

function removeAllergenNotification() {
    const notification = document.getElementById('allergen-notification');
    if (notification) {
        notification.remove();
    }
}

function updateResultsCount(visible, total) {
    const existingCounter = document.querySelector('.results-counter');
    if (existingCounter) {
        existingCounter.remove();
    }
    
    const counter = document.createElement('div');
    counter.className = 'results-counter text-center text-gray-600 mb-6';
    
    const locationText = window.currentLocation === 'newprovidence' ? 
        ' (New Providence selection)' : 
        ' (All flavors available)';
    
    counter.innerHTML = `<p class="text-sm">Showing ${visible} of ${total} flavors${locationText}</p>`;
    
    const grid = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');
    if (grid && grid.parentNode) {
        grid.parentNode.insertBefore(counter, grid);
    }
}

// Export functions
window.initializeMenu = initializeMenu;

console.log('🍨 Menu.js loaded successfully');