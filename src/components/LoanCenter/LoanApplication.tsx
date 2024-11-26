import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Upload } from 'lucide-react';

const loanApplicationSchema = z.object({
  loanType: z.enum(['personal', 'auto', 'home']),
  amount: z.number().min(1000, 'Minimum loan amount is $1,000'),
  purpose: z.string().min(1, 'Loan purpose is required'),
  term: z.number().min(6, 'Minimum term is 6 months'),
  employmentStatus: z.string().min(1, 'Employment status is required'),
  annualIncome: z.number().min(1, 'Annual income is required'),
});

type LoanApplicationData = z.infer<typeof loanApplicationSchema>;

function LoanApplication() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoanApplicationData>({
    resolver: zodResolver(loanApplicationSchema),
  });

  const onSubmit = (data: LoanApplicationData) => {
    console.log('Loan application:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Loan Type</label>
          <select
            {...register('loanType')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="personal">Personal Loan</option>
            <option value="auto">Auto Loan</option>
            <option value="home">Home Loan</option>
          </select>
          {errors.loanType && (
            <p className="mt-1 text-sm text-red-600">{errors.loanType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
          <input
            type="number"
            {...register('amount', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Loan Purpose</label>
          <input
            type="text"
            {...register('purpose')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.purpose && (
            <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Loan Term (months)</label>
          <input
            type="number"
            {...register('term', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.term && (
            <p className="mt-1 text-sm text-red-600">{errors.term.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Employment Status</label>
          <select
            {...register('employmentStatus')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select status</option>
            <option value="employed">Employed</option>
            <option value="self-employed">Self-employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="retired">Retired</option>
          </select>
          {errors.employmentStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.employmentStatus.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Income</label>
          <input
            type="number"
            {...register('annualIncome', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.annualIncome && (
            <p className="mt-1 text-sm text-red-600">{errors.annualIncome.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Required Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Upload ID Proof</p>
            <input type="file" className="hidden" />
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Upload Income Proof</p>
            <input type="file" className="hidden" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Application
        </button>
      </div>
    </form>
  );
}

export default LoanApplication;