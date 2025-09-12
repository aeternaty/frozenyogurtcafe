// Store Hours JavaScript - Handle store hours display and updates

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        updateStoreHours();
    }, 1500);
});

function updateStoreHours() {
    console.log('⏰ Updating store hours...');
    
    updateCurrentDate();
    updateMarlboroHours();
    updateProvidenceHours();
    updateHeroHours();
    updateFooterStatus(); // YENİ: Footer status güncelleme
    
    console.log('✅ Store hours updated');
}

// YENİ: Footer'daki status elementlerini güncelle
function updateFooterStatus() {
    const marlboroHours = getMarlboroHours();
    const providenceHours = getProvidenceHours();
    
    // Marlboro status güncelle
    const marlboroStatus = document.getElementById('marlboro-status');
    const marlboroStatusText = document.getElementById('marlboro-status-text');
    
    if (marlboroStatus && marlboroStatusText) {
        if (marlboroHours.isOpen) {
            marlboroStatus.className = 'px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium';
            marlboroStatusText.textContent = 'Open';
        } else {
            marlboroStatus.className = 'px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium';
            marlboroStatusText.textContent = 'Closed';
        }
    }
    
    // New Providence status güncelle
    const providenceStatus = document.getElementById('providence-status');
    const providenceStatusText = document.getElementById('providence-status-text');
    
    if (providenceStatus && providenceStatusText) {
        if (providenceHours.isOpen) {
            providenceStatus.className = 'px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium';
            providenceStatusText.textContent = 'Open';
        } else {
            providenceStatus.className = 'px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium';
            providenceStatusText.textContent = 'Closed';
        }
    }
}

// Update current date display (Eastern Time)
function updateCurrentDate() {
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const now = new Date();
        const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        const options = { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric',
            timeZone: "America/New_York"
        };
        currentDateElement.textContent = easternTime.toLocaleDateString('en-US', options);
    }
}

// Update Marlboro hours
function updateMarlboroHours() {
    const marlboroHoursElement = document.getElementById('marlboro-hours');
    if (marlboroHoursElement) {
        const hours = getMarlboroHours();
        marlboroHoursElement.innerHTML = hours.display;
        
        // Add status indicator
        if (hours.isOpen) {
            marlboroHoursElement.innerHTML += ' <span class="text-green-600 font-medium">• Open</span>';
        } else {
            marlboroHoursElement.innerHTML += ' <span class="text-red-600 font-medium">• Closed</span>';
        }
    }
}

// Update New Providence hours
function updateProvidenceHours() {
    const providenceHoursElement = document.getElementById('providence-hours');
    if (providenceHoursElement) {
        const hours = getProvidenceHours();
        providenceHoursElement.innerHTML = hours.display;
        
        // Add status indicator
        if (hours.isOpen) {
            providenceHoursElement.innerHTML += ' <span class="text-green-600 font-medium">• Open</span>';
        } else {
            providenceHoursElement.innerHTML += ' <span class="text-red-600 font-medium">• Closed</span>';
        }
    }
}

// Update hours in hero section
function updateHeroHours() {
    const heroMarlboroHours = document.querySelector('#marlboro-hours');
    const heroProvidenceHours = document.querySelector('#providence-hours');
    
    if (heroMarlboroHours) {
        const hours = getMarlboroHours();
        heroMarlboroHours.textContent = hours.display;
    }
    
    if (heroProvidenceHours) {
        const hours = getProvidenceHours();
        heroProvidenceHours.textContent = hours.display;
    }
}

// Get Marlboro store hours (FIXED - Eastern Time)
function getMarlboroHours() {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const dayOfWeek = easternTime.getDay(); // 0 is Sunday, 6 is Saturday
    const currentTime = easternTime.getHours() * 100 + easternTime.getMinutes(); // HHMM format
    
    // ABD saati log'u
    console.log(`🕐 Marlboro Check - Eastern Time: ${easternTime.toLocaleString()}, Day: ${dayOfWeek}, Time: ${currentTime}`);
    
    let hours = '';
    let openTime = 0;
    let closeTime = 0;
    
    if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
        hours = '3:00 PM - 10:00 PM';
        openTime = 1500; // 3:00 PM
        closeTime = 2200; // 10:00 PM
    } else if (dayOfWeek === 0) { // Sunday
        hours = '1:00 PM - 10:00 PM';
        openTime = 1300; // 1:00 PM
        closeTime = 2200; // 10:00 PM
    } else { // Friday and Saturday
        hours = '1:00 PM - 11:00 PM';
        openTime = 1300; // 1:00 PM
        closeTime = 2300; // 11:00 PM
    }
    
    const isOpen = currentTime >= openTime && currentTime < closeTime;
    
    console.log(`🏪 Marlboro: ${isOpen ? 'OPEN' : 'CLOSED'} (${currentTime} vs ${openTime}-${closeTime})`);
    
    return {
        display: hours,
        isOpen: isOpen,
        openTime: openTime,
        closeTime: closeTime
    };
}

// Get New Providence store hours (FIXED - Eastern Time)
function getProvidenceHours() {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const dayOfWeek = easternTime.getDay(); // 0 is Sunday, 6 is Saturday
    const currentTime = easternTime.getHours() * 100 + easternTime.getMinutes(); // HHMM format
    
    // ABD saati log'u
    console.log(`🕐 Providence Check - Eastern Time: ${easternTime.toLocaleString()}, Day: ${dayOfWeek}, Time: ${currentTime}`);
    
    let hours = '';
    let openTime = 0;
    let closeTime = 0;
    
    if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
        hours = '12:00 PM - 10:00 PM';
        openTime = 1200; // 12:00 PM
        closeTime = 2200; // 10:00 PM
    } else { // Friday, Saturday and Sunday
        hours = '12:00 PM - 11:00 PM';
        openTime = 1200; // 12:00 PM
        closeTime = 2300; // 11:00 PM
    }
    
    const isOpen = currentTime >= openTime && currentTime < closeTime;
    
    console.log(`🏪 Providence: ${isOpen ? 'OPEN' : 'CLOSED'} (${currentTime} vs ${openTime}-${closeTime})`);
    
    return {
        display: hours,
        isOpen: isOpen,
        openTime: openTime,
        closeTime: closeTime
    };
}

// Get store hours for a specific day (Eastern Time)
function getHoursForDay(dayOfWeek, location) {
    if (location === 'marlboro') {
        if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
            return '3:00 PM - 10:00 PM';
        } else if (dayOfWeek === 0) { // Sunday
            return '1:00 PM - 10:00 PM';
        } else { // Friday and Saturday
            return '1:00 PM - 11:00 PM';
        }
    } else if (location === 'newprovidence') {
        if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
            return '12:00 PM - 10:00 PM';
        } else { // Friday, Saturday and Sunday
            return '12:00 PM - 11:00 PM';
        }
    }
    
    return 'Closed';
}

// Get next opening time (Eastern Time)
function getNextOpeningTime(location) {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const currentDay = easternTime.getDay();
    const currentTime = easternTime.getHours() * 100 + easternTime.getMinutes();
    
    // Check if currently open
    if (location === 'marlboro') {
        const marlboroHours = getMarlboroHours();
        if (marlboroHours.isOpen) {
            return null; // Already open
        }
        
        // Check if opening today
        if (currentTime < marlboroHours.openTime) {
            return {
                day: 'Today',
                time: formatTime(marlboroHours.openTime)
            };
        }
    } else {
        const providenceHours = getProvidenceHours();
        if (providenceHours.isOpen) {
            return null; // Already open
        }
        
        // Check if opening today
        if (currentTime < providenceHours.openTime) {
            return {
                day: 'Today',
                time: formatTime(providenceHours.openTime)
            };
        }
    }
    
    // Find next opening day
    for (let i = 1; i <= 7; i++) {
        const nextDay = (currentDay + i) % 7;
        const hours = getHoursForDay(nextDay, location);
        
        if (hours !== 'Closed') {
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nextDay];
            const openTime = location === 'marlboro' ? 
                (nextDay >= 1 && nextDay <= 4 ? 1500 : 1300) :
                1200;
            
            return {
                day: i === 1 ? 'Tomorrow' : dayName,
                time: formatTime(openTime)
            };
        }
    }
    
    return null;
}

// Format time from HHMM to readable format
function formatTime(timeNum) {
    const hours = Math.floor(timeNum / 100);
    const minutes = timeNum % 100;
    
    if (hours === 0) {
        return `12:${minutes.toString().padStart(2, '0')} AM`;
    } else if (hours < 12) {
        return `${hours}:${minutes.toString().padStart(2, '0')} AM`;
    } else if (hours === 12) {
        return `12:${minutes.toString().padStart(2, '0')} PM`;
    } else {
        return `${hours - 12}:${minutes.toString().padStart(2, '0')} PM`;
    }
}

// Create store hours widget (Eastern Time)
function createHoursWidget(location) {
    const widget = document.createElement('div');
    widget.className = 'store-hours-widget bg-white rounded-lg p-4 shadow-sm border';
    
    const locationName = location === 'marlboro' ? 'Marlboro' : 'New Providence';
    const hours = location === 'marlboro' ? getMarlboroHours() : getProvidenceHours();
    const nextOpening = getNextOpeningTime(location);
    
    widget.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-800">${locationName} Store</h3>
            <span class="px-2 py-1 text-xs font-medium rounded-full ${
                hours.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }">
                ${hours.isOpen ? 'Open' : 'Closed'}
            </span>
        </div>
        <p class="text-gray-700 mb-2">Today: ${hours.display}</p>
        ${!hours.isOpen && nextOpening ? 
            `<p class="text-sm text-gray-500">Opens ${nextOpening.day} at ${nextOpening.time}</p>` : 
            ''
        }
    `;
    
    return widget;
}

// Holiday hours checker (Eastern Time)
function checkHolidayHours() {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const month = easternTime.getMonth(); // 0-11
    const day = easternTime.getDate();
    
    // Holiday dates (month is 0-indexed)
    const holidays = [
        { month: 0, day: 1, name: 'New Year\'s Day', hours: 'Closed' },
        { month: 6, day: 4, name: 'Independence Day', hours: 'Closed' },
        { month: 10, day: 28, name: 'Thanksgiving', hours: 'Closed' },
        { month: 11, day: 25, name: 'Christmas', hours: 'Closed' }
    ];
    
    const holiday = holidays.find(h => h.month === month && h.day === day);
    
    if (holiday) {
        return {
            isHoliday: true,
            name: holiday.name,
            hours: holiday.hours
        };
    }
    
    return { isHoliday: false };
}

// Update hours with holiday information
function updateHolidayHours() {
    const holiday = checkHolidayHours();
    
    if (holiday.isHoliday) {
        // Show holiday banner
        const holidayBanner = document.createElement('div');
        holidayBanner.className = 'bg-red-500 text-white text-center py-2 px-4 mb-4';
        holidayBanner.innerHTML = `
            <p class="font-medium">
                <i class="ri-calendar-line mr-2"></i>
                Holiday Hours: ${holiday.name} - ${holiday.hours}
            </p>
        `;
        
        // Insert at top of page
        document.body.insertBefore(holidayBanner, document.body.firstChild);
        
        // Update all hour displays
        const hourElements = document.querySelectorAll('#marlboro-hours, #providence-hours');
        hourElements.forEach(element => {
            element.innerHTML = `<span class="text-red-600 font-medium">${holiday.hours}</span>`;
        });
    }
}

// Initialize store hours functionality
function initializeStoreHours() {
    updateStoreHours();
    updateHolidayHours();
    
    // Update every minute
    setInterval(updateStoreHours, 60000);
    
    // Update at midnight (Eastern Time)
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const tomorrow = new Date(easternTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 1, 0);
    
    const msUntilMidnight = tomorrow.getTime() - easternTime.getTime();
    setTimeout(() => {
        updateStoreHours();
        updateHolidayHours();
        // Then continue updating every minute
        setInterval(updateStoreHours, 60000);
    }, msUntilMidnight);
}

// Export functions for global use
window.updateStoreHours = updateStoreHours;
window.getMarlboroHours = getMarlboroHours;
window.getProvidenceHours = getProvidenceHours;
window.getHoursForDay = getHoursForDay;
window.getNextOpeningTime = getNextOpeningTime;
window.createHoursWidget = createHoursWidget;
window.initializeStoreHours = initializeStoreHours;

console.log('⏰ Store-hours.js loaded successfully');