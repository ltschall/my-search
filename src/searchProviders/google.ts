import type { SearchProvider } from "../providers";
import { hasBang, removeBang } from "../helpers";

const url = "https://www.google.com/search?q=%s";

export const google: SearchProvider = {
    name: "Google",
    description: "Searches Google for the given query",
    matches: (query) => hasBang(query, "!g"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!g");
        const urlWithQuery = url.replace("%s", encodeURIComponent(queryWithoutBang));
        return urlWithQuery + '&udm=14'; // no AI results
    },
};

export const googleImages: SearchProvider = {
    name: "Google Images",
    description: "Searches Google Images for the given query",
    matches: (query) => hasBang(query, "!gi"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!gi");
        const urlWithQuery = url.replace("%s", encodeURIComponent(queryWithoutBang));
        return urlWithQuery + '&tbs=imgo:1' + '&udm=2';
    },
};

export const googleGifs: SearchProvider = {
    name: "Google GIFs",
    description: "Searches Google GIFs for the given query",
    matches: (query) => hasBang(query, "!gg"),
    target: (query: string) => {
        const queryWithoutBang = removeBang(query, "!gg");
        const urlWithQuery = url.replace("%s", encodeURIComponent(queryWithoutBang));
        return urlWithQuery + '&tbs=itp:animated' + '&udm=2';
    },
};