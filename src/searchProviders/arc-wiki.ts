import type { SearchProvider } from "../providers";
import { hasBang, removeBang } from "../helpers";

const baseUrl = new URL("https://arcraiders.wiki/w/index.php");

export const arcWiki: SearchProvider = {
    name: "Arc Raiders Wiki",
    key: "!arc",
    description: "Searches Arc Raiders Wiki for the given query",
    matches: (query) => hasBang(query, "!arc"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!arc");
        const url = new URL(baseUrl);
        url.searchParams.set("search", queryWithoutBang);
        return url.toString();
    },
};

