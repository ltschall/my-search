import type { SearchProvider } from "../providers";
import { hasBang, removeBang } from "../helpers";

const baseUrl = new URL("https://www.google.com/search");
baseUrl.searchParams.set("udm", "14"); // no AI results

export const google: SearchProvider = {
    name: "Google",
    key: "!g",
    description: "Searches Google for the given query",
    matches: (query) => hasBang(query, "!g"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!g");
        const url = new URL(baseUrl);
        url.searchParams.set("q", queryWithoutBang);
        return url.toString();
    },
};

export const googleReddit: SearchProvider = {
    name: "Google Reddit",
    key: "!gr",
    description: "Searches Google Reddit for the given query",
    matches: (query) => hasBang(query, "!gr"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!gr");
        const url = new URL(baseUrl);
        url.searchParams.set("q", `site:reddit.com ${queryWithoutBang}`);
        return url.toString();
    },
};

export const googleImages: SearchProvider = {
    name: "Google Images",
    key: "!gi",
    description: "Searches Google Images for the given query",
    matches: (query) => hasBang(query, "!gi"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!gi");
        const url = new URL(baseUrl);
        url.searchParams.set("q", queryWithoutBang);
        url.searchParams.set("tbs", "imgo:1");
        url.searchParams.set("udm", "2");
        return url.toString();
    },
};

export const googleGifs: SearchProvider = {
    name: "Google GIFs",
    key: "!gg",
    description: "Searches Google GIFs for the given query",
    matches: (query) => hasBang(query, "!gg"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!gg");
        const url = new URL(baseUrl);
        url.searchParams.set("q", queryWithoutBang);
        url.searchParams.set("tbs", "itp:animated");
        url.searchParams.set("udm", "2");
        return url.toString();
    },
};