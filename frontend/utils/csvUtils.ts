/**
 * Escapes a value for CSV format. If the value contains a comma, double quote, or newline,
 * it will be enclosed in double quotes. Existing double quotes will be escaped by doubling them.
 * @param value The value to escape.
 * @returns The CSV-safe string.
 */
const escapeCsvValue = (value: any): string => {
    const stringValue = String(value == null ? '' : value);
    if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

/**
 * Generates and triggers a download for a CSV file from headers and rows of data.
 * @param filename The name of the file to be downloaded (e.g., 'report.csv').
 * @param headers An array of strings for the CSV header row.
 * @param rows An array of arrays, where each inner array represents a row of data.
 */
export const downloadCsv = (filename: string, headers: string[], rows: (string|number|boolean|null|undefined)[][]) => {
    if (rows.length === 0) {
        alert("No data to download for the current selection.");
        return;
    }

    const headerRow = headers.map(escapeCsvValue).join(',');
    const dataRows = rows.map(row => 
        row.map(escapeCsvValue).join(',')
    );

    const csvContent = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};