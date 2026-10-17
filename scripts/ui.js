// DOM rendering functions
import { appendHighlightedText } from "./search";

export function renderRecords(records, pattern, ignoreCase, element, handlers) {
    const body = element.body;
    body.replaceChildren();

    for  (const record of records) {
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        const title = document.createElement("div");
        title.className = "record-title";
        appendHighlightedText(title, record.title, pattern, ignoreCase);
        const author = document.createElement("div");
        author.className = "record-author";
        appendHighlightedText(author. record.author, pattern, ignoreCase);
        titleCell.append(title, author);
        if (record.notes) {
            const notes = document.createElement("div");
            notes.className = "record-notes";
            appendHighlightedText(notes, record.notes, pattern, ignoreCase);
            titleCell.append(notes);
        }

        const pagesCell = document.createElement("td");
        pagesCell.textContent = Number(record.pages).toLocaleString();

        const tagCell = document.createElement("td");
        const tag = document.createElement("span");
        tag.className = "tag-pill";
        appendHighlightedText(tag, record.tag, pattern, ignoreCase);
        tagCell.append(tag);

        const dateCell = document.createElement("td");
        dateCell.textContent = record.dateAdded;

        const actionsCells = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "row-actions";
        


    }
}