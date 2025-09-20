/**
 * Google My Business (GMB) Tracking Script for GetYoCafe
 * Tracks all interactions from GMB profiles for both locations
 * Version: 1.0.0 - 2025
 */

(function() {
    'use strict';

    // GMB Configuration
    const GMB_CONFIG = {
        marlboro: {
            name: 'Marlboro',
            phone: '(732) 617-6332',
            address: '450 Union Hill Road, Suite 15, Morganville, NJ 07751',
            utmCampaign: 'marlboro-location'
        },
        newprovidence: {
            name: 'New Providence', 
            phone: '(908) 219-4338',
            address: '12 South Street, New Providence, NJ 07974',
            utmCampaign: 'newprovidence-location'
        }
    };

    // Initialize GMB tracking when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initGMBTracking();
        detectGMBTraffic();
        setupPhoneTracking();
        setupDirectionTracking();
    });

    /**
     * Initialize GMB tracking system
     */
    function initGMBTracking() {
        console.log('🎯 GMB Tracking initialized for GetYoCafe');
        
        // Track page view with GMB context if available
        const utmSource = getUrlParameter('utm_source');
        if (utmSource === 'gmb') {
            const campaign = getUrlParameter('utm_campaign') || 'unknown';
            trackGMBEvent('gmb_page_view', campaign);
        }
    }

    /**
     * Detect and track GMB traffic
     */
    function detectGMBTraffic() {
        const utmParams = {
            source: getUrlParameter('utm_source'),
            medium: getUrlParameter('utm_medium'),
            campaign: getUrlParameter('utm_campaign'),
            content: getUrlParameter('utm_content'),
            term: getUrlParameter('utm_term')
        };

        // Track GMB website clicks
        if (utmParams.source === 'gmb') {
            trackGMBEvent('gmb_website_click', utmParams.campaign, {
                utm_medium: utmParams.medium,
                utm_content: utmParams.content,
                utm_term: utmParams.term
            });

            // Store GMB session data
            sessionStorage.setItem('gmb_source', JSON.stringify({
                location: utmParams.campaign,
                timestamp: new Date().toISOString(),
                referrer: document.referrer
            }));
        }

        // Track referrer from Google Maps/Search
        if (document.referrer.includes('google.com') || document.referrer.includes('maps.google.com')) {
            trackGMBEvent('google_referrer', 'organic', {
                referrer: document.referrer
            });
        }
    }

    /**
     * Setup phone number click tracking
     */
    function setupPhoneTracking() {
        // Track all phone number clicks
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a[href^="tel:"]');
            if (target) {
                const phoneNumber = target.href.replace('tel:', '');
                const location = getLocationFromPhone(phoneNumber);
                
                trackGMBEvent('phone_click', location, {
                    phone_number: phoneNumber,
                    link_text: target.textContent.trim()
                });
            }
        });
    }

    /**
     * Setup direction tracking (maps links)
     */
    function setupDirectionTracking() {
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (target && (target.href.includes('maps.google.com') || target.href.includes('goo.gl/maps'))) {
                const location = getLocationFromMapsLink(target.href);
                
                trackGMBEvent('get_directions', location, {
                    maps_url: target.href,
                    link_text: target.textContent.trim()
                });
            }
        });
    }

    /**
     * Track GMB specific events
     */
    function trackGMBEvent(action, location, additionalData = {}) {
        // Ensure gtag is available
        if (typeof gtag !== 'function') {
            console.warn('gtag not available for GMB tracking');
            return;
        }

        const eventData = {
            event_category: 'GMB',
            event_label: `${action} - ${location}`,
            location_id: location,
            gmb_action: action,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            ...additionalData
        };

        // Send to GA4
        gtag('event', action, eventData);

        // Custom event for enhanced tracking
        gtag('event', 'gmb_interaction', {
            event_category: 'Local Business',
            event_label: `${location} - ${action}`,
            value: getActionValue(action),
            custom_parameter_1: 'gmb',
            custom_parameter_2: location
        });

        console.log('🎯 GMB Event Tracked:', action, location, eventData);

        // Optional: Send to additional analytics platforms
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'gmb_interaction',
                gmb_action: action,
                gmb_location: location,
                event_category: 'GMB',
                event_label: `${location} - ${action}`
            });
        }
    }

    /**
     * Get action value for conversion tracking
     */
    function getActionValue(action) {
        const values = {
            'gmb_website_click': 5,
            'phone_click': 10,
            'get_directions': 8,
            'gmb_page_view': 1,
            'form_submission': 15,
            'menu_view': 3
        };
        return values[action] || 1;
    }

    /**
     * Get location from phone number
     */
    function getLocationFromPhone(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.includes('7326176332')) return 'marlboro';
        if (cleanPhone.includes('9082194338')) return 'newprovidence';
        return 'unknown';
    }

    /**
     * Get location from maps link
     */
    function getLocationFromMapsLink(url) {
        if (url.includes('450+Union+Hill') || url.includes('Morganville') || url.includes('07751')) {
            return 'marlboro';
        }
        if (url.includes('12+South+Street') || url.includes('New+Providence') || url.includes('07974')) {
            return 'newprovidence';
        }
        return 'unknown';
    }

    /**
     * Get URL parameter value
     */
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    /**
     * Track form submissions from GMB traffic
     */
    function trackGMBFormSubmission(formType) {
        const gmbSource = sessionStorage.getItem('gmb_source');
        if (gmbSource) {
            const sourceData = JSON.parse(gmbSource);
            trackGMBEvent('form_submission', sourceData.location, {
                form_type: formType,
                conversion: true,
                value: 15
            });

            // Send conversion event to GA4
            if (typeof gtag === 'function') {
                gtag('event', 'conversion', {
                    send_to: 'G-D8M5Z9J4KL',
                    event_category: 'GMB Conversion',
                    event_label: `Form Submit - ${sourceData.location}`,
                    value: 15,
                    currency: 'USD'
                });
            }
        }
    }

    /**
     * Track menu interactions from GMB traffic
     */
    function trackGMBMenuView(flavor) {
        const gmbSource = sessionStorage.getItem('gmb_source');
        if (gmbSource) {
            const sourceData = JSON.parse(gmbSource);
            trackGMBEvent('menu_view', sourceData.location, {
                flavor: flavor,
                engagement: true
            });
        }
    }

    /**
     * Track location page views
     */
    function trackLocationView(location) {
        trackGMBEvent('location_page_view', location, {
            location_interest: true
        });
    }

    /**
     * Track scroll depth on GMB traffic
     */
    function trackScrollDepth() {
        let maxScroll = 0;
        let scrollTracked = false;

        window.addEventListener('scroll', function() {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }

            // Track 75% scroll depth once
            if (scrollPercent >= 75 && !scrollTracked) {
                const gmbSource = sessionStorage.getItem('gmb_source');
                if (gmbSource) {
                    const sourceData = JSON.parse(gmbSource);
                    trackGMBEvent('scroll_depth_75', sourceData.location, {
                        scroll_percent: scrollPercent,
                        engagement: true
                    });
                    scrollTracked = true;
                }
            }
        });
    }

    /**
     * Track time spent on page for GMB traffic
     */
    function trackTimeOnPage() {
        const gmbSource = sessionStorage.getItem('gmb_source');
        if (!gmbSource) return;

        const sourceData = JSON.parse(gmbSource);
        const startTime = Date.now();

        // Track after 30 seconds
        setTimeout(() => {
            trackGMBEvent('time_on_page_30s', sourceData.location, {
                time_spent: 30,
                engagement: true
            });
        }, 30000);

        // Track after 60 seconds
        setTimeout(() => {
            trackGMBEvent('time_on_page_60s', sourceData.location, {
                time_spent: 60,
                engagement: true
            });
        }, 60000);

        // Track before page unload
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            if (timeSpent > 10) { // Only track if spent more than 10 seconds
                navigator.sendBeacon('/api/track-time', JSON.stringify({
                    action: 'time_on_page',
                    location: sourceData.location,
                    time_spent: timeSpent
                }));
            }
        });
    }

    /**
     * Setup enhanced GMB tracking
     */
    function setupEnhancedTracking() {
        // Only setup enhanced tracking for GMB traffic
        const gmbSource = sessionStorage.getItem('gmb_source');
        if (gmbSource) {
            trackScrollDepth();
            trackTimeOnPage();
        }
    }

    // Export functions for global use
    window.GMBTracking = {
        trackFormSubmission: trackGMBFormSubmission,
        trackMenuView: trackGMBMenuView,
        trackLocationView: trackLocationView,
        trackCustomEvent: trackGMBEvent,
        getGMBSource: function() {
            return sessionStorage.getItem('gmb_source');
        },
        isGMBTraffic: function() {
            return !!sessionStorage.getItem('gmb_source');
        }
    };

    // Initialize enhanced tracking after page load
    window.addEventListener('load', setupEnhancedTracking);

    // Auto-track location page views
    if (window.location.hash === '#locations' || window.location.pathname.includes('/marlboro') || window.location.pathname.includes('/new-providence')) {
        setTimeout(() => {
            const location = window.location.pathname.includes('/marlboro') ? 'marlboro' : 
                           window.location.pathname.includes('/new-providence') ? 'newprovidence' : 
                           'both-locations';
            trackLocationView(location);
        }, 1000);
    }

    // Track outbound clicks to competitors (for competitive analysis)
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a');
        if (target && target.href && !target.href.includes(window.location.hostname)) {
            const gmbSource = sessionStorage.getItem('gmb_source');
            if (gmbSource) {
                const sourceData = JSON.parse(gmbSource);
                trackGMBEvent('outbound_click', sourceData.location, {
                    destination: target.href,
                    link_text: target.textContent.trim()
                });
            }
        }
    });

})();