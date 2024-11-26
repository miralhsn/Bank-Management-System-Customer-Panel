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

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
  type: 'internal' | 'external' | 'scheduled';
}

function TransferForm({ type }: TransferFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  const onSubmit = (data: TransferFormData) => {
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
          placeholder="Enter transfer description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Transfer Funds
      </button>
    </form>
  );
}

export default TransferForm;