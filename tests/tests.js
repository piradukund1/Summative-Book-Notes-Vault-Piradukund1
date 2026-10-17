import { validateTitle, validateAuthor, validatePages, validateTag, validateDate, validateImport } from "../scripts/validators.js";
import { compileRegex } from "../scripts/search.js";

const tests = [
    ["accepts a normal title", () => validateTitle("Learning JavaScript") === ""],
    ["rejects a title with a leading space", () => validateTitle(" Learning") !== ""],
    ["rejects repeated words using a back-reference", () => validateTitle("Book book") !== ""],
    ["accepts an author name", () => validateAuthor("Jane Smith") === ""],
    ["accepts whole-number pages", () => validatePages("250") === ""],
    ["rejects decimal pages", () => validatePages("2.5") !== ""],
    ["accepts a multi-word tag", () => validateTag("Personal Growth") === ""],
    ["rejects a tag containing numbers", () => validateTag("Tech123") !== ""],
    ["accepts a real date", () => validateDate("2026-10-15") === ""],
    ["rejects an impossible date", () => validateDate("2026-02-31") !== ""],
    ["compiles a regex search", () => compileRegex("robotics").regex instanceof RegExp],
    ["catches an invalid regex", () => compileRegex("[").error !== ""],
    ["rejects an import that is not an array", () => validateImport({}).valid === false]
]; 

const list = document.querySelector("#test-results");
let passed = 0;
tests.forEach(([name, test]) => {
    const item = document.createElement("li");
    let success = false;
    try { success = test(); } catch { success = false; }
    item.textContent = `${success ? "PASS" : "FAIL"} — ${name}`;
    item.style.color = success ? "#245c49" : "#a42c36";
    list.append(item);
    if (success) passed++;
});
document.querySelector("#test-summary").textContent = `${passed} of ${tests.length} tests passed.`;