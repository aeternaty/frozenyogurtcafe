class DynamicMenuSystem {
    constructor() {
        this.config = {
            API_BASE_URL: 'https://getyocafe.com/api/public',
            IMAGE_BASE_URL: 'https://irbbgsekymaxpvtdncpd.supabase.co/storage/v1/object/public/images/',
            CERT_BASE_URL: 'assets/images/cert/',
            CACHE_DURATION: 5 * 60 * 1000,
        };
        
        this.state = {
            data: null,
            cache: null,
            activeLocation: null,
            activeTab: 'flavors',
            filters: {
                flavors: {
                    category: 'all',
                    allergen: null
                },
                toppings: {
                    category: 'all',
                    allergen: null
                }
            }
        };
        
        this.certMap = {
            'kosher': 'kosher-logo.png',
            'gluten-free': 'gluten-free_cert.png',
            'kof-k-dairy': 'kof-k-dairy_cert.png',
            'ok-dairy': 'ok-dairy-kosher_cert.png',
            'orthodox-union-dairy': 'orthodox-union-dairy-kosher_cert.png',
            'orthodox-union': 'orthodox-union-kosher_cert.png',
            'star-d': 'star-d-kosher_cert.png'
        };
    }

    async init() {
        try {
            await this.loadData();
            this.bindEvents();
        } catch (error) {
            this.showError('Menu could not be loaded. Please refresh the page.');
        }
    }

    async loadData() {
        if (this.getCachedData()) {
            this.processData(this.getCachedData());
            return;
        }

        try {
            const response = await fetch(`${this.config.API_BASE_URL}/menu`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const result = await response.json();
            if (!result.success) throw new Error(result.message);
            
            this.setCachedData(result.data);
            this.processData(result.data);
            
        } catch (error) {
            this.showError('Menu data could not be loaded. Please try again later.');
        }
    }

    getCachedData() {
        if (!this.state.cache || Date.now() - this.state.cache.timestamp > this.config.CACHE_DURATION) {
            return null;
        }
        return this.state.cache.data;
    }

    setCachedData(data) {
        this.state.cache = { data, timestamp: Date.now() };
    }

    processData(data) {
        this.state.data = data;
        
        const locations = this.extractLocations(data);
        this.state.activeLocation = locations[0];
        
        this.generateLocationTabs(locations);
        this.generateFlavorFilters(data.flavors);
        this.generateToppingFilters(data.toppings);
        
        this.renderFlavors();
        this.renderToppings();
    }

    extractLocations(data) {
        const locationSet = new Set();
        
        data.flavors.forEach(flavor => {
            flavor.locations.forEach(loc => locationSet.add(loc));
        });
        
        data.toppings.forEach(topping => {
            topping.locations.forEach(loc => locationSet.add(loc));
        });
        
        return Array.from(locationSet);
    }

    formatLocationName(location) {
        const locationMap = {
            'newprovidence': 'New Providence',
        };
        

        const lowerLocation = location.toLowerCase();
        if (locationMap[lowerLocation]) {
            return locationMap[lowerLocation];
        }
        
        let formatted = location;
        
        formatted = formatted.replace(/^new([a-z])/i, 'New $1');
        formatted = formatted.replace(/^old([a-z])/i, 'Old $1');
        formatted = formatted.replace(/^south([a-z])/i, 'South $1');
        formatted = formatted.replace(/^north([a-z])/i, 'North $1');
        formatted = formatted.replace(/^east([a-z])/i, 'East $1');
        formatted = formatted.replace(/^west([a-z])/i, 'West $1');
        
        return formatted
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .split(/[\s-_]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
            .trim();
    }

    generateLocationTabs(locations) {
        const container = document.getElementById('location-tabs');
        container.innerHTML = '';
        
        locations.forEach((location, index) => {
            const button = document.createElement('button');
            button.className = `location-tab flex-1 py-3 px-4 rounded-full font-medium transition-all duration-200 ${
                index === 0 ? 'text-white bg-orange-500' : 'text-gray-700'
            }`;
            button.dataset.location = location;
            
            const displayName = this.formatLocationName(location);
            const flavorCount = this.getLocationFlavorCount(location);
            
            button.innerHTML = `
                <i class="ri-store-2-line mr-2"></i>${displayName}
                <span class="text-xs block mt-1">${flavorCount} Flavors</span>
            `;
            
            container.appendChild(button);
        });
    }

    getLocationFlavorCount(location) {
        return this.state.data.flavors.filter(flavor => 
            flavor.locations.some(loc => loc.toLowerCase() === location.toLowerCase())
        ).length;
    }

    generateFlavorFilters(flavors) {
        const categories = new Set(['all']);
        flavors.forEach(flavor => {
            flavor.categories.forEach(cat => categories.add(cat));
        });
        
        const categoryContainer = document.getElementById('flavor-category-filters');
        categoryContainer.innerHTML = '';
        
        Array.from(categories).forEach((category, index) => {
            const button = document.createElement('button');
            button.className = `filter-btn ${index === 0 ? 'active' : ''}`;
            button.dataset.filter = category;
            
            const displayName = category === 'all' ? 'All Flavors' : 
                category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            
            button.textContent = displayName;
            categoryContainer.appendChild(button);
        });

        const allergens = new Set();
        flavors.forEach(flavor => {
            flavor.allergens.forEach(allergen => allergens.add(allergen.toLowerCase()));
        });
        
        const allergenContainer = document.getElementById('flavor-allergen-filters');
        allergenContainer.innerHTML = '';
        
        Array.from(allergens).forEach(allergen => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.allergen = allergen;
            
            const iconMap = {
                'milk': 'ri-drop-line',
                'egg': 'ri-egg-line',
                'wheat': 'ri-plant-line',
                'soy': 'ri-seedling-line',
                'peanuts': 'ri-plant-line',
                'tree nuts': 'ri-leaf-line'
            };
            
            const icon = iconMap[allergen] || 'ri-alert-line';
            const displayName = allergen.charAt(0).toUpperCase() + allergen.slice(1);
            
            button.innerHTML = `<i class="${icon} mr-2"></i>${displayName}`;
            allergenContainer.appendChild(button);
        });
    }

    generateToppingFilters(toppings) {
        const categories = new Set(['all']);
        toppings.forEach(topping => {
            topping.categories.forEach(cat => categories.add(cat));
        });
        
        const categoryContainer = document.getElementById('topping-category-filters');
        categoryContainer.innerHTML = '';
        
        Array.from(categories).forEach((category, index) => {
            const button = document.createElement('button');
            button.className = `filter-btn ${index === 0 ? 'active' : ''}`;
            button.dataset.filter = category;
            
            const displayName = category === 'all' ? 'All Toppings' : 
                category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            
            button.textContent = displayName;
            categoryContainer.appendChild(button);
        });

        const allergens = new Set();
        toppings.forEach(topping => {
            topping.allergens.forEach(allergen => allergens.add(allergen.toLowerCase()));
        });
        
        const allergenContainer = document.getElementById('topping-allergen-filters');
        allergenContainer.innerHTML = '';
        
        Array.from(allergens).forEach(allergen => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.allergen = allergen;
            
            const iconMap = {
                'milk': 'ri-drop-line',
                'egg': 'ri-egg-line',
                'wheat': 'ri-plant-line',
                'soy': 'ri-seedling-line',
                'peanuts': 'ri-plant-line',
                'tree nuts': 'ri-leaf-line'
            };
            
            const icon = iconMap[allergen] || 'ri-alert-line';
            const displayName = allergen.charAt(0).toUpperCase() + allergen.slice(1);
            
            button.innerHTML = `<i class="${icon} mr-2"></i>${displayName}`;
            allergenContainer.appendChild(button);
        });
    }

    renderFlavors() {
        const filteredFlavors = this.getFilteredFlavors();
        const container = document.getElementById('flavors-grid');
        
        if (filteredFlavors.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">🍦</div>
                    <h3 class="text-xl font-medium text-gray-600 mb-2">No flavors found</h3>
                    <p class="text-gray-500">Adjust your filters or select a different location.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        filteredFlavors.forEach(flavor => {
            const card = this.createFlavorCard(flavor);
            container.appendChild(card);
        });
    }

    getFilteredFlavors() {
        return this.state.data.flavors.filter(flavor => {
            if (!flavor.locations.some(loc => loc.toLowerCase() === this.state.activeLocation.toLowerCase())) {
                return false;
            }
            
            if (this.state.filters.flavors.category !== 'all' && !flavor.categories.includes(this.state.filters.flavors.category)) {
                return false;
            }
            
            if (this.state.filters.flavors.allergen && !flavor.allergens.some(allergen => 
                allergen.toLowerCase() === this.state.filters.flavors.allergen
            )) {
                return false;
            }
            
            return true;
        });
    }

    createFlavorCard(flavor) {
        const card = document.createElement('div');
        card.className = 'flavor-card animate-fade-in';
        
        const imageUrl = flavor.image_path 
            ? `${this.config.IMAGE_BASE_URL}${flavor.image_path}`
            : 'assets/images/flavors/placeholder.jpg';
        
        const categoryBadges = flavor.categories.map(cat => 
            `<span class="badge badge-${cat}">${this.formatCategoryName(cat)}</span>`
        ).join('');
        
        card.innerHTML = `
            <div class="overflow-hidden">
                <img class="flavor-image" src="${imageUrl}" alt="${flavor.name}" 
                     onerror="this.src='assets/images/flavors/placeholder.jpg'">
            </div>
            <div class="p-4">
                <h3 class="text-lg font-bold text-gray-800 mb-2">${flavor.name}</h3>
                ${flavor.description ? `<p class="text-gray-600 text-sm mb-3 line-clamp-2">${flavor.description}</p>` : ''}
                <div class="flex flex-wrap gap-2 mb-2">
                    ${categoryBadges}
                </div>
                ${flavor.calories ? `<p class="text-orange-500 font-semibold">${flavor.calories} kcal</p>` : ''}
            </div>
        `;
        
        card.addEventListener('click', () => this.showFlavorModal(flavor));
        return card;
    }

    formatCategoryName(category) {
        return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    renderToppings() {
        const filteredToppings = this.getFilteredToppings();
        const groupedToppings = this.groupToppingsByCategory(filteredToppings);
        const container = document.getElementById('topping-categories');
        
        container.innerHTML = '';
        
        if (Object.keys(groupedToppings).length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">🍓</div>
                    <h3 class="text-xl font-medium text-gray-600 mb-2">No toppings found</h3>
                    <p class="text-gray-500">Try selecting a different location or adjusting filters.</p>
                </div>
            `;
            return;
        }
        
        Object.entries(groupedToppings).forEach(([category, toppings]) => {
            if (category.toLowerCase().includes('cereal')) return;
            
            const section = document.createElement('div');
            section.className = 'bg-white rounded-xl p-6 shadow-sm';
            
            const displayCategory = this.formatCategoryName(category);
            
            section.innerHTML = `
                <h3 class="text-xl font-bold text-gray-800 mb-6">${displayCategory}</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${toppings.map(topping => this.createToppingCard(topping)).join('')}
                </div>
            `;
            
            container.appendChild(section);
        });
    }

    getFilteredToppings() {
        return this.state.data.toppings.filter(topping => {
            if (!topping.locations.some(loc => loc.toLowerCase() === this.state.activeLocation.toLowerCase())) {
                return false;
            }
            
            if (this.state.filters.toppings.category !== 'all' && !topping.categories.includes(this.state.filters.toppings.category)) {
                return false;
            }
            
            if (this.state.filters.toppings.allergen && !topping.allergens.some(allergen => 
                allergen.toLowerCase() === this.state.filters.toppings.allergen
            )) {
                return false;
            }
            
            return true;
        });
    }

    getLocationToppings() {
        return this.state.data.toppings.filter(topping => 
            topping.locations.some(loc => loc.toLowerCase() === this.state.activeLocation.toLowerCase())
        );
    }

    groupToppingsByCategory(toppings) {
        const grouped = {};
        
        toppings.forEach(topping => {
            topping.categories.forEach(category => {
                if (category.toLowerCase().includes('cereal')) return;
                
                if (!grouped[category]) grouped[category] = [];
                grouped[category].push(topping);
            });
        });
        
        return grouped;
    }

    createToppingCard(topping) {
        const imageUrl = topping.image_path 
            ? `${this.config.IMAGE_BASE_URL}${topping.image_path}`
            : 'assets/images/toppings/placeholder.jpg';
        
        const categoryBadges = topping.categories.map(cat => 
            `<span class="badge badge-${cat}">${this.formatCategoryName(cat)}</span>`
        ).join('');
        
        return `
            <div class="topping-card animate-fade-in" onclick="window.menuSystem.showToppingModal(${JSON.stringify(topping).replace(/"/g, '&quot;')})">
                <div class="overflow-hidden">
                    <img class="topping-image" src="${imageUrl}" alt="${topping.name}" 
                         onerror="this.src='assets/images/toppings/placeholder.jpg'">
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-2">${topping.name}</h3>
                    ${topping.description ? `<p class="text-gray-600 text-sm mb-3 line-clamp-2">${topping.description}</p>` : ''}
                    <div class="flex flex-wrap gap-2 mb-2">
                        ${categoryBadges}
                    </div>
                </div>
            </div>
        `;
    }

    showFlavorModal(flavor) {
        const modal = document.getElementById('flavor-modal');
        
        document.getElementById('modal-title').textContent = flavor.name;
        document.getElementById('modal-description').textContent = flavor.description || 'Delicious frozen yogurt';
        
        const imageUrl = flavor.image_path 
            ? `${this.config.IMAGE_BASE_URL}${flavor.image_path}`
            : 'assets/images/flavors/placeholder.jpg';
        
        const modalImage = document.getElementById('modal-image');
        modalImage.src = imageUrl;
        modalImage.alt = flavor.name;
        
        const categoryBadges = flavor.categories.map(cat => 
            `<span class="badge badge-${cat}">${this.formatCategoryName(cat)}</span>`
        ).join('');
        document.getElementById('modal-categories').innerHTML = categoryBadges;
        
        const certIcons = flavor.certifications.map(cert => {
            const file = this.certMap[cert];
            return file ? `<img src="${this.config.CERT_BASE_URL}${file}" alt="${cert}" class="cert-icon w-12 h-12 sm:w-16 sm:h-16 object-contain" title="${cert}">` : '';
        }).filter(Boolean).join('');
        document.getElementById('modal-certifications').innerHTML = certIcons;
        
        const nutrition = flavor.nutrition || {};
        const nutritionGrid = document.querySelector('#modal-nutrition .grid');
        nutritionGrid.innerHTML = Object.entries(nutrition).map(([key, value]) => 
            value ? `<div><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</div>` : ''
        ).filter(Boolean).join('') || 'Nutrition information not available';
        
        const allergenElement = document.querySelector('#modal-allergens p');
        if (flavor.allergens.length > 0) {
            allergenElement.innerHTML = `<span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Contains: ${flavor.allergens.join(', ')}</span>`;
        } else {
            allergenElement.innerHTML = `<span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">No allergens</span>`;
        }
        
        document.querySelector('#modal-ingredients p').textContent = flavor.ingredients && flavor.ingredients.length > 0 
            ? flavor.ingredients.join(', ')
            : 'Ingredient list not available';
        
        document.querySelector('#modal-pairings p').textContent = flavor.pairing_suggestions && flavor.pairing_suggestions.length > 0 
            ? flavor.pairing_suggestions.join(', ')
            : 'Try with any of our delicious toppings!';
        
        modal.classList.remove('hidden');
    }

    showToppingModal(topping) {
        const modal = document.getElementById('topping-modal');
        
        document.getElementById('topping-modal-title').textContent = topping.name;
        document.getElementById('topping-modal-description').textContent = topping.description || 'Delicious topping for your frozen yogurt';
        
        const imageUrl = topping.image_path 
            ? `${this.config.IMAGE_BASE_URL}${topping.image_path}`
            : 'assets/images/toppings/placeholder.jpg';
        
        const modalImage = document.getElementById('topping-modal-image');
        modalImage.src = imageUrl;
        modalImage.alt = topping.name;
        modalImage.onerror = function() { 
            this.src = 'assets/images/toppings/placeholder.jpg'; 
        };
        
        const categoryBadges = topping.categories.map(cat => 
            `<span class="badge badge-${cat}">${this.formatCategoryName(cat)}</span>`
        ).join('');
        document.getElementById('topping-modal-categories').innerHTML = categoryBadges;
        
        const certIcons = topping.certifications.map(cert => {
            const file = this.certMap[cert];
            return file ? `<img src="${this.config.CERT_BASE_URL}${file}" alt="${cert}" class="cert-icon w-12 h-12 sm:w-16 sm:h-16 object-contain" title="${cert}">` : '';
        }).filter(Boolean).join('');
        document.getElementById('topping-modal-certifications').innerHTML = certIcons;
        
        const allergenElement = document.querySelector('#topping-modal-allergens p');
        if (topping.allergens.length > 0) {
            allergenElement.innerHTML = `<span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Contains: ${topping.allergens.join(', ')}</span>`;
        } else {
            allergenElement.innerHTML = `<span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">No allergens</span>`;
        }
        
        document.querySelector('#topping-modal-locations p').textContent = topping.locations.length > 0 
            ? `Available at: ${topping.locations.map(loc => this.formatLocationName(loc)).join(', ')}`
            : 'Location information not available';
        
        modal.classList.remove('hidden');
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.location-tab')) {
                const location = e.target.closest('.location-tab').dataset.location;
                this.switchLocation(location);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('.menu-tab')) {
                const tab = e.target.closest('.menu-tab').dataset.tab;
                this.switchTab(tab);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('#flavor-category-filters .filter-btn')) {
                const filter = e.target.closest('.filter-btn').dataset.filter;
                this.setFlavorCategoryFilter(filter);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('#flavor-allergen-filters .filter-btn')) {
                const allergen = e.target.closest('.filter-btn').dataset.allergen;
                this.toggleFlavorAllergenFilter(allergen);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('#topping-category-filters .filter-btn')) {
                const filter = e.target.closest('.filter-btn').dataset.filter;
                this.setToppingCategoryFilter(filter);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('#topping-allergen-filters .filter-btn')) {
                const allergen = e.target.closest('.filter-btn').dataset.allergen;
                this.toggleToppingAllergenFilter(allergen);
            }
        });
        
        document.getElementById('close-flavor-modal')?.addEventListener('click', () => {
            document.getElementById('flavor-modal').classList.add('hidden');
        });
        
        document.getElementById('close-topping-modal')?.addEventListener('click', () => {
            document.getElementById('topping-modal').classList.add('hidden');
        });
        
        document.getElementById('flavor-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'flavor-modal') {
                document.getElementById('flavor-modal').classList.add('hidden');
            }
        });
        
        document.getElementById('topping-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'topping-modal') {
                document.getElementById('topping-modal').classList.add('hidden');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('flavor-modal').classList.add('hidden');
                document.getElementById('topping-modal').classList.add('hidden');
            }
        });
    }

    switchLocation(location) {
        this.state.activeLocation = location;
        this.updateLocationTabs();
        this.resetFilters();
        this.renderFlavors();
        this.renderToppings();
    }

    updateLocationTabs() {
        document.querySelectorAll('.location-tab').forEach(tab => {
            const isActive = tab.dataset.location === this.state.activeLocation;
            tab.className = `location-tab flex-1 py-3 px-4 rounded-full font-medium transition-all duration-200 ${
                isActive ? 'text-white bg-orange-500' : 'text-gray-700'
            }`;
        });
    }

    switchTab(tab) {
        this.state.activeTab = tab;
        
        document.querySelectorAll('.menu-tab').forEach(tabBtn => {
            const isActive = tabBtn.dataset.tab === tab;
            tabBtn.className = `menu-tab flex-1 py-3 px-4 rounded-full font-medium transition-all duration-200 ${
                isActive ? 'text-white bg-orange-500' : 'text-gray-700'
            }`;
        });
        
        document.querySelectorAll('.menu-content').forEach(content => {
            content.classList.toggle('hidden', !content.id.includes(tab));
        });
    }

    setFlavorCategoryFilter(category) {
        this.state.filters.flavors.category = category;
        
        document.querySelectorAll('#flavor-category-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
        
        this.renderFlavors();
    }

    toggleFlavorAllergenFilter(allergen) {
        const isActive = this.state.filters.flavors.allergen === allergen;
        this.state.filters.flavors.allergen = isActive ? null : allergen;
        
        document.querySelectorAll('#flavor-allergen-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.allergen === allergen && !isActive);
        });
        
        this.renderFlavors();
    }

    setToppingCategoryFilter(category) {
        this.state.filters.toppings.category = category;
        
        document.querySelectorAll('#topping-category-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
        
        this.renderToppings();
    }

    toggleToppingAllergenFilter(allergen) {
        const isActive = this.state.filters.toppings.allergen === allergen;
        this.state.filters.toppings.allergen = isActive ? null : allergen;
        
        document.querySelectorAll('#topping-allergen-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.allergen === allergen && !isActive);
        });
        
        this.renderToppings();
    }

    resetFilters() {
        this.state.filters = {
            flavors: { category: 'all', allergen: null },
            toppings: { category: 'all', allergen: null }
        };
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'all');
        });
    }

    showError(message) {
        const container = document.getElementById('flavors-grid');
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 class="text-xl font-medium text-red-600 mb-2">Error</h3>
                <p class="text-red-500">${message}</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.menuSystem = new DynamicMenuSystem();
    setTimeout(() => window.menuSystem.init(), 1000);
});