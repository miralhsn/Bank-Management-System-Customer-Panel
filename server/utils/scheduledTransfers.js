import cron from 'node-cron';
import Transfer from '../models/Transfer.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

const processScheduledTransfers = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get all pending transfers scheduled for today or earlier
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transfers = await Transfer.find({
      status: 'pending',
      scheduledDate: { $lte: today }
    });

    for (const transfer of transfers) {
      try {
        const fromAccount = await Account.findById(transfer.fromAccount);
        
        if (fromAccount.balance < transfer.amount) {
          transfer.status = 'failed';
          await transfer.save({ session });
          continue;
        }

        // Process transfer
        fromAccount.balance -= transfer.amount;
        await fromAccount.save({ session });

        // Create debit transaction
        const debitTransaction = new Transaction({
          accountId: fromAccount._id,
          type: 'debit',
          amount: transfer.amount,
          description: transfer.description,
          category: 'transfer',
          status: 'completed'
        });
        await debitTransaction.save({ session });

        if (transfer.type === 'internal') {
          const toAccount = await Account.findById(transfer.toAccount);
          toAccount.balance += transfer.amount;
          await toAccount.save({ session });

          // Create credit transaction
          const creditTransaction = new Transaction({
            accountId: toAccount._id,
            type: 'credit',
            amount: transfer.amount,
            description: transfer.description,
            category: 'transfer',
            status: 'completed'
          });
          await creditTransaction.save({ session });
        }

        // Update transfer status
        transfer.status = 'completed';
        await transfer.save({ session });

        // Handle recurring transfers
        if (transfer.recurringDetails) {
          const { frequency, endDate } = transfer.recurringDetails;
          const nextDate = new Date(transfer.scheduledDate);

          switch (frequency) {
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

          if (!endDate || nextDate <= new Date(endDate)) {
            const newTransfer = new Transfer({
              ...transfer.toObject(),
              _id: new mongoose.Types.ObjectId(),
              status: 'pending',
              scheduledDate: nextDate
            });
            await newTransfer.save({ session });
          }
        }
      } catch (error) {
        console.error(`Error processing transfer ${transfer._id}:`, error);
        transfer.status = 'failed';
        await transfer.save({ session });
      }
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error('Error processing scheduled transfers:', error);
  } finally {
    session.endSession();
  }
};

// Run every day at midnight
cron.schedule('0 0 * * *', processScheduledTransfers);

export const startScheduler = () => {
  console.log('Transfer scheduler started');
  processScheduledTransfers(); // Run once at startup
}; 