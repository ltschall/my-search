import './style.css'
import { searchHandler } from './searchHandler';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main>
    <form id="searchForm">
      <input type="search" id="searchInput" autofocus>
      <button type="submit">Search</button>
    </form>
  </main>
`

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  if (!searchForm || !searchInput) {
    throw new Error('Search form or input element not found');
  }

  if (!(searchInput instanceof HTMLInputElement)) {
    throw new TypeError('searchInput is not an instance of HTMLInputElement');
  }

  const params = new URLSearchParams(window.location.search);
  const queryParam = params.get('q');
  if (queryParam) {
    searchInput.value = queryParam;
  }

  searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    const newUrl = new URL(window.location.origin + window.location.pathname);
    if (query) {
      newUrl.searchParams.set('q', query);
    }
    window.history.replaceState({}, '', newUrl);
  });

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    const query = searchInput.value;
    console.log("Search Query:", query);
    const results = searchHandler(query);
    console.log("Results:", results);
    window.location.href = results;
  });
});
