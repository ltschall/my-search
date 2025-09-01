import type { SearchProvider } from "../providers";
import { removeBang, hasBang } from "../helpers";

const baseUrl = "https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html";

export const dhl: SearchProvider = {
    name: "DHL Tracking",
    key: "!dhl",
    description: "Track DHL packages",
    matches: (query: string) => hasBang(query, "!dhl"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!dhl");
        const url = new URL(baseUrl);
        url.searchParams.set("piececode", queryWithoutBang);
        return url.toString();
    },
};