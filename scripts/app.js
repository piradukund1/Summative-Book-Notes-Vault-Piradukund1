import { loadRecords, saveRecords, loadSettings, saveSettings } from "./storage.js";
import { makeId, nowISO, todayISO } from "./state.js";
import { validateTitle, validateAuthor, validatePages, validateTag, validateDate, validateImport } from "./validators.js";
import { compileRegex, recordMatches } from "./search.js";
import { renderRecords, renderStats, showFieldError } from "./ui.js";

const select = selector => document.querySelector(selector);




