// DOM rendering functions
import { appendHighlightedText } from "./search";

export function renderRecords(records, pattern, ignoreCase, elements, handlers) {
    const body = elements.body;
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
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "small-button";
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", `Edit ${record.title}`);
        editButton.addEventListener("click", () => handlers.edit(record.id));
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "small-button delete";
        deleteButton.textContent = "delete";
        deleteButton.setAttribute("aria-label", `Delete ${record.title}`);
        deleteButton.addEventListener("click", () => handlers.delete(record.id));
        actions.append(editButton, deleteButton);
        actionsCells.append(actions);

        row.append(titleCell, pagesCell, tagCell, dateCell, actionsCells);
        body.append(row);
    }

    elements.empty.hidden = records.length !== 0;
    elements.count.textContent = `Showing ${records.length} record${records.length === 1 ? "" : "s"}`;
}

export function renderStats(records, settings, elements) {
    const totalPages = records.reduce((sum, record) => sum + Number(record.pages), 0);
    elements.totalRecords.textContent = records.length.toLocaleString();

    let shownTotal = totalPages;
    let unitName = "pages";
    if (settings.pagesUnit === "sheets") {
        shownTotal = totalPages / 2;
        unitName = "approx. sheets";
    } else if (settings.pagesUnit === "thousands") {
        shownTotal = totalPages / 1000;
        unitName = "thousand pages";
    }
    elements.totalPages.textContent = Number(shownTotal.toFixed(2)).toLocaleString();
    elements.totalPages.nextElementSibling.textContent = `Total ${unitName} across your vault`;
    elements.uniPreview.textContent = `Display: ${unitName}. Raw page target always uses pages.`;

    const tagCounts = {};
    records.forEach(record => {
        tagCounts[record.tag] = (tagCounts[record.tag] || 0) + 1; 
    });
    const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    elements.topTag.textContent = topTag ? topTag[0] : "_";

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const recent = records.filter(record => {
        const date = new Date(`${record.dateAdded}T00:00:00`);
        return date >= weekAgo && date <= today;
    });
    elements.recentRecords.textContent = recent.length.toLocaleString();

    const dayLabels = [];
    for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - i);
        const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
        dayLabels.push({ key, label: day.toLocaleDateString(undefined, { weekday: "short" }), count: records.filter(r => r.dateAdded === key).length });
    }
    const max = Math.max(1, ...dayLabels.map(day => day.count));
    elements.chart.replaceChildren();
    dayLabels.forEach(day => {
        const column = document.createElement("div");
        column.className = "chart-day";
        const count = document.createElement("span");
        count.className = "chart-count";
        count.textContent = day.count;
        const wrap = document.createElement("div");
        wrap.className = "chart-bar-wrap";
        const bar = document.createElement("div");
        bar.className = "chart-bar";
        bar.style.height = `${Math.max(3, day.count / max * 82)}px`;
        wrap.append(bar);
        const label = document.createElement("span");
        label.className = "chart-label";
        label.textContent = day.label;
        column.append(count, wrap, label);
        elements.chart.append(column);
    });

    const target = Number(settings.pageTarget) || 0;
    const difference = target - totalPages;
    if (target === 0) {
        elements.targetMessage.textContent = `You have ${totalPages.toLocaleDateString()} pages. set above zero to track progress.`;
        elements.targetMessage.classList.remove("alert");
        elements.targetProgress.style.width = "0%";
    } else if (difference >= 0){
        elements.targetMessage.textContent = `${difference.toLocaleString()} pages remaining to reach your ${target.toLocaleString()}-page target.`;
        elements.targetMessage.classList.remove("alert");
        elements.targetProgress.style.width = `${Math.min(100, totalPages / target * 100)}%`;
    } else {
        elements.targetMessage.textContent = `Target exceeded by ${Math.abs(difference).toLocaleString()} pages. Great collection!`;
        elements.targetMessage.classList.add("alert");
        elements.targetProgress.style.width = "100%";
    }
    elements.targetMessage.setAttribute("aria-live", difference < 0 ? "assertive" : "polite");
}

export function showFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    input.setAttribute("aria-live", message ? "true" : "false");
}