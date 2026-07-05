// js/api-config.js
// ========================================
// CEYLONWANDER - API CONFIGURATION
// ========================================
// This file MUST load first (before app.js, spots.js, reviews.js, admin.js)
// on every page. It defines API_CONFIG, which every other file depends on.
//
// It was referenced by every HTML page (<script src="js/api-config.js">)
// but did not exist yet — that's what was causing the runtime crash.

const API_CONFIG = {

    // Base URL of your PHP REST API on Azure App Service.
    // Auto-switches between local testing and the deployed Azure backend.
    BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost/ceylonwander/api/api.php'          // local PHP dev server path
        : 'https://ceylonwander-api-aybkaxhzakgghte9.centralindia-01.azurewebsites.net/api.php', // confirmed working App Service URL

    /**
     * Base API endpoint (used for things like image upload)
     * e.g. https://.../api.php?endpoint=upload
     */
    getApiUrl() {
        return this.BASE_URL;
    },

    /**
     * Spots endpoint.
     * getSpotsUrl()            -> .../api.php?endpoint=spots        (GET all / POST new)
     * getSpotsUrl() + '&id=5'  -> .../api.php?endpoint=spots&id=5   (GET one / PUT / DELETE)
     */
    getSpotsUrl() {
        return `${this.BASE_URL}?endpoint=spots`;
    },

    /**
     * Reviews endpoint.
     * getReviewsUrl()             -> .../api.php?endpoint=reviews              (GET all / POST new)
     * getReviewsUrl(spotId)       -> .../api.php?endpoint=reviews&spotId=5     (GET reviews for one spot)
     * getReviewsUrl() + '&id=9'   -> .../api.php?endpoint=reviews&id=9         (DELETE one review)
     */
    getReviewsUrl(spotId = null) {
        return spotId
            ? `${this.BASE_URL}?endpoint=reviews&spotId=${spotId}`
            : `${this.BASE_URL}?endpoint=reviews`;
    }
};

// Make available globally
window.API_CONFIG = API_CONFIG;

console.log('API_CONFIG loaded. Base URL:', API_CONFIG.BASE_URL);