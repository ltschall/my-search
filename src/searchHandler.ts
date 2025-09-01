import { providerChain, defaultProvider } from "./providers";

export interface MatchedSearch {
    url: string;
    providerName: string;
    providerDescription: string;
}

export function searchHandler(query: string) {
    let provider = providerChain.find((provider) => provider.matches(query));
    let effectiveQuery = query;

    if (!provider) {
        effectiveQuery = query.replace("#", "!");
        provider = providerChain.find((provider) => provider.matches(effectiveQuery));
    }

    if (!provider) {
        const defaultMatch: MatchedSearch = {
            url: defaultProvider.target(effectiveQuery),
            providerName: defaultProvider.name,
            providerDescription: defaultProvider.description,
        };
        return defaultMatch
    } else {
        const matchedSearch: MatchedSearch = {
            url: provider.target(effectiveQuery),
            providerName: provider.name,
            providerDescription: provider.description,
        };
        return matchedSearch;
    }
}

export function getProvidersHelp(): Map<string, string> {
    const providerDescriptions = new Map<string, string>();
    providerChain.forEach((provider) => {
        providerDescriptions.set(provider.key, provider.description);
    });
    return providerDescriptions;
}