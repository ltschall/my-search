import './style.css'
import { searchHandler, getProvidersHelp } from './searchHandler';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main>
    <form id="searchForm">
      <input type="search" id="searchInput" autofocus>
      <button type="submit">Search</button>
    </form>
    <div id="previewContainer">
      <div id="preview"></div>
    </div>
    <button id="toggleProviders" class="accordion-toggle">Show All Providers</button>
    <div id="providersGridContainer" class="accordion-content"></div>
  </main>
`

function search(query: string) {
  if (query.trim() === '') {
    return;
  }

  console.log("Search Query:", query);
  const result = searchHandler(query);
  console.log("Results:", result);
  window.location.href = result.url;
}

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const previewDiv = document.getElementById('preview');
  const previewContainerDiv = document.getElementById('previewContainer');
  const toggleProvidersButton = document.getElementById('toggleProviders');
  const providersGridContainer = document.getElementById('providersGridContainer');

  if (!searchForm || !searchInput || !previewDiv || !previewContainerDiv || !toggleProvidersButton || !providersGridContainer) {
    throw new Error('Search form or input element not found');
  }

  if (!(searchInput instanceof HTMLInputElement)) {
    throw new TypeError('searchInput is not an instance of HTMLInputElement');
  }

  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('q');
  if (searchQuery) {
    search(searchQuery);
  }

  searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    if (query.trim() === '') {
      previewDiv.innerHTML = '';
      previewContainerDiv.classList.remove('visible');
      previewDiv.classList.remove('display');
      return;
    }
    try {
      const matchedSearch = searchHandler(query);
      previewDiv.innerHTML = `
                <p>Searching with: <strong>${matchedSearch.providerName}</strong></p>
                <p class="description">${matchedSearch.providerDescription}</p>
                <p class="url-preview">URL: <span>${matchedSearch.url}</span></p>
            `;
    } catch (error) {
      previewDiv.textContent = `Error: ${error instanceof Error ? error.message : 'No matching provider'}`;
      console.error("Search Handler Error:", error);
    }
    previewContainerDiv.classList.add('visible');
    previewDiv.classList.add('display');
  });

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = searchInput.value;
    search(query);
  });

  let providersLoaded = false;

  toggleProvidersButton.addEventListener('mouseover', () => {
    if (!providersLoaded) {
      const providersData = getProvidersHelp();
      let providersHtml = '';
      providersData.forEach((description, key) => {
        providersHtml += `
                    <div class="provider-item">
                        <span class="bang-key">${key}</span>
                        <p>${description}</p>
                    </div>
                `;
      });
      providersGridContainer.innerHTML = providersHtml;
      providersLoaded = true;
    }
  });

  toggleProvidersButton.addEventListener('click', () => {
    providersGridContainer.classList.toggle('expanded');
    if (providersGridContainer.classList.contains('expanded')) {
      toggleProvidersButton.textContent = 'Hide All Providers';
    } else {
      toggleProvidersButton.textContent = 'Show All Providers';
    }
  });
});
