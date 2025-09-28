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
                    allergens: []
                },
                toppings: {
                    category: 'all',
                    allergens: []
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
        
        return location.charAt(0).toUpperCase() + location.slice(1);
    }

    generateLocationTabs(locations) {
        const container = document.getElementById('location-tabs');
        if (!container) return;
        
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
        // Category filters (single selection)
        const categories = new Set(['all']);
        flavors.forEach(flavor => {
            flavor.categories.forEach(cat => categories.add(cat));
        });
        
        const categoryContainer = document.getElementById('flavor-category-filters');
        if (categoryContainer) {
            categoryContainer.innerHTML = '';
            
            Array.from(categories).forEach((category, index) => {
                const button = document.createElement('button');
                button.className = `filter-btn ${index === 0 ? 'active' : ''}`;
                button.dataset.filter = category;
                button.dataset.type = 'category';
                
                const displayName = category === 'all' ? 'All Flavors' : 
                    category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                
                button.textContent = displayName;
                categoryContainer.appendChild(button);
            });
        }

        // Allergen filters (multiple selection)
        const allergens = new Set();
        flavors.forEach(flavor => {
            flavor.allergens.forEach(allergen => allergens.add(allergen.toLowerCase()));
        });
        
        const allergenContainer = document.getElementById('flavor-allergen-filters');
        if (allergenContainer) {
            allergenContainer.innerHTML = '';
            
            Array.from(allergens).forEach(allergen => {
                const button = document.createElement('button');
                button.className = 'filter-btn';
                button.dataset.allergen = allergen;
                button.dataset.type = 'allergen';
                
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
    }

    generateToppingFilters(toppings) {
        // Category filters (single selection)
        const categories = new Set(['all']);
        toppings.forEach(topping => {
            topping.categories.forEach(cat => categories.add(cat));
        });
        
        const categoryContainer = document.getElementById('topping-category-filters');
        if (categoryContainer) {
            categoryContainer.innerHTML = '';
            
            Array.from(categories).forEach((category, index) => {
                const button = document.createElement('button');
                button.className = `filter-btn ${index === 0 ? 'active' : ''}`;
                button.dataset.filter = category;
                button.dataset.type = 'category';
                
                const displayName = category === 'all' ? 'All Toppings' : 
                    category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                
                button.textContent = displayName;
                categoryContainer.appendChild(button);
            });
        }

        // Allergen filters (multiple selection)
        const allergens = new Set();
        toppings.forEach(topping => {
            topping.allergens.forEach(allergen => allergens.add(allergen.toLowerCase()));
        });
        
        const allergenContainer = document.getElementById('topping-allergen-filters');
        if (allergenContainer) {
            allergenContainer.innerHTML = '';
            
            Array.from(allergens).forEach(allergen => {
                const button = document.createElement('button');
                button.className = 'filter-btn';
                button.dataset.allergen = allergen;
                button.dataset.type = 'allergen';
                
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
    }

    renderFlavors() {
        const filteredFlavors = this.getFilteredFlavors();
        const container = document.getElementById('flavors-grid');
        if (!container) return;
        
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
            
            if (this.state.filters.flavors.allergens.length > 0) {
                const hasAllSelectedAllergens = this.state.filters.flavors.allergens.every(selectedAllergen =>
                    flavor.allergens.some(allergen => allergen.toLowerCase() === selectedAllergen)
                );
                if (!hasAllSelectedAllergens) {
                    return false;
                }
            }
            
            return true;
        });
    }

    isFlavorOutOfStock(flavor) {
        if (flavor.stockInfo) {
            const locationSlug = this.state.activeLocation.toLowerCase();
            const stockData = flavor.stockInfo[locationSlug];
            
            if (stockData && stockData.stock_status === 'out_of_stock') {
                return true;
            }
        }
        
        return !flavor.available;
    }

    createFlavorCard(flavor) {
        const card = document.createElement('div');
        const isOutOfStock = this.isFlavorOutOfStock(flavor);
        
        card.className = `flavor-card animate-fade-in ${isOutOfStock ? 'out-of-stock opacity-75' : ''}`;
        
        const imageUrl = flavor.image_path 
            ? `${this.config.IMAGE_BASE_URL}${flavor.image_path}`
            : 'assets/images/flavors/placeholder.jpg';
        
        const categoryBadges = flavor.categories.map(cat => 
            `<span class="badge badge-${cat}">${this.formatCategoryName(cat)}</span>`
        ).join('');
        
        card.innerHTML = `
            <div class="overflow-hidden relative">
                <img class="flavor-image ${isOutOfStock ? 'grayscale' : ''}" 
                     src="${imageUrl}" alt="${flavor.name}" 
                     onerror="this.src='assets/images/flavors/placeholder.jpg'"
                     style="width: 100%; height: 200px; object-fit: contain; background-color: white;">
                ${isOutOfStock ? `
                    <div class="absolute inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-20">
                        <div class="text-center space-y-2">
                            <div class="bg-red-500 text-white px-6 py-3 rounded-2xl text-base font-bold shadow-2xl border border-red-300">
                                Out of stock for today
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="p-4">
                <h3 class="text-lg font-bold mb-2 ${isOutOfStock ? 'text-slate-500' : 'text-gray-800'}">${flavor.name}</h3>
                ${flavor.description ? `<p class="text-sm mb-3 line-clamp-2 ${isOutOfStock ? 'text-slate-400' : 'text-gray-600'}">${flavor.description}</p>` : ''}
                <div class="flex flex-wrap gap-2 mb-2">
                    ${categoryBadges}
                </div>
                ${flavor.calories ? `<p class="font-semibold ${isOutOfStock ? 'text-slate-400' : 'text-orange-500'}">${flavor.calories} kcal</p>` : ''}
            </div>
        `;
        
        if (!isOutOfStock) {
            card.addEventListener('click', () => this.showFlavorModal(flavor));
            card.style.cursor = 'pointer';
        } else {
            card.style.cursor = 'not-allowed';
        }
        
        return card;
    }

    formatCategoryName(category) {
        return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    renderToppings() {
        const filteredToppings = this.getFilteredToppings();
        const groupedToppings = this.groupToppingsByCategory(filteredToppings);
        const container = document.getElementById('topping-categories');
        if (!container) return;
        
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
            
            if (this.state.filters.toppings.allergens.length > 0) {
                const hasAllSelectedAllergens = this.state.filters.toppings.allergens.every(selectedAllergen =>
                    topping.allergens.some(allergen => allergen.toLowerCase() === selectedAllergen)
                );
                if (!hasAllSelectedAllergens) {
                    return false;
                }
            }
            
            return true;
        });
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
        const isOutOfStock = !topping.available;
        
        const imageUrl = topping.image_path 
            ? `${this.config.IMAGE_BASE_URL}${topping.image_path}`
            : 'assets/images/toppings/placeholder.jpg';
        
        const categoryBadges = topping.categories.map(cat => 
            `<span class="badge badge-${cat}">${this.formatCategoryName(cat)}</span>`
        ).join('');
        
        const clickHandler = isOutOfStock ? '' : `onclick="window.menuSystem.showToppingModal(${JSON.stringify(topping).replace(/"/g, '&quot;')})"`;
        const cardClass = `topping-card animate-fade-in ${isOutOfStock ? 'out-of-stock opacity-75' : ''}`;
        const cursorStyle = isOutOfStock ? 'cursor: not-allowed;' : 'cursor: pointer;';
        
        return `
            <div class="${cardClass}" ${clickHandler} style="${cursorStyle}">
                <div class="overflow-hidden relative">
                    <img class="topping-image ${isOutOfStock ? 'grayscale' : ''}" 
                         src="${imageUrl}" alt="${topping.name}" 
                         onerror="this.src='assets/images/toppings/placeholder.jpg'"
                         style="width: 100%; height: 150px; object-fit: contain; background-color: white;">
                    ${isOutOfStock ? `
                        <div class="absolute inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-20">
                            <div class="text-center space-y-2">
                                <div class="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-2xl border border-red-300">
                                    Out of stock for today
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold mb-2 ${isOutOfStock ? 'text-slate-500' : 'text-gray-800'}">${topping.name}</h3>
                    <div class="flex flex-wrap gap-2 mb-2">
                        ${categoryBadges}
                    </div>
                </div>
            </div>
        `;
    }

    showFlavorModal(flavor) {
        if (this.isFlavorOutOfStock(flavor)) {
            return;
        }
        
        const modal = document.getElementById('flavor-modal');
        if (!modal) return;
        
        const titleElement = document.getElementById('modal-title');
        const descriptionElement = document.getElementById('modal-description');
        const imageElement = document.getElementById('modal-image');
        const categoriesElement = document.getElementById('modal-categories');
        const certificationsElement = document.getElementById('modal-certifications');
        
        if (titleElement) titleElement.textContent = flavor.name;
        if (descriptionElement) descriptionElement.textContent = flavor.description || 'Delicious frozen yogurt';
        
        const imageUrl = flavor.image_path 
            ? `${this.config.IMAGE_BASE_URL}${flavor.image_path}`
            : 'assets/images/flavors/placeholder.jpg';
        
        if (imageElement) {
            imageElement.src = imageUrl;
            imageElement.alt = flavor.name;
        }
        
        const categoryBadges = flavor.categories.map(cat => 
            `<span class="badge badge-${cat}">${this.formatCategoryName(cat)}</span>`
        ).join('');
        if (categoriesElement) categoriesElement.innerHTML = categoryBadges;
        
        const certIcons = flavor.certifications.map(cert => {
            const file = this.certMap[cert];
            return file ? `<img src="${this.config.CERT_BASE_URL}${file}" alt="${cert}" class="cert-icon w-12 h-12 sm:w-16 sm:h-16 object-contain" title="${cert}">` : '';
        }).filter(Boolean).join('');
        if (certificationsElement) certificationsElement.innerHTML = certIcons;
        
        // Nutrition section with visual nutrition label - mobile first
        const nutritionSection = document.getElementById('modal-nutrition');
        if (nutritionSection) {
            if (flavor.nutrition_image_path) {
                const nutritionImageUrl = `${this.config.IMAGE_BASE_URL}${flavor.nutrition_image_path}`;
                nutritionSection.innerHTML = `
                    <div class="text-center">
                        <img src="${nutritionImageUrl}" 
                             alt="Nutrition Facts for ${flavor.name}" 
                             class="w-full max-w-xs mx-auto cursor-pointer hover:opacity-80 transition-opacity rounded-lg border border-gray-200"
                             onclick="window.menuSystem.showNutritionModal('${nutritionImageUrl}', '${flavor.name}')"
                             onerror="this.parentElement.parentElement.style.display='none'"
                             style="object-fit: contain; background-color: white; max-height: 300px;">
                        <p class="text-xs text-gray-500 mt-2">Tap to view full nutrition facts</p>
                    </div>
                `;
                nutritionSection.style.display = 'block';
            } else {
                nutritionSection.style.display = 'none';
            }
        }
        
        // Live Cultures & Health Benefits section - mobile optimized
        const benefitsSection = document.getElementById('modal-benefits');
        if (benefitsSection) {
            if (flavor.nutritional_benefits && flavor.nutritional_benefits.length > 0) {
                const benefitsList = flavor.nutritional_benefits.map(benefit => 
                    `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 mb-1">
                        <i class="ri-check-line mr-1"></i>${benefit}
                    </span>`
                ).join('');
                
                benefitsSection.innerHTML = `
                    <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                        <h4 class="font-semibold text-green-800 mb-2 flex items-center text-sm">
                            <i class="ri-heart-pulse-line mr-2"></i>Live Cultures & Health Benefits
                        </h4>
                        <div class="flex flex-wrap gap-1">
                            ${benefitsList}
                        </div>
                    </div>
                `;
                benefitsSection.style.display = 'block';
            } else {
                benefitsSection.style.display = 'none';
            }
        }
        
        const allergenElement = document.querySelector('#modal-allergens p');
        if (allergenElement) {
            if (flavor.allergens.length > 0) {
                allergenElement.innerHTML = `<span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Contains: ${flavor.allergens.join(', ')}</span>`;
            } else {
                allergenElement.innerHTML = `<span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">No allergens</span>`;
            }
        }
        
        const ingredientsElement = document.querySelector('#modal-ingredients');
        if (ingredientsElement) {
            if (flavor.ingredients && flavor.ingredients.length > 0) {
                // Check for yogurt cultures
                const hasYogurtCultures = flavor.ingredients.some(ingredient =>
                    ingredient.toLowerCase().includes('active yogurt cultures') ||
                    ingredient.toLowerCase().includes('yogurt cultures') ||
                    ingredient.toLowerCase().includes('live cultures')
                );

                let ingredientsHTML = '';

                if (hasYogurtCultures) {
                    const standardCultures = [
                        'S. Thermophilus',
                        'L. Bulgaricus', 
                        'L. Acidophilus',
                        'B. Bifidus',
                        'L. Casei'
                    ];

                    ingredientsHTML += `
                        <div class="space-y-4">
                            <div>
                                <h4 class="text-sm font-medium text-slate-700 mb-3">Active Yogurt Cultures:</h4>
                                <div class="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl p-4 border-2 border-orange-300 shadow-sm">
                                    <div class="flex flex-wrap gap-2">
                                        ${standardCultures.map(culture => 
                                            `<span class="bg-gradient-to-br from-orange-200 to-orange-300 text-orange-900 px-3 py-2 rounded-full text-sm font-medium border border-orange-400 shadow-sm">
                                                ${culture}
                                            </span>`
                                        ).join('')}
                                    </div>
                                    <p class="text-orange-800 text-xs mt-2 font-medium">
                                        These beneficial probiotics support digestive health
                                    </p>
                                </div>
                            </div>
                    `;

                    // Other ingredients
                    const otherIngredients = flavor.ingredients.filter(ingredient =>
                        !ingredient.toLowerCase().includes('active yogurt cultures') &&
                        !ingredient.toLowerCase().includes('yogurt cultures') &&
                        !ingredient.toLowerCase().includes('live cultures')
                    );

                    if (otherIngredients.length > 0) {
                        ingredientsHTML += `
                            <div>
                                <h4 class="text-sm font-medium text-slate-700 mb-3">Other Ingredients:</h4>
                                <p class="text-slate-600 leading-relaxed text-sm">
                                    ${otherIngredients.join(', ')}
                                </p>
                            </div>
                        `;
                    }

                    ingredientsHTML += '</div>';
                } else {
                    // No yogurt cultures, just show ingredients normally
                    ingredientsHTML = `<p class="text-slate-600 leading-relaxed text-sm">${flavor.ingredients.join(', ')}</p>`;
                }

                ingredientsElement.innerHTML = ingredientsHTML;
            } else {
                ingredientsElement.innerHTML = '<p class="text-slate-600 text-sm">Ingredient list not available</p>';
            }
        }
        
        const pairingsElement = document.querySelector('#modal-pairings p');
        if (pairingsElement) {
            pairingsElement.textContent = flavor.pairing_suggestions && flavor.pairing_suggestions.length > 0 
                ? flavor.pairing_suggestions.join(', ')
                : 'Try with any of our delicious toppings!';
        }
        
        modal.classList.remove('hidden');
    }

    showNutritionModal(imageUrl, flavorName) {
        let nutritionModal = document.getElementById('nutrition-modal');
        if (!nutritionModal) {
            nutritionModal = document.createElement('div');
            nutritionModal.id = 'nutrition-modal';
            nutritionModal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 hidden p-2';
            nutritionModal.innerHTML = `
                <div class="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center">
                    <button id="close-nutrition-modal" class="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 shadow-xl border-2 border-white transition-all">
                        <i class="ri-close-line text-lg font-bold"></i>
                    </button>
                    <img id="nutrition-modal-image" class="max-w-full max-h-full object-contain" alt="Nutrition Facts" style="background-color: white; border-radius: 8px;">
                </div>
            `;
            document.body.appendChild(nutritionModal);
            
            document.getElementById('close-nutrition-modal').addEventListener('click', () => {
                nutritionModal.classList.add('hidden');
            });
            
            nutritionModal.addEventListener('click', (e) => {
                if (e.target === nutritionModal) {
                    nutritionModal.classList.add('hidden');
                }
            });
        }
        
        document.getElementById('nutrition-modal-image').src = imageUrl;
        document.getElementById('nutrition-modal-image').alt = `Nutrition Facts for ${flavorName}`;
        nutritionModal.classList.remove('hidden');
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        
        // Re-enable scroll when modal closes
        const closeModal = () => {
            document.body.style.overflow = '';
            nutritionModal.classList.add('hidden');
        };
        
        document.getElementById('close-nutrition-modal').onclick = closeModal;
        nutritionModal.onclick = (e) => {
            if (e.target === nutritionModal) closeModal();
        };
    }

    showToppingModal(topping) {
        if (!topping.available) {
            return;
        }
        
        const modal = document.getElementById('topping-modal');
        if (!modal) return;
        
        const titleElement = document.getElementById('topping-modal-title');
        const descriptionElement = document.getElementById('topping-modal-description');
        const imageElement = document.getElementById('topping-modal-image');
        const categoriesElement = document.getElementById('topping-modal-categories');
        const certificationsElement = document.getElementById('topping-modal-certifications');
        
        if (titleElement) titleElement.textContent = topping.name;
        if (descriptionElement) descriptionElement.textContent = topping.description || 'Delicious topping for your frozen yogurt';
        
        const imageUrl = topping.image_path 
            ? `${this.config.IMAGE_BASE_URL}${topping.image_path}`
            : 'assets/images/toppings/placeholder.jpg';
        
        if (imageElement) {
            imageElement.src = imageUrl;
            imageElement.alt = topping.name;
            imageElement.onerror = function() { 
                this.src = 'assets/images/toppings/placeholder.jpg'; 
            };
        }
        
        const categoryBadges = topping.categories.map(cat => 
            `<span class="badge badge-${cat}">${this.formatCategoryName(cat)}</span>`
        ).join('');
        if (categoriesElement) categoriesElement.innerHTML = categoryBadges;
        
        const certIcons = topping.certifications.map(cert => {
            const file = this.certMap[cert];
            return file ? `<img src="${this.config.CERT_BASE_URL}${file}" alt="${cert}" class="cert-icon w-12 h-12 sm:w-16 sm:h-16 object-contain" title="${cert}">` : '';
        }).filter(Boolean).join('');
        if (certificationsElement) certificationsElement.innerHTML = certIcons;
        
        const allergenElement = document.querySelector('#topping-modal-allergens p');
        if (allergenElement) {
            if (topping.allergens.length > 0) {
                allergenElement.innerHTML = `<span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Contains: ${topping.allergens.join(', ')}</span>`;
            } else {
                allergenElement.innerHTML = `<span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">No allergens</span>`;
            }
        }
        
        const locationsElement = document.querySelector('#topping-modal-locations p');
        if (locationsElement) {
            locationsElement.textContent = topping.locations.length > 0 
                ? `Available at: ${topping.locations.map(loc => this.formatLocationName(loc)).join(', ')}`
                : 'Location information not available';
        }
        
        modal.classList.remove('hidden');
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            // Location tabs
            if (e.target.closest('.location-tab')) {
                const location = e.target.closest('.location-tab').dataset.location;
                this.switchLocation(location);
            }
            
            // Menu tabs
            if (e.target.closest('.menu-tab')) {
                const tab = e.target.closest('.menu-tab').dataset.tab;
                this.switchTab(tab);
            }
            
            // Filter buttons - distinguish between category and allergen
            if (e.target.closest('.filter-btn')) {
                const btn = e.target.closest('.filter-btn');
                const type = btn.dataset.type;
                
                if (type === 'category') {
                    const filter = btn.dataset.filter;
                    if (btn.closest('#flavor-category-filters')) {
                        this.setFlavorCategoryFilter(filter);
                    } else if (btn.closest('#topping-category-filters')) {
                        this.setToppingCategoryFilter(filter);
                    }
                } else if (type === 'allergen') {
                    const allergen = btn.dataset.allergen;
                    if (btn.closest('#flavor-allergen-filters')) {
                        this.toggleFlavorAllergenFilter(allergen);
                    } else if (btn.closest('#topping-allergen-filters')) {
                        this.toggleToppingAllergenFilter(allergen);
                    }
                }
            }
        });
        
        // Modal close events
        const closeFlavorModal = document.getElementById('close-flavor-modal');
        if (closeFlavorModal) {
            closeFlavorModal.addEventListener('click', () => {
                document.getElementById('flavor-modal').classList.add('hidden');
            });
        }
        
        const closeToppingModal = document.getElementById('close-topping-modal');
        if (closeToppingModal) {
            closeToppingModal.addEventListener('click', () => {
                document.getElementById('topping-modal').classList.add('hidden');
            });
        }
        
        // Click outside modal to close
        const flavorModal = document.getElementById('flavor-modal');
        if (flavorModal) {
            flavorModal.addEventListener('click', (e) => {
                if (e.target.id === 'flavor-modal') {
                    flavorModal.classList.add('hidden');
                }
            });
        }
        
        const toppingModal = document.getElementById('topping-modal');
        if (toppingModal) {
            toppingModal.addEventListener('click', (e) => {
                if (e.target.id === 'topping-modal') {
                    toppingModal.classList.add('hidden');
                }
            });
        }
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const flavorModal = document.getElementById('flavor-modal');
                const toppingModal = document.getElementById('topping-modal');
                const nutritionModal = document.getElementById('nutrition-modal');
                
                if (flavorModal) flavorModal.classList.add('hidden');
                if (toppingModal) toppingModal.classList.add('hidden');
                if (nutritionModal) {
                    nutritionModal.classList.add('hidden');
                    document.body.style.overflow = '';
                }
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
        const allergens = this.state.filters.flavors.allergens;
        const index = allergens.indexOf(allergen);
        
        if (index > -1) {
            allergens.splice(index, 1);
        } else {
            allergens.push(allergen);
        }
        
        document.querySelectorAll('#flavor-allergen-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', allergens.includes(btn.dataset.allergen));
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
        const allergens = this.state.filters.toppings.allergens;
        const index = allergens.indexOf(allergen);
        
        if (index > -1) {
            allergens.splice(index, 1);
        } else {
            allergens.push(allergen);
        }
        
        document.querySelectorAll('#topping-allergen-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', allergens.includes(btn.dataset.allergen));
        });
        
        this.renderToppings();
    }

    resetFilters() {
        this.state.filters = {
            flavors: { category: 'all', allergens: [] },
            toppings: { category: 'all', allergens: [] }
        };
        
        // Reset category filters
        document.querySelectorAll('.filter-btn[data-type="category"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'all');
        });
        
        // Reset allergen filters
        document.querySelectorAll('.filter-btn[data-type="allergen"]').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    showError(message) {
        const container = document.getElementById('flavors-grid');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 class="text-xl font-medium text-red-600 mb-2">Error</h3>
                    <p class="text-red-500">${message}</p>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.menuSystem = new DynamicMenuSystem();
    setTimeout(() => window.menuSystem.init(), 1000);
});