class StoreHoursManager {
    constructor() {
        this.config = {
            API_BASE_URL: 'https://getyocafe.com/api/public',
            CACHE_DURATION: 15 * 60 * 1000,
            UPDATE_INTERVAL: 60 * 1000
        };
        
        this.state = {
            hoursData: null,
            cache: null,
            lastUpdate: null
        };
        
        this.updateInterval = null;
    }

    async init() {
        console.log('Initializing Store Hours Manager...');
        
        try {
            await this.loadHoursData();
            this.updateAllDisplays();
            this.startAutoUpdate();
            console.log('Store Hours Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Store Hours Manager:', error);
            this.showError();
        }
    }

    async loadHoursData() {
        if (this.getCachedData()) {
            this.state.hoursData = this.getCachedData();
            console.log('Using cached hours data');
            return;
        }

        try {
            const response = await fetch(`${this.config.API_BASE_URL}/hours`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (!result.success || !result.data) {
                throw new Error(result.message || 'Invalid API response');
            }
            
            this.state.hoursData = result.data;
            this.setCachedData(result.data);
            this.state.lastUpdate = new Date();
            
            console.log('Hours data loaded from API:', this.state.hoursData);
            
        } catch (error) {
            console.error('Failed to load hours from API:', error);
            throw error;
        }
    }

    getCachedData() {
        if (!this.state.cache || Date.now() - this.state.cache.timestamp > this.config.CACHE_DURATION) {
            return null;
        }
        return this.state.cache.data;
    }

    setCachedData(data) {
        this.state.cache = {
            data: data,
            timestamp: Date.now()
        };
    }

    getCurrentEasternTime() {
        const now = new Date();
        return new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    }

    formatTimeDisplay(time24) {
        if (!time24) return '';
        
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    getTimeInMinutes(timeString) {
        if (!timeString) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    getCurrentTimeInMinutes(easternTime) {
        return easternTime.getHours() * 60 + easternTime.getMinutes();
    }

    isHolidayToday(holidays) {
        const today = this.getCurrentEasternTime();
        const todayStr = today.toISOString().split('T')[0];
        
        return holidays.find(holiday => holiday.date === todayStr);
    }

    getStoreStatus(storeSlug) {
        if (!this.state.hoursData || !this.state.hoursData.stores[storeSlug]) {
            return { isOpen: false, hours: 'Hours unavailable', nextOpening: null };
        }

        const store = this.state.hoursData.stores[storeSlug];
        const easternTime = this.getCurrentEasternTime();
        const currentTimeMinutes = this.getCurrentTimeInMinutes(easternTime);
        const dayOfWeek = easternTime.getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = dayNames[dayOfWeek];

        const todayHoliday = this.isHolidayToday(store.holidays);
        if (todayHoliday && todayHoliday.is_closed) {
            return {
                isOpen: false,
                hours: `Closed - ${todayHoliday.name}`,
                nextOpening: this.getNextOpening(storeSlug),
                isHoliday: true,
                holidayName: todayHoliday.name
            };
        }

        const todaySpecialHours = store.special_hours.find(sh => {
            const today = easternTime.toISOString().split('T')[0];
            return sh.date === today;
        });

        let dayHours;
        if (todaySpecialHours) {
            dayHours = todaySpecialHours;
        } else {
            dayHours = store.regular_hours[currentDay];
        }

        if (!dayHours || dayHours.is_closed) {
            return {
                isOpen: false,
                hours: 'Closed',
                nextOpening: this.getNextOpening(storeSlug)
            };
        }

        const openTime = this.getTimeInMinutes(dayHours.open_time);
        const closeTime = this.getTimeInMinutes(dayHours.close_time);
        const isOpen = currentTimeMinutes >= openTime && currentTimeMinutes < closeTime;

        const hoursDisplay = `${this.formatTimeDisplay(dayHours.open_time)} - ${this.formatTimeDisplay(dayHours.close_time)}`;

        return {
            isOpen: isOpen,
            hours: hoursDisplay,
            openTime: openTime,
            closeTime: closeTime,
            nextOpening: isOpen ? null : this.getNextOpening(storeSlug)
        };
    }

    getNextOpening(storeSlug) {
        if (!this.state.hoursData || !this.state.hoursData.stores[storeSlug]) {
            return null;
        }

        const store = this.state.hoursData.stores[storeSlug];
        const easternTime = this.getCurrentEasternTime();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (let i = 0; i <= 7; i++) {
            const checkDate = new Date(easternTime);
            checkDate.setDate(checkDate.getDate() + i);
            
            const checkDay = checkDate.getDay();
            const checkDayName = dayNames[checkDay];
            const checkDateStr = checkDate.toISOString().split('T')[0];

            const holiday = store.holidays.find(h => h.date === checkDateStr);
            if (holiday && holiday.is_closed) {
                continue;
            }

            const specialHours = store.special_hours.find(sh => sh.date === checkDateStr);
            let dayHours;
            
            if (specialHours) {
                dayHours = specialHours;
            } else {
                dayHours = store.regular_hours[checkDayName];
            }

            if (!dayHours || dayHours.is_closed) {
                continue;
            }

            const openTime = this.getTimeInMinutes(dayHours.open_time);
            
            if (i === 0) {
                const currentTimeMinutes = this.getCurrentTimeInMinutes(easternTime);
                if (currentTimeMinutes < openTime) {
                    return {
                        day: 'Today',
                        time: this.formatTimeDisplay(dayHours.open_time)
                    };
                }
            } else {
                return {
                    day: i === 1 ? 'Tomorrow' : dayLabels[checkDay],
                    time: this.formatTimeDisplay(dayHours.open_time)
                };
            }
        }

        return null;
    }

    getWeeklyHours(storeSlug) {
        if (!this.state.hoursData || !this.state.hoursData.stores[storeSlug]) {
            return null;
        }

        const store = this.state.hoursData.stores[storeSlug];
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        return dayNames.map((day, index) => {
            const dayHours = store.regular_hours[day];
            return {
                day: dayLabels[index],
                hours: dayHours && !dayHours.is_closed ? 
                    `${this.formatTimeDisplay(dayHours.open_time)} - ${this.formatTimeDisplay(dayHours.close_time)}` : 
                    'Closed'
            };
        });
    }

    updateCurrentDate() {
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            const easternTime = this.getCurrentEasternTime();
            const options = {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                timeZone: "America/New_York"
            };
            currentDateElement.textContent = easternTime.toLocaleDateString('en-US', options);
        }
    }

    updateStoreDisplay(storeSlug, elementId, includeStatus = true) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const status = this.getStoreStatus(storeSlug);
        
        let displayHtml = status.hours;
        
        if (includeStatus) {
            if (status.isHoliday) {
                displayHtml += ` <span class="text-red-600 font-medium">• ${status.holidayName}</span>`;
            } else if (status.isOpen) {
                displayHtml += ' <span class="text-green-600 font-medium">• Open</span>';
            } else {
                displayHtml += ' <span class="text-red-600 font-medium">• Closed</span>';
            }
        }
        
        element.innerHTML = displayHtml;
    }

    updateLocationHours() {
        const marlboroHoursElement = document.getElementById('marlboro-location-hours');
        const providenceHoursElement = document.getElementById('providence-location-hours');
        
        if (marlboroHoursElement) {
            const weeklyHours = this.getWeeklyHours('marlboro');
            if (weeklyHours) {
                marlboroHoursElement.innerHTML = this.generateWeeklyHoursHTML(weeklyHours);
            }
        }
        
        if (providenceHoursElement) {
            const weeklyHours = this.getWeeklyHours('newprovidence');
            if (weeklyHours) {
                providenceHoursElement.innerHTML = this.generateWeeklyHoursHTML(weeklyHours);
            }
        }
    }

    generateWeeklyHoursHTML(weeklyHours) {
        const groupedHours = this.groupConsecutiveDays(weeklyHours);
        return groupedHours.map(group => `
            <p class="text-gray-700">${group.days}: ${group.hours}</p>
        `).join('');
    }

    groupConsecutiveDays(weeklyHours) {
        const groups = [];
        let currentGroup = null;
        
        weeklyHours.forEach((dayHours, index) => {
            if (!currentGroup || currentGroup.hours !== dayHours.hours) {
                if (currentGroup) {
                    groups.push(currentGroup);
                }
                currentGroup = {
                    days: dayHours.day,
                    hours: dayHours.hours,
                    startIndex: index,
                    endIndex: index
                };
            } else {
                currentGroup.endIndex = index;
                if (currentGroup.startIndex === currentGroup.endIndex - 1) {
                    currentGroup.days = `${weeklyHours[currentGroup.startIndex].day}-${dayHours.day}`;
                } else if (currentGroup.endIndex > currentGroup.startIndex) {
                    currentGroup.days = `${weeklyHours[currentGroup.startIndex].day}-${dayHours.day}`;
                }
            }
        });
        
        if (currentGroup) {
            groups.push(currentGroup);
        }
        
        return groups;
    }

    updateFooterStatus() {
        this.updateFooterStoreStatus('marlboro', 'marlboro-status', 'marlboro-status-text');
        this.updateFooterStoreStatus('newprovidence', 'providence-status', 'providence-status-text');
    }

    updateFooterStoreStatus(storeSlug, statusElementId, textElementId) {
        const statusElement = document.getElementById(statusElementId);
        const textElement = document.getElementById(textElementId);
        
        if (!statusElement || !textElement) return;

        const status = this.getStoreStatus(storeSlug);
        
        if (status.isOpen) {
            statusElement.className = 'px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium';
            textElement.textContent = 'Open';
        } else {
            statusElement.className = 'px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium';
            textElement.textContent = 'Closed';
        }
    }

    updateFooterHours() {
        const marlboroFooterHours = document.getElementById('marlboro-footer-hours');
        const providenceFooterHours = document.getElementById('providence-footer-hours');
        
        if (marlboroFooterHours) {
            const weeklyHours = this.getWeeklyHours('marlboro');
            if (weeklyHours) {
                marlboroFooterHours.innerHTML = this.generateFooterHoursHTML(weeklyHours);
            }
        }
        
        if (providenceFooterHours) {
            const weeklyHours = this.getWeeklyHours('newprovidence');
            if (weeklyHours) {
                providenceFooterHours.innerHTML = this.generateFooterHoursHTML(weeklyHours);
            }
        }
    }

    generateFooterHoursHTML(weeklyHours) {
        const groupedHours = this.groupConsecutiveDays(weeklyHours);
        return `<div class="space-y-3">` + 
            groupedHours.map(group => `
                <div class="flex justify-between items-center py-2 px-4 bg-gray-800/50 rounded-lg">
                    <span class="text-gray-300">${group.days}</span>
                    <span class="text-white font-semibold">${group.hours}</span>
                </div>
            `).join('') + 
            `</div>`;
    }

    updateAllDisplays() {
        console.log('Updating all store hours displays...');
        
        this.updateCurrentDate();
        
        this.updateStoreDisplay('marlboro', 'marlboro-hours');
        this.updateStoreDisplay('newprovidence', 'providence-hours');
        
        this.updateStoreDisplay('marlboro', 'marlboro-hours', false);
        this.updateStoreDisplay('newprovidence', 'providence-hours', false);
        
        this.updateLocationHours();
        this.updateFooterStatus();
        this.updateFooterHours();
        
        this.checkForHolidayBanner();
        
        console.log('All displays updated successfully');
    }

    checkForHolidayBanner() {
        if (!this.state.hoursData) return;

        const easternTime = this.getCurrentEasternTime();
        const todayStr = easternTime.toISOString().split('T')[0];
        
        let holidayInfo = null;
        
        Object.values(this.state.hoursData.stores).forEach(store => {
            const holiday = store.holidays.find(h => h.date === todayStr);
            if (holiday && holiday.is_closed) {
                holidayInfo = holiday;
            }
        });

        const existingBanner = document.querySelector('.holiday-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        if (holidayInfo) {
            const banner = document.createElement('div');
            banner.className = 'holiday-banner bg-red-500 text-white text-center py-3 px-4 font-medium';
            banner.innerHTML = `
                <i class="ri-calendar-line mr-2"></i>
                Holiday Notice: ${holidayInfo.name} - All stores are closed today
            `;
            
            document.body.insertBefore(banner, document.body.firstChild);
        }
    }

    createHoursWidget(storeSlug) {
        if (!this.state.hoursData || !this.state.hoursData.stores[storeSlug]) {
            return this.createErrorWidget(storeSlug);
        }

        const store = this.state.hoursData.stores[storeSlug];
        const status = this.getStoreStatus(storeSlug);
        const displayName = storeSlug === 'marlboro' ? 'Marlboro' : 'New Providence';

        const widget = document.createElement('div');
        widget.className = 'store-hours-widget bg-white rounded-lg p-4 shadow-sm border';
        
        widget.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-gray-800">${displayName}</h3>
                <span class="px-3 py-1 text-xs font-medium rounded-full ${
                    status.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                    ${status.isOpen ? 'Open' : 'Closed'}
                </span>
            </div>
            <p class="text-gray-700 mb-2">Today: ${status.hours}</p>
            ${!status.isOpen && status.nextOpening ? 
                `<p class="text-sm text-gray-500">Opens ${status.nextOpening.day} at ${status.nextOpening.time}</p>` : 
                ''
            }
        `;
        
        return widget;
    }

    createErrorWidget(storeSlug) {
        const displayName = storeSlug === 'marlboro' ? 'Marlboro' : 'New Providence';
        const widget = document.createElement('div');
        widget.className = 'store-hours-widget bg-white rounded-lg p-4 shadow-sm border';
        
        widget.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-gray-800">${displayName}</h3>
                <span class="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    Unavailable
                </span>
            </div>
            <p class="text-gray-500 text-sm">Hours information not available</p>
        `;
        
        return widget;
    }

    async refresh() {
        try {
            this.state.cache = null;
            await this.loadHoursData();
            this.updateAllDisplays();
            console.log('Hours data refreshed successfully');
        } catch (error) {
            console.error('Failed to refresh hours data:', error);
        }
    }

    startAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            this.updateAllDisplays();
        }, this.config.UPDATE_INTERVAL);

        const easternTime = this.getCurrentEasternTime();
        const tomorrow = new Date(easternTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 1, 0);
        
        const msUntilMidnight = tomorrow.getTime() - easternTime.getTime();
        
        setTimeout(async () => {
            await this.refresh();
            
            setInterval(async () => {
                await this.refresh();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }

    showError() {
        const hourElements = document.querySelectorAll('#marlboro-hours, #providence-hours');
        hourElements.forEach(element => {
            if (element) {
                element.innerHTML = '<span class="text-red-600">Hours unavailable</span>';
            }
        });
        
        console.error('Store hours could not be loaded');
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        const banner = document.querySelector('.holiday-banner');
        if (banner) {
            banner.remove();
        }
        
        console.log('Store Hours Manager destroyed');
    }
}

window.storeHoursManager = new StoreHoursManager();

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.storeHoursManager.init();
    }, 1500);
});

window.updateStoreHours = () => window.storeHoursManager.updateAllDisplays();
window.refreshStoreHours = () => window.storeHoursManager.refresh();
window.getStoreStatus = (storeSlug) => window.storeHoursManager.getStoreStatus(storeSlug);
window.createHoursWidget = (storeSlug) => window.storeHoursManager.createHoursWidget(storeSlug);
window.getWeeklyHours = (storeSlug) => window.storeHoursManager.getWeeklyHours(storeSlug);

console.log('store-hours.js loaded successfully');