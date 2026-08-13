const ExcelJS = require('exceljs');

/**
 * Export to CSV (String content with UTF-8 BOM for Excel compatibility)
 * @param {Array} columns - [{ header: 'Header Name', key: 'data_key' }]
 * @param {Array} data - Array of data objects
 */
const exportToCSV = (columns, data) => {
  // UTF-8 BOM for proper Excel display of Unicode characters (e.g. Amharic text)
  const BOM = '\uFEFF';
  
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    // Escape double quotes by doubling them
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = columns.map(col => escapeCell(col.header)).join(',');
  
  const rows = data.map(item => {
    return columns.map(col => {
      const val = item[col.key];
      return escapeCell(val);
    }).join(',');
  });

  return BOM + [headers, ...rows].join('\r\n');
};

/**
 * Export to Excel (Buffer)
 * @param {Array} columns - [{ header: 'Header Name', key: 'data_key', width: 20 }]
 * @param {Array} data - Array of data objects
 * @param {String} sheetName - Name of the worksheet
 */
const exportToExcel = async (columns, data, sheetName = 'Report') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 18
  }));

  // Style headers
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4F46E5' } // Indigo color
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Add data rows
  data.forEach(item => {
    worksheet.addRow(item);
  });

  // Adjust row height and alignment
  worksheet.eachRow((row, rowNumber) => {
    row.height = rowNumber === 1 ? 26 : 22;
    if (rowNumber > 1) {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = {
  exportToCSV,
  exportToExcel
};
