import { providerChain, defaultProvider } from "./providers";


function trim(str: string) {
    return str.trim();
}

export function searchHandler(query: string) {
    const provider = providerChain.find((provider) => provider.matches(query));

    let target: string | undefined;
    if (!provider) {
        target = defaultProvider.target(query);
    } else {
        target = provider.target(query);
    }

    return trim(target);
}