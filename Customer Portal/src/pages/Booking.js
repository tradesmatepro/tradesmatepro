import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../contexts/CustomerContext';
import BookingForm from '../components/Common/BookingForm';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const Booking = () => {
  const navigate = useNavigate();
  const { customer } = useCustomer();
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const handleBookingSubmit = async (newRequest) => {
    console.log('Customer Portal - Booking submitted:', newRequest);
    setSubmittedRequest(newRequest);
    setShowSuccess(true);
    
    // Auto-redirect after 3 seconds
    setTimeout(() => {
      navigate('/requests');
    }, 3000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Request Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your service request "{submittedRequest?.title}" has been posted to the marketplace.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Contractors will start responding soon. You'll be redirected to your requests page...
          </p>
          <button
            onClick={() => navigate('/requests')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View My Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <BookingForm
            mode="customer"
            onSubmit={handleBookingSubmit}
            initialData={{
              customer_name: customer?.name || '',
              customer_email: customer?.email || '',
              customer_phone: customer?.phone || '',
              location_address: customer?.street_address || '',
              location_city: customer?.city || '',
              location_state: customer?.state || '',
              location_postal_code: customer?.zip_code || ''
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Booking;
