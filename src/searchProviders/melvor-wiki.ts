import type { SearchProvider } from "../providers";
import { hasBang, removeBang } from "../helpers";

const baseUrl = new URL("https://wiki.melvoridle.com/index.php");

export const melvorWiki: SearchProvider = {
    name: "Melvor Idle Wiki",
    key: "!mw",
    description: "Searches Melvor Idle Wiki for the given query",
    matches: (query) => hasBang(query, "!mw"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!mw");
        const url = new URL(baseUrl);
        url.searchParams.set("search", queryWithoutBang);
        return url.toString();
    },
};