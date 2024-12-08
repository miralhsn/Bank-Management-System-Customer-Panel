import cron from 'node-cron';
import Transfer from '../models/Transfer.js';
import Account from '../models/Account.js';
import mongoose from 'mongoose';

const processScheduledTransfers = async () => {
  // Check if database is connected
  if (mongoose.connection.readyState !== 1) {
    console.log('Database not connected, skipping scheduled transfers');
    return;
  }

  try {
    // Get all pending transfers scheduled for today or earlier
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transfers = await Transfer.find({
      status: 'pending',
      scheduledDate: { $lte: today }
    }).exec(); // Use exec() to get a proper promise

    console.log(`Processing ${transfers.length} scheduled transfers`);

    for (const transfer of transfers) {
      try {
        const fromAccount = await Account.findById(transfer.fromAccount);
        
        if (!fromAccount || fromAccount.balance < transfer.amount) {
          transfer.status = 'failed';
          await transfer.save();
          continue;
        }

        // Process transfer
        fromAccount.balance -= transfer.amount;
        await fromAccount.save();

        if (transfer.type === 'internal' && transfer.toAccount) {
          const toAccount = await Account.findById(transfer.toAccount);
          if (toAccount) {
            toAccount.balance += transfer.amount;
            await toAccount.save();
          }
        }

        transfer.status = 'completed';
        await transfer.save();

        // Handle recurring transfers
        if (transfer.recurringDetails && transfer.recurringDetails.frequency) {
          const nextDate = new Date(transfer.scheduledDate);
          switch (transfer.recurringDetails.frequency) {
            case 'daily':
              nextDate.setDate(nextDate.getDate() + 1);
              break;
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7);
              break;
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
            case 'yearly':
              nextDate.setFullYear(nextDate.getFullYear() + 1);
              break;
          }

          if (!transfer.recurringDetails.endDate || nextDate <= new Date(transfer.recurringDetails.endDate)) {
            const newTransfer = new Transfer({
              ...transfer.toObject(),
              _id: new mongoose.Types.ObjectId(),
              status: 'pending',
              scheduledDate: nextDate
            });
            await newTransfer.save();
          }
        }
      } catch (error) {
        console.error(`Error processing transfer ${transfer._id}:`, error);
        transfer.status = 'failed';
        await transfer.save();
      }
    }
  } catch (error) {
    console.error('Error processing scheduled transfers:', error);
  }
};

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled transfers job');
  await processScheduledTransfers();
});

export const startScheduler = () => {
  console.log('Transfer scheduler started');
  // Don't run immediately on startup, wait for first scheduled time
};

export default { startScheduler }; 