/**
 * Parses a CSV string into an array of objects or arrays.
 * Handles quoted fields containing commas or newlines.
 * 
 * @param {string} text - The raw CSV text.
 * @returns {Array<Array<string>>} - Array of rows, where each row is an array of cell values.
 */
export const parseCSV = (text) => {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuote = false;


    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (insideQuote && nextChar === '"') {
                // Escaped quote ("") -> treat as single quote
                currentCell += '"';
                i++;
            } else {
                insideQuote = !insideQuote;
            }
        } else if (char === ',' && !insideQuote) {
            currentRow.push(currentCell.trim());
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !insideQuote) {
            if (char === '\r' && nextChar === '\n') i++;

            currentRow.push(currentCell.trim());
            if (currentRow.length > 0 && currentRow.some(cell => cell)) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }


    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
    }

    return rows;
};
