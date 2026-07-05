// js/admin.js
// ========================================
// CEYLONWANDER - ADMIN PANEL (AZURE API)
// ========================================

/**
 * Initialize admin dashboard
 */
function initAdminDashboard() {
    updateAdminStats();
    loadAdminSpots();
    loadAdminReviews();
    loadAdminUsers();
    setupAdminEventListeners();
}

/**
 * Update admin statistics from Azure
 */
async function updateAdminStats() {
    try {
        const spots = await getSpots(true);
        const reviews = await getAllReviews();
        const users = getAdminUsers();

        const totalSpotsEl = document.getElementById('totalSpots');
        const totalReviewsEl = document.getElementById('totalReviews');
        const totalUsersEl = document.getElementById('totalUsers');
        const totalImagesEl = document.getElementById('totalImages');

        if (totalSpotsEl) totalSpotsEl.textContent = spots.length;
        if (totalReviewsEl) totalReviewsEl.textContent = reviews.length;
        if (totalUsersEl) totalUsersEl.textContent = users.length;
        if (totalImagesEl) totalImagesEl.textContent = spots.filter(s => s.image).length;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

/**
 * Load admin spots from Azure
 */
async function loadAdminSpots() {
    try {
        const spots = await getSpots(true);
        const tbody = document.getElementById('spotsTableBody');
        if (!tbody) return;

        if (spots.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-landmark"></i>
                        <p>No tourist spots found. Add your first spot!</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = spots.map(spot => `
            <tr data-id="${spot.id}">
                <td>#${spot.id}</td>
                <td>
                    <img src="${spot.imageUrl || spot.image || 'images/placeholder.jpg'}"
                        alt="${spot.name}"
                        class="admin-thumbnail"
                        onerror="this.src='images/placeholder.jpg'">
                </td>
                <td><strong>${spot.name}</strong></td>
                <td><span class="category-badge">${spot.category}</span></td>
                <td><span class="rating-badge"><i class="fas fa-star"></i> ${spot.rating || 0}</span></td>
                <td>${spot.reviewsCount || 0}</td>
                <td>
                    <button class="btn-action edit" onclick="editSpot(${spot.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="deleteSpotHandler(${spot.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-action view" onclick="viewSpot(${spot.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading spots:', error);
        showNotification('Error loading spots from server', 'error');
    }
}

/**
 * Load admin reviews
 */
async function loadAdminReviews() {
    try {
        const reviews = await getAllReviews();
        const tbody = document.getElementById('reviewsTableBody');
        if (!tbody) return;

        if (reviews.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-star"></i>
                        <p>No reviews found.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = reviews.slice(0, 50).map(review => `
            <tr data-id="${review.id}">
                <td>#${review.id}</td>
                <td>${review.reviewerName || review.name}</td>
                <td>${review.spotName || 'Unknown'}</td>
                <td><span class="rating-badge"><i class="fas fa-star"></i> ${review.rating}</span></td>
                <td class="review-comment">${review.comment.substring(0, 60)}${review.comment.length > 60 ? '...' : ''}</td>
                <td>${formatDate(review.date)}</td>
                <td><span class="status-badge published">Published</span></td>
                <td>
                    <button class="btn-action view" onclick="viewReview(${review.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action delete" onclick="deleteReviewHandler(${review.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

/**
 * Load admin users
 */
function loadAdminUsers() {
    const users = getAdminUsers();
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No users found</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>#${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.reviews} reviews</td>
            <td>${formatDate(user.joined)}</td>
        </tr>
    `).join('');
}

/**
 * Get admin users (derived from review authors)
 */
function getAdminUsers() {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const userMap = {};

    reviews.forEach(review => {
        const email = review.email || review.reviewerEmail || 'unknown@email.com';
        if (!userMap[email]) {
            userMap[email] = {
                id: Object.keys(userMap).length + 1,
                name: review.reviewerName || review.name || 'User',
                email: email,
                reviews: 0,
                joined: review.date || new Date().toISOString()
            };
        }
        userMap[email].reviews++;
    });

    return Object.values(userMap);
}

/**
 * View spot details in modal
 */
function viewSpot(id) {
    const spot = getSpotById(id);
    if (!spot) {
        showNotification('Spot not found', 'error');
        return;
    }

    const content = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <p><strong>Name:</strong> ${spot.name}</p>
            <p><strong>Category:</strong> ${spot.category}</p>
            <p><strong>Location:</strong> ${spot.location}</p>
            <p><strong>Rating:</strong> ${spot.rating || 0}</p>
            <p><strong>Reviews:</strong> ${spot.reviewsCount || 0}</p>
            <p><strong>Description:</strong> ${spot.shortDescription}</p>
            <div style="margin-top: 0.5rem;">
                <img src="${spot.imageUrl || spot.image || 'images/placeholder.jpg'}"
                    alt="${spot.name}"
                    style="max-width: 100%; max-height: 200px; border-radius: var(--border-radius);"
                    onerror="this.style.display='none'">
            </div>
        </div>
    `;

    showModal(`Tourist Spot: ${spot.name}`, content, {
        confirmText: 'Close',
        showCancel: false
    });
}

/**
 * Edit spot - load data into form
 */
async function editSpot(id) {
    const spot = await getSpotById(id);
    if (!spot) {
        showNotification('Spot not found', 'error');
        return;
    }

    window.editingSpotId = id;

    document.getElementById('spotName').value = spot.name;
    document.getElementById('spotCategory').value = spot.category;
    document.getElementById('spotLocation').value = spot.location;
    document.getElementById('spotRating').value = spot.rating || 0;
    document.getElementById('spotShortDesc').value = spot.shortDescription;
    document.getElementById('spotFullDesc').value = spot.fullDescription || spot.shortDescription;
    document.getElementById('spotFeatures').value = spot.features ? spot.features.join(', ') : '';
    document.getElementById('spotImage').value = spot.imageUrl || spot.image || '';
    updateImagePreview(spot.imageUrl || spot.image || '');

    const submitBtn = document.querySelector('#addSpotForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Spot';
        submitBtn.dataset.mode = 'edit';
    }

    const formTitle = document.querySelector('#add-spot .section-header h3');
    if (formTitle) {
        formTitle.textContent = 'Edit Tourist Spot';
    }

    switchTab('add-spot');
    showNotification('Edit mode activated. Update the spot details and save.', 'info');
}

/**
 * Save spot (add or update)
 */
async function saveSpot(event) {
    event.preventDefault();

    const spotData = {
        name: document.getElementById('spotName').value.trim(),
        category: document.getElementById('spotCategory').value,
        location: document.getElementById('spotLocation').value.trim(),
        rating: parseFloat(document.getElementById('spotRating').value) || 0,
        shortDescription: document.getElementById('spotShortDesc').value.trim(),
        fullDescription: document.getElementById('spotFullDesc').value.trim(),
        features: document.getElementById('spotFeatures').value.split(',').map(f => f.trim()).filter(f => f),
        image: document.getElementById('spotImage').value.trim() || 'images/placeholder.jpg'
    };

    if (!spotData.name || !spotData.category || !spotData.location ||
        !spotData.shortDescription || !spotData.fullDescription) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        if (window.editingSpotId) {
            await updateSpot(window.editingSpotId, spotData);
            showNotification('Spot updated successfully!', 'success');
        } else {
            await addSpot(spotData);
            showNotification('Spot added successfully!', 'success');
        }
        resetAdminForm();
        loadAdminSpots();
        updateAdminStats();
        window.editingSpotId = null;
    } catch (error) {
        console.error('Error saving spot:', error);
        showNotification('Error saving spot. Please try again.', 'error');
    }
}

/**
 * Delete spot handler
 */
async function deleteSpotHandler(id) {
    const spot = await getSpotById(id);
    if (!spot) {
        showNotification('Spot not found', 'error');
        return;
    }

    if (!confirm(`Are you sure you want to delete "${spot.name}"? This cannot be undone.`)) {
        return;
    }

    try {
        await deleteSpot(id);
        showNotification('Spot deleted successfully!', 'success');
        loadAdminSpots();
        updateAdminStats();
    } catch (error) {
        console.error('Error deleting spot:', error);
        showNotification('Error deleting spot. Please try again.', 'error');
    }
}

/**
 * View review in modal
 */
function viewReview(id) {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const review = reviews.find(r => r.id === id);
    if (!review) {
        showNotification('Review not found', 'error');
        return;
    }

    const content = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <p><strong>User:</strong> ${review.reviewerName || review.name}</p>
            <p><strong>Email:</strong> ${review.reviewerEmail || review.email || 'N/A'}</p>
            <p><strong>Spot:</strong> ${review.spotName || 'Unknown'}</p>
            <p><strong>Rating:</strong> ${review.rating}</p>
            <p><strong>Date:</strong> ${formatDate(review.date)}</p>
            <p><strong>Comment:</strong></p>
            <p style="background: var(--bg-light); padding: 1rem; border-radius: var(--border-radius);">
                ${review.comment}
            </p>
        </div>
    `;

    showModal(`Review by ${review.reviewerName || review.name}`, content, {
        confirmText: 'Close',
        showCancel: false
    });
}

/**
 * Delete review handler
 * FIX: this now correctly calls the (previously missing) deleteReview()
 * function from reviews.js and awaits it, matching the pattern used by
 * deleteSpotHandler. Before this fix, clicking "delete" on a review threw
 * "deleteReview is not defined" and the review was never removed.
 */
async function deleteReviewHandler(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
        await deleteReview(id);
        showNotification('Review deleted successfully!', 'success');
        loadAdminReviews();
        updateAdminStats();
    } catch (error) {
        console.error('Error deleting review:', error);
        showNotification('Error deleting review. Please try again.', 'error');
    }
}

/**
 * Reset admin form
 */
function resetAdminForm() {
    const form = document.getElementById('addSpotForm');
    if (form) form.reset();

    const ratingEl = document.getElementById('spotRating');
    if (ratingEl) ratingEl.value = '0.0';

    updateImagePreview('');

    const fileInput = document.getElementById('spotImageFile');
    if (fileInput) {
        fileInput.value = '';
        const filePreview = document.getElementById('filePreview');
        if (filePreview) {
            filePreview.style.display = 'none';
            filePreview.innerHTML = '';
        }
    }

    const submitBtn = document.querySelector('#addSpotForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Add Spot';
        submitBtn.dataset.mode = 'add';
    }

    const formTitle = document.querySelector('#add-spot .section-header h3');
    if (formTitle) {
        formTitle.textContent = 'Add New Tourist Spot';
    }

    window.editingSpotId = null;
}

/**
 * Update image preview
 */
function updateImagePreview(url) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;

    if (url && url.trim()) {
        preview.innerHTML = `
            <img src="${url.trim()}" alt="Preview" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-image\\'></i><span>Invalid image URL</span>'">
        `;
    } else {
        preview.innerHTML = `
            <i class="fas fa-image"></i>
            <span>No image selected</span>
        `;
    }
}

/**
 * Setup admin event listeners
 */
function setupAdminEventListeners() {
    const form = document.getElementById('addSpotForm');
    if (form) {
        form.addEventListener('submit', saveSpot);
    }

    const imageInput = document.getElementById('spotImage');
    if (imageInput) {
        imageInput.addEventListener('input', function() {
            updateImagePreview(this.value);
        });
    }

    const fileInput = document.getElementById('spotImageFile');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
}

/**
 * Handle local file upload
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        event.target.value = '';
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.innerHTML = `<img src="${imageData}" alt="Preview">`;
        }

        const filePreview = document.getElementById('filePreview');
        if (filePreview) {
            filePreview.style.display = 'flex';
            filePreview.innerHTML = `
                <span class="file-name"><i class="fas fa-file-image"></i> ${file.name}</span>
                <span class="file-size">(${(file.size / 1024).toFixed(1)} KB)</span>
            `;
        }

        document.getElementById('spotImage').value = imageData;
        showNotification('Image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
}

/**
 * Switch tabs
 */
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });
}

/**
 * Filter admin spots
 */
function filterAdminSpots() {
    const search = document.getElementById('adminSpotSearch')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#spotsTableBody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

/**
 * Filter admin reviews
 */
function filterAdminReviews() {
    const search = document.getElementById('adminReviewSearch')?.value.toLowerCase() || '';
    const status = document.getElementById('reviewStatusFilter')?.value || 'all';
    const rows = document.querySelectorAll('#reviewsTableBody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const statusBadge = row.querySelector('.status-badge');
        const rowStatus = statusBadge ? statusBadge.textContent.toLowerCase() : 'published';
        const matchStatus = status === 'all' || rowStatus === status;
        const matchSearch = text.includes(search);
        row.style.display = matchSearch && matchStatus ? '' : 'none';
    });
}

// ========================================
// DATA MANAGEMENT (Settings tab)
// FIX: these 5 functions did not exist anywhere in the codebase.
// The Settings tab buttons (Export Data, Import Data, Backup,
// Reset All Data, Save Settings) called them via onclick="" but
// clicking any of them threw "function is not defined".
// ========================================

/**
 * Export all spots + reviews as a downloadable JSON file
 */
function exportData() {
    const spots = getFromStorage('spots', []);
    const reviews = getFromStorage('reviews', []);
    const exportObj = {
        exportDate: new Date().toISOString(),
        app: 'CeylonWander',
        spots: spots,
        reviews: reviews
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ceylonwander-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Data exported successfully!', 'success');
}

/**
 * Import spots + reviews from a JSON file the admin selects
 */
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.spots && !data.reviews) {
                    throw new Error('File does not contain spots or reviews data');
                }

                if (data.spots) {
                    localStorage.setItem('spots', JSON.stringify(data.spots));
                }
                if (data.reviews) {
                    localStorage.setItem('reviews', JSON.stringify(data.reviews));
                }

                window._cachedSpots = null;
                showNotification('Data imported successfully!', 'success');

                loadAdminSpots();
                loadAdminReviews();
                loadAdminUsers();
                updateAdminStats();
            } catch (error) {
                console.error('Error importing data:', error);
                showNotification('Invalid file. Please select a valid CeylonWander backup JSON file.', 'error');
            }
        };
        reader.readAsText(file);
    };

    input.click();
}

/**
 * Create a timestamped local backup, and also trigger a download
 * (same output as Export, but also kept in localStorage as a safety copy)
 */
function backupData() {
    const spots = getFromStorage('spots', []);
    const reviews = getFromStorage('reviews', []);
    const backup = {
        backupDate: new Date().toISOString(),
        spots: spots,
        reviews: reviews
    };

    localStorage.setItem('lastBackup', JSON.stringify(backup));
    exportData();

    showNotification('Backup created and downloaded!', 'success');
}

/**
 * Reset all locally cached data (spots + reviews).
 * Note: this clears the browser's local cache/offline copy only.
 * It does NOT delete anything from the Azure SQL database.
 */
function resetData() {
    if (!confirm('This will clear all locally cached spots and reviews from this browser. This cannot be undone. Continue?')) {
        return;
    }
    if (!confirm('Are you absolutely sure? This action is irreversible.')) {
        return;
    }

    localStorage.removeItem('spots');
    localStorage.removeItem('reviews');
    window._cachedSpots = null;

    showNotification('Local data has been reset.', 'success');

    loadAdminSpots();
    loadAdminReviews();
    loadAdminUsers();
    updateAdminStats();
}

/**
 * Save review-moderation settings to localStorage
 * NOTE: the "Max Reviews per User" input in admin.html currently has no id,
 * so it can't be reliably read here yet. Add id="maxReviewsPerUser" to that
 * <input> in admin.html (see notes) for this field to save correctly.
 */
function saveSettings() {
    const maxReviewsInput = document.getElementById('maxReviewsPerUser');

    const settings = {
        autoPublish: document.getElementById('autoPublish')?.checked ?? true,
        requireEmail: document.getElementById('requireEmail')?.checked ?? true,
        maxReviewsPerUser: maxReviewsInput ? parseInt(maxReviewsInput.value) || 10 : 10
    };

    localStorage.setItem('appSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
}

// ========================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ========================================
window.initAdminDashboard = initAdminDashboard;
window.updateAdminStats = updateAdminStats;
window.loadAdminSpots = loadAdminSpots;
window.loadAdminReviews = loadAdminReviews;
window.loadAdminUsers = loadAdminUsers;
window.saveSpot = saveSpot;
window.editSpot = editSpot;
window.viewSpot = viewSpot;
window.deleteSpotHandler = deleteSpotHandler;
window.resetAdminForm = resetAdminForm;
window.viewReview = viewReview;
window.deleteReviewHandler = deleteReviewHandler;
window.filterAdminSpots = filterAdminSpots;
window.filterAdminReviews = filterAdminReviews;
window.switchTab = switchTab;
window.handleFileUpload = handleFileUpload;
window.exportData = exportData;
window.importData = importData;
window.backupData = backupData;
window.resetData = resetData;
window.saveSettings = saveSettings;
window.editingSpotId = null;

console.log('admin.js loaded successfully!');

// Note: initAdminDashboard() is called from admin.html's own
// DOMContentLoaded listener, not from here — keeping it in one
// place avoids double-initializing the dashboard.
