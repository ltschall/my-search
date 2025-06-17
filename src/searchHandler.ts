import { providerChain, defaultProvider } from "./providers";

export interface MatchedSearch {
    url: string;
    providerName: string;
    providerDescription: string;
}

export function searchHandler(query: string) {
    const provider = providerChain.find((provider) => provider.matches(query));

    if (!provider) {
        const defaultMatch: MatchedSearch = {
            url: defaultProvider.target(query),
            providerName: defaultProvider.name,
            providerDescription: defaultProvider.description,
        };
        return defaultMatch
    } else {
        const matchedSearch: MatchedSearch = {
            url: provider.target(query),
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