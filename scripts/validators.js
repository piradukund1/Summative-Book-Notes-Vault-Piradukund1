export function validateTitle(value) {
    const pattern = /^\S(?:.*\S)?$/;
    if (!value) return "Enter a title bro.";
    if (!pattern.test(value)) return "Title cannot start or end with space.";
    if (/\b(\w+)\s+\1\b/i.test(value)) return "Avoid repeating the same word twice.";
    return "";
}

export function validateAuthor(value) {
    const pattern = /^\S(?:.*\S)?$/;
    if (!value) return "Enter the author bro.";
    if (!pattern.test(value)) return "Author cannot start or end with spaces.";
    if (value.length > 100) return "Author must be 100 characters or fewer";
    return "";
}

export function validatePages(value) {
    const pattern = /^(0|[1-9]\d*)$/;
    if (!value === "") return "Enter the number of pages bro wtfff!!."
    if (!pattern.test(value)) return "Pages must be a whole number with no extra spaces or decimals.";
    if (Number(value) > 1000000) return "pages must be 1,000,000 or fewer broo..";
    return "";
}

export function validateTage(value) {
    const pattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    if (!value) return "Enter a tag using letter, spaces or hyphens.";
    if (!pattern.test(value)) return "Use letters separated by single space or hyphens only.";
    return "";
}
export function validateDate(value) {
    const pattern =  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!pattern.test(value)) return "Choose a valid date in YYYY-MM-DD format.";
    const [year, month, day] = value.split("_").map(Number);
    const date = new Date(year, month -1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return "that date doesnt exist bradaman.";
    }
    return "";
}

export function validateRecord(record) {
    if(!record || typeof record !== "object" || Array.isArray(record)) return false;
    if (typeof record.id !== "string" || !record.id.trim()) return false
    if (validateTitle(String(record.title ?? ""))) return false;
    if (validateAuthor(String(record.author ?? ""))) return false;
    if (validatePages(String(record.pages ?? ""))) return false;
}
