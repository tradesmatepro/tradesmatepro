import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import BookingForm from '../components/Common/BookingForm';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const Booking = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const handleBookingSubmit = async (newRequest) => {
    console.log('Contractor App - Booking submitted:', newRequest);
    setSubmittedRequest(newRequest);
    setShowSuccess(true);
    
    // Auto-redirect after 3 seconds
    setTimeout(() => {
      navigate('/marketplace');
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
            Other contractors will start responding soon. You'll be redirected to the marketplace...
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            View Marketplace
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
            mode="contractor"
            onSubmit={handleBookingSubmit}
            initialData={{
              customer_name: user?.full_name || user?.company_name || '',
              customer_email: user?.email || '',
              customer_phone: user?.phone || ''
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Booking;
