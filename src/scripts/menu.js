export class DynamicMenuSystem {
    constructor() {
        this.config = {
            API_BASE_URL: 'https://get-yo-web-app.vercel.app/api/public',
            IMAGE_BASE_URL: 'https://irbbgsekymaxpvtdncpd.supabase.co/storage/v1/object/public/images/',
            CERT_BASE_URL: '/assets/images/cert/',
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
            'kosher': 'kosher-logo.webp',
            'gluten-free': 'gluten-free_cert.webp',
            'kof-k-dairy': 'kof-k-dairy_cert.webp',
            'ok-dairy': 'ok-dairy-kosher_cert.webp',
            'orthodox-union-dairy': 'orthodox-union-dairy-kosher_cert.webp',
            'orthodox-union': 'orthodox-union-kosher_cert.webp',
            'star-d': 'star-d-kosher_cert.webp'
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
            flavor.locations.forEach(loc => {
                if (loc) locationSet.add(loc.toLowerCase().trim());
            });
        });

        data.toppings.forEach(topping => {
            topping.locations.forEach(loc => {
                if (loc) locationSet.add(loc.toLowerCase().trim());
            });
        });

        return Array.from(locationSet);
    }

    formatLocationName(location) {
        const locationMap = {
            'marlboro': 'Marlboro',
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
            button.className = `location-tab flex-1 py-3 px-4 rounded-full font-medium transition-all duration-200 ${index === 0 ? 'active' : ''
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
                    category === 'no-sugar' ? 'No Sugar Added' :
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
            ? `${this.config.IMAGE_BASE_URL}${flavor.image_path}?width=300&quality=60&format=webp`
            : 'data:image/png;base64,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';

        const categoryBadges = flavor.categories.map(cat =>
            `<span class="badge badge-${cat}">${this.formatCategoryName(cat)}</span>`
        ).join('');

        card.innerHTML = `
            <div class="overflow-hidden relative">
                <img class="flavor-image ${isOutOfStock ? 'grayscale' : ''}" 
                     src="${imageUrl}" alt="${flavor.name}" 
                     loading="lazy" decoding="async"
                     onerror="this.src='data:image/png;base64,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'"
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
                ${flavor.calories ? `<p class="font-semibold ${isOutOfStock ? 'text-slate-400' : 'text-orange-700'}">${flavor.calories} kcal</p>` : ''}
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
        // Handle special case for no-sugar -> No Sugar Added
        if (category === 'no-sugar') {
            return 'No Sugar Added';
        }
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
            ? `${this.config.IMAGE_BASE_URL}${topping.image_path}?width=200&quality=60&format=webp`
            : '/assets/images/logo.webp';

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
                         loading="lazy" decoding="async"
                         onerror="this.src='/assets/images/logo.webp'"
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

        // Hide header and prevent body scroll
        const header = document.querySelector('header');
        if (header) header.style.display = 'none';
        document.body.style.overflow = 'hidden';

        const titleElement = document.getElementById('modal-title');
        const descriptionElement = document.getElementById('modal-description');
        const imageElement = document.getElementById('modal-image');
        const categoriesElement = document.getElementById('modal-categories');
        const certificationsElement = document.getElementById('modal-certifications');

        if (titleElement) titleElement.textContent = flavor.name;
        if (descriptionElement) descriptionElement.textContent = flavor.description || 'Delicious frozen yogurt';

        const imageUrl = flavor.image_path
            ? `${this.config.IMAGE_BASE_URL}${flavor.image_path}?width=600&quality=60&format=webp`
            : 'data:image/png;base64,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';

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
            return file ? `<img src="${this.config.CERT_BASE_URL}${file}" alt="${cert}" class="cert-icon w-12 h-12 sm:w-16 sm:h-16 object-contain" title="${cert}" loading="lazy" decoding="async">` : '';
        }).filter(Boolean).join('');
        if (certificationsElement) certificationsElement.innerHTML = certIcons;

        // Nutrition section with visual nutrition label - mobile first
        const nutritionSection = document.getElementById('modal-nutrition');
        if (nutritionSection) {
            if (flavor.nutrition_image_path) {
                const nutritionImageUrl = `${this.config.IMAGE_BASE_URL}${flavor.nutrition_image_path}?width=600&quality=85&format=webp`;
                nutritionSection.innerHTML = `
                    <div class="text-center relative min-h-[100px] flex flex-col items-center justify-center">
                        <div id="nutrition-spinner" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10 transition-opacity">
                            <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                        <img src="${nutritionImageUrl}" 
                             alt="Nutrition Facts for ${flavor.name}" 
                             loading="lazy" decoding="async"
                             class="w-full max-w-xs mx-auto cursor-pointer hover:opacity-80 transition-opacity rounded-lg border border-gray-200"
                             onload="document.getElementById('nutrition-spinner')?.classList.add('opacity-0'); setTimeout(()=>document.getElementById('nutrition-spinner')?.remove(), 300)"
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
                                <div class="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4 border-2 border-green-300 shadow-sm">
                                    <div class="flex flex-wrap gap-2">
                                        ${standardCultures.map(culture =>
                        `<span class="bg-gradient-to-br from-green-200 to-green-300 text-green-900 px-3 py-2 rounded-full text-sm font-medium border border-green-400 shadow-sm">
                                                ${culture}
                                            </span>`
                    ).join('')}
                                    </div>
                                    <p class="text-green-800 text-xs mt-2 font-medium">
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

        modal.classList.remove('hidden');
    }

    hideFlavorModal() {
        const modal = document.getElementById('flavor-modal');
        if (modal) modal.classList.add('hidden');
        const header = document.querySelector('header');
        if (header) header.style.display = '';
        document.body.style.overflow = '';
    }

    showNutritionModal(imageUrl, flavorName) {
        let nutritionModal = document.getElementById('nutrition-modal');
        if (!nutritionModal) {
            nutritionModal = document.createElement('div');
            nutritionModal.id = 'nutrition-modal';
            nutritionModal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center hidden p-2';
            nutritionModal.style.zIndex = '200';
            nutritionModal.innerHTML = `
                <div class="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center">
                    <button id="close-nutrition-modal" class="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center z-10 shadow-xl border-2 border-white transition-all">
                        <i class="ri-close-line text-lg font-bold"></i>
                    </button>
                    <img id="nutrition-modal-image" class="max-w-full max-h-full object-contain" alt="Nutrition Facts" style="background-color: white; border-radius: 8px;">
                </div>
            `;
            document.body.appendChild(nutritionModal);
        }

        document.getElementById('nutrition-modal-image').src = imageUrl;
        document.getElementById('nutrition-modal-image').alt = `Nutrition Facts for ${flavorName}`;
        nutritionModal.classList.remove('hidden');

        // Hide header and prevent body scroll
        const header = document.querySelector('header');
        if (header) header.style.display = 'none';
        document.body.style.overflow = 'hidden';

        // Re-enable scroll and show header when modal closes
        const closeModal = () => {
            nutritionModal.classList.add('hidden');
            const header = document.querySelector('header');
            if (header) header.style.display = '';
            document.body.style.overflow = '';
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

        // Hide header and prevent body scroll
        const header = document.querySelector('header');
        if (header) header.style.display = 'none';
        document.body.style.overflow = 'hidden';

        const titleElement = document.getElementById('topping-modal-title');
        const descriptionElement = document.getElementById('topping-modal-description');
        const imageElement = document.getElementById('topping-modal-image');
        const categoriesElement = document.getElementById('topping-modal-categories');
        const certificationsElement = document.getElementById('topping-modal-certifications');

        if (titleElement) titleElement.textContent = topping.name;
        if (descriptionElement) descriptionElement.textContent = topping.description || 'Delicious topping for your frozen yogurt';

        const imageUrl = topping.image_path
            ? `${this.config.IMAGE_BASE_URL}${topping.image_path}?width=600&quality=80&format=webp`
            : '/assets/images/logo.webp';

        if (imageElement) {
            imageElement.src = imageUrl;
            imageElement.alt = topping.name;
            imageElement.onerror = function () {
                this.src = '/assets/images/logo.webp';
            };
        }

        const categoryBadges = topping.categories.map(cat =>
            `<span class="badge badge-${cat}">${this.formatCategoryName(cat)}</span>`
        ).join('');
        if (categoriesElement) categoriesElement.innerHTML = categoryBadges;

        const certIcons = topping.certifications.map(cert => {
            const file = this.certMap[cert];
            return file ? `<img src="${this.config.CERT_BASE_URL}${file}" alt="${cert}" class="cert-icon w-12 h-12 sm:w-16 sm:h-16 object-contain" title="${cert}" loading="lazy" decoding="async">` : '';
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

    hideToppingModal() {
        const modal = document.getElementById('topping-modal');
        if (modal) modal.classList.add('hidden');
        const header = document.querySelector('header');
        if (header) header.style.display = '';
        document.body.style.overflow = '';
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
            closeFlavorModal.addEventListener('click', () => this.hideFlavorModal());
        }

        const closeToppingModal = document.getElementById('close-topping-modal');
        if (closeToppingModal) {
            closeToppingModal.addEventListener('click', () => this.hideToppingModal());
        }

        // Click outside modal to close
        const flavorModal = document.getElementById('flavor-modal');
        if (flavorModal) {
            flavorModal.addEventListener('click', (e) => {
                if (e.target.id === 'flavor-modal') this.hideFlavorModal();
            });
        }

        const toppingModal = document.getElementById('topping-modal');
        if (toppingModal) {
            toppingModal.addEventListener('click', (e) => {
                if (e.target.id === 'topping-modal') this.hideToppingModal();
            });
        }

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideFlavorModal();
                this.hideToppingModal();
                const nutritionModal = document.getElementById('nutrition-modal');
                if (nutritionModal && !nutritionModal.classList.contains('hidden')) {
                    nutritionModal.classList.add('hidden');
                    const header = document.querySelector('header');
                    if (header) header.style.display = '';
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
            tab.className = `location-tab flex-1 py-3 px-4 rounded-full font-medium transition-all duration-300 ${isActive
                    ? 'active'
                    : ''
                }`;
        });
    }

    switchTab(tab) {
        this.state.activeTab = tab;

        document.querySelectorAll('.menu-tab').forEach(tabBtn => {
            const isActive = tabBtn.dataset.tab === tab;
            tabBtn.className = `menu-tab flex-1 py-3 px-4 rounded-full font-medium transition-all duration-200 ${isActive ? 'active' : ''
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