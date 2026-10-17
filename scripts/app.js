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


