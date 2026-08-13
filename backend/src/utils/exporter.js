const ExcelJS = require('exceljs');

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
  exportToExcel
};
