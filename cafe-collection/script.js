"use strict";

// STEP 7–12: data, DOM, forms, favorites, editing, deleting, searching.
const STORAGE_KEY = "cafeCollection_v2";
const LEGACY_CAFES_KEY = "savedCafes";
const LEGACY_FAVORITES_KEY = "favorites";
const ALLOWED_IMAGES = ["images/cafe.jpg", "images/cafe2.jpg"];

const defaultCafes = [
  { id: "default-1", name: "My Favorite Cafe", location: "Vancouver, BC", rating: 5, image: "images/cafe.jpg", favorite: false },
  { id: "default-2", name: "Cafe Two", location: "Vancouver, BC", rating: 4, image: "images/cafe2.jpg", favorite: false }
];

const cafeForm = document.getElementById("cafe-form");
const cafeInput = document.getElementById("cafe-input");
const locationInput = document.getElementById("location-input");
const ratingInput = document.getElementById("rating-input");
const imageInput = document.getElementById("image-input");
const cafeGrid = document.getElementById("cafe-grid");
const searchInput = document.getElementById("search-input");
const filterInput = document.getElementById("filter-input");
const resultCount = document.getElementById("result-count");
const emptyMessage = document.getElementById("empty-message");

function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "cafe-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (error) {
    console.warn("Could not read stored data:", key, error);
    return null;
  }
}

function normalizeCafe(item, fallbackId) {
  if (!item || typeof item !== "object") return null;
  const name = String(item.name || "").trim();
  const location = String(item.location || "").trim();
  const rating = Number(item.rating);
  if (!name || !location || !Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  return {
    id: typeof item.id === "string" && item.id ? item.id : fallbackId,
    name,
    location,
    rating,
    image: ALLOWED_IMAGES.includes(item.image) ? item.image : "images/cafe.jpg",
    favorite: item.favorite === true
  };
}

function loadCafes() {
  // New format takes priority. An empty array is a valid saved state.
  const stored = readJSON(STORAGE_KEY);
  if (Array.isArray(stored)) {
    const seen = new Set();
    return stored.map(item => normalizeCafe(item, newId())).filter(cafe => {
      if (!cafe) return false;
      if (seen.has(cafe.id)) cafe.id = newId();
      seen.add(cafe.id);
      return true;
    });
  }

  // One-time migration from STEP 10–11 data.
  const oldFavorites = readJSON(LEGACY_FAVORITES_KEY);
  const favorites = Array.isArray(oldFavorites) ? oldFavorites : [];
  const oldAdded = readJSON(LEGACY_CAFES_KEY);
  const oldCafes = Array.isArray(oldAdded) ? oldAdded : [];
  const combined = [
    ...defaultCafes.map(cafe => ({ ...cafe })),
    ...oldCafes
  ];
  const migrated = combined.map(item => normalizeCafe(item, newId())).filter(Boolean);
  migrated.forEach(cafe => { cafe.favorite = favorites.includes(cafe.name); });
  return migrated;
}

let cafes = loadCafes();

function saveCafes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cafes));
  } catch (error) {
    console.error("Could not save cafes:", error);
    alert("Saving failed. Please check your browser storage settings.");
  }
}

// Store the migrated data in the new ID-based format.
if (!Array.isArray(readJSON(STORAGE_KEY))) saveCafes();

function stars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function createInput(type, value, required = true) {
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  input.required = required;
  return input;
}

function createLabeledField(labelText, input) {
  const label = document.createElement("label");
  label.textContent = labelText;
  const id = "field-" + newId();
  input.id = id;
  label.htmlFor = id;
  return [label, input];
}

function createEditForm(cafe, onClose) {
  const form = document.createElement("form");
  form.className = "edit-form";

  const nameInput = createInput("text", cafe.name);
  nameInput.maxLength = 100;
  const placeInput = createInput("text", cafe.location);
  placeInput.maxLength = 120;
  const ratingSelect = document.createElement("select");
  for (let rating = 5; rating >= 1; rating--) {
    const option = document.createElement("option");
    option.value = String(rating);
    option.textContent = stars(rating);
    ratingSelect.appendChild(option);
  }
  ratingSelect.value = String(cafe.rating);

  const imageSelect = document.createElement("select");
  for (const [path, label] of [["images/cafe.jpg", "Cafe Interior"], ["images/cafe2.jpg", "Coffee & Pastry"]]) {
    const option = document.createElement("option");
    option.value = path;
    option.textContent = label;
    imageSelect.appendChild(option);
  }
  imageSelect.value = cafe.image;

  form.append(...createLabeledField("Cafe Name", nameInput));
  form.append(...createLabeledField("Location", placeInput));
  form.append(...createLabeledField("Rating", ratingSelect));
  form.append(...createLabeledField("Image", imageSelect));

  const actions = document.createElement("div");
  actions.className = "edit-form-actions";
  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "save-btn";
  saveButton.textContent = "Save Changes";
  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "cancel-btn";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", onClose);
  actions.append(saveButton, cancelButton);
  form.appendChild(actions);

  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const location = placeInput.value.trim();
    const rating = Number(ratingSelect.value);
    if (!name || !location || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      alert("Please enter valid cafe information.");
      return;
    }
    cafe.name = name;
    cafe.location = location;
    cafe.rating = rating;
    cafe.image = imageSelect.value;
    saveCafes();
    renderCafes();
  });
  return form;
}

function createCafeCard(cafe) {
  const card = document.createElement("article");
  card.className = "cafe-card";
  const image = document.createElement("img");
  image.src = cafe.image;
  image.alt = cafe.name + " image";
  image.loading = "lazy";

  const title = document.createElement("h3");
  title.textContent = cafe.name;
  const location = document.createElement("p");
  location.textContent = cafe.location;
  const rating = document.createElement("p");
  rating.className = "stars";
  rating.textContent = stars(cafe.rating);

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const favoriteButton = document.createElement("button");
  favoriteButton.className = "favorite-btn" + (cafe.favorite ? " active" : "");
  favoriteButton.textContent = cafe.favorite ? "Added to Favorites" : "Add to Favorites";
  favoriteButton.setAttribute("aria-pressed", String(cafe.favorite));
  favoriteButton.addEventListener("click", () => {
    cafe.favorite = !cafe.favorite;
    saveCafes();
    renderCafes();
  });

  const editButton = document.createElement("button");
  editButton.className = "edit-btn";
  editButton.textContent = "Edit Cafe";
  editButton.addEventListener("click", () => {
    if (card.querySelector(".edit-form")) return;
    editButton.disabled = true;
    const close = () => {
      const form = card.querySelector(".edit-form");
      if (form) form.remove();
      editButton.disabled = false;
    };
    card.appendChild(createEditForm(cafe, close));
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "Delete Cafe";
  deleteButton.addEventListener("click", () => {
    if (!confirm("Do you want to delete " + cafe.name + "?")) return;
    cafes = cafes.filter(item => item.id !== cafe.id);
    saveCafes();
    renderCafes();
  });

  actions.append(favoriteButton, editButton, deleteButton);
  card.append(image, title, location, rating, actions);
  return card;
}

function renderCafes() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const filter = filterInput.value;
  const visible = cafes.filter(cafe => {
    const matchesSearch = cafe.name.toLocaleLowerCase().includes(query) ||
      cafe.location.toLocaleLowerCase().includes(query);
    const matchesFilter = filter === "all" ||
      (filter === "favorites" && cafe.favorite) ||
      (filter === "five-stars" && cafe.rating === 5);
    return matchesSearch && matchesFilter;
  });
  cafeGrid.replaceChildren(...visible.map(createCafeCard));
  resultCount.textContent = visible.length + " of " + cafes.length + " cafes";
  emptyMessage.hidden = visible.length !== 0;
}

cafeForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = cafeInput.value.trim();
  const location = locationInput.value.trim();
  const rating = Number(ratingInput.value);
  const image = imageInput.value;
  if (!name || !location || !Number.isInteger(rating) || rating < 1 || rating > 5 || !ALLOWED_IMAGES.includes(image)) {
    alert("Please enter valid cafe information.");
    return;
  }
  cafes.push({ id: newId(), name, location, rating, image, favorite: false });
  saveCafes();
  cafeForm.reset();
  searchInput.value = "";
  filterInput.value = "all";
  renderCafes();
});

searchInput.addEventListener("input", renderCafes);
filterInput.addEventListener("change", renderCafes);
renderCafes();
