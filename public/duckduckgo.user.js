// ==UserScript==
// @name         DuckDuckGo Search Redirect
// @namespace    https://search.tschall.dev/
// @version      1.1
// @description  Redirect DuckDuckGo searches to search.tschall.dev
// @author       Louis Tschall
// @match        https://duckduckgo.com/*
// @match        https://www.duckduckgo.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.debug('[DuckDuckGo Redirect] Script initialized');

    const SEARCH_FORM_ID = 'search_form';
    const SEARCH_INPUT_ID = 'search_form_input';
    
    const INDICATOR_SVG = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path fill="currentColor" d="M247.355,106.9C222.705,82.241,205.833,39.18,197.46,0c-8.386,39.188-25.24,82.258-49.899,106.917c-24.65,24.642-67.724,41.514-106.896,49.904c39.188,8.373,82.254,25.235,106.904,49.895c24.65,24.65,41.522,67.72,49.908,106.9c8.373-39.188,25.24-82.258,49.886-106.917c24.65-24.65,67.724-41.514,106.896-49.904C315.08,148.422,272.014,131.551,247.355,106.9z"/><path fill="currentColor" d="M407.471,304.339c-14.714-14.721-24.81-40.46-29.812-63.864c-5.011,23.404-15.073,49.142-29.803,63.872c-14.73,14.714-40.464,24.801-63.864,29.812c23.408,5.01,49.134,15.081,63.864,29.811c14.73,14.722,24.81,40.46,29.82,63.864c5.001-23.413,15.081-49.142,29.802-63.872c14.722-14.722,40.46-24.802,63.856-29.82C447.939,329.14,422.201,319.061,407.471,304.339z"/><path fill="currentColor" d="M146.352,354.702c-4.207,19.648-12.655,41.263-25.019,53.626c-12.362,12.354-33.968,20.82-53.613,25.027c19.645,4.216,41.251,12.656,53.613,25.027c12.364,12.362,20.829,33.96,25.036,53.618c4.203-19.658,12.655-41.255,25.023-53.626c12.354-12.362,33.964-20.82,53.605-25.035c-19.64-4.2-41.251-12.656-53.613-25.019C159.024,395.966,150.555,374.351,146.352,354.702z"/></g></svg>`;

    const interceptedForms = new WeakSet();
    let styleAdded = false;

    function interceptSearch(query) {
        if (query && query.trim() !== '') {
            const encodedQuery = encodeURIComponent(query.trim());
            const redirectUrl = `https://search.tschall.dev/?q=${encodedQuery}`;
            console.debug('[DuckDuckGo Redirect] Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
        }
    }

    function addGlobalStyles() {
        if (styleAdded) return;
        
        const style = document.createElement('style');
        style.id = 'search-redirect-styles';
        style.textContent = `
            .search-redirect-indicator svg { fill: yellow; color: yellow; stroke: yellow; }
            .search-redirect-indicator svg * { fill: yellow !important; color: yellow !important; stroke: yellow !important; }
        `;
        document.head.appendChild(style);
        styleAdded = true;
    }

    function addSearchIndicator(searchInput) {
        if (!searchInput) return;
        
        // Check if indicator already exists (using class check on sibling is safer than WeakSet for DOM elements that might be replaced)
        if (searchInput.parentElement?.querySelector('.search-redirect-indicator')) {
            return;
        }

        addGlobalStyles();

        const indicator = document.createElement('div');
        indicator.className = 'search-redirect-indicator';
        indicator.style.cssText = 'display: inline-flex; align-items: center; vertical-align: middle; pointer-events: none;';

        const svgContainer = document.createElement('div');
        svgContainer.className = 'search-redirect-svg';
        svgContainer.style.cssText = 'display: inline-block; width: 20px; height: 20px;';
        svgContainer.innerHTML = INDICATOR_SVG;

        indicator.appendChild(svgContainer);

        const inputParent = searchInput.parentElement;
        if (inputParent) {
            inputParent.appendChild(indicator);
        }
    }

    function setupFormInterception() {
        const searchForm = document.getElementById(SEARCH_FORM_ID);
        
        if (!searchForm || interceptedForms.has(searchForm)) {
            return;
        }
        
        // Clone the form to remove all event listeners
        const formClone = searchForm.cloneNode(true);
        const formParent = searchForm.parentElement;
        
        if (formParent) {
            formParent.replaceChild(formClone, searchForm);
        }
        
        const cleanForm = formParent ? formClone : searchForm;
        interceptedForms.add(cleanForm);
        
        const searchInput = cleanForm.querySelector(`#${SEARCH_INPUT_ID}`);
        addSearchIndicator(searchInput);
        
        cleanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const currentInput = cleanForm.querySelector(`#${SEARCH_INPUT_ID}`);
            if (currentInput?.value) {
                interceptSearch(currentInput.value);
            }
        }, true);
    }

    const observer = new MutationObserver(function(mutations) {
        // Performance optimization: only run setup if the form exists and hasn't been intercepted
        // This avoids unnecessary function calls and DOM queries on every mutation
        const form = document.getElementById(SEARCH_FORM_ID);
        if (form && !interceptedForms.has(form)) {
            setupFormInterception();
        }
    });

    function init() {
        setupFormInterception();
        
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                setupFormInterception();
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
