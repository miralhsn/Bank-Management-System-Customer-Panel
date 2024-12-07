import cron from 'node-cron';
import Transfer from '../models/Transfer.js';
import { executeTransfer } from '../services/transferService.js';

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const scheduledTransfers = await Transfer.find({
      status: 'scheduled',
      scheduledDate: {
        $lte: new Date()
      }
    });

    for (const transfer of scheduledTransfers) {
      await executeTransfer(transfer);
      
      if (transfer.recurring) {
        // Calculate next execution date based on frequency
        const nextDate = new Date(transfer.nextExecutionDate);
        switch (transfer.frequency) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        }
        
        transfer.nextExecutionDate = nextDate;
        await transfer.save();
      }
    }
  } catch (error) {
    console.error('Transfer scheduler error:', error);
  }
}); 