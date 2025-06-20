import type { SearchProvider } from "../providers";
import { hasBang, removeBang } from "../helpers";

const baseUrl = new URL("https://wiki.tarkov.dev/index.php");

export const tarkovWiki: SearchProvider = {
    name: "Tarkov Wiki",
    key: "!tw",
    description: "Searches Tarkov Wiki for the given query",
    matches: (query) => hasBang(query, "!tw"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!tw");
        const url = new URL(baseUrl);
        url.searchParams.set("query", queryWithoutBang);
        return url.toString();
    },
};