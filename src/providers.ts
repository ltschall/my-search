import { google, googleImages, googleGifs } from "./searchProviders/google";
import { duckduckgo } from "./searchProviders/duckduckgo";

export interface SearchProvider {
    name: string;
    description: string;
    matches: (query: string) => boolean;
    target: (query: string) => string;
}

export const providerChain: SearchProvider[] = [
    google,
    googleImages,
    googleGifs,
];

export const defaultProvider = duckduckgo;