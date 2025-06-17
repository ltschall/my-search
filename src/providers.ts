import { google, googleImages, googleGifs, googleReddit } from "./searchProviders/google";
import { duckduckgo } from "./searchProviders/duckduckgo";

export interface SearchProvider {
    name: string;
    key: string;
    description: string;
    matches: (query: string) => boolean;
    target: (query: string) => string;
}

export const providerChain: SearchProvider[] = [
    google,
    googleReddit,
    googleImages,
    googleGifs,
];

export const defaultProvider = duckduckgo;