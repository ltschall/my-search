// ==UserScript==
// @name         Universal Search Redirect
// @namespace    https://search.tschall.dev/
// @version      2.0
// @description  Redirect searches from multiple search engines to search.tschall.dev
// @author       Louis Tschall
// @match        https://www.google.com/*
// @match        https://google.com/*
// @match        https://duckduckgo.com/*
// @match        https://www.duckduckgo.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ============================================================================
    // CONSTANTS
    // ============================================================================

    const REDIRECT_URL = 'https://search.tschall.dev/';
    
    const INDICATOR_SVG = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path fill="currentColor" d="M247.355,106.9C222.705,82.241,205.833,39.18,197.46,0c-8.386,39.188-25.24,82.258-49.899,106.917c-24.65,24.642-67.724,41.514-106.896,49.904c39.188,8.373,82.254,25.235,106.904,49.895c24.65,24.65,41.522,67.72,49.908,106.9c8.373-39.188,25.24-82.258,49.886-106.917c24.65-24.65,67.724-41.514,106.896-49.904C315.08,148.422,272.014,131.551,247.355,106.9z"/><path fill="currentColor" d="M407.471,304.339c-14.714-14.721-24.81-40.46-29.812-63.864c-5.011,23.404-15.073,49.142-29.803,63.872c-14.73,14.714-40.464,24.801-63.864,29.812c23.408,5.01,49.134,15.081,63.864,29.811c14.73,14.722,24.81,40.46,29.82,63.864c5.001-23.413,15.081-49.142,29.802-63.872c14.722-14.722,40.46-24.802,63.856-29.82C447.939,329.14,422.201,319.061,407.471,304.339z"/><path fill="currentColor" d="M146.352,354.702c-4.207,19.648-12.655,41.263-25.019,53.626c-12.362,12.354-33.968,20.82-53.613,25.027c19.645,4.216,41.251,12.656,53.613,25.027c12.364,12.362,20.829,33.96,25.036,53.618c4.203-19.658,12.655-41.255,25.023-53.626c12.354-12.362,33.964-20.82,53.605-25.035c-19.64-4.2-41.251-12.656-53.613-25.019C159.024,395.966,150.555,374.351,146.352,354.702z"/></g></svg>`;

    // ============================================================================
    // EVENT EMITTER
    // ============================================================================

    /**
     * Simple event emitter for cross-provider communication and debugging
     */
    class EventEmitter {
        constructor() {
            this.listeners = new Map();
        }

        /**
         * Register an event listener
         * @param {string} event - Event name
         * @param {Function} callback - Event handler
         */
        on(event, callback) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
        }

        /**
         * Remove an event listener
         * @param {string} event - Event name
         * @param {Function} callback - Event handler to remove
         */
        off(event, callback) {
            if (!this.listeners.has(event)) {
                return;
            }
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }

        /**
         * Emit an event to all registered listeners
         * @param {string} event - Event name
         * @param {*} data - Event data
         */
        emit(event, data) {
            if (!this.listeners.has(event)) {
                return;
            }
            const callbacks = this.listeners.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[SearchRedirect] Error in ${event} listener:`, error);
                }
            });
        }
    }

    // ============================================================================
    // SEARCH PROVIDER INTERFACE (Base Class)
    // ============================================================================

    /**
     * Base class for search provider implementations using the Strategy Pattern.
     * Each search engine must extend this class and implement all methods.
     * 
     * @interface
     */
    class SearchProvider {
        /**
         * Get the name of the search provider
         * @returns {string} Provider name
         */
        getName() {
            throw new Error('SearchProvider.getName() must be implemented');
        }

        /**
         * Get URL patterns this provider matches
         * @returns {string[]} Array of URL patterns
         */
        getMatchUrls() {
            throw new Error('SearchProvider.getMatchUrls() must be implemented');
        }

        /**
         * Find the search form element on the page
         * @returns {HTMLFormElement|null} The search form or null if not found
         */
        findSearchForm() {
            throw new Error('SearchProvider.findSearchForm() must be implemented');
        }

        /**
         * Find the search input element within a form
         * @param {HTMLFormElement} form - The form containing the input
         * @returns {HTMLInputElement|HTMLTextAreaElement|null} The search input or null
         */
        findSearchInput(form) {
            throw new Error('SearchProvider.findSearchInput() must be implemented');
        }

        /**
         * Add visual indicator to show redirect is active
         * @param {HTMLInputElement|HTMLTextAreaElement} searchInput - The search input element
         */
        addIndicator(searchInput) {
            throw new Error('SearchProvider.addIndicator() must be implemented');
        }

        /**
         * Check if this provider matches the current URL
         * @returns {boolean} True if provider matches current page
         */
        matches() {
            const currentUrl = window.location.href;
            return this.getMatchUrls().some(pattern => {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return regex.test(currentUrl);
            });
        }
    }

    // ============================================================================
    // SHARED UTILITIES
    // ============================================================================

    let styleAdded = false;

    /**
     * Add global styles for the redirect indicator (only once)
     */
    function addGlobalStyles() {
        if (styleAdded) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'search-redirect-styles';
        style.textContent = `
            .search-redirect-indicator svg { fill: yellow; color: yellow; stroke: yellow; }
            .search-redirect-indicator svg * { fill: yellow !important; color: yellow !important; stroke: yellow !important; }
        `;
        document.head.appendChild(style);
        styleAdded = true;
    }

    /**
     * Create the indicator element
     * @returns {HTMLDivElement} The indicator element
     */
    function createIndicatorElement() {
        addGlobalStyles();

        const indicator = document.createElement('div');
        indicator.className = 'search-redirect-indicator';
        indicator.style.cssText = 'display: inline-flex; align-items: center; vertical-align: middle; pointer-events: none;';

        const svgContainer = document.createElement('div');
        svgContainer.className = 'search-redirect-svg';
        svgContainer.style.cssText = 'display: inline-block; width: 20px; height: 20px;';
        svgContainer.innerHTML = INDICATOR_SVG;

        indicator.appendChild(svgContainer);
        return indicator;
    }

    /**
     * Clone a form to remove all existing event listeners
     * @param {HTMLFormElement} form - Form to clone
     * @returns {HTMLFormElement} The cloned form
     */
    function cloneFormAndRemoveListeners(form) {
        const formClone = form.cloneNode(true);
        const formParent = form.parentElement;
        
        if (formParent) {
            formParent.replaceChild(formClone, form);
            return formClone;
        }
        
        return form;
    }

    /**
     * Perform the search redirect
     * @param {string} query - Search query
     * @param {EventEmitter} events - Event emitter for notifications
     */
    function interceptSearch(query, events) {
        if (query && query.trim() !== '') {
            const encodedQuery = encodeURIComponent(query.trim());
            const redirectUrl = `${REDIRECT_URL}?q=${encodedQuery}`;
            
            events.emit('beforeRedirect', { query, redirectUrl });
            window.location.href = redirectUrl;
        }
    }

    // ============================================================================
    // GOOGLE PROVIDER
    // ============================================================================

    class GoogleProvider extends SearchProvider {
        getName() {
            return 'Google';
        }

        getMatchUrls() {
            return [
                'https://www.google.com/*',
                'https://google.com/*'
            ];
        }

        findSearchForm() {
            // Find the search input first, then get its form
            const searchInput = this._findVisibleSearchInput();
            return searchInput ? searchInput.closest('form') : null;
        }

        findSearchInput(form) {
            if (!form) {
                return this._findVisibleSearchInput();
            }
            
            // Try textarea first (Google homepage)
            let searchInput = form.querySelector('textarea[name="q"]');
            if (searchInput) {
                return searchInput;
            }
            
            // Try visible text input
            searchInput = form.querySelector('input[type="text"][name="q"]');
            if (searchInput) {
                return searchInput;
            }
            
            // Fallback: find any input[name="q"] that's not hidden
            const allInputs = form.querySelectorAll('input[name="q"]');
            for (const input of allInputs) {
                if (input.type !== 'hidden') {
                    return input;
                }
            }
            
            return null;
        }

        addIndicator(searchInput) {
            if (!searchInput) {
                return;
            }
            
            // Navigate: input -> parent -> next sibling (div) -> first element
            const inputParent = searchInput.parentElement;
            if (!inputParent) {
                return;
            }
            
            const targetDiv = inputParent.nextElementSibling;
            if (!targetDiv) {
                return;
            }
            
            // Check if indicator already exists
            const existingIndicator = targetDiv.querySelector('.search-redirect-indicator');
            if (existingIndicator) {
                return;
            }

            const indicator = createIndicatorElement();
            
            // Insert as first element of the target div
            if (targetDiv.firstChild) {
                targetDiv.insertBefore(indicator, targetDiv.firstChild);
            } else {
                targetDiv.appendChild(indicator);
            }
        }

        _findVisibleSearchInput() {
            // Try textarea first (Google homepage)
            let searchInput = document.querySelector('textarea[name="q"]');
            if (searchInput) {
                return searchInput;
            }
            
            // Try visible text input
            searchInput = document.querySelector('input[type="text"][name="q"]');
            if (searchInput) {
                return searchInput;
            }
            
            // Fallback: find any input[name="q"] that's not hidden
            const allInputs = document.querySelectorAll('input[name="q"]');
            for (const input of allInputs) {
                if (input.type !== 'hidden') {
                    return input;
                }
            }
            
            return null;
        }
    }

    // ============================================================================
    // DUCKDUCKGO PROVIDER
    // ============================================================================

    class DuckDuckGoProvider extends SearchProvider {
        getName() {
            return 'DuckDuckGo';
        }

        getMatchUrls() {
            return [
                'https://duckduckgo.com/*',
                'https://www.duckduckgo.com/*'
            ];
        }

        findSearchForm() {
            return document.getElementById('search_form');
        }

        findSearchInput(form) {
            if (!form) {
                return document.getElementById('search_form_input');
            }
            return form.querySelector('#search_form_input');
        }

        addIndicator(searchInput) {
            if (!searchInput) {
                return;
            }
            
            // Check if indicator already exists
            if (searchInput.parentElement?.querySelector('.search-redirect-indicator')) {
                return;
            }

            const indicator = createIndicatorElement();
            const inputParent = searchInput.parentElement;
            
            if (inputParent) {
                inputParent.appendChild(indicator);
            }
        }
    }

    // ============================================================================
    // SEARCH REDIRECT CONTROLLER
    // ============================================================================

    class SearchRedirectController {
        constructor(provider, events) {
            this.provider = provider;
            this.events = events;
            this.interceptedForms = new WeakSet();
            this.observer = null;
        }

        /**
         * Initialize the controller
         */
        init() {
            this.events.emit('providerInitialized', { 
                provider: this.provider.getName() 
            });

            this.setupFormInterception();
            this.startObserver();
        }

        /**
         * Setup form interception for the current provider
         */
        setupFormInterception() {
            const searchForm = this.provider.findSearchForm();
            
            if (!searchForm || this.interceptedForms.has(searchForm)) {
                return;
            }
            
            // Clone the form to remove all existing event listeners
            const cleanForm = cloneFormAndRemoveListeners(searchForm);
            this.interceptedForms.add(cleanForm);
            
            // Find the search input in the cloned form
            const searchInput = this.provider.findSearchInput(cleanForm);
            
            // Add visual indicator
            this.provider.addIndicator(searchInput);
            this.events.emit('indicatorAdded', { 
                provider: this.provider.getName(),
                input: searchInput
            });
            
            // Intercept form submission
            cleanForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const currentInput = this.provider.findSearchInput(cleanForm);
                if (currentInput?.value) {
                    interceptSearch(currentInput.value, this.events);
                }
            }, true);
            
            // Also intercept Enter key on the input field
            // This is especially important for Google which often uses custom form handling
            if (searchInput) {
                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        
                        const query = searchInput.value;
                        if (query && query.trim() !== '') {
                            interceptSearch(query, this.events);
                        }
                    }
                }, true);
            }

            this.events.emit('formIntercepted', { 
                provider: this.provider.getName(),
                form: cleanForm
            });
        }

        /**
         * Start the mutation observer to handle dynamic content
         */
        startObserver() {
            this.observer = new MutationObserver(() => {
                // Performance optimization: only run setup if form exists and hasn't been intercepted
                const form = this.provider.findSearchForm();
                if (form && !this.interceptedForms.has(form)) {
                    this.setupFormInterception();
                }
            });

            if (document.body) {
                this.observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupFormInterception();
                    this.observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                });
            }
        }
    }

    // ============================================================================
    // PROVIDER REGISTRY
    // ============================================================================

    class ProviderRegistry {
        constructor() {
            this.providers = [];
        }

        /**
         * Register a new search provider
         * @param {SearchProvider} provider - Provider to register
         */
        register(provider) {
            this.providers.push(provider);
        }

        /**
         * Find the provider that matches the current page
         * @returns {SearchProvider|null} Matching provider or null
         */
        findMatchingProvider() {
            return this.providers.find(provider => provider.matches()) || null;
        }
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    function initialize() {
        // Create event emitter
        const events = new EventEmitter();

        // Optional: Add debug logging (can be disabled in production)
        if (false) { // Set to true for debugging
            events.on('providerInitialized', (data) => {
                console.debug('[SearchRedirect] Provider initialized:', data.provider);
            });
            events.on('formIntercepted', (data) => {
                console.debug('[SearchRedirect] Form intercepted:', data.provider);
            });
            events.on('indicatorAdded', (data) => {
                console.debug('[SearchRedirect] Indicator added:', data.provider);
            });
            events.on('beforeRedirect', (data) => {
                console.debug('[SearchRedirect] Redirecting:', data.redirectUrl);
            });
        }

        // Create and register providers
        const registry = new ProviderRegistry();
        registry.register(new GoogleProvider());
        registry.register(new DuckDuckGoProvider());

        // Find matching provider for current page
        const provider = registry.findMatchingProvider();
        
        if (!provider) {
            console.warn('[SearchRedirect] No matching provider found for:', window.location.href);
            return;
        }

        // Create and initialize controller
        const controller = new SearchRedirectController(provider, events);
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => controller.init());
        } else {
            controller.init();
        }
    }

    // Start the application
    initialize();

})();
