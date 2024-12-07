import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

export const generatePDF = async (transactions, account) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add content to PDF
      doc.fontSize(20).text('Account Statement', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Account Number: ${account.accountNumber}`);
      doc.text(`Account Type: ${account.accountType}`);
      doc.moveDown();

      // Add transactions table
      transactions.forEach(transaction => {
        doc.text(`Date: ${transaction.createdAt.toLocaleDateString()}`);
        doc.text(`Description: ${transaction.description}`);
        doc.text(`Amount: ${transaction.amount}`);
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generateCSV = async (transactions, account) => {
  const fields = ['date', 'description', 'amount', 'type', 'status'];
  const json2csvParser = new Parser({ fields });
  
  const csvData = transactions.map(transaction => ({
    date: transaction.createdAt,
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    status: transaction.status
  }));

  return json2csvParser.parse(csvData);
}; 