async function getReviewsBySpotId(spotId) {
  const apiUrl = API_CONFIG.getReviewsUrl(spotId);
  try {
    console.log("Fetching reviews for spot:", spotId, "from:", apiUrl);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const reviews = await response.json();

    const allReviews = getFromStorage("reviews", []);
    const spotReviews = reviews;
    const otherReviews = allReviews.filter((r) => r.spotId !== spotId);
    localStorage.setItem(
      "reviews",
      JSON.stringify([...otherReviews, ...spotReviews]),
    );
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);

    const allReviews = getFromStorage("reviews", []);
    return allReviews.filter((r) => r.spotId === spotId);
  }
}

async function getAllReviews() {
  const apiUrl = API_CONFIG.getReviewsUrl();
  try {
    console.log("Fetching all reviews from:", apiUrl);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const reviews = await response.json();
    localStorage.setItem("reviews", JSON.stringify(reviews));
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return getFromStorage("reviews", []);
  }
}

async function submitReview(reviewData) {
  const apiUrl = API_CONFIG.getReviewsUrl();
  try {
    console.log("Submitting review to:", apiUrl);
    console.log("Review data:", reviewData);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`,
      );
    }

    const result = await response.json();

    const reviews = getFromStorage("reviews", []);
    reviews.push({
      id: result.id,
      ...reviewData,
      date: new Date().toISOString(),
    });
    localStorage.setItem("reviews", JSON.stringify(reviews));

    await updateSpotRating(reviewData.spotId);

    return result;
  } catch (error) {
    console.error("Error submitting review:", error);

    const reviews = getFromStorage("reviews", []);
    const newReview = {
      id: Date.now(),
      ...reviewData,
      date: new Date().toISOString(),
    };
    reviews.push(newReview);
    localStorage.setItem("reviews", JSON.stringify(reviews));

    updateSpotRatingLocal(reviewData.spotId);

    return { id: newReview.id, message: "Review saved locally (offline)" };
  }
}

async function deleteReview(id) {
  const apiUrl = API_CONFIG.getReviewsUrl() + "&id=" + id;
  try {
    const response = await fetch(apiUrl, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reviews = getFromStorage("reviews", []);
    const filtered = reviews.filter((r) => r.id !== id);
    localStorage.setItem("reviews", JSON.stringify(filtered));
    notifyDataChange();
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);

    const reviews = getFromStorage("reviews", []);
    const filtered = reviews.filter((r) => r.id !== id);
    localStorage.setItem("reviews", JSON.stringify(filtered));
    return true;
  }
}

async function updateSpotRating(spotId) {
  try {
    const reviews = await getReviewsBySpotId(spotId);
    if (reviews.length === 0) return;

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = sum / reviews.length;

    const spot = await getSpotById(spotId);
    if (spot) {
      await updateSpot(spotId, {
        ...spot,
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: reviews.length,
      });
    }
  } catch (error) {
    console.error("Error updating spot rating:", error);
  }
}

function updateSpotRatingLocal(spotId) {
  const reviews = getFromStorage("reviews", []);
  const spotReviews = reviews.filter((r) => r.spotId === spotId);
  if (spotReviews.length === 0) return;

  const sum = spotReviews.reduce((acc, r) => acc + r.rating, 0);
  const avgRating = sum / spotReviews.length;

  const spots = getFromStorage("spots", []);
  const index = spots.findIndex((s) => s.id === spotId);
  if (index !== -1) {
    spots[index].rating = Math.round(avgRating * 10) / 10;
    spots[index].reviewsCount = spotReviews.length;
    localStorage.setItem("spots", JSON.stringify(spots));
    window._cachedSpots = spots;
  }
}

function getFromStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

window.getReviewsBySpotId = getReviewsBySpotId;
window.getAllReviews = getAllReviews;
window.submitReview = submitReview;
window.deleteReview = deleteReview;
window.updateSpotRating = updateSpotRating;

console.log("reviews.js loaded successfully!");
