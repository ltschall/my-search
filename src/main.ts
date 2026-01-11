import './style.css'
import { searchHandler, getProvidersHelp } from './searchHandler';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main>
    <div id="searchContainer">
      <div class="brand">
        <h1>Search</h1>
      </div>
      
      <form id="searchForm">
        <div class="input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input type="search" id="searchInput" placeholder="Search the web..." autofocus>
          <button type="submit">Search</button>
        </div>
      </form>
      
      <p class="hint">
        Tip: Use bangs like <code>!g</code> or hashtags like <code>#g</code> for quick access
      </p>
      
      <div id="previewContainer">
        <div id="preview"></div>
      </div>
      
      <button id="toggleProviders" class="accordion-toggle">
        <span>Show All Providers</span>
        <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      <div id="providersGridContainer" class="accordion-content"></div>
    </div>
    
    <footer id="footer">
      <div id="referral">
        <span>Made with <span title="Love">❤️</span> by <a href="https://github.com/ltschall" target="_blank" rel="noopener">Louis</a></span>
        <span class="separator">·</span>
        <span>View on <a href="https://github.com/ltschall/my-search" target="_blank" rel="noopener">GitHub</a></span>
        <span class="separator">·</span>
        <span><a href="/duckduckgo.user.js" target="_blank">DDG Redirect Script</a></span>
      </div>
      <div id="buildDate">
        Built on ${new Date(__BUILD_DATE__).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
    </footer>
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

  const searchParam = params.get('search');
  if (searchParam) {
    searchInput.value = searchParam;
    // Trigger the input event to show preview
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
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
        <p class="url-preview">Preview URL: <span>${matchedSearch.url}</span></p>
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
    toggleProvidersButton.classList.toggle('active');
    
    const buttonText = toggleProvidersButton.querySelector('span');
    if (buttonText) {
      if (providersGridContainer.classList.contains('expanded')) {
        buttonText.textContent = 'Hide All Providers';
      } else {
        buttonText.textContent = 'Show All Providers';
      }
    }
  });
});
