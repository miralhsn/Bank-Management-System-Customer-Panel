import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';

export const generatePDF = async (transactions) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add header
      doc.fontSize(20).text('Transaction History', { align: 'center' });
      doc.moveDown();

      // Add bank details
      doc.fontSize(12).text('ReliBank', { align: 'center' });
      doc.moveDown();

      // Add date range
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown();

      // Add table headers
      const headers = ['Date', 'Reference', 'Description', 'Type', 'Amount', 'Status'];
      let y = 150;
      headers.forEach((header, i) => {
        doc.text(header, 50 + (i * 90), y);
      });

      // Add transactions
      y = 180;
      transactions.forEach(transaction => {
        if (y > 700) { // Start new page if near bottom
          doc.addPage();
          y = 50;
          // Add headers to new page
          headers.forEach((header, i) => {
            doc.text(header, 50 + (i * 90), y);
          });
          y += 30;
        }

        doc.text(new Date(transaction.createdAt).toLocaleDateString(), 50, y);
        doc.text(transaction.reference, 140, y);
        doc.text(transaction.description.substring(0, 20), 230, y);
        doc.text(transaction.type, 320, y);
        doc.text(`$${transaction.amount.toLocaleString()}`, 410, y);
        doc.text(transaction.status, 500, y);
        y += 30;
      });

      // Add footer
      doc.fontSize(10).text('Thank you for banking with ReliBank', {
        align: 'center',
        bottom: 30
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generateCSV = async (transactions) => {
  try {
    const records = transactions.map(t => ({
      Date: new Date(t.createdAt).toLocaleString(),
      Reference: t.reference,
      Description: t.description,
      Type: t.type,
      Amount: `$${t.amount.toLocaleString()}`,
      Status: t.status,
      Account: t.accountId?.accountNumber || 'N/A',
      Category: t.category,
      'Transfer Type': t.transferDetails?.transferId ? (t.transferDetails.toAccount ? 'Internal' : 'External') : 'N/A',
      'From Account': t.transferDetails?.fromAccount?.accountNumber || 'N/A',
      'To Account': t.transferDetails?.toAccount?.accountNumber || t.transferDetails?.externalAccount?.accountNumber || 'N/A'
    }));

    const csvContent = stringify(records, {
      header: true,
      columns: [
        'Date',
        'Reference',
        'Description',
        'Type',
        'Amount',
        'Status',
        'Account',
        'Category',
        'Transfer Type',
        'From Account',
        'To Account'
      ]
    });

    return Buffer.from(csvContent);
  } catch (error) {
    throw new Error('Failed to generate CSV: ' + error.message);
  }
};