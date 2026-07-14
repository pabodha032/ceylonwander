async function getSpots(forceRefresh = false) {
    if (!forceRefresh && window._cachedSpots) {
        return window._cachedSpots;
    }

    const apiUrl = API_CONFIG.getSpotsUrl();
    try {
        console.log("Fetching spots from:", apiUrl);
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const spots = await response.json();

        window._cachedSpots = spots;
        localStorage.setItem("spots", JSON.stringify(spots));
        return spots;
    } catch (error) {
        console.error("Error fetching spots from Azure:", error);

        const localSpots = getFromStorage("spots");
        if (localSpots && localSpots.length > 0) {
            window._cachedSpots = localSpots;
            return localSpots;
        }

        return getSampleSpots();
    }
}

async function getSpotById(id) {
    const apiUrl = API_CONFIG.getSpotsUrl() + "&id=" + id;
    try {
        console.log("Fetching spot ID:", id, "from:", apiUrl);
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching spot:", error);

        const spots = getFromStorage("spots", []);
        return spots.find((s) => s.id === id) || null;
    }
}

async function addSpot(spotData) {
    const apiUrl = API_CONFIG.getSpotsUrl();
    try {
        let imageUrl = spotData.image;

        if (spotData.image && spotData.image.startsWith("data:image")) {
            imageUrl = await uploadImageToAzure(spotData.image);
        }

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...spotData,
                image: imageUrl,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        await getSpots(true);
        notifyDataChange();

        return result;
    } catch (error) {
        console.error("Error adding spot:", error);

        const spots = getFromStorage("spots", []);
        const newSpot = {
            id: Date.now(),
            ...spotData,
        };
        spots.push(newSpot);
        localStorage.setItem("spots", JSON.stringify(spots));
        window._cachedSpots = spots;
        return { id: newSpot.id, message: "Spot saved locally (offline)" };
    }
}

async function updateSpot(id, spotData) {
    const apiUrl = API_CONFIG.getSpotsUrl() + "&id=" + id;
    try {
        let imageUrl = spotData.image;

        if (spotData.image && spotData.image.startsWith("data:image")) {
            imageUrl = await uploadImageToAzure(spotData.image);
        }

        const response = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...spotData,
                image: imageUrl,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        await getSpots(true);
        notifyDataChange();

        return result;
    } catch (error) {
        console.error("Error updating spot:", error);
        const spots = getFromStorage("spots", []);
        const index = spots.findIndex((s) => s.id === id);
        if (index !== -1) {
            spots[index] = { ...spots[index], ...spotData };
            localStorage.setItem("spots", JSON.stringify(spots));
            window._cachedSpots = spots;
        }
        return { message: "Spot updated locally (offline)" };
    }
}

async function deleteSpot(id) {
    const apiUrl = API_CONFIG.getSpotsUrl() + "&id=" + id;
    try {
        const response = await fetch(apiUrl, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        await getSpots(true);
        notifyDataChange();

        return true;
    } catch (error) {
        console.error("Error deleting spot:", error);

        let spots = getFromStorage("spots", []);
        spots = spots.filter((s) => s.id !== id);
        localStorage.setItem("spots", JSON.stringify(spots));
        window._cachedSpots = spots;
        return true;
    }
}

async function uploadImageToAzure(base64Image) {
    const apiUrl = API_CONFIG.getApiUrl();
    try {
        if (base64Image && base64Image.startsWith("http")) {
            return base64Image;
        }

        const formData = new FormData();
        formData.append("image", base64Image);

        const response = await fetch(apiUrl + "?endpoint=upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.imageUrl || result.url || base64Image;
    } catch (error) {
        console.error("Error uploading image:", error);
        return base64Image;
    }
}

function getSampleSpots() {
    return [
        {
            id: 1,
            name: "Sigiriya Rock Fortress",
            category: "historical",
            location: "Sigiriya, Central Province",
            rating: 4.8,
            shortDescription: "Ancient rock fortress and UNESCO World Heritage site.",
            fullDescription:
                "Sigiriya, also known as the Lion's Rock, is a magnificent ancient rock fortress.",
            features: ["UNESCO World Heritage Site", "Ancient frescoes"],
            image: "images/sigiriya.jpg",
            reviewsCount: 342,
        },
        {
            id: 2,
            name: "Ella Rock",
            category: "nature",
            location: "Ella, Uva Province",
            rating: 4.7,
            shortDescription:
                "Stunning mountain viewpoint with lush green landscapes.",
            fullDescription:
                "Ella Rock is a popular hiking destination offering spectacular views.",
            features: ["Hiking trail", "Panoramic views"],
            image: "images/ella.jpg",
            reviewsCount: 289,
        },
    ];
}

function getFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}

function notifyDataChange() {
    try {
        const channel = new BroadcastChannel("sl_tourist_data");
        channel.postMessage({ type: "dataChanged", timestamp: Date.now() });
        channel.close();
    } catch (e) {
        localStorage.setItem("dataChanged", Date.now().toString());
    }
}

window.getSpots = getSpots;
window.getSpotById = getSpotById;
window.addSpot = addSpot;
window.updateSpot = updateSpot;
window.deleteSpot = deleteSpot;
window.uploadImage = uploadImageToAzure;
window.getSampleSpots = getSampleSpots;
window.getFromStorage = getFromStorage;
window.saveToStorage = saveToStorage;
window.notifyDataChange = notifyDataChange;

console.log("spots.js loaded successfully!");
