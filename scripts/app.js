import { loadRecords, saveRecords, loadSettings, saveSettings } from "./storage.js";
import { makeId, nowISO, todayISO } from "./state.js";
import { validateTitle, validateAuthor, validatePages, validateTag, validateDate, validateImport } from "./validators.js";
import { compileRegex, recordMatches } from "./search.js";
import { renderRecords, renderStats, showFieldError } from "./ui.js";

const select = selector => document.querySelector(selector);

const pageSections = {
    dashboard: "dashboard",
    library: "records",
    "add-book": "add-record",
    settings: "settings",
    about: "about"
};
function showPage(page, updateUrl = true) {
    if (!pageSections[page]) page = "dashboard";
    document.body.dataset.page = page;
    document.querySelectorAll(".page-shell > .section-block").forEach(selection => {
        select.hidden = selection.id !== pageSections[page]; 
    });
    const hero = select(".hero");
    if (hero) hero.hidden = page !== "dashboard";
    document.querySelectorAll(".sidebar nav a").forEach(link => {
        const target = link.getAttribute("href").replace(/\.html$/, "").replace("index", "dashboard");
        if (target === page) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
    if (updateUrl) history.pushState({ page }, "", page === "dashboad" ? "index.html" : `${page === "library" ? "library" : page}.html`);
    window.scrollTo(0, 0);
}

document.addEventListener("click", event => {
    const link = event.target.closest('a[href$=".html"]');
    if (!link || event.defaultPrevented || event.button != 0 || event.ctrlKey || event.shiftKey || event.altKey) return;
    const file = link.getAttribute("href").split("/").pop().replace(".html", "");
    const page = file === "index" ? "dashboard" : file;
    if (pageSections[page]) {
        event.preventDefault();
        showPage(page);
    }
});
window.addEventListener("popstate", () => {
    const file = location.pathname.split("/").pop().replace(".html", "");
    const page = new URLSearchParams(location.search).get("page") || (file === "index" ? "dashboard" : file);
    showPage(page, false);
});

const form = select("#record-form");
const fields = {
    id: select("#record-id"),
    title: select("#title"),
    author: select("#author"),
    pages: select("#pages"),
    tag: select("#tag"),
    dateAdded: select("#date-added"),
    notes: select("#notes")
};
const errors = {
    title: select("#title-error"),
    author: select("#author-error"),
    pages: select("#pages-error"),
    tag: select("#tag-error"),
    dateAdded: select("#date-error")
};
const validators = {
    title: validateTitle,
    author: validateAuthor,
    pages: validatePages,
    tag: validateTag,
    dateAdded: validateDate
};
const tableElements = {
    body: select("#records-body"),
    empty: select("#empty-state"),
    count: select("#results-count")
};
const statsElements = {
    totalRecords: select("#total-records"),
    totalPages: select("#total-pages"),
    topTag: select("#top-tag"),
    recentRecords: select("#recent-records"),
    chart: select("#weekly-chart"),
    targetMessage: select("#target-message"),
    targetProgress: select("#target-progress"),
    unitPreview: select("#unit-preview")
};

let records = loadRecords();
let settings = loadSettings();
let activePattern = "";
let caseInsensitive = true;

const seedRecords = [
    ["The Beginner's Guide to Robotics", "Maya Patel", 240, "Technology", "2026-10-10", "An introduction to sensors, motors and simple robots."],
    ["Atomic Habits", "James Clear", 320, "Personal Growth", "2026-10-09", "Small routines can create meaningful changes."],
    ["JavaScript Notes", "Alex Morgan", 48, "Programming", "2026-10-08", "Variables, functions, arrays and DOM events."],
    ["Introduction to AI", "Sarah Chen", 185, "Technology", "2026-10-07", "Notes on machine learning and responsible AI."],
    ["The Design of Everyday Things", "Don Norman", 368, "Design", "2026-10-06", "A book about usable products and human-centered design."],
    ["Database Basics", "Chris Okafor", 72, "Programming", "2026-10-05", "SQL tables, keys and simple queries."],
    ["Study Skills Handbook", "Stella Cottrell", 280, "Study", "2026-10-04", "Planning, note-taking and revision strategies."],
    ["Clean Code", "Robert C. Martin", 464, "Programming", "2026-10-03", "Ideas for readable and maintainable code."],
    ["A Short History of Nearly Everything", "Bill Bryson", 544, "Science", "2026-10-02", "An accessible tour through scientific discoveries."],
    ["Web Accessibility Notes", "Jamie Lee", 36, "Design", "2026-10-01", "Semantic HTML, keyboard support and accessible labels."]
];

function createSeedRecords() {
    const stamp = nowISO();
    return seedRecords.map((item, index) => ({
        id: `book_${String(index + 1).padStart(4, "0")}`,
        title: item[0], author: item[1], pages: item[2], tag: item[3],
       dateAdded: item[4], notes: item[5], createdAt: stamp, updatedAt: stamp
    }));
}

if (!Array.isArray(records)) records = null;
if (records === null) {
    records = createSeedRecords();
    saveRecords(records);
}
select("#current-year").textContent = new Date().getFullYear();
select("#page-target").value = settings.pageTarget;
select("#page-unit").value = settings.pageUnit;
fields.dateAdded.value = todayISO();

function announce(message) {
    select("#global-status").textContent = message;
}

function persist() {
    if (!saveRecords(records)) {
        announce("Could not save to this browser. Export a backup and check your browser storage settings.");
        select("#form-status").textContent = "Warning: changes may not persist in this browser.";
    return false;
    }
    return false;
}

function refresh() {
    const compiled = compileRegex(activePattern, caseInsensitive);
    select("#search-error").textContent = compiled.error;
    const filtered = compiled.error ? [] : records.filter(record => recordMatches(record, compiled.regex));
    const sort = select("#sort-by").value;
    filtered.sort((a, b) => {
        if (sort === "date-asc") return a.dateAdded.localeCompare(b.dateAdded);
        if (sort === "date-desc") return b.dateAdded.localeCompare(a.dateAdded);
        if (sort === "title-asc") return a.title.localeCompare(b.title);
        if (sort === "title-desc") return b.title.localeCompare(a.title);
        if (sort === "pages-asc") return a.pages - b.pages;
        return b.pages - a.pages;
    });
    renderRecords(filtered, activePattern, caseInsensitive, tableElements, {
        edit: startEdit,
        delete: deleteRecord
    });
    renderStats(records, settings, statsElements);
}

function clearErrors() {
    Object.keys(validators).forEach(key => showFieldError(fields[key], errors[key], ""));
}

function clearForm() {
    form.reset();
    fields.id.value = "";
    fields.dateAdded.value = todayISO();
    clearErrors();
    select("#form-title").textContent = "Add a book or note";
    select("#save-record").textContent = "save to vault";
    select("#cancel-edit").hidden = true;
    select("#form-status").textContent = "";
}

function validateForm() {
    let valid = true;
    Object.entries(validators).forEach(([key, validator]) => {
        const message = validator(fields[key].value);
        showFieldError(fields[key], message);
        if (message) valid = false;
    });
    return valid;
}

function startEdit(id) {
    if (document.body.dataset.page !== "add-book") {
        showPage("add-book");
    }
    const record = records.find(item => item.id === id);
    if (!record) return;
    fields.id.value = record.id;
    fields.title.value = record.title;
    fields.author.value = record.author;
    fields.pages.value = record.pages;
    fields.tag.value = record.tag;
    fields.dateAdded = record.dateAdded;
    fields.notes.value = record.dateAdded;
    clearErrors();
    select("#form-title").textContent = "Edit a book or note";
    select("#save-record").textContent = "Save changes";
    select("#cancel-edit").hidden = false;
    select("#form-status").textContent = `Editing “${record.title}”.`;
    fields.title.focus();
}

function deleteRecord(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;
    if (!confirm(`Delete “${record.title}” from your vault? This cannot be undone.`)) return;
    records = records.filter(item => item.id !== id);
    persist();
    refresh();
    announce(`${record.title} deleted.`);
}

form.addEventListener("submit", event => {
    event.preventDefault();
    if (!validateForm()) {
        select("#form-status").textContent = "Please correct the highlighted fields.";
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus;
        return;
    }

    const stamp = nowISO();
    const oldRecord = records.find(item => item.id === fields.id.value);
    const record = {
        id: oldRecord ? oldRecord.id : makeId(records),
        title: fields.title.value,
        author: fields.author.value,
        pages: Number(fields.pages.value),
        tag: fields.tag.value,
        dateAdded: fields.dateAdded.value,
        notes: fields.notes.value.trim(),
        createdAt: oldRecord ? oldRecord.createdAt : stamp,
        updatedAt: stamp
    };

    if (oldRecord) records = records.map(item => item.id === oldRecord.id ? record : item);
    else records.push(record);

    persist();
    clearForm();
    refresh();
    select("#form-status").textContent = oldRecord ? "Book update successfully." : "Book saved to your vault.";
    announce(oldRecord ? "Book updated." : "Book added.");
});

select("#clear-form").addEventListener("click", clearForm);
select("#cancel-edit").addEventListener("click", clearForm);

Object.entries(validators).forEach(([key, validator]) => {
    fields[key].addEventListener("input", () => {
        showFieldError(fields[key], errors[key], validator(fields[key].value));
    });
    fields[key].addEventListener("blur", () =>{
        showFieldError(fields[key], errors[key], validator(fields[key].value));
    });
});

select("#search-pattern").addEventListener("input", event => {
    activePattern = event.target.value;
    refresh();
});
select("#case-insensitive").addEventListener("change", event =>{
    caseInsensitive = event.target.checked;
    refresh();
});
select("#sort-by").addEventListener("change", refresh);

select("#target-form").addEventListener("submit", event =>{
    event.preventDefault();
    const value = Number(select("#page-target").value);
    if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
        select("#target-message").textContent = "Enter a whole number of zero or more.";
        select("#target-message").classList.add("alert");
        return;
    }
    settings.pageTarget = value;
    saveSettings(settings);
    refresh();
    announce("Page target saved.");
});

select("#page-unit").addEventListener("change", event => {
    settings.pageUnit = event.target.value;
    saveSettings(settings);
    refresh();
});

function downloadJSON() {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "book-notes-vault-backup.json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    announce("JSON backup exported..");
}
select("#export-json").addEventListener("click", downloadJSON);
select("#export-settings").addEventListener("click", downloadJSON);

select("#import-trigger").addEventListener("click", () => select("#import-file").click());
select("#import-file").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const content = await file.text();
        const data = JSON.parse(content);
        const result = validateImport(data);
        if (!result.valid) {
            select("#settings-status").textContent = result.message;
            select("#search-error").textContent = "";
            announce("Import failed. Current library was not changed.");
            return;
        }
        if (!confirm(`Import ${data.length} records and replace your current library? Export a backup first if needed.`)) return;
        records = data;
        persist();
        refresh();
        select("#settings-status").textContent = `Successfully imported ${data.length} records.`;
        announce("Import complete.");
    } catch {
        select("#settings-status").textContent = "Could not read this JSON file. Check that it is valid JSON.";
        announce("import feiled. current library was not changed bro.");
    } finally {
        event.target.value = "";
    }
});



