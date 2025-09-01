import { google, googleImages, googleGifs, googleReddit } from "./searchProviders/google";
import { duckduckgo } from "./searchProviders/duckduckgo";
import { melvorWiki } from "./searchProviders/melvor-wiki";
import { tarkovWiki } from "./searchProviders/tarkov-wiki";
import { dhl } from "./searchProviders/dhl";

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
    melvorWiki,
    tarkovWiki,
    dhl,
];

export const defaultProvider = duckduckgo;