export function makeId(records) {
    const nextNumber = records.reduce((max, record) => {
        const match = String(record.id).match(/^book_(\d+)$/);
        return match ? Math.max(max, Number(match[1])) : max;
    }, 0) + 1;
    return `book_${String(nextNumber).padStart(4, "0")}`;
}

export function nowISO() {
        return new Date().toISOString();
}

export function todayISO() {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0,10);
}