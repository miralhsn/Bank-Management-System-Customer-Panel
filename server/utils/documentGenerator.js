import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

export const generatePDF = async (transactions, account) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      let buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add content to PDF
      doc.fontSize(20).text('Account Statement', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Account Number: ${account.accountNumber}`);
      doc.text(`Account Type: ${account.accountType}`);
      doc.text(`Statement Period: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Add transactions
      transactions.forEach(transaction => {
        doc.text(`Date: ${new Date(transaction.createdAt).toLocaleDateString()}`);
        doc.text(`Description: ${transaction.description}`);
        doc.text(`Amount: $${transaction.amount.toFixed(2)}`);
        doc.text(`Status: ${transaction.status}`);
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generateCSV = async (transactions, account) => {
  try {
    const fields = ['date', 'description', 'amount', 'status'];
    const opts = { fields };
    const parser = new Parser(opts);

    const data = transactions.map(transaction => ({
      date: new Date(transaction.createdAt).toLocaleDateString(),
      description: transaction.description,
      amount: transaction.amount.toFixed(2),
      status: transaction.status
    }));

    return parser.parse(data);
  } catch (error) {
    throw error;
  }
}; 