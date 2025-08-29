import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun } from 'docx';
import * as XLSX from 'xlsx';

export interface ExportData {
  [key: string]: string | number;
}

export const exportToPDF = (data: ExportData[], title: string, filename: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
  
  // Prepare table data
  const headers = Object.keys(data[0] || {});
  const rows = data.map(row => headers.map(header => String(row[header] || '')));
  
  // Add table
  (doc as any).autoTable({
    head: [headers],
    body: rows,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};

export const exportToWord = async (data: ExportData[], title: string, filename: string) => {
  const headers = Object.keys(data[0] || {});
  
  // Create table rows
  const tableRows = [
    // Header row
    new TableRow({
      children: headers.map(header => 
        new TableCell({
          children: [new Paragraph({ 
            children: [new TextRun({ text: header, bold: true })]
          })],
          shading: { fill: "428BCA" },
        })
      ),
    }),
    // Data rows
    ...data.map(row => 
      new TableRow({
        children: headers.map(header =>
          new TableCell({
            children: [new Paragraph(String(row[header] || ''))],
          })
        ),
      })
    ),
  ];
  
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });
  
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 24 })],
        }),
        new Paragraph({
          text: `Generated on: ${new Date().toLocaleString()}`,
          spacing: { after: 200 },
        }),
        table,
      ],
    }],
  });
  
  // Generate and download the document
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToExcel = (data: ExportData[], title: string, filename: string) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Add metadata row
  const metaData = [
    [title],
    [`Generated on: ${new Date().toLocaleString()}`],
    [], // Empty row for spacing
  ];
  
  // Convert data to worksheet format
  const headers = Object.keys(data[0] || {});
  const rows = data.map(row => headers.map(header => row[header] || ''));
  
  // Combine metadata, headers, and data
  const worksheetData = [
    ...metaData,
    headers,
    ...rows,
  ];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  const colWidths = headers.map(() => ({ wch: 15 }));
  worksheet['!cols'] = colWidths;
  
  // Style the title and headers
  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: 'center' }
    };
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Save the file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToCSV = (data: ExportData[], filename: string) => {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${String(row[header] || '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};