// ==UserScript==
// @name         DuckDuckGo Search Redirect
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Redirect DuckDuckGo searches to search.tschall.dev
// @author       Louis Tschall
// @match        https://duckduckgo.com/*
// @match        https://www.duckduckgo.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.debug('[DuckDuckGo Redirect] Script initialized');

    // Function to intercept and redirect search
    function interceptSearch(query) {
        if (query && query.trim() !== '') {
            const encodedQuery = encodeURIComponent(query.trim());
            const redirectUrl = `https://search.tschall.dev/?q=${encodedQuery}`;
            console.debug('[DuckDuckGo Redirect] Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
        }
    }

    // Track forms we've already intercepted to avoid duplicate listeners
    const interceptedForms = new WeakSet();
    const indicatorsAdded = new WeakSet();
    let styleAdded = false;

    // Add global styles for yellow SVG (only once)
    function addGlobalStyles() {
        if (styleAdded) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'search-redirect-styles';
        style.textContent = `
            .search-redirect-indicator svg {
                fill: yellow;
                color: yellow;
                stroke: yellow;
            }
            .search-redirect-indicator svg * {
                fill: yellow !important;
                color: yellow !important;
                stroke: yellow !important;
            }
        `;
        document.head.appendChild(style);
        styleAdded = true;
    }

    // Add indicator to the right of search bar
    function addSearchIndicator(searchInput) {
        if (!searchInput) {
            return;
        }
        if (indicatorsAdded.has(searchInput)) {
            return;
        }

        // Check if indicator already exists
        const existingIndicator = searchInput.parentElement?.querySelector('.search-redirect-indicator');
        if (existingIndicator) {
            return;
        }

        // Ensure global styles are added
        addGlobalStyles();

        // Create indicator container
        const indicator = document.createElement('div');
        indicator.className = 'search-redirect-indicator';
        indicator.style.cssText = `
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
            pointer-events: none;
        `;

        // Create SVG container (user will add SVG here)
        const svgContainer = document.createElement('div');
        svgContainer.className = 'search-redirect-svg';
        svgContainer.style.cssText = `
            display: inline-block;
            width: 20px;
            height: 20px;
        `;
        svgContainer.innerHTML = `
        <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
            viewBox="0 0 512 512" xml:space="preserve">
        <g>
            <path fill="currentColor" d="M247.355,106.9C222.705,82.241,205.833,39.18,197.46,0c-8.386,39.188-25.24,82.258-49.899,106.917
                c-24.65,24.642-67.724,41.514-106.896,49.904c39.188,8.373,82.254,25.235,106.904,49.895c24.65,24.65,41.522,67.72,49.908,106.9
                c8.373-39.188,25.24-82.258,49.886-106.917c24.65-24.65,67.724-41.514,106.896-49.904
                C315.08,148.422,272.014,131.551,247.355,106.9z"/>
            <path fill="currentColor" d="M407.471,304.339c-14.714-14.721-24.81-40.46-29.812-63.864c-5.011,23.404-15.073,49.142-29.803,63.872
                c-14.73,14.714-40.464,24.801-63.864,29.812c23.408,5.01,49.134,15.081,63.864,29.811c14.73,14.722,24.81,40.46,29.82,63.864
                c5.001-23.413,15.081-49.142,29.802-63.872c14.722-14.722,40.46-24.802,63.856-29.82
                C447.939,329.14,422.201,319.061,407.471,304.339z"/>
            <path fill="currentColor" d="M146.352,354.702c-4.207,19.648-12.655,41.263-25.019,53.626c-12.362,12.354-33.968,20.82-53.613,25.027
                c19.645,4.216,41.251,12.656,53.613,25.027c12.364,12.362,20.829,33.96,25.036,53.618c4.203-19.658,12.655-41.255,25.023-53.626
                c12.354-12.362,33.964-20.82,53.605-25.035c-19.64-4.2-41.251-12.656-53.613-25.019
                C159.024,395.966,150.555,374.351,146.352,354.702z"/>
        </g>
        </svg>
        `

        indicator.appendChild(svgContainer);

        // Add indicator as last sibling of search input
        const inputParent = searchInput.parentElement;
        if (inputParent) {
            // Append as last child of parent (making it the last sibling of search input)
            inputParent.appendChild(indicator);
            indicatorsAdded.add(searchInput);
        }
    }

    // Intercept form submission
    function setupFormInterception() {
        const searchForm = document.querySelector('#search_form');
        
        if (!searchForm) {
            return;
        }
        
        if (interceptedForms.has(searchForm)) {
            return;
        }
        
        // Clone the form to remove all event listeners
        const formClone = searchForm.cloneNode(true);
        // Preserve the form's parent
        const formParent = searchForm.parentElement;
        
        // Replace the original form with the clone (removes all event listeners)
        if (formParent) {
            formParent.replaceChild(formClone, searchForm);
        }
        
        // Use the cloned form from now on
        const cleanForm = formParent ? formClone : searchForm;
        interceptedForms.add(cleanForm);
        
        // Try to get query from input field (from the cloned form)
        const searchInput = cleanForm.querySelector('#search_form_input');
        
        // Add indicator next to search input
        if (searchInput) {
            addSearchIndicator(searchInput);
        }
        
        cleanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get fresh reference to input in case it changed
            const currentInput = cleanForm.querySelector('#search_form_input');
            if (currentInput && currentInput.value) {
                interceptSearch(currentInput.value);
            }
        }, true); // Use capture phase to intercept early
    }

    // Initialize on page load - only intercept form submissions, not URL parameters
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setupFormInterception();
        });
    } else {
        setupFormInterception();
    }

    // Also watch for dynamically added forms (in case DuckDuckGo loads forms via JS)
    const observer = new MutationObserver(function(mutations) {
        setupFormInterception();
    });

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        // Wait for body to be available
        const bodyObserver = new MutationObserver(function() {
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                bodyObserver.disconnect();
            }
        });
        bodyObserver.observe(document.documentElement, {
            childList: true
        });
    }
})();

