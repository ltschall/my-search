import type { SearchProvider } from "../providers";
import { hasBang, removeBang } from "../helpers";

const baseUrl = new URL("https://minecraft.wiki/w/Special:Search");

export const minecraftWiki: SearchProvider = {
    name: "Minecraft Wiki",
    key: "!mc",
    description: "Searches Minecraft Wiki for the given query",
    matches: (query) => hasBang(query, "!mc"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!mc");
        const url = new URL(baseUrl);
        url.searchParams.set("search", queryWithoutBang);
        return url.toString();
    },
};

