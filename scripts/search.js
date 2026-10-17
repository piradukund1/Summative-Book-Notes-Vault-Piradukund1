export function compileRegex(pattern, ignoreCase = true) {
    if (!pattern) return { regex: null, error: "" };
    try {
        return { regex : new RegExp(pattern, ignoreCase ? "gi" : "g"), error: ""};
    } catch (error) {
        return { regex: null, error: "that regular expression is not validation. check brackets,parentheses and special characters." };
    }
}

export function recordMatches(record, regex) {
    if(!regex) return true;
    const searchable = `${record.title} ${record.author} ${record.tag} ${record.notes} ${record.dateAdded} ${record.pages}`;
    regex.lastIndex = 0;
    return regex.test(searchable);
}
export function appendHighlightedText(element, text, pattern, ignoreCase = true) {
    const source = String(text ?? "");
    if (!pattern) {
        element.textContent = source;
        return;
    }
    let regex;
    try {
        regex = new RegExp(pattern, ignoreCase ? "gi" : "g");
    } catch {
        element.textContent = source;
        return;
    }
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(source)) !== null) {
        if (match.index > lastIndex ) element.append(document.createTextNode(source.slice(lastIndex, match.index)));
        const mark = document.createElement("mark");
        mark.textContent = match[0];
        element.append(mark);
        lastIndex = match.index + match[0].length;
        if(match[0] === "") regex.lastIndex++;
    }
    if (lastIndex < source.length) element.append(document.createTextNode(source.slice(lastIndex)));
}