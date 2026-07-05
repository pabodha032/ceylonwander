/**
 * ========================================
 * CEYLONWANDER APP
 * Main JavaScript File
 * ========================================
 */

// ========================================
// NAVIGATION
// ========================================

/**
 * Initialize navigation functionality
 * - Hamburger menu toggle for mobile
 * - Scroll effect for navbar
 */
document.addEventListener('DOMContentLoaded', function() {
    // Navbar toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // Close mobile menu on link click
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            if (navToggle) {
                navToggle.querySelector('i').classList.remove('fa-times');
                navToggle.querySelector('i').classList.add('fa-bars');
            }
        });
    });
});

// ========================================
// SCROLL ANIMATIONS
// ========================================

/**
 * Initialize scroll animations
 * - Fade in elements when they come into view
 */
document.addEventListener('DOMContentLoaded', function() {
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(element => {
        observer.observe(element);
    });
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format a date string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Generate star rating HTML
 * @param {number} rating - Rating value (0-5)
 * @param {string} size - Size class (optional)
 * @returns {string} HTML string of stars
 */
function generateStarRating(rating, size = '') {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    const starClass = size ? `fa-${size}` : '';

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += `<i class="fas fa-star ${starClass}" style="color: var(--primary-gold);"></i>`;
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += `<i class="fas fa-star-half-alt ${starClass}" style="color: var(--primary-gold);"></i>`;
        } else {
            stars += `<i class="far fa-star ${starClass}" style="color: #ddd;"></i>`;
        }
    }

    return stars;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, length = 100) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Generate random ID
 * @returns {number} Random ID
 */
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
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

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ========================================
// LOCAL STORAGE HELPERS
// ========================================

/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {*} data - Data to store
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

/**
 * Get data from local storage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored data
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Remove data from local storage
 * @param {string} key - Storage key
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================

/**
 * Show a toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Check if notification container exists
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
            width: 100%;
        `;
        document.body.appendChild(container);
    }

    const colors = {
        success: '#2ecc71',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        border-left: 4px solid ${colors[type] || colors.info};
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideInRight 0.3s ease-out;
        min-width: 300px;
    `;

    notification.innerHTML = `
        <i class="fas ${icons[type] || icons.info}" style="color: ${colors[type] || colors.info}; font-size: 1.5rem;"></i>
        <span style="flex: 1; color: var(--text-dark);">${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; cursor: pointer; color: var(--text-muted);">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, duration);
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(notificationStyles);

// ========================================
// MODAL SYSTEM
// ========================================

/**
 * Show a modal dialog
 * @param {string} title - Modal title
 * @param {string} content - Modal content HTML
 * @param {Object} options - Modal options
 * @returns {HTMLElement} Modal element
 */
function showModal(title, content, options = {}) {
    const {
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        showConfirm = true,
        showCancel = true,
        onConfirm = null,
        onCancel = null
    } = options;

    // Remove existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: fadeIn 0.3s ease-out;
    `;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        background: white;
        border-radius: var(--border-radius);
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: 2rem;
        animation: scaleIn 0.3s ease-out;
    `;

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0; font-size: 1.3rem; color: var(--text-dark);">${title}</h3>
            <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-content" style="margin-bottom: 1.5rem; color: var(--text-muted); line-height: 1.6;">
            ${content}
        </div>
        <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: flex-end;">
            ${showCancel ? `<button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove(); ${onCancel ? 'onCancel()' : ''}">${cancelText}</button>` : ''}
            ${showConfirm ? `<button class="btn btn-gold" onclick="this.closest('.modal-overlay').remove(); ${onConfirm ? 'onConfirm()' : ''}">${confirmText}</button>` : ''}
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
            if (onCancel) onCancel();
        }
    });

    return overlay;
}

// ========================================
// LOADING SPINNER
// ========================================

/**
 * Show a loading spinner
 * @param {string} message - Loading message
 * @returns {HTMLElement} Spinner element
 */
function showLoading(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255,255,255,0.9);
        z-index: 10001;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    `;

    overlay.innerHTML = `
        <div class="spinner" style="
            width: 50px;
            height: 50px;
            border: 4px solid #f0f0f0;
            border-top-color: var(--primary-gold);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
        <p style="margin-top: 1rem; color: var(--text-muted);">${message}</p>
    `;

    document.body.appendChild(overlay);
    return overlay;
}

/**
 * Hide loading spinner
 * @param {HTMLElement} spinner - Spinner element to remove
 */
function hideLoading(spinner) {
    if (spinner) {
        spinner.remove();
    } else {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Add spin animation
const spinStyles = document.createElement('style');
spinStyles.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(spinStyles);

// ========================================
// FORM VALIDATION HELPERS
// ========================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone number
 */
function isValidPhone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
}

// ========================================
// THEME TOGGLE (Dark Mode - Optional)
// ========================================

/**
 * Toggle dark mode
 */
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-mode');

    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Update icon
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

/**
 * Load theme preference
 */
function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// ========================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ========================================

// Make functions globally available
window.formatDate = formatDate;
window.generateStarRating = generateStarRating;
window.truncateText = truncateText;
window.generateId = generateId;
window.debounce = debounce;
window.getQueryParam = getQueryParam;
window.saveToStorage = saveToStorage;
window.getFromStorage = getFromStorage;
window.removeFromStorage = removeFromStorage;
window.showNotification = showNotification;
window.showModal = showModal;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.isValidEmail = isValidEmail;
window.isValidUrl = isValidUrl;
window.isValidPhone = isValidPhone;
window.toggleTheme = toggleTheme;
window.loadTheme = loadTheme;

// ========================================
// INITIALIZATION
// ========================================

// Load theme on page load
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    console.log('CeylonWander App initialized!');
});
