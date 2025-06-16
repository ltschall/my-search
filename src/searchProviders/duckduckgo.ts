import type { SearchProvider } from "../providers";
import { removeBang } from "../helpers";

const url = "https://www.duckduckgo.com/?q=%s";

export const duckduckgo: SearchProvider = {
    name: "DuckDuckGo",
    description: "Searches DuckDuckGo for the given query",
    matches: (query) => query.startsWith("!d"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!d");
        const urlWithQuery = url.replace("%s", encodeURIComponent(queryWithoutBang));
        return urlWithQuery;
    },
};