import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ArrowLeft, Download } from 'lucide-react';
import api from '../../utils/api';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      const response = await api.get(`/loans/${id}`);
      setLoan(response.data);
    } catch (err) {
      setError('Failed to fetch loan details');
      console.error('Error fetching loan details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadPDF = async () => {
    try {
      const response = await api.get(`/loans/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `loan-application-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Loan not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/loans')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Loans
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Loan Application Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Application ID: {loan._id}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(loan.status)}`}>
              {getStatusIcon(loan.status)}
              <span className="ml-2">{loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</span>
            </div>
            <button
              onClick={downloadPDF}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Loan Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {loan.type.charAt(0).toUpperCase() + loan.type.slice(1)} Loan
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Application Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(loan.applicationDate)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Loan Amount</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatCurrency(loan.amount)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Term</dt>
              <dd className="mt-1 text-sm text-gray-900">{loan.term} months</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
              <dd className="mt-1 text-sm text-gray-900">{loan.interestRate}%</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Monthly Payment</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatCurrency(loan.monthlyPayment)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Purpose</dt>
              <dd className="mt-1 text-sm text-gray-900">{loan.purpose}</dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 mb-2">Personal Details</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <p className="font-medium">Full Name</p>
                    <p>{loan.personalDetails.fullName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Phone Number</p>
                    <p>{loan.personalDetails.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="font-medium">Date of Birth</p>
                    <p>{formatDate(loan.personalDetails.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p>
                      {loan.personalDetails.address.street}<br />
                      {loan.personalDetails.address.city}, {loan.personalDetails.address.state} {loan.personalDetails.address.zipCode}<br />
                      {loan.personalDetails.address.country}
                    </p>
                  </div>
                </div>
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 mb-2">Employment Details</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <p className="font-medium">Employer</p>
                    <p>{loan.employmentDetails.employerName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Job Title</p>
                    <p>{loan.employmentDetails.jobTitle}</p>
                  </div>
                  <div>
                    <p className="font-medium">Monthly Income</p>
                    <p>{formatCurrency(loan.employmentDetails.monthlyIncome)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Employment Duration</p>
                    <p>{loan.employmentDetails.employmentDuration} months</p>
                  </div>
                </div>
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 mb-2">Financial Details</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
                  <div>
                    <p className="font-medium">Monthly Expenses</p>
                    <p>{formatCurrency(loan.financialDetails.monthlyExpenses)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Existing Loans</p>
                    <p>{formatCurrency(loan.financialDetails.existingLoans)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Credit Score</p>
                    <p>{loan.financialDetails.creditScore}</p>
                  </div>
                </div>
              </dd>
            </div>

            {loan.references && loan.references.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 mb-2">References</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {loan.references.map((ref, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <p className="font-medium">{ref.name}</p>
                        <p className="text-gray-600">{ref.relationship}</p>
                        <p className="text-gray-600">{ref.phoneNumber}</p>
                        <p className="text-gray-600">{ref.email}</p>
                      </div>
                    ))}
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails; 