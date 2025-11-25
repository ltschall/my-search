import type { SearchProvider } from "../providers";
import { hasBang, removeBang } from "../helpers";

const url = "https://www.duckduckgo.com/?q=%s";

export const duckduckgo: SearchProvider = {
    name: "DuckDuckGo",
    key: "!d, <default>",
    description: "Searches DuckDuckGo for the given query",
    matches: (query) => hasBang(query, "!d"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!d");
        const urlWithQuery = url.replace("%s", encodeURIComponent(queryWithoutBang));
        return urlWithQuery;
    },
};