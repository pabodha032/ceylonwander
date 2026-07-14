const API_CONFIG = {

    
    BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost/ceylonwander/api/api.php'          
        : 'https://ceylonwander-api-aybkaxhzakgghte9.centralindia-01.azurewebsites.net/api.php', 

    
    getApiUrl() {
        return this.BASE_URL;
    },


    getSpotsUrl() {
        return `${this.BASE_URL}?endpoint=spots`;
    },


    getReviewsUrl(spotId = null) {
        return spotId
            ? `${this.BASE_URL}?endpoint=reviews&spotId=${spotId}`
            : `${this.BASE_URL}?endpoint=reviews`;
    }
};


window.API_CONFIG = API_CONFIG;

console.log('API_CONFIG loaded. Base URL:', API_CONFIG.BASE_URL);