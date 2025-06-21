// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

// Global state
let mapData = null;
const mapElement = document.getElementById('map');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const detailsDialog = document.getElementById('details-dialog');
const detailsContent = document.getElementById('details-content');
const closeDialogBtn = document.getElementById('close-dialog-btn');

async function fetchMapData() {
  try {
    const response = await fetch('assets/map-data.json');
    mapData = await response.json();
    initFilters();
    renderMap();
  } catch (err) {
    mapElement.innerHTML = `<p>Error loading map data.</p>`;
  }
}

function initFilters() {
  // Get unique categories
  const categories = Array.from(
    new Set(mapData.places.map(b => b.category))
  );
  categories.forEach(cat => {
    const option = document.createElement('sl-menu-item');
    option.value = cat;
    option.textContent = cat;
    filterSelect.appendChild(option);
  });
}

function renderMap(filteredPlaces) {
  const places = filteredPlaces || mapData.places;

  // Simple map rendering (just coordinates shown as buttons)
  mapElement.innerHTML = ''; // Clear existing

  if (!places.length) {
    mapElement.innerHTML = '<p>No places found.</p>';
    return;
  }

  places.forEach(place => {
    const btn = document.createElement('sl-button');
    btn.variant = 'primary';
    btn.size = 'small';
    btn.style.position = 'absolute';
    btn.style.left = place.coordinates.x + 'px';
    btn.style.top = place.coordinates.y + 'px';
    btn.textContent = place.name;
    btn.title = place.description;
    btn.addEventListener('click', () => showBuildingDetails(place));
    mapElement.appendChild(btn);
  });

  // Set map element relative for positioning
  mapElement.style.position = 'relative';
  mapElement.style.height = '400px';
  mapElement.style.minHeight = '400px';
}

function showPlaceDetails(place) {
  detailsContent.innerHTML = `
    <h3>${place.name}</h3>
    <p><strong>Category:</strong> ${place.category}</p>
    <p>${place.description}</p>
  `;
  detailsDialog.show();
}

function filterAndSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedFilters = Array.from(filterSelect.selectedOptions).map(
    option => option.value
  );

  const filtered = mapData.places.filter(place => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchTerm) ||
      place.category.toLowerCase().includes(searchTerm);
    const matchesFilter =
      selectedFilters.length === 0 || selectedFilters.includes(building.category);
    return matchesSearch && matchesFilter;
  });

  renderMap(filtered);
}

// Event Listeners
searchInput.addEventListener('sl-input', filterAndSearch);
filterSelect.addEventListener('sl-change', filterAndSearch);
closeDialogBtn.addEventListener('click', () => detailsDialog.hide());

// Initialize app
fetchMapData();
