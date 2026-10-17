// all browser storage work is kept in this file wallahhii.

const DATA_KEY ="book-notes-vault:records";
const SETTINGS_KEY = "book-notes-vault:settings";

export function loadRecords() {
    try {
        const saved = localStorage.getItem(DATA_KEY);
        if (!saved) return null;
        const data = JSON.parse(saved);
        return Array.isArray(data) ? data : null;
    } catch (error){
        console.error("could not load saved records:", error);
        return null;
    }
}
export function saveRecords(records) {
    try {
        localStorage.setItem(DATA_KEY, JSON.stringify(records));
        return true;
    } catch (error) {
        console.error("could not save records:", error);
        return false;
    }
}

export function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
        return {
            pageTarget: Number.isFinite(Number(saved.pageTarget)) ? Math.max(0, Number(saved.pageTarget)) : 1000,
            pageUnit: ["page", "sheets", "thousands"].includes(saved.pageUnit) ? saved.pageUnit : "pages"
        };
    } catch {
        return { pageTarget: 1000, pageUnit: "pages" };
    }
}
export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error("could not save settings wlh!!:", error);
        return false;
    }
}