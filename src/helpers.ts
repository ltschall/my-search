// bang could be any word surrounded by spaces, not only start. so "hello !g whats up" would be true
export function hasBang(query: string, bang: string) {
    const words = query.split(" ");
    return words.some((word) => word === bang);
}

export function removeBang(query: string, bang: string) {
    const words = query.split(" ");
    const index = words.indexOf(bang);
    if (index === -1) {
        return query;
    }
    const withoutBang = words.slice(0, index).join(" ") + " " + words.slice(index + 1).join(" ");
    return withoutBang.trim();
}
