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
        
    }
}