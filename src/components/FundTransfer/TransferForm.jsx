import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const transferSchema = z.object({
  fromAccount: z.string().min(1, 'Please select an account'),
  toAccount: z.string().min(1, 'Please enter recipient account'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Please enter a description'),
  scheduleDate: z.date().optional(),
  recurring: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
});

function TransferForm({ type }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferSchema),
  });

  const onSubmit = (data) => {
    console.log('Transfer data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">From Account</label>
          <select
            {...register('fromAccount')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Account</option>
            <option value="savings">Savings Account (*1234)</option>
            <option value="checking">Checking Account (*5678)</option>
          </select>
          {errors.fromAccount && (
            <p className="mt-1 text-sm text-red-600">{errors.fromAccount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {type === 'internal' ? 'To Account' : 'Recipient Account'}
          </label>
          {type === 'internal' ? (
            <select
              {...register('toAccount')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Account</option>
              <option value="savings">Savings Account (*1234)</option>
              <option value="checking">Checking Account (*5678)</option>
            </select>
          ) : (
            <input
              type="text"
              {...register('toAccount')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter account number"
            />
          )}
          {errors.toAccount && (
            <p className="mt-1 text-sm text-red-600">{errors.toAccount.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            {...register('amount', { valueAsNumber: true })}
            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="0.00"
            step="0.01"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input
          type="text"
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Transfer description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {type === 'scheduled' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Schedule Date</label>
            <input
              type="date"
              {...register('scheduleDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('recurring')}
                className="h-4 w-4 text-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Recurring</span>
            </label>
            {errors.recurring && (
              <p className="mt-1 text-sm text-red-600">{errors.recurring.message}</p>
            )}
          </div>

          {errors.scheduleDate && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduleDate.message}</p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600"
        >
          Transfer
        </button>
      </div>
    </form>
  );
}

export default TransferForm;
