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

