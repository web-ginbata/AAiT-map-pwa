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
    new Set(mapData.buildings.map(b => b.category))
  );
  categories.forEach(cat => {
    const option = document.createElement('sl-menu-item');
    option.value = cat;
    option.textContent = cat;
    filterSelect.appendChild(option);
  });
}

function renderMap(filteredBuildings) {
  const buildings = filteredBuildings || mapData.buildings;

  // Simple map rendering (just coordinates shown as buttons)
  mapElement.innerHTML = ''; // Clear existing

  if (!buildings.length) {
    mapElement.innerHTML = '<p>No buildings found.</p>';
    return;
  }

  buildings.forEach(building => {
    const btn = document.createElement('sl-button');
    btn.variant = 'primary';
    btn.size = 'small';
    btn.style.position = 'absolute';
    btn.style.left = building.coordinates.x + 'px';
    btn.style.top = building.coordinates.y + 'px';
    btn.textContent = building.name;
    btn.title = building.description;
    btn.addEventListener('click', () => showBuildingDetails(building));
    mapElement.appendChild(btn);
  });

  // Set map element relative for positioning
  mapElement.style.position = 'relative';
  mapElement.style.height = '400px';
  mapElement.style.minHeight = '400px';
}

function showBuildingDetails(building) {
  detailsContent.innerHTML = `
    <h3>${building.name}</h3>
    <p><strong>Category:</strong> ${building.category}</p>
    <p>${building.description}</p>
  `;
  detailsDialog.show();
}

function filterAndSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedFilters = Array.from(filterSelect.selectedOptions).map(
    option => option.value
  );

  const filtered = mapData.buildings.filter(building => {
    const matchesSearch =
      building.name.toLowerCase().includes(searchTerm) ||
      building.category.toLowerCase().includes(searchTerm);
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
