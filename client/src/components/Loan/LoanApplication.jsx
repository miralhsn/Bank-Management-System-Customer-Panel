import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { AlertCircle, CheckCircle } from 'lucide-react';

const calculateLoanDetails = (amount, term, type) => {
  try {
    // Ensure we have valid numbers
    const principal = parseFloat(amount);
    const termMonths = parseInt(term);

    if (isNaN(principal) || isNaN(termMonths) || principal <= 0 || termMonths <= 0) {
      throw new Error('Invalid loan amount or term');
    }

    // Set interest rate based on loan type
    let interestRate;
    switch (type) {
      case 'personal':
        interestRate = 12.99;
        break;
      case 'auto':
        interestRate = 6.99;
        break;
      case 'home':
        interestRate = 4.99;
        break;
      default:
        interestRate = 12.99;
    }

    // Convert annual rate to monthly rate
    const monthlyRate = interestRate / 100 / 12;

    // Calculate monthly payment using loan amortization formula
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    // Calculate total payment
    const totalPayment = monthlyPayment * termMonths;

    // Ensure all values are valid numbers
    if (isNaN(monthlyPayment) || isNaN(totalPayment)) {
      throw new Error('Invalid calculation results');
    }

    return {
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
      interestRate: parseFloat(interestRate.toFixed(2))
    };
  } catch (error) {
    console.error('Loan calculation error:', error);
    throw error;
  }
};

const LoanApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const calculatedLoan = location.state?.calculatedLoan;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: calculatedLoan?.type || 'personal',
    amount: calculatedLoan?.amount || '',
    term: calculatedLoan?.term || '',
    purpose: '',
    employmentDetails: {
      employerName: '',
      jobTitle: '',
      monthlyIncome: '',
      employmentDuration: ''
    },
    personalDetails: {
      fullName: '',
      dateOfBirth: '',
      phoneNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    },
    financialDetails: {
      monthlyExpenses: '',
      existingLoans: '0',
      creditScore: ''
    },
    references: [{
      name: '',
      relationship: '',
      phoneNumber: '',
      email: ''
    }],
    termsAccepted: false,
    truthfulnessDeclaration: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Validate required fields
      if (!formData.amount || !formData.term || !formData.type) {
        throw new Error('Loan amount, term, and type are required');
      }

      // Calculate loan details
      const loanDetails = calculateLoanDetails(
        formData.amount,
        formData.term,
        formData.type
      );

      // Prepare the complete loan application data
      const loanApplication = {
        ...formData,
        monthlyPayment: loanDetails.monthlyPayment,
        totalPayment: loanDetails.totalPayment,
        interestRate: loanDetails.interestRate,
        status: 'pending'
      };

      // Log the data being sent to verify all required fields are present
      console.log('Submitting loan application:', loanApplication);

      const response = await api.post('/loans', loanApplication);
      
      setSuccess(true);

      // Download PDF after successful submission
      try {
        const pdfResponse = await api.get(`/loans/${response.data._id}/pdf`, {
          responseType: 'blob'
        });
        
        const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `loan-application-${response.data._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        // Continue with navigation even if PDF fails
      }

      // Navigate after a short delay
      setTimeout(() => {
        navigate('/loans/success', {
          state: {
            loanDetails: response.data,
            calculatedDetails: loanDetails
          }
        });
      }, 2000);
    } catch (err) {
      console.error('Loan application error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit loan application');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [name]: type === 'checkbox' ? checked : value
          }
        };
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        address: {
          ...prev.personalDetails.address,
          [name]: value
        }
      }
    }));
  };

  const handleReferenceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [
        ...prev.references,
        { name: '', relationship: '', phoneNumber: '', email: '' }
      ]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Loan Application</h2>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">
                Loan application submitted successfully! Redirecting...
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="personal">Personal Loan</option>
                <option value="auto">Auto Loan</option>
                <option value="home">Home Loan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Amount ($)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="1000"
                step="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Term (months)
              </label>
              <input
                type="number"
                name="term"
                value={formData.term}
                onChange={handleChange}
                min="6"
                max="360"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Purpose
              </label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Personal Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.personalDetails.fullName}
                  onChange={(e) => handleChange(e, 'personalDetails')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.personalDetails.dateOfBirth}
                  onChange={(e) => handleChange(e, 'personalDetails')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.personalDetails.phoneNumber}
                  onChange={(e) => handleChange(e, 'personalDetails')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="mt-6">
              <h4 className="text-md font-medium mb-4">Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.personalDetails.address.street}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.personalDetails.address.city}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.personalDetails.address.state}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.personalDetails.address.zipCode}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.personalDetails.address.country}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employer Name
                </label>
                <input
                  type="text"
                  name="employerName"
                  value={formData.employmentDetails.employerName}
                  onChange={(e) => handleChange(e, 'employmentDetails')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.employmentDetails.jobTitle}
                  onChange={(e) => handleChange(e, 'employmentDetails')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Income ($)
                </label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.employmentDetails.monthlyIncome}
                  onChange={(e) => handleChange(e, 'employmentDetails')}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employment Duration (months)
                </label>
                <input
                  type="number"
                  name="employmentDuration"
                  value={formData.employmentDetails.employmentDuration}
                  onChange={(e) => handleChange(e, 'employmentDetails')}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Financial Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Expenses ($)
                </label>
                <input
                  type="number"
                  name="monthlyExpenses"
                  value={formData.financialDetails.monthlyExpenses}
                  onChange={(e) => handleChange(e, 'financialDetails')}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Existing Loans ($)
                </label>
                <input
                  type="number"
                  name="existingLoans"
                  value={formData.financialDetails.existingLoans}
                  onChange={(e) => handleChange(e, 'financialDetails')}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Credit Score
                </label>
                <input
                  type="number"
                  name="creditScore"
                  value={formData.financialDetails.creditScore}
                  onChange={(e) => handleChange(e, 'financialDetails')}
                  min="300"
                  max="850"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* References */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">References</h3>
              <button
                type="button"
                onClick={addReference}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                + Add Reference
              </button>
            </div>

            {formData.references.map((reference, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <h4 className="text-md font-medium mb-3">Reference {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={reference.name}
                      onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={reference.relationship}
                      onChange={(e) => handleReferenceChange(index, 'relationship', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={reference.phoneNumber}
                      onChange={(e) => handleReferenceChange(index, 'phoneNumber', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={reference.email}
                      onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Terms and Declaration */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Terms and Declaration</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  I accept the terms and conditions
                </label>
                <p className="text-gray-500">
                  By checking this box, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  name="truthfulnessDeclaration"
                  checked={formData.truthfulnessDeclaration}
                  onChange={handleChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  Declaration of truthfulness
                </label>
                <p className="text-gray-500">
                  I declare that all information provided is true and accurate. I understand that providing false information may result in legal consequences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default LoanApplication; 